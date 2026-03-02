"use client";

import { useState, useTransition, useRef, useCallback, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Feather, LogIn, UserPlus, User } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import ReCAPTCHA from "react-google-recaptcha";

export default function LoginPageClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const error = searchParams.get("error");
    const verified = searchParams.get("verified");

    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    // Show verified success toast once on mount
    useEffect(() => {
        if (verified === "1") {
            toast.success("Email verified! You can now log in. 🎉");
        }
    }, [verified]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const result = await signIn("credentials", {
                email: form.email,
                password: form.password,
                redirect: false,
            });

            if (result?.error) {
                if (result.error === "EmailNotVerified" || result.error.includes("EmailNotVerified")) {
                    toast.error("Please verify your email before logging in. Check your inbox.");
                } else {
                    toast.error("Invalid email or password.");
                }
            } else {
                toast.success("Welcome back! 🎉");
                router.push("/");
                router.refresh();
            }
        });
    };

    const handleRegister = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();

            if (!form.name || !form.email || !form.password) {
                toast.error("All fields are required.");
                return;
            }
            if (form.password.length < 8) {
                toast.error("Password must be at least 8 characters.");
                return;
            }
            if (!/[A-Z]/.test(form.password)) {
                toast.error("Password must contain at least one uppercase letter.");
                return;
            }
            if (!/[0-9]/.test(form.password)) {
                toast.error("Password must contain at least one number.");
                return;
            }

            // Get CAPTCHA token
            const captchaToken = recaptchaRef.current?.getValue() || "";
            if (!captchaToken) {
                toast.error("Please complete the CAPTCHA verification.");
                return;
            }

            startTransition(async () => {
                try {
                    const res = await fetch("/api/auth/register", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            name: form.name,
                            email: form.email,
                            password: form.password,
                            captchaToken,
                        }),
                    });

                    const data = await res.json();

                    if (res.status === 429) {
                        toast.error(data.error || "Too many attempts. Please wait.");
                        recaptchaRef.current?.reset();
                        return;
                    }

                    if (data.success) {
                        router.push("/verify-email");
                    } else {
                        toast.error(data.error || "Registration failed. Please try again.");
                        recaptchaRef.current?.reset();
                    }
                } catch {
                    toast.error("Something went wrong. Please try again.");
                    recaptchaRef.current?.reset();
                }
            });
        },
        [form, router]
    );

    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

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
                        <h1 className="text-2xl font-bold gradient-text mb-1">
                            {isLogin ? "Welcome Back" : "Join Shayariprime"}
                        </h1>
                        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                            {isLogin ? "Sign in to like, comment & share" : "Create your free account today"}
                        </p>
                    </div>

                    {/* Error */}
                    {error && !verified && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-6 p-4 rounded-xl text-sm"
                            style={{ background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.25)", color: "#f9a8d4" }}
                            role="alert"
                        >
                            ⚠️ {decodeURIComponent(error)}
                        </motion.div>
                    )}

                    {/* Tabs */}
                    <div className="flex rounded-xl p-1 mb-8" style={{ background: "rgba(124,58,237,0.1)" }}>
                        {["Login", "Register"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setIsLogin(tab === "Login")}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${(tab === "Login") === isLogin
                                    ? "bg-purple-600 text-white shadow"
                                    : "text-purple-300/60 hover:text-purple-300"
                                    }`}
                                aria-pressed={(tab === "Login") === isLogin}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Form */}
                    <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4" noValidate>
                        {/* Name field (register only) */}
                        {!isLogin && (
                            <div className="relative">
                                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Full Name"
                                    className="input-field"
                                    style={{ paddingLeft: "2.5rem" }}
                                    autoComplete="name"
                                    required
                                />
                            </div>
                        )}

                        {/* Email */}
                        <div className="relative">
                            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Email address"
                                className="input-field"
                                style={{ paddingLeft: "2.5rem" }}
                                autoComplete="email"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={form.password}
                                onChange={handleChange}
                                placeholder={isLogin ? "Password" : "Password (8+ chars, 1 uppercase, 1 number)"}
                                className="input-field"
                                style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                                autoComplete={isLogin ? "current-password" : "new-password"}
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

                        {/* Forgot Password (login only) */}
                        {isLogin && (
                            <div className="text-right -mt-1">
                                <Link
                                    href="/forgot-password"
                                    className="text-xs"
                                    style={{ color: "var(--color-accent)" }}
                                >
                                    Forgot password?
                                </Link>
                            </div>
                        )}

                        {/* reCAPTCHA (register only) */}
                        {!isLogin && siteKey && (
                            <div className="flex justify-center">
                                <ReCAPTCHA
                                    ref={recaptchaRef}
                                    sitekey={siteKey}
                                    theme="dark"
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="btn-primary w-full justify-center py-3 text-base mt-2 flex items-center gap-2"
                        >
                            {isLogin ? (
                                <><LogIn size={18} />{isPending ? "Signing in..." : "Sign In"}</>
                            ) : (
                                <><UserPlus size={18} />{isPending ? "Creating..." : "Create Account"}</>
                            )}
                        </button>
                    </form>
                </div>
                <p className="text-center mt-4 text-xs" style={{ color: "var(--color-text-muted)" }}>
                    By continuing, you agree to Shayariprime&apos;s Terms of Service.
                </p>
            </motion.div>
        </div>
    );
}
