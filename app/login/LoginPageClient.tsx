"use client";

import {
    useState,
    useTransition,
    useRef,
    useCallback,
    useEffect,
} from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    Feather,
    LogIn,
    UserPlus,
    User,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import ReCAPTCHA from "react-google-recaptcha";
import Script from "next/script";

// ── Types ────────────────────────────────────────────────────────────────────

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: {
                        client_id: string;
                        callback: (response: { credential: string }) => void;
                        auto_select?: boolean;
                        cancel_on_tap_outside?: boolean;
                    }) => void;
                    renderButton: (
                        element: HTMLElement,
                        options: Record<string, unknown>
                    ) => void;
                    prompt: () => void;
                };
            };
        };
    }
}

// ── Component ────────────────────────────────────────────────────────────────

export default function LoginPageClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const error = searchParams.get("error");
    const verified = searchParams.get("verified");

    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [registerError, setRegisterError] = useState<string | null>(null);
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const googleButtonRef = useRef<HTMLDivElement>(null);
    const googleScriptLoaded = useRef(false);

    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
    // Trigger Vercel rebuild for NEXT_PUBLIC_ variables
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

    // Show verified success toast once on mount
    useEffect(() => {
        if (verified === "1") {
            toast.success("Email verified! You can now log in. 🎉");
        }
    }, [verified]);

    // Initialise Google Sign-In button after GSI script loads
    const initGoogleSignIn = useCallback(() => {
        if (!googleClientId || !window.google?.accounts?.id) return;
        if (googleScriptLoaded.current) return;
        googleScriptLoaded.current = true;

        window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredential,
            cancel_on_tap_outside: true,
        });

        if (googleButtonRef.current) {
            window.google.accounts.id.renderButton(googleButtonRef.current, {
                theme: "filled_black",
                size: "large",
                width: googleButtonRef.current.offsetWidth > 0
                    ? googleButtonRef.current.offsetWidth
                    : undefined, // Let Google handle it if offsetWidth is 0
                text: "continue_with",
                shape: "rectangular",
            });
        }
    }, [googleClientId]); // eslint-disable-line react-hooks/exhaustive-deps

    // Re-render Google button when switching tabs (DOM may re-mount the div)
    useEffect(() => {
        if (!googleScriptLoaded.current) return;
        if (!googleClientId || !window.google?.accounts?.id) return;
        if (googleButtonRef.current) {
            window.google.accounts.id.renderButton(googleButtonRef.current, {
                theme: "filled_black",
                size: "large",
                width: googleButtonRef.current.offsetWidth > 0
                    ? googleButtonRef.current.offsetWidth
                    : undefined, // Let Google handle it if offsetWidth is 0
                text: "continue_with",
                shape: "rectangular",
            });
        }
    }, [isLogin, googleClientId]);

    // ── Google credential callback ─────────────────────────────────────────
    // Passes the id_token directly to NextAuth — verified server-side inside authorize().
    // No /api/auth/google round-trip needed (eliminates double DB lookup).
    const handleGoogleCredential = async (response: { credential: string }) => {
        try {
            const result = await signIn("google-login", {
                credential: response.credential,
                redirect: false,
            });

            if (result?.ok) {
                toast.success("Signed in with Google! 🎉");
                router.push("/");
                router.refresh();
            } else {
                toast.error("Google Sign-In failed. Please try again.");
            }
        } catch {
            toast.error("Something went wrong with Google Sign-In.");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        if (registerError) setRegisterError(null);
    };

    // ── Standard login ────────────────────────────────────────────────────
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const result = await signIn("credentials", {
                email: form.email,
                password: form.password,
                redirect: false,
            });

            if (result?.error) {
                if (
                    result.error === "EmailNotVerified" ||
                    result.error.includes("EmailNotVerified")
                ) {
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

    // ── Register (email + password → sends verification link) ────────────
    const handleRegister = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setRegisterError(null);

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
                        // Show inline error message below form (not toast) for better UX
                        setRegisterError(data.error || "Registration failed. Please try again.");
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

    return (
        <>
            {/* Google Identity Services script — loaded once, deferred */}
            {googleClientId && (
                <Script
                    src="https://accounts.google.com/gsi/client"
                    strategy="afterInteractive"
                    onLoad={initGoogleSignIn}
                />
            )}

            <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md kv-card-in">
                    <div
                        className="glass rounded-3xl p-8 md:p-10"
                        style={{ border: "1px solid rgba(124,58,237,0.25)" }}
                    >
                        {/* Logo */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 mb-4 shadow-lg shadow-purple-600/30">
                                <Feather size={24} className="text-white" />
                            </div>
                            <h1 className="text-2xl font-bold gradient-text mb-1">
                                {isLogin ? "Welcome Back" : "Join Shayariprime"}
                            </h1>
                            <p
                                className="text-sm"
                                style={{ color: "var(--color-text-muted)" }}
                            >
                                {isLogin
                                    ? "Sign in to like, comment & share"
                                    : "Create your free account today"}
                            </p>
                        </div>

                        {/* URL Error banner */}
                        {error && !verified && (
                            <div
                                className="mb-6 p-4 rounded-xl text-sm login-error-fade"
                                style={{
                                    background: "rgba(236,72,153,0.1)",
                                    border: "1px solid rgba(236,72,153,0.25)",
                                    color: "#f9a8d4",
                                }}
                                role="alert"
                            >
                                ⚠️ {decodeURIComponent(error)}
                            </div>
                        )}

                        {/* Tabs */}
                        <div
                            className="flex rounded-xl p-1 mb-8"
                            style={{ background: "rgba(124,58,237,0.1)" }}
                        >
                            {["Login", "Register"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => {
                                        setIsLogin(tab === "Login");
                                        setRegisterError(null);
                                    }}
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

                        {/* Google Sign-In button — shown on both tabs */}
                        {googleClientId && (
                            <div className="mb-6">
                                <div className="w-full flex justify-center items-center overflow-hidden">
                                    <div
                                        ref={googleButtonRef}
                                        id="google-signin-button"
                                        className="w-full"
                                    />
                                </div>
                                {/* Divider */}
                                <div className="flex items-center gap-3 mt-5">
                                    <hr
                                        className="flex-1"
                                        style={{ borderColor: "rgba(255,255,255,0.1)" }}
                                    />
                                    <span
                                        className="text-xs"
                                        style={{ color: "var(--color-text-muted)" }}
                                    >
                                        or continue with email
                                    </span>
                                    <hr
                                        className="flex-1"
                                        style={{ borderColor: "rgba(255,255,255,0.1)" }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Form */}
                        <form
                            onSubmit={isLogin ? handleLogin : handleRegister}
                            className="space-y-4"
                            noValidate
                        >
                            {/* Name field (register only) */}
                            {!isLogin && (
                                <div className="relative">
                                    <User
                                        size={16}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2"
                                        style={{ color: "var(--color-text-muted)" }}
                                    />
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
                                <Mail
                                    size={16}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2"
                                    style={{ color: "var(--color-text-muted)" }}
                                />
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
                                <Lock
                                    size={16}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2"
                                    style={{ color: "var(--color-text-muted)" }}
                                />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder={
                                        isLogin
                                            ? "Password"
                                            : "Password (8+ chars, 1 uppercase, 1 number)"
                                    }
                                    className="input-field"
                                    style={{
                                        paddingLeft: "2.5rem",
                                        paddingRight: "2.5rem",
                                    }}
                                    autoComplete={
                                        isLogin ? "current-password" : "new-password"
                                    }
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2"
                                    style={{ color: "var(--color-text-muted)" }}
                                    aria-label={
                                        showPassword ? "Hide password" : "Show password"
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff size={16} />
                                    ) : (
                                        <Eye size={16} />
                                    )}
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

                            {/* Inline register error (shown below CAPTCHA for best UX) */}
                            {!isLogin && registerError && (
                                <div
                                    className="p-3 rounded-xl text-sm"
                                    style={{
                                        background: "rgba(236,72,153,0.1)",
                                        border: "1px solid rgba(236,72,153,0.25)",
                                        color: "#f9a8d4",
                                    }}
                                    role="alert"
                                >
                                    ⚠️ {registerError}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isPending}
                                className="btn-primary w-full justify-center py-3 text-base mt-2 flex items-center gap-2"
                            >
                                {isLogin ? (
                                    <>
                                        <LogIn size={18} />
                                        {isPending ? "Signing in..." : "Sign In"}
                                    </>
                                ) : (
                                    <>
                                        <UserPlus size={18} />
                                        {isPending ? "Creating..." : "Create Account"}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                    <p
                        className="text-center mt-4 text-xs"
                        style={{ color: "var(--color-text-muted)" }}
                    >
                        By continuing, you agree to Shayariprime&apos;s Terms of Service.
                    </p>
                </div>
            </div>
        </>
    );
}
