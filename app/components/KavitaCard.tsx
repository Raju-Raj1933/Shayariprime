"use client";

import { useState, useCallback, lazy, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Heart,
    Share2,
    Copy,
    Eye,
    MessageCircle,
    ArrowRight,
} from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { likePost } from "@/app/actions/postActions";
import type { PostData } from "@/app/actions/postActions";

// ── Lazy load CommentsSection — only downloaded when user clicks comment button
const CommentsSection = lazy(() => import("./CommentsSection"));

interface KavitaCardProps {
    post: PostData;
    index?: number;
    showComments?: boolean;
    onCommentToggle?: (postId: string) => void;
}

const categoryConfig = {
    sad: { label: "दर्द", className: "badge-sad", color: "#93c5fd", emoji: "💔", slug: "sad" },
    romantic: { label: "रोमांस", className: "badge-romantic", color: "#f9a8d4", emoji: "🌹", slug: "romantic" },
    motivational: { label: "प्रेरणा", className: "badge-motivational", color: "#fcd34d", emoji: "✨", slug: "motivational" },
};

function getCloudinaryUrl(url: string): string {
    if (!url || !url.includes("cloudinary.com")) return url;
    if (url.includes("w_400,h_360")) return url;
    return url.replace("/upload/", "/upload/w_400,h_360,c_pad,b_auto,f_auto,q_auto/");
}

/** Return a 3-4 line excerpt from content */
function getExcerpt(content: string, lineCount = 4): string {
    return content.split("\n").filter(Boolean).slice(0, lineCount).join("\n");
}

