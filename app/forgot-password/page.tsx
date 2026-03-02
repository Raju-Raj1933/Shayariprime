"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Mail, Feather, ArrowLeft, Send } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            toast.error("Please enter your email address.");
            return;
        }
        startTransition(async () => {
            try {
                const res = await fetch("/api/auth/forgot-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: email.trim() }),
                });
                const data = await res.json();
                if (res.status === 429) {
                    toast.error(data.error || "Too many requests. Please wait.");
                    return;
                }
                // Always show success regardless (prevent enumeration)
                setSubmitted(true);
            } catch {
                toast.error("Something went wrong. Please try again.");
            }
        });
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="glass rounded-3xl p-8 md:p-10" style={{ border: "1px solid rgba(124,58,237,0.25)" }}>
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 mb-4 shadow-lg shadow-purple-600/30">
                            <Feather size={24} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold gradient-text mb-1">Forgot Password?</h1>
                        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                            Enter your email — we&apos;ll send a reset link.
                        </p>
                    </div>

                    {submitted ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                        >
                            <div className="text-4xl mb-4">📬</div>
                            <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)", lineHeight: 1.7 }}>
                                If an account with <strong style={{ color: "var(--color-accent)" }}>{email}</strong> exists,
                                we&apos;ve sent a password reset link.
                                <br /><br />
                                Check your inbox (and spam folder). The link expires in <strong style={{ color: "var(--color-accent)" }}>30 minutes</strong>.
                            </p>
                            <Link href="/login" className="btn-primary inline-flex items-center gap-2 justify-center py-2.5 px-6 text-sm">
                                <ArrowLeft size={16} /> Back to Login
                            </Link>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email address"
                                    className="input-field"
                                    style={{ paddingLeft: "2.5rem" }}
                                    autoComplete="email"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="btn-primary w-full justify-center py-3 text-base mt-2 flex items-center gap-2"
                            >
                                <Send size={18} />
                                {isPending ? "Sending..." : "Send Reset Link"}
                            </button>
                            <div className="text-center">
                                <Link href="/login" className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                                    ← Back to Login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
