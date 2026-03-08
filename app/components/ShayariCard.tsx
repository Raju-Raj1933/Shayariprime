"use client";

import { useState, useCallback, lazy, Suspense } from "react";
import Image from "next/image";
import {
    Heart,
    Share2,
    Copy,
    Eye,
    MessageCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { likePost } from "@/app/actions/postActions";
import { useViewTracker } from "@/app/hooks/useViewTracker";
import type { PostData } from "@/app/actions/postActions";

// Lazy load CommentsSection to save ~40-50KB of JS upfront
const CommentsSection = lazy(() => import("./CommentsSection"));

interface ShayariCardProps {
    post: PostData;
    index?: number;
    /** Controlled by parent ShayariGrid for accordion behaviour */
    showComments?: boolean;
    onCommentToggle?: (postId: string) => void;
}

const categoryConfig = {
    sad: { label: "दर्द", className: "badge-sad", color: "#93c5fd", emoji: "💔" },
    romantic: { label: "रोमांस", className: "badge-romantic", color: "#f9a8d4", emoji: "🌹" },
    motivational: { label: "प्रेरणा", className: "badge-motivational", color: "#fcd34d", emoji: "✨" },
};

/**
 * Inject Cloudinary fetch-time transforms into any Cloudinary URL.
 */
function getCloudinaryUrl(url: string): string {
    if (!url || !url.includes("cloudinary.com")) return url;
    if (url.includes("w_600")) return url;
    return url.replace("/upload/", "/upload/w_600,f_auto,q_auto/");
}

export default function ShayariCard({
    post,
    index = 0,
    showComments = false,
    onCommentToggle,
}: ShayariCardProps) {
    const { data: session } = useSession();
    const [likes, setLikes] = useState(post.likes?.length ?? 0);
    const [isLiked, setIsLiked] = useState(
        post.likes?.includes((session?.user as { id?: string })?.id ?? "") ?? false
    );
    const [isLiking, setIsLiking] = useState(false);

    const cat =
        categoryConfig[post.category as keyof typeof categoryConfig] ??
        categoryConfig.sad;

    // Instagram-style view tracking — 50% visibility for 2 continuous seconds
    const cardRef = useViewTracker(post._id);

    // ── Like sound ──────────────────────────────────────────────────────────
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



    // ── Like ────────────────────────────────────────────────────────────────
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

    // ── Copy ────────────────────────────────────────────────────────────────
    const handleCopy = async () => {
        const text = `${post.title}\n\n${post.content}\n\n— shayariprime.com`;
        try {
            await navigator.clipboard.writeText(text);
            toast.success("Copied! 📋");
        } catch { toast.error("Could not copy"); }
    };

    // ── Share ───────────────────────────────────────────────────────────────
    const handleShare = async () => {
        const url = `${window.location.origin}`;
        if (navigator.share) {
            try {
                await navigator.share({ title: post.title, text: post.content.substring(0, 100), url });
            } catch { /* cancelled */ }
        } else {
            await navigator.clipboard.writeText(url);
            toast.success("Link copied! 🔗");
        }
    };


    return (
        <div
            ref={cardRef}
            className={`flex flex-col h-full relative kv-card-in ${showComments ? 'z-50' : 'z-0'}`}
            style={{ animationDelay: `${Math.min(index * 80, 500)}ms` }}
            aria-label={`${post.type === "kavita" ? "Kavita" : "Shayari"}: ${post.title}`}
        >
            {/* ════════════════════════════════
                TOP: Image Card with animated gradient border
            ════════════════════════════════ */}
            {/* Outer gradient border wrapper */}
            <div className="card-image-gradient-border rounded-2xl group overflow-hidden">
                {/* inner wrapper — mobile: 400×360 ratio, desktop: fixed 500px height */}
                <div
                    className="relative overflow-hidden rounded-[14px] bg-[#0f0a1e] w-full aspect-[400/360] md:aspect-auto md:h-[500px]"
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

                    {/* ── Top bar: Category badge LEFT + Eye counter RIGHT ── */}
                    <div
                        className="absolute top-0 left-0 right-0 flex items-center justify-between p-2"
                        style={{ zIndex: 15 }}
                    >
                        {/* Category badge - Increased padding for minimum touch target */}
                        <span
                            className={`text-xs font-semibold px-4 py-2 rounded-full ${cat.className}`}
                            style={{ minHeight: "36px", display: "inline-flex", alignItems: "center" }}
                        >
                            {cat.emoji} {cat.label}
                        </span>

                        {/* View counter */}
                        <div className="flex items-center gap-1 text-xs text-white/80 bg-black/30 px-3 py-2 rounded-full" style={{ minHeight: "36px" }}>
                            <Eye size={12} />
                            <span>{(post.views * 100).toLocaleString()}</span>
                        </div>
                    </div>

                    {/* ── Diagonal watermark — dark pill so always visible ── */}
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
                                backdropFilter: "blur(3px)",
                                border: "1px solid rgba(255,255,255,0.18)",
                            }}
                        >
                            shayariprime.com
                        </span>
                    </div>
                </div>
            </div>

            {/* 2px gap between image card and content card */}
            <div style={{ height: "2px" }} />

            {/* ════════════════════════════════
                BOTTOM: Content Card (fixed face — comment panel is a sibling below)
            ════════════════════════════════ */}
            <div
                className="glass rounded-2xl p-4 md:p-5 card-content-face"
                style={{
                    background: "rgba(26,16,48,0.85)",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
                }}
            >
                {/* Title (hidden for humans, visible to search engines) */}
                <h2 className="sr-only">
                    {post.title}
                </h2>

                {/* Full shayari content */}
                <blockquote
                    className="shayari-text text-sm md:text-base mb-4 border-l-2 border-purple-500/50 pl-3 whitespace-pre-line leading-relaxed"
                    style={{ color: "var(--color-text-muted)" }}
                >
                    {post.content}
                </blockquote>

                {/* ── Action bar — always at bottom via mt-auto ── */}
                <div
                    className="card-action-bar flex items-center justify-between pt-3 border-t"
                    style={{ borderColor: "rgba(124,58,237,0.15)" }}
                >
                    {/* Like using pure CSS active:scale instead of framer-motion */}
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-1.5 text-sm font-medium transition-colors active:scale-90 ${isLiked ? "text-pink-400" : "text-purple-300/60 hover:text-pink-400"
                            }`}
                        aria-label={`${likes} likes`}
                        aria-pressed={isLiked}
                        style={{ transition: "transform 0.15s, color 0.2s" }}
                    >
                        <Heart size={16} className={isLiked ? "fill-current" : ""} />
                        <span>{likes}</span>
                    </button>

                    {/* Right icons */}
                    <div className="flex items-center gap-1">
                        {/* Comment toggle — controlled by parent (accordion) */}
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

            {/* Comment Panel — absolutely positioned BELOW the card. */}
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
