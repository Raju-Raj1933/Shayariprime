import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Verify Your Email — Shayariprime",
    description: "Please check your email to verify your Shayariprime account.",
};

export default function VerifyEmailPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div
                className="glass rounded-3xl p-10 max-w-md w-full text-center"
                style={{ border: "1px solid rgba(124,58,237,0.25)" }}
            >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 mb-6 shadow-lg shadow-purple-600/30 text-3xl">
                    ✉️
                </div>
                <h1 className="text-2xl font-bold gradient-text mb-3">Check your inbox</h1>
                <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)", lineHeight: 1.7 }}>
                    We&apos;ve sent a verification link to your email address.
                    <br />
                    Click the link to activate your account.
                </p>
                <div
                    className="rounded-xl p-4 text-sm mb-6"
                    style={{
                        background: "rgba(124,58,237,0.08)",
                        border: "1px solid rgba(124,58,237,0.2)",
                        color: "var(--color-text-muted)",
                    }}
                >
                    ⏰ The link expires in <strong style={{ color: "var(--color-accent)" }}>15 minutes</strong>.
                    <br />
                    Check your spam folder if you don&apos;t see it.
                </div>
                <a
                    href="/login"
                    className="text-sm"
                    style={{ color: "var(--color-accent)" }}
                >
                    ← Back to Login
                </a>
            </div>
        </div>
    );
}
