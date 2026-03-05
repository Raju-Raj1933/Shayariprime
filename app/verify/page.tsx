import { redirect } from "next/navigation";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import type { Metadata } from "next";
import connectDB from "@/app/lib/mongodb";
import User from "@/app/models/User";
import VerifyAutoLogin from "./VerifyAutoLogin";

export const metadata: Metadata = {
    title: "Verify Your Email — Shayariprime",
    description: "Verifying your Shayariprime account.",
    robots: { index: false, follow: false },
};

interface VerifyPageProps {
    searchParams: Promise<{ token?: string }>;
}

function hashToken(raw: string): string {
    return crypto.createHash("sha256").update(raw).digest("hex");
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
    const { token: rawToken } = await searchParams;

    if (!rawToken) {
        redirect("/login?error=Invalid+verification+link");
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error("[verify] JWT_SECRET is not set");

    await connectDB();

    // Hash the raw opaque token and look it up in DB (single query with expiry check)
    const hashedToken = hashToken(rawToken);
    const user = await User.findOne({
        verificationToken: hashedToken,
        verificationTokenExpiry: { $gt: new Date() },
    }).select("+verificationToken +verificationTokenExpiry");

    if (!user) {
        // Invalid token, already used, or expired
        redirect("/login?error=Verification+link+is+invalid+or+expired.+Please+register+again.");
    }

    // Replay protection: already verified (shouldn't normally reach here due to token deletion)
    if (user.isEmailVerified) {
        redirect("/login?message=already_verified");
    }

    // Mark verified + delete token (one-time use enforced at DB level)
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    // Generate a SHORT-LIVED auto-login JWT (2 min) just for the client signIn step.
    // This is separate from the verification token — it only grants a session.
    const autoLoginToken = jwt.sign(
        { sub: user._id.toString(), type: "email_verify" },
        jwtSecret,
        { expiresIn: "2m" }
    );

    return <VerifyAutoLogin token={autoLoginToken} />;
}
