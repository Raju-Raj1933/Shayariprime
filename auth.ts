import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "@/app/lib/mongodb";
import User from "@/app/models/User";
import { authConfig } from "./auth.config";

// ── 1. Standard email + password login ────────────────────────────────────────

const credentialsProvider = CredentialsProvider({
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

        const user = await User.findOne({
            email: (credentials.email as string).toLowerCase(),
        });

        if (!user || !user.password) {
            throw new Error("Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
        );
        if (!isPasswordValid) {
            throw new Error("Invalid email or password");
        }

        // Admins can log in regardless of email verification status
        if (!user.isEmailVerified && user.role !== "admin") {
            throw new Error("EmailNotVerified");
        }

        return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
        };
    },
});

// ── 2. Auto-login after email verification (verify page → client → here) ──────
// Accepts a short-lived 2-min JWT issued by /verify page after the opaque token is consumed.
// The JWT type claim "email_verify" and isEmailVerified DB check ensure this cannot be abused.

const verifyLoginProvider = CredentialsProvider({
    id: "verify-login",
    name: "Verify Login",
    credentials: {
        token: { label: "Auto-login Token", type: "text" },
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

            if (
                typeof payload !== "object" ||
                payload.type !== "email_verify" ||
                !payload.sub
            ) {
                return null;
            }

            await connectDB();

            const user = await User.findById(payload.sub);
            // isEmailVerified must be true — set by verify page before this is called
            if (!user || !user.isEmailVerified) return null;

            return {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                role: user.role,
            };
        } catch {
            return null;
        }
    },
});

// ── 3. Google Sign-In — verify id_token directly inside authorize ─────────────
// Single DB upsert here — no /api/auth/google route needed, eliminates double lookup.
// Section 2 fix: we NEVER overwrite provider for existing credential users.
//   → googleId is added, isEmailVerified is set true, but provider stays "credentials"
//   → that user can continue to log in with email+password AND Google.

const googleLoginProvider = CredentialsProvider({
    id: "google-login",
    name: "Google Login",
    credentials: {
        credential: { label: "Google ID Token", type: "text" },
    },
    async authorize(credentials) {
        if (!credentials?.credential) return null;

        const clientId = process.env.GOOGLE_CLIENT_ID;
        if (!clientId) return null;

        // Dynamic import — google-auth-library only loads when this provider is actually used.
        // Avoids crashing every auth() call (e.g. in postActions) when the static import
        // is processed by Turbopack on module load.
        const { OAuth2Client } = await import("google-auth-library");
        const oauthClient = new OAuth2Client(clientId);
        let email: string;
        let name: string;
        let googleId: string;

        try {
            const ticket = await oauthClient.verifyIdToken({
                idToken: credentials.credential as string,
                audience: clientId,
            });
            const payload = ticket.getPayload();
            if (!payload?.email || !payload?.sub) return null;

            email = payload.email.toLowerCase();
            name = payload.name || payload.email.split("@")[0];
            googleId = payload.sub;
        } catch {
            return null;
        }

        await connectDB();

        // Single DB lookup
        const existing = await User.findOne({ email });

        if (!existing) {
            // CASE 1: Brand new user — create with Google credentials
            const newUser = await User.create({
                name,
                email,
                provider: "google",
                googleId,
                isEmailVerified: true,
                role: "user",
            });
            return {
                id: newUser._id.toString(),
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,
            };
        }

        // CASE 2 + 3: Existing user (credentials OR google)
        // Section 2 fix: do NOT overwrite provider — preserve dual login capability.
        // Only update fields that actually need changing to avoid unnecessary writes.
        const needsGoogleId = existing.googleId !== googleId;
        const needsVerify = !existing.isEmailVerified;

        if (needsGoogleId || needsVerify) {
            const update: Record<string, unknown> = {};
            if (needsGoogleId) update.googleId = googleId;
            if (needsVerify) {
                update.isEmailVerified = true;
                // Clear pending verification tokens now that Google confirmed the email
                update.verificationToken = null;
                update.verificationTokenExpiry = null;
            }
            await User.updateOne({ _id: existing._id }, { $set: update });
        }

        return {
            id: existing._id.toString(),
            email: existing.email,
            name: existing.name,
            role: existing.role,
        };
    },
});

// ── NextAuth export ───────────────────────────────────────────────────────────

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [credentialsProvider, verifyLoginProvider, googleLoginProvider],

    callbacks: {
        async jwt({ token, user, trigger }) {
            if (user) {
                token.id = user.id;
                token.role = (user as { role?: string }).role ?? "user";
            }

            // Re-read role from DB on session update (e.g. admin secret verification)
            if (trigger === "update" && token.id) {
                try {
                    await connectDB();
                    const dbUser = await User.findById(token.id).select("role").lean();
                    if (dbUser) token.role = (dbUser as { role: string }).role;
                } catch {
                    // fail silently — keep existing token
                }
            }

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
