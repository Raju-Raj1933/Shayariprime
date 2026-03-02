"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
    BookOpen,
    LayoutDashboard,
    LogIn,
    LogOut,
    PlusCircle,
    Menu,
    X,
    Feather,
} from "lucide-react";
import AdminVerifyModal from "@/app/components/AdminVerifyModal";

export default function Header() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const isAdmin = (session?.user as { role?: string })?.role === "admin";

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isMenuOpen]);

    const navLinks = [
        pathname === "/kavita"
            ? { href: "/", label: "Shayari", icon: <BookOpen size={16} /> }
            : { href: "/kavita", label: "Kavita", icon: <BookOpen size={16} /> },
        // Add Post is always visible — guests get redirected to login first
        {
            href: session ? "/add-post" : "/login?callbackUrl=/add-post",
            label: "✍️ Add Post",
            icon: <PlusCircle size={16} />,
            highlight: true,
        },
        ...(session
            ? [
                {
                    href: "/my-dashboard",
                    label: "My Dashboard",
                    icon: <LayoutDashboard size={16} />,
                    highlight: false,
                },
            ]
            : []),
        ...(session && isAdmin
            ? [
                {
                    href: "/dashboard",
                    label: "Admin",
                    icon: <LayoutDashboard size={16} />,
                    highlight: false,
                },
            ]
            : []),
    ];

    const isActive = (href: string) =>
        href === "/kavita"
            ? pathname === "/kavita" || pathname === "/"
            : pathname.startsWith(href);

    return (
        <>
            {/* Admin secret verification popup — only shown to admin email */}
            <AdminVerifyModal />
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? "glass shadow-lg shadow-purple-900/20"
                    : "bg-transparent"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* Logo */}
                        <Link
                            href="/"
                            className="flex items-center gap-2 group"
                            aria-label="Shayariprime Home"
                        >
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg group-hover:shadow-purple-500/40 transition-shadow">
                                <Feather size={18} className="text-white" />
                            </div>
                            <span className="font-bold text-xl md:text-2xl gradient-text tracking-tight">
                                Shayariprime
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <nav
                            className="hidden md:flex items-center gap-2"
                            aria-label="Main navigation"
                        >
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${link.highlight
                                        ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md hover:shadow-purple-500/40 hover:opacity-90"
                                        : isActive(link.href)
                                            ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                                            : "text-purple-200/70 hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    {link.icon}
                                    {link.label}
                                </Link>
                            ))}

                            {!session ? (
                                <Link
                                    href="/login"
                                    className="btn-primary flex items-center gap-1.5 text-sm"
                                >
                                    <LogIn size={16} />
                                    Login
                                </Link>
                            ) : (
                                <button
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-pink-300/80 hover:text-pink-300 hover:bg-pink-500/10 transition-all"
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            )}
                        </nav>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 rounded-lg text-purple-300 hover:bg-purple-500/20 transition-colors"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                            aria-expanded={isMenuOpen}
                        >
                            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
                    onClick={() => setIsMenuOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Mobile Drawer */}
            <div
                className={`fixed top-0 right-0 z-50 h-full w-72 bg-[#0f0724] border-l border-purple-500/20 shadow-2xl shadow-purple-900/40 transform transition-transform duration-300 md:hidden ${isMenuOpen ? "translate-x-0" : "translate-x-full"
                    }`}
                role="dialog"
                aria-modal="true"
                aria-label="Mobile navigation"
            >
                <div className="flex flex-col h-full p-6">
                    <div className="flex items-center justify-between mb-8">
                        <span className="font-bold text-xl gradient-text">Shayariprime</span>
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="p-2 text-purple-300 hover:bg-purple-500/20 rounded-lg flex md:hidden"
                            aria-label="close menu button"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <nav className="flex flex-col gap-2 flex-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${link.highlight
                                    ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md"
                                    : isActive(link.href)
                                        ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                                        : "text-purple-200/70 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                {link.icon}
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="border-t border-purple-800/40 pt-4">
                        {!session ? (
                            <Link href="/login" className="btn-primary w-full justify-center">
                                <LogIn size={16} />
                                Login / Register
                            </Link>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-xs text-purple-400 px-2">
                                    Logged in as{" "}
                                    <span className="font-medium text-purple-300">
                                        {session.user?.name}
                                    </span>
                                    {isAdmin && (
                                        <span className="ml-1 text-yellow-400">(Admin)</span>
                                    )}
                                </p>
                                <button
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium text-pink-300 hover:bg-pink-500/10 transition-all"
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
