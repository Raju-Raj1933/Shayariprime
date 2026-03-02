import Link from "next/link";
import { Feather, Heart, Shield, Instagram, Facebook, Twitter, Pin as Pinterest } from "lucide-react";

const footerSections = [
    {
        title: "Shayari Categories (शायरी श्रेणियाँ)",
        links: [
            { href: "/?category=all&page=1", label: "All Shayari (मिक्स शायरी)" },
            { href: "/category/sad", label: "Sad Shayari (दर्द भरी शायरी)" },
            { href: "/category/romantic", label: "Romantic Shayari (रोमांटिक शायरी)" },
            { href: "/category/motivational", label: "Motivational Shayari (प्रेरणादायक शायरी)" },
        ],
    },
    {
        title: "Kavita Categories (कविता श्रेणियाँ)",
        links: [
            { href: "/kavita?category=all&page=1", label: "All Kavita (सभी कविताएँ)" },
            { href: "/kavita?category=sad", label: "Sad Kavita (दर्द भरी कविताएँ)" },
            { href: "/kavita?category=romantic", label: "Romantic Kavita (रोमांटिक कविताएँ)" },
            { href: "/kavita?category=motivational", label: "Motivational Kavita (प्रेरणादायक कविताएँ)" },
        ],
    },
    {
        title: "Important Links",
        links: [
            { href: "/", label: "Home" },
            { href: "/about", label: "About Us" },
            { href: "/contact", label: "Contact Us" },
            { href: "/privacy-policy", label: "Privacy Policy" },
            { href: "/disclaimer", label: "Disclaimer" },
            { href: "/terms-and-conditions", label: "Terms & Conditions" },
        ],
    },
];

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer
            className="relative glass border-t"
            style={{ borderColor: "rgba(124,58,237,0.15)" }}
            role="contentinfo"
            aria-label="Site footer"
        >
            <div className="h-px w-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

            <div className="max-w-7xl mx-auto px-0 md:px-4 py-8 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 px-4 md:px-0">

                    {/* Brand Column */}
                    <div className="lg:col-span-4 space-y-4 lg:pr-8">
                        <Link href="/" className="flex items-center gap-2 group w-fit">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                                <Feather size={18} className="text-white" />
                            </div>
                            <span className="font-bold text-xl gradient-text">
                                Shayariprime
                            </span>
                        </Link>

                        <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                            Shayariprime is a dedicated Hindi Shayari directory where you can explore
                            heartfelt Love Shayari, emotional Sad Shayari, Romantic Poetry,
                            and Motivational Quotes. We share meaningful words that connect
                            deeply with your emotions.
                        </p>

                        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                            भारत का एक भरोसेमंद शायरी प्लेटफ़ॉर्म जहाँ हर एहसास के लिए बेहतरीन शायरी मिलती है।
                        </p>

                        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
                            <Shield size={13} className="text-purple-400" />
                            <span>Managed from India • Regularly Updated • 100% Original Content</span>
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center gap-3 pt-4">
                            <a
                                href="https://www.instagram.com/shayariprime"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Follow Shayariprime on Instagram"
                                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-purple-500/20 hover:text-purple-400 hover:scale-110"
                                style={{ color: "var(--color-text-muted)", border: "1px solid rgba(124,58,237,0.2)" }}
                            >
                                <Instagram size={15} />
                            </a>
                            <a
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Follow Shayariprime on Facebook"
                                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-purple-500/20 hover:text-purple-400 hover:scale-110"
                                style={{ color: "var(--color-text-muted)", border: "1px solid rgba(124,58,237,0.2)" }}
                            >
                                <Facebook size={15} />
                            </a>
                            <a
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Follow Shayariprime on Twitter"
                                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-purple-500/20 hover:text-purple-400 hover:scale-110"
                                style={{ color: "var(--color-text-muted)", border: "1px solid rgba(124,58,237,0.2)" }}
                            >
                                <Twitter size={15} />
                            </a>
                            <a
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Follow Shayariprime on Pinterest"
                                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-purple-500/20 hover:text-purple-400 hover:scale-110"
                                style={{ color: "var(--color-text-muted)", border: "1px solid rgba(124,58,237,0.2)" }}
                            >
                                {/* Using Lucide's icon that resembles Pinterest */}
                                <Pinterest size={15} className="rotate-45" />
                            </a>
                            <a
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Follow Shayariprime on Quora"
                                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-purple-500/20 hover:text-purple-400 hover:scale-110 font-bold font-serif"
                                style={{ color: "var(--color-text-muted)", border: "1px solid rgba(124,58,237,0.2)", fontSize: "14px" }}
                            >
                                Q
                            </a>
                            <a
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Follow Shayariprime on Reddit"
                                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-purple-500/20 hover:text-purple-400 hover:scale-110 font-bold"
                                style={{ color: "var(--color-text-muted)", border: "1px solid rgba(124,58,237,0.2)", fontSize: "12px", letterSpacing: "-1px" }}
                            >
                                r/
                            </a>
                        </div>
                    </div>

                    {/* Footer Sections */}
                    {footerSections.map((section) => (
                        <div key={section.title} className={section.title === "Important Links" ? "lg:col-span-2" : "lg:col-span-3"}>
                            <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--color-text)" }}>
                                {section.title}
                            </h3>
                            <ul className="space-y-2.5">
                                {section.links.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="text-sm transition-colors hover:text-purple-300"
                                            style={{ color: "var(--color-text-muted)" }}
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Trust Line */}
                <div
                    className="mt-6 pt-4 border-t text-center"
                    style={{ borderColor: "rgba(124,58,237,0.1)" }}
                >
                    <p className="text-xs md:text-sm" style={{ color: "var(--color-text-muted)" }}>
                        Shayariprime is an independent Hindi Shayari website created for
                        educational and entertainment purposes. We aim to provide
                        authentic and creative content while respecting originality.
                    </p>
                </div>

                {/* Copyright */}
                <div
                    className="mt-6 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
                    style={{ borderColor: "rgba(124,58,237,0.1)" }}
                >
                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                        © {currentYear} Shayariprime.com – All rights reserved.
                    </p>

                    <p className="text-xs flex items-center gap-1.5" style={{ color: "var(--color-text-muted)" }}>
                        Made with{" "}
                        <Heart
                            size={12}
                            className="text-pink-400 fill-current"
                            aria-hidden="true"
                        />{" "}
                        for Shayari lovers
                    </p>
                </div>
            </div>
        </footer>
    );
}