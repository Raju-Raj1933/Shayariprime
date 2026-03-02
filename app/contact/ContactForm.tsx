"use client";

import { useState, useTransition, useRef } from "react";
import { User, Mail, Send, Loader2 } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import toast from "react-hot-toast";
import { submitContactForm } from "@/app/actions/contactActions";

export default function ContactForm() {
    const [isPending, startTransition] = useTransition();
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    const [form, setForm] = useState({
        name: "",
        email: "",
        message: "",
    });

    // Dedicated error state for each field
    const [errors, setErrors] = useState({
        name: "",
        email: "",
        message: "",
        captcha: ""
    });

    const [isSuccess, setIsSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        // Clear the specific error when the user starts typing
        setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
        setIsSuccess(false);
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = { name: "", email: "", message: "", captcha: "" };

        // Default empty field validation
        if (!form.name.trim()) {
            newErrors.name = "Full Name is compulsory.";
            isValid = false;
        }

        // Email validation: checking for at least one character before @, an @ symbol, and at least 2 characters after
        if (!form.email.trim()) {
            newErrors.email = "Email Address is compulsory.";
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]{2,}\.[^\s@]+$/.test(form.email)) {
            newErrors.email = "Please enter a valid email address (e.g., name@example.com).";
            isValid = false;
        }

        // Message validation
        if (!form.message.trim()) {
            newErrors.message = "Message is compulsory.";
            isValid = false;
        } else if (form.message.trim().length < 20) {
            newErrors.message = "Message must be at least 20 characters long.";
            isValid = false;
        }

        // Captcha validation
        const captchaToken = recaptchaRef.current?.getValue() || "";
        if (!captchaToken) {
            newErrors.captcha = "Please click 'I'm not a robot' to verify.";
            isValid = false;
        }

        setErrors(newErrors);
        return { isValid, captchaToken };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Run validation mapping
        const { isValid, captchaToken } = validateForm();

        if (!isValid) {
            toast.error("Please fix the errors in the form.");
            return;
        }

        startTransition(async () => {
            try {
                const result = await submitContactForm({
                    name: form.name.trim(),
                    email: form.email.trim(),
                    message: form.message.trim(),
                    captchaToken,
                });

                if (result.error) {
                    toast.error(result.error);
                    recaptchaRef.current?.reset();
                    return;
                }

                if (result.warning) {
                    toast.success(result.warning); // Show warning as success if saved
                } else {
                    toast.success("Message sent successfully! We'll be in touch soon.");
                }

                // Show success state block below the form
                setIsSuccess(true);
                // Reset form completely
                setForm({ name: "", email: "", message: "" });
                setErrors({ name: "", email: "", message: "", captcha: "" });
                recaptchaRef.current?.reset();

            } catch (error) {
                console.error("Failed to submit form", error);
                toast.error("Something went wrong. Please try again later.");
                recaptchaRef.current?.reset();
            }
        });
    };

    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

    return (
        <form className="space-y-5 relative z-10" onSubmit={handleSubmit} noValidate>

            {/* Success Message display if submitted */}
            {isSuccess && (
                <div className="p-4 rounded-xl mb-6 flex items-center gap-3 bg-purple-500/10 border border-purple-500/30 text-purple-200">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                        <span className="text-xl">✅</span>
                    </div>
                    <p className="text-sm font-medium">Your message has been successfully submitted! We will get back to you soon.</p>
                </div>
            )}

            {/* Name Field */}
            <div className="space-y-1.5">
                <label htmlFor="name" className="text-sm font-medium text-[var(--color-text-muted)] ml-1">
                    Full Name <span className="text-pink-500">*</span>
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-purple-400/50" />
                    </div>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        className={`w-full bg-black/20 border rounded-xl py-3 pl-10 pr-4 text-sm text-[var(--color-text)] placeholder:text-white/20 focus:outline-none transition-all ${errors.name ? 'border-pink-500/50 focus:ring-1 focus:ring-pink-500' : 'border-purple-500/20 focus:ring-2 focus:ring-purple-500/50'
                            }`}
                    />
                </div>
                {errors.name && <p className="text-xs text-pink-400 mt-1 ml-1">{errors.name}</p>}
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-[var(--color-text-muted)] ml-1">
                    Email Address <span className="text-pink-500">*</span>
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-purple-400/50" />
                    </div>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        className={`w-full bg-black/20 border rounded-xl py-3 pl-10 pr-4 text-sm text-[var(--color-text)] placeholder:text-white/20 focus:outline-none transition-all ${errors.email ? 'border-pink-500/50 focus:ring-1 focus:ring-pink-500' : 'border-purple-500/20 focus:ring-2 focus:ring-purple-500/50'
                            }`}
                    />
                </div>
                {errors.email && <p className="text-xs text-pink-400 mt-1 ml-1">{errors.email}</p>}
            </div>

            {/* Message Field */}
            <div className="space-y-1.5">
                <label htmlFor="message" className="text-sm font-medium text-[var(--color-text-muted)] ml-1">
                    Your Message <span className="text-pink-500">*</span>
                </label>
                <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="How can we help you? (Minimum 20 characters)"
                    className={`w-full bg-black/20 border rounded-xl p-4 text-sm text-[var(--color-text)] placeholder:text-white/20 focus:outline-none transition-all resize-y ${errors.message ? 'border-pink-500/50 focus:ring-1 focus:ring-pink-500' : 'border-purple-500/20 focus:ring-2 focus:ring-purple-500/50'
                        }`}
                ></textarea>
                {errors.message && <p className="text-xs text-pink-400 mt-1 ml-1">{errors.message}</p>}
            </div>

            {/* reCAPTCHA */}
            {siteKey && (
                <div className="space-y-1.5 mt-4">
                    <div className={`overflow-hidden rounded-xl border max-w-fit ${errors.captcha ? 'border-pink-500/50' : 'border-purple-500/20'}`}>
                        <ReCAPTCHA
                            ref={recaptchaRef}
                            sitekey={siteKey}
                            theme="dark"
                            onChange={() => setErrors(prev => ({ ...prev, captcha: "" }))} // Clear error when clicked
                        />
                    </div>
                    {errors.captcha && <p className="text-xs text-pink-400 ml-1">{errors.captcha}</p>}
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isPending}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm text-white transition-all active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:pointer-events-none mt-2"
                style={{
                    background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                    boxShadow: '0 4px 15px rgba(236, 72, 153, 0.3)'
                }}
            >
                {isPending ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                    </>
                ) : (
                    <>
                        Send Message
                        <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                )}
            </button>
        </form>
    );
}
