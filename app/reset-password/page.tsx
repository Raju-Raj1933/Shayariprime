"use client";

import { useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Feather, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";
    const router = useRouter();

    const [form, setForm] = useState({ password: "", confirmPassword: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [done, setDone] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.password || !form.confirmPassword) {
            toast.error("Please fill in all fields.");
            return;
        }
        if (form.password !== form.confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }
        if (form.password.length < 8) {
            toast.error("Password must be at least 8 characters.");
            return;
        }

        startTransition(async () => {
            try {
                const res = await fetch("/api/auth/reset-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        token,
                        password: form.password,
                        confirmPassword: form.confirmPassword,
                    }),
                });
                const data = await res.json();
                if (data.success) {
                    setDone(true);
                    setTimeout(() => router.push("/login"), 3000);
                } else {
                    toast.error(data.error || "Reset failed. Please try again.");
                }
            } catch {
                toast.error("Something went wrong. Please try again.");
            }
        });
    };

    if (!token) {
        return (
            <div className="text-center">
                <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
                    Invalid or missing reset token. Please request a new password reset link.
                </p>
                <Link href="/forgot-password" className="btn-primary inline-flex justify-center py-2.5 px-6 text-sm">
                    Request New Link
                </Link>
            </div>
        );
    }

    if (done) {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <CheckCircle size={48} className="mx-auto mb-4" style={{ color: "#10b981" }} />
                <h2 className="text-xl font-bold gradient-text mb-2">Password Reset!</h2>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                    Your password has been updated. Redirecting to login...
                </p>
            </motion.div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
                <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    placeholder="New password (min 8 chars, 1 uppercase, 1 number)"
                    className="input-field"
                    style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                    autoComplete="new-password"
                    required
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--color-text-muted)" }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
            <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
                <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                    className="input-field"
                    style={{ paddingLeft: "2.5rem" }}
                    autoComplete="new-password"
                    required
                />
            </div>
            <button
                type="submit"
                disabled={isPending}
                className="btn-primary w-full justify-center py-3 text-base mt-2"
            >
                {isPending ? "Updating..." : "🔑 Reset Password"}
            </button>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="glass rounded-3xl p-8 md:p-10" style={{ border: "1px solid rgba(124,58,237,0.25)" }}>
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 mb-4 shadow-lg shadow-purple-600/30">
                            <Feather size={24} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold gradient-text mb-1">Reset Password</h1>
                        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                            Choose a strong new password.
                        </p>
                    </div>
                    <Suspense fallback={<div className="text-center text-sm" style={{ color: "var(--color-text-muted)" }}>Loading...</div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </motion.div>
        </div>
    );
}
