import type { NextAuthConfig } from "next-auth";

// This config is edge-safe (no Node.js-only modules like bcryptjs or mongoose)
// Used by middleware.ts for session/role checking
export const authConfig: NextAuthConfig = {
    pages: {
        signIn: "/login",
        error: "/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as { role?: string }).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                (session.user as { role?: string }).role = token.role as string;
            }
            return session;
        },
        authorized({ auth }) {
            // Called by middleware — just check if session exists
            return !!auth?.user;
        },
    },
    providers: [], // Providers added in auth.ts (Node.js env only)
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
};
