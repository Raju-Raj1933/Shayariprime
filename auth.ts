import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "@/app/lib/mongodb";
import User from "@/app/models/User";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        // ---------- Standard password login ----------
        CredentialsProvider({
            id: "credentials",
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required");
                }

                await connectDB();

                const user = await User.findOne({ email: (credentials.email as string).toLowerCase() });

                if (!user) {
                    // Generic error message to prevent user enumeration
                    throw new Error("Invalid email or password");
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );
                if (!isPasswordValid) {
                    throw new Error("Invalid email or password");
                }

                // Block login if email not verified
                if (!user.isVerified) {
                    throw new Error("EmailNotVerified");
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            },
        }),

        // ---------- Auto-login after email verification ----------
        // Accepts a verification JWT (issued during registration).
        // Validates signature, expiry, and type claim before granting a session.
        // Cannot be used for normal login — rejects anything without a valid verify token.
        CredentialsProvider({
            id: "verify-login",
            name: "Verify Login",
            credentials: {
                token: { label: "Verification Token", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.token) return null;

                const jwtSecret = process.env.JWT_SECRET;
                if (!jwtSecret) return null;

                try {
                    const payload = jwt.verify(
                        credentials.token as string,
                        jwtSecret
                    ) as jwt.JwtPayload;

                    // Validate type claim — reject tokens not issued for email verification
                    if (
                        typeof payload !== "object" ||
                        payload.type !== "email_verify" ||
                        !payload.sub
                    ) {
                        return null;
                    }

                    await connectDB();

                    const user = await User.findById(payload.sub);

                    // Guard: user must exist and be verified at DB level before granting session
                    if (!user || !user.isVerified) return null;

                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.name,
                        role: user.role,
                    };
                } catch {
                    // Catches: TokenExpiredError, JsonWebTokenError, etc.
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger }) {
            // On first login — attach user info to JWT
            if (user) {
                token.id = user.id;
                token.role = (user as { role?: string }).role ?? "user";
            }

            // On session update (called after verifyAdminSecret) — re-read role from DB
            if (trigger === "update" && token.id) {
                try {
                    await connectDB();
                    const dbUser = await User.findById(token.id).select("role").lean();
                    if (dbUser) {
                        token.role = (dbUser as { role: string }).role;
                    }
                } catch {
                    // fail silently — keep existing token
                }
            }

            // Flag: this email is the admin but hasn't verified the secret yet
            const adminEmail = process.env.ADMIN_EMAIL;
            token.needsAdminVerify =
                !!adminEmail &&
                token.email?.toLowerCase() === adminEmail.toLowerCase() &&
                token.role !== "admin";

            return token;
        },

        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                (session.user as { role?: string }).role = token.role as string;
                (session.user as { needsAdminVerify?: boolean }).needsAdminVerify =
                    token.needsAdminVerify as boolean;
            }
            return session;
        },
    },
});
