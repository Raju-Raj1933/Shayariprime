// Server-side only — imported by API routes, NOT called as React Server Actions

import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import connectDB from "@/app/lib/mongodb";
import User from "@/app/models/User";
import { sendVerificationEmail, sendResetPasswordEmail } from "@/app/lib/email";
import { verifyRecaptcha } from "@/app/lib/captcha";

// ---------- Guards ----------

function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("[auth] JWT_SECRET is not set.");
    return secret;
}

// ---------- Helpers ----------

function hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
}

function generateOpaqueToken(): string {
    return crypto.randomBytes(32).toString("hex");
}

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password: string): { valid: boolean; message: string } {
    if (password.length < 8)
        return { valid: false, message: "Password must be at least 8 characters" };
    if (!/[A-Z]/.test(password))
        return { valid: false, message: "Password must contain at least one uppercase letter" };
    if (!/[0-9]/.test(password))
        return { valid: false, message: "Password must contain at least one number" };
    return { valid: true, message: "" };
}

// ---------- Register (email + password → verification link) ----------

export async function registerUser(
    rawName: string,
    rawEmail: string,
    rawPassword: string,
    captchaToken: string
) {
    const name = rawName.trim().slice(0, 100);
    const email = rawEmail.trim().toLowerCase();
    const password = rawPassword;

    if (!name || !email || !password)
        return { success: false, error: "All fields are required." };
    if (!isValidEmail(email))
        return { success: false, error: "Please enter a valid email address." };

    const passwordCheck = isStrongPassword(password);
    if (!passwordCheck.valid)
        return { success: false, error: passwordCheck.message };

    const captchaOk = await verifyRecaptcha(captchaToken);
    if (!captchaOk)
        return { success: false, error: "CAPTCHA verification failed. Please try again." };

    try {
        await connectDB();

        interface ExistingUser {
            _id: { toString(): string };
            isEmailVerified: boolean;
            verificationTokenExpiry?: Date;
            provider: string;
        }

        // Single lookup — select verificationTokenExpiry for resend check
        const existing = await User.findOne({ email })
            .select("+verificationToken +verificationTokenExpiry")
            .lean<ExistingUser>();

        if (existing) {
            // SCENARIO 2 — Already verified: explicit error, no email sent
            if (existing.isEmailVerified) {
                return {
                    success: false,
                    error: "This email is already registered. Please try with another email.",
                };
            }

            // Google user trying to re-register via email
            if (existing.provider === "google") {
                return {
                    success: false,
                    error: "This email is registered via Google Sign-In. Please use Google to log in.",
                };
            }

            // SCENARIO 1 — Unverified: check if token has expired before resending
            const tokenExpired =
                !existing.verificationTokenExpiry ||
                existing.verificationTokenExpiry < new Date();

            if (!tokenExpired) {
                // Token still valid — NO DB write, just inform user
                return {
                    success: false,
                    error: "A verification link was already sent. Please check your inbox (or spam).",
                };
            }

            // Token expired — generate new opaque token, update in DB, resend email
            const rawToken = generateOpaqueToken();
            const hashedToken = hashToken(rawToken);
            const newExpiry = new Date(Date.now() + 15 * 60 * 1000);
            const hashedPassword = await bcrypt.hash(password, 10);

            // updateOne: minimal write — no full document reload
            await User.updateOne(
                { _id: existing._id },
                {
                    verificationToken: hashedToken,
                    verificationTokenExpiry: newExpiry,
                    password: hashedPassword,
                }
            );

            try {
                await sendVerificationEmail(email, rawToken);
            } catch {
                // Email failure is non-fatal — user can retry
            }

            return { success: true };
        }

        // New user — create with opaque verification token
        const rawToken = generateOpaqueToken();
        const hashedToken = hashToken(rawToken);
        const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email,
            password: hashedPassword,
            role: "user",
            isEmailVerified: false,
            provider: "credentials",
            verificationToken: hashedToken,
            verificationTokenExpiry: tokenExpiry,
        });

        try {
            await sendVerificationEmail(email, rawToken);
        } catch {
            // Non-fatal
        }

        return { success: true };
    } catch (error) {
        if ((error as { code?: number })?.code === 11000) {
            return {
                success: false,
                error: "This email is already registered. Please try with another email.",
            };
        }
        return { success: false, error: "Registration failed. Please try again." };
    }
}

// ---------- Forgot Password ----------

export async function forgotPassword(rawEmail: string): Promise<{ success: boolean; error?: string }> {
    const email = rawEmail.trim().toLowerCase();

    if (!isValidEmail(email))
        return { success: false, error: "Please enter a valid email address." };

    const genericResponse = {
        success: true as const,
        message: "If an account with this email exists, we've sent a reset link.",
    };

    try {
        await connectDB();

        const user = await User.findOne({ email });
        if (!user) return genericResponse;

        const rawToken = generateOpaqueToken();
        const hashedToken = hashToken(rawToken);
        const expires = new Date(Date.now() + 30 * 60 * 1000);

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = expires;
        await user.save();

        try {
            await sendResetPasswordEmail(email, rawToken);
        } catch {
            // Non-fatal
        }

        return genericResponse;
    } catch {
        return genericResponse;
    }
}

// ---------- Reset Password ----------

export async function resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string
): Promise<{ success: boolean; error?: string }> {
    if (!token) return { success: false, error: "Invalid reset link." };
    if (newPassword !== confirmPassword)
        return { success: false, error: "Passwords do not match." };

    const passwordCheck = isStrongPassword(newPassword);
    if (!passwordCheck.valid)
        return { success: false, error: passwordCheck.message };

    try {
        await connectDB();

        const hashedToken = hashToken(token);
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() },
        }).select("+resetPasswordToken +resetPasswordExpires");

        if (!user) {
            return {
                success: false,
                error: "Reset link is invalid or has expired. Please request a new one.",
            };
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return { success: true };
    } catch {
        return { success: false, error: "Password reset failed. Please try again." };
    }
}


