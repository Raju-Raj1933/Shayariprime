"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Props {
    token: string;
}

/**
 * Client component responsible for triggering NextAuth auto-login
 * after the server has already validated the JWT and set isVerified=true.
 * Using the client ensures NextAuth sets HTTP-only session cookies correctly.
 */
export default function VerifyAutoLogin({ token }: Props) {
    const router = useRouter();

    useEffect(() => {
        signIn("verify-login", { token, redirect: false }).then((result) => {
            if (result?.ok) {
                router.replace("/");
            } else {
                // Auto-login failed (e.g. token re-use after session creation) — fall back to manual login
                router.replace("/login?verified=1");
            }
        });
    }, [token, router]);

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div
                className="glass rounded-3xl p-10 max-w-md w-full text-center"
                style={{ border: "1px solid rgba(124,58,237,0.25)" }}
            >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 mb-6 shadow-lg shadow-purple-600/30 text-3xl">
                    ✅
                </div>
                <h1 className="text-2xl font-bold gradient-text mb-3">Email Verified!</h1>
                <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)", lineHeight: 1.7 }}>
                    Your email has been verified successfully.
                    <br />
                    Logging you in automatically…
                </p>
                <div className="flex justify-center">
                    <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                </div>
            </div>
        </div>
    );
}
