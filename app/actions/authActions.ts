"use server";

import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import connectDB from "@/app/lib/mongodb";
import User from "@/app/models/User";
import { sendVerificationEmail, sendResetPasswordEmail } from "@/app/lib/email";
import { verifyRecaptcha } from "@/app/lib/captcha";

// ---------- Startup guards ----------

function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("[auth] JWT_SECRET is not set. Cannot generate verification tokens.");
    }
    return secret;
}

// ---------- Helpers (kept for password reset) ----------

function hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
}

function generateSecureToken(): string {
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

// ---------- Register ----------

export async function registerUser(
    rawName: string,
    rawEmail: string,
    rawPassword: string,
    captchaToken: string
) {
    // Sanitize
    const name = rawName.trim().slice(0, 100);
    const email = rawEmail.trim().toLowerCase();
    const password = rawPassword;

    // Validate
    if (!name || !email || !password) {
        return { success: false, error: "All fields are required." };
    }
    if (!isValidEmail(email)) {
        return { success: false, error: "Please enter a valid email address." };
    }
    const passwordCheck = isStrongPassword(password);
    if (!passwordCheck.valid) {
        return { success: false, error: passwordCheck.message };
    }

    // CAPTCHA
    const captchaOk = await verifyRecaptcha(captchaToken);
    if (!captchaOk) {
        return { success: false, error: "CAPTCHA verification failed. Please try again." };
    }

    try {
        await connectDB();

        // Generic message to prevent user enumeration
        const existing = await User.findOne({ email });
        if (existing) {
            return {
                success: true,
                message: "If this email is not registered, you will receive a verification link shortly.",
            };
        }

        // Cost factor 10: OWASP recommended for web apps (~250ms on serverless vs 4-9s for 12)
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "user",
            isVerified: false,
        });

        // Generate stateless JWT verification token
        // Payload: { sub: userId, type: "email_verify" }
        const verificationToken = jwt.sign(
            { sub: user._id.toString(), type: "email_verify" },
            getJwtSecret(),
            { expiresIn: "15m" }
        );

        // Awaited: must complete before returning so Vercel doesn't kill the function
        // before Resend receives the HTTP call (fire-and-forget is unsafe on serverless)
        try {
            await sendVerificationEmail(email, verificationToken);
        } catch (err) {
            // Log error but still return success — user can re-request verification
            console.error("[email] Failed to send verification email to", email, err);
        }

        return { success: true };
    } catch (error) {
        if ((error as { code?: number })?.code === 11000) {
            return { success: true }; // Same generic response for race conditions
        }
        return { success: false, error: "Registration failed. Please try again." };
    }
}

// ---------- Forgot Password ----------

export async function forgotPassword(rawEmail: string): Promise<{ success: boolean; error?: string }> {
    const email = rawEmail.trim().toLowerCase();

    if (!isValidEmail(email)) {
        return { success: false, error: "Please enter a valid email address." };
    }

    // Always return same message to prevent user enumeration
    const genericResponse = {
        success: true,
        message: "If an account with this email exists, we've sent a reset link.",
    };

    try {
        await connectDB();

        const user = await User.findOne({ email });
        if (!user) return genericResponse;

        const rawToken = generateSecureToken();
        const hashedToken = hashToken(rawToken);
        const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = expires;
        await user.save();

        // Awaited: must complete before returning so Vercel doesn't kill the function
        // before Resend receives the HTTP call (fire-and-forget is unsafe on serverless)
        try {
            await sendResetPasswordEmail(email, rawToken);
        } catch (err) {
            console.error("[email] Failed to send reset email to", email, err);
            // Still return genericResponse — don't reveal failure to prevent enumeration
        }

        return genericResponse;
    } catch {
        return genericResponse; // Never reveal error details
    }
}

// ---------- Reset Password ----------

export async function resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string
): Promise<{ success: boolean; error?: string }> {
    if (!token) return { success: false, error: "Invalid reset link." };
    if (newPassword !== confirmPassword) {
        return { success: false, error: "Passwords do not match." };
    }

    const passwordCheck = isStrongPassword(newPassword);
    if (!passwordCheck.valid) {
        return { success: false, error: passwordCheck.message };
    }

    // bcrypt is statically imported at top of file

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

        // Cost factor 10 — consistent with registration
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return { success: true };
    } catch {
        return { success: false, error: "Password reset failed. Please try again." };
    }
}
