import { redirect } from "next/navigation";
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

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
    const { token } = await searchParams;

    // Guard: missing token
    if (!token) {
        redirect("/login?error=Invalid+verification+link");
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error("[verify] JWT_SECRET is not set");
    }

    // Verify JWT signature and expiry
    let payload: jwt.JwtPayload;
    try {
        payload = jwt.verify(token, jwtSecret) as jwt.JwtPayload;
    } catch {
        // Handles: TokenExpiredError, JsonWebTokenError, NotBeforeError
        redirect("/login?error=Verification+link+is+invalid+or+expired.+Please+register+again.");
    }

    // Validate type claim — reject tokens not issued for email verification
    if (
        typeof payload !== "object" ||
        payload.type !== "email_verify" ||
        !payload.sub
    ) {
        redirect("/login?error=Invalid+verification+link");
    }

    // Fetch user by userId (sub claim) — never trust email from token
    await connectDB();
    const user = await User.findById(payload.sub);

    if (!user) {
        redirect("/login?error=Account+not+found.+Please+register+again.");
    }

    // Refinement 3 — Replay Protection:
    // If already verified, refuse the token and redirect safely.
    // Prevents token replay abuse even before token expiry.
    if (user.isVerified) {
        redirect("/login?message=already_verified");
    }

    // Mark as verified
    user.isVerified = true;
    await user.save();

    // Hand off to client component for auto-login.
    // Client calls signIn("verify-login") so NextAuth sets HTTP-only cookies correctly.
    return <VerifyAutoLogin token={token} />;
}