export default function KavitaCard({
    post,
    index = 0,
    showComments = false,
    onCommentToggle,
}: KavitaCardProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [likes, setLikes] = useState(post.likes?.length ?? 0);
    const [isLiked, setIsLiked] = useState(
        post.likes?.includes((session?.user as { id?: string })?.id ?? "") ?? false
    );
    const [isLiking, setIsLiking] = useState(false);

    const cat =
        categoryConfig[post.category as keyof typeof categoryConfig] ??
        categoryConfig.sad;

    const detailHref = `/kavita/${post.slug}`;
    const categoryHref = `/kavita?category=${cat.slug}`;
    const excerpt = post.excerpt || getExcerpt(post.content);

    // ── Like sound ───────────────────────────────────────────────────────────
    const playLikeSound = useCallback(() => {
        try {
            const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.type = "sine";
            osc.frequency.setValueAtTime(523, ctx.currentTime);
            osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
            osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.5);
        } catch { /* AudioContext not supported */ }
    }, []);

    // ── Like ─────────────────────────────────────────────────────────────────
    const handleLike = async () => {
        if (!session?.user) { toast.error("Please login to like ❤️"); return; }
        if (isLiking) return;
        setIsLiking(true);
        const newLiked = !isLiked;
        setIsLiked(newLiked);
        setLikes((p) => (newLiked ? p + 1 : p - 1));
        if (newLiked) playLikeSound();
        const result = await likePost(post._id);
        if (!result.success) {
            setIsLiked(!newLiked);
            setLikes((p) => (!newLiked ? p + 1 : p - 1));
            toast.error("Something went wrong");
        }
        setIsLiking(false);
    };

    // ── Copy ─────────────────────────────────────────────────────────────────
    const handleCopy = async () => {
        const text = `${post.title}\n\n${post.content}\n\n— shayariprime.com`;
        try {
            await navigator.clipboard.writeText(text);
            toast.success("Copied! 📋");
        } catch { toast.error("Could not copy"); }
    };

    // ── Share ─────────────────────────────────────────────────────────────────
    const handleShare = async () => {
        const url = `${window.location.origin}${detailHref}`;
        if (navigator.share) {
            try {
                await navigator.share({ title: post.title, text: excerpt, url });
            } catch { /* cancelled */ }
        } else {
            await navigator.clipboard.writeText(url);
            toast.success("Link copied! 🔗");
        }
    };

    return (
        <div
            className={`flex flex-col h-full relative kavita-card-wrap kv-card-in ${showComments ? 'z-50' : 'z-0'}`}
            style={{ animationDelay: `${Math.min(index * 80, 500)}ms` }}
            aria-label={`Kavita: ${post.title}`}
        >
            {/* ── Top: Image with gradient border ─────────────────── */}
            <div
                className="card-image-gradient-border rounded-2xl group overflow-hidden cursor-pointer kavita-img-block"
                onClick={() => router.push(detailHref)}
                role="link"
                tabIndex={0}
                aria-label={`Read kavita: ${post.title}`}
                onKeyDown={(e) => e.key === "Enter" && router.push(detailHref)}
            >
                <div
                    className="relative overflow-hidden rounded-[14px] bg-[#0a061a] w-full"
                    style={{ aspectRatio: "400 / 360" }}
                >
                    <Image
                        src={getCloudinaryUrl(post.image)}
                        alt={post.title}
                        fill
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        priority={index < 2}
                        fetchPriority={index < 2 ? "high" : "auto"}
                        loading={index < 2 ? undefined : "lazy"}
                    />

                    {/* Gradient overlays top & bottom */}
                    <div
                        className="absolute top-0 left-0 right-0 h-16 pointer-events-none"
                        style={{ background: "linear-gradient(to bottom, rgba(10,6,26,0.7) 0%, transparent 100%)", zIndex: 12 }}
                    />
                    <div
                        className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
                        style={{ background: "linear-gradient(to top, rgba(10,6,26,0.7) 0%, transparent 100%)", zIndex: 12 }}
                    />

                    {/* ── Top bar: Category badge LEFT + Eye counter RIGHT ── */}
                    <div
                        className="absolute top-0 left-0 right-0 flex items-center justify-between p-2"
                        style={{ zIndex: 15 }}
                    >
                        {/* Increased padding for 48x48 minimum touch target */}
                        <Link
                            href={categoryHref}
                            className={`text-xs font-semibold px-4 py-2 rounded-full ${cat.className}`}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Category: ${cat.label}`}
                            style={{ minHeight: "36px", display: "inline-flex", alignItems: "center" }}
                        >
                            {cat.emoji} {cat.label}
                        </Link>
                        <div className="flex items-center gap-1 text-xs text-white/80 bg-black/30 px-3 py-2 rounded-full" style={{ minHeight: "36px" }}>
                            <Eye size={12} />
                            <span>{(post.views * 100).toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Watermark */}
                    <div
                        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
                        aria-hidden="true"
                        style={{ zIndex: 10 }}
                    >
                        <span
                            style={{
                                fontSize: "14px",
                                fontWeight: 700,
                                color: "rgba(255,255,255,0.92)",
                                letterSpacing: "0.12em",
                                transform: "rotate(-30deg)",
                                whiteSpace: "nowrap",
                                userSelect: "none",
                                textTransform: "uppercase",
                                background: "rgba(0,0,0,0.38)",
                                padding: "4px 16px",
                                borderRadius: "6px",
                                border: "1px solid rgba(255,255,255,0.28)",
                            }}
                        >
                            shayariprime.com
                        </span>
                    </div>
                </div>
            </div>

            {/* 2px gap */}
            <div style={{ height: "2px" }} />

            {/* ── Bottom: Content card ─────────────────────────────────────── */}
            <div
                className="rounded-2xl p-4 md:p-5 card-content-face kavita-content-card"
                style={{
                    background: "linear-gradient(135deg, rgba(20,10,42,0.95) 0%, rgba(30,15,55,0.95) 100%)",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(124,58,237,0.12)",
                    border: "1px solid rgba(124,58,237,0.22)",
                }}
            >
                {/* Visible title in h2 — NOT a link (Read More below is the only anchor) */}
                <h2 className="kv-card-title text-base font-bold mb-2 leading-snug" style={{ color: "#e9d5ff" }}>
                    {post.title}
                </h2>

                {/* Excerpt — 3-4 lines only */}
                <blockquote
                    className="kv-card-excerpt shayari-text text-sm mb-3 border-l-2 border-purple-500/50 pl-3 whitespace-pre-line leading-relaxed line-clamp-4"
                    style={{ color: "#c4b5d4" }}
                >
                    {excerpt}
                </blockquote>

                {/* Read More link */}
                <Link
                    href={detailHref}
                    className="kv-read-more inline-flex items-center gap-1 text-xs font-semibold mb-3 hover:gap-2 transition-all"
                >
                    पूरी कविता पढ़ें <ArrowRight size={12} />
                </Link>

                {/* ── Action bar ─────────────────────────────────────────── */}
                <div
                    className="card-action-bar flex items-center justify-between pt-3 border-t"
                    style={{ borderColor: "rgba(124,58,237,0.18)" }}
                >
                    {/* Like — CSS active:scale replaces motion.button */}
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-1.5 text-sm font-medium transition-colors active:scale-90 ${isLiked ? "text-pink-400" : "text-purple-300/60 hover:text-pink-400"}`}
                        aria-label={`${likes} likes`}
                        aria-pressed={isLiked}
                        style={{ transition: "transform 0.15s, color 0.2s" }}
                    >
                        <Heart size={16} className={isLiked ? "fill-current" : ""} />
                        <span>{likes}</span>
                    </button>

                    {/* Right icons */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onCommentToggle?.(post._id)}
                            className={`p-1.5 rounded-full transition-all ${showComments
                                ? "text-purple-400 bg-purple-500/15"
                                : "text-purple-300/60 hover:text-purple-300 hover:bg-purple-500/10"
                                }`}
                            aria-label="Toggle comments"
                            title="Comments"
                        >
                            <MessageCircle size={15} />
                        </button>
                        <button onClick={handleCopy} className="p-1.5 rounded-full text-purple-300/60 hover:text-purple-300 hover:bg-purple-500/10 transition-all" aria-label="Copy to clipboard" title="Copy">
                            <Copy size={15} />
                        </button>
                        <button onClick={handleShare} className="p-1.5 rounded-full text-purple-300/60 hover:text-purple-300 hover:bg-purple-500/10 transition-all" aria-label="Share post" title="Share">
                            <Share2 size={15} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Comment panel — lazy loaded */}
            {showComments && (
                <div
                    className="card-comment-panel kv-comment-slide"
                >
                    <div
                        className="glass rounded-2xl p-4"
                        style={{
                            background: "rgba(26,16,48,0.95)",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                            border: "1px solid rgba(124,58,237,0.25)",
                        }}
                    >
                        <Suspense fallback={<div className="text-center py-4 text-purple-300/50 text-sm">Loading comments...</div>}>
                            <CommentsSection postId={post._id} />
                        </Suspense>
                    </div>
                </div>
            )}
        </div>
    );
}
