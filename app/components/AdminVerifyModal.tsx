"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff, Loader2, Lock, X } from "lucide-react";
import toast from "react-hot-toast";
import { verifyAdminSecret } from "@/app/actions/adminActions";

export default function AdminVerifyModal() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const [secret, setSecret] = useState("");
    const [showSecret, setShowSecret] = useState(false);
    const [error, setError] = useState("");
    const [isPending, startTransition] = useTransition();
    const [dismissed, setDismissed] = useState(false);
    const [verified, setVerified] = useState(false); // local hide flag

    const needsVerify = (session?.user as { needsAdminVerify?: boolean })?.needsAdminVerify;
    // Hide if: no flag, already dismissed, or we just verified (local state)
    if (!needsVerify || dismissed || verified) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!secret.trim()) {
            setError("Please enter the admin secret");
            return;
        }
        startTransition(async () => {
            const result = await verifyAdminSecret(secret.trim());
            if (result.success) {
                setVerified(true); // instantly hide the modal
                await update();    // refresh JWT so role = "admin"
                toast.success("🎉 Admin access granted! Redirecting...");
                // Short delay so toast is visible, then go to admin dashboard
                setTimeout(() => router.push("/dashboard"), 800);
            } else {
                setError(result.error || "Verification failed");
                setSecret("");
            }
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative glass rounded-2xl p-8 w-full max-w-md animate-in"
                style={{ border: "1px solid rgba(124,58,237,0.5)", boxShadow: "0 0 60px rgba(124,58,237,0.2)" }}
            >
                {/* Dismiss button */}
                <button
                    onClick={() => setDismissed(true)}
                    className="absolute top-4 right-4 p-2 rounded-lg text-purple-300/50 hover:text-purple-300 hover:bg-white/5 transition-all"
                    title="Skip (login as regular user)"
                >
                    <X size={16} />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", boxShadow: "0 8px 32px rgba(124,58,237,0.4)" }}
                    >
                        <Shield size={28} color="white" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-center gradient-text mb-1">
                    Admin Verification
                </h2>
                <p className="text-center text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
                    We detected admin credentials. Enter the admin secret to get full access.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2 text-purple-300">
                            <Lock size={13} /> Admin Secret Password
                        </label>
                        <div className="relative">
                            <input
                                type={showSecret ? "text" : "password"}
                                value={secret}
                                onChange={(e) => { setSecret(e.target.value); setError(""); }}
                                placeholder="Enter admin secret..."
                                className="input-field pr-12"
                                autoFocus
                                autoComplete="off"
                            />
                            <button
                                type="button"
                                onClick={() => setShowSecret(!showSecret)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-300/50 hover:text-purple-300"
                            >
                                {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {error && (
                            <p className="text-sm mt-2 flex items-center gap-1.5" style={{ color: "#f87171" }}>
                                ❌ {error}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isPending || !secret.trim()}
                        className="btn-primary w-full justify-center"
                        style={{ opacity: !secret.trim() ? 0.5 : 1 }}
                    >
                        {isPending ? (
                            <><Loader2 size={16} className="animate-spin" /> Verifying...</>
                        ) : (
                            <><Shield size={16} /> Verify & Activate Admin</>
                        )}
                    </button>

                    <p className="text-center text-xs" style={{ color: "var(--color-text-muted)" }}>
                        Not admin? Click ✕ above to continue as regular user.
                    </p>
                </form>
            </div>
        </div>
    );
}
