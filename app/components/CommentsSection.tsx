"use client";

import { useState, useTransition, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Reply, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { addComment, addReply, fetchPostComments } from "@/app/actions/commentActions";
import type { SerializedComment } from "@/app/actions/commentActions";

// ── helpers ──────────────────────────────────────────────────────────────────
function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
}
function formatTime(iso: string) {
    return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
    });
}

const EMOJI_LIST = ["❤️", "😢", "😍", "🔥", "😊", "💙", "🥺", "✨", "💔", "🌹", "😭", "🙏"];
const TRUNCATE_LEN = 140; // ~2 lines

// ── Comment text with "Read more" ─────────────────────────────────────────────
function CommentText({ text, emoji }: { text: string; emoji?: string }) {
    const [expanded, setExpanded] = useState(false);
    const long = text.length > TRUNCATE_LEN;
    const displayed = expanded || !long ? text : text.slice(0, TRUNCATE_LEN);
    return (
        <p className="text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>
            {emoji && <span className="mr-1 text-base">{emoji}</span>}
            {displayed}
            {long && !expanded && (
                <button
                    onClick={() => setExpanded(true)}
                    className="ml-1 text-purple-400 hover:text-purple-300 text-xs font-medium"
                >
                    ...Read more
                </button>
            )}
            {long && expanded && (
                <button
                    onClick={() => setExpanded(false)}
                    className="ml-1 text-purple-400 hover:text-purple-300 text-xs font-medium"
                >
                    {" "}Show less
                </button>
            )}
        </p>
    );
}

// ── Mini comment input ────────────────────────────────────────────────────────
function CommentInput({
    onSubmit,
    placeholder = "Write a comment...",
    buttonLabel = "Post",
    compact = false,
}: {
    onSubmit: (text: string, emoji: string) => Promise<void>;
    placeholder?: string;
    buttonLabel?: string;
    compact?: boolean;
}) {
    const [text, setText] = useState("");
    const [selectedEmoji, setSelectedEmoji] = useState("");
    const [showEmoji, setShowEmoji] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        startTransition(async () => {
            await onSubmit(text.trim(), selectedEmoji);
            setText(""); setSelectedEmoji(""); setShowEmoji(false);
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-2">
            <div className="relative">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={placeholder}
                    rows={compact ? 2 : 3}
                    maxLength={1000}
                    className="input-field resize-none text-sm"
                    style={{ paddingRight: "3rem" }}
                />
                <button
                    type="button"
                    onClick={() => setShowEmoji(!showEmoji)}
                    className="absolute top-2 right-2 text-lg hover:scale-125 transition-transform"
                >
                    {selectedEmoji || "😊"}
                </button>
            </div>

            {/* Emoji picker */}
            <AnimatePresence>
                {showEmoji && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="glass rounded-xl p-2"
                        style={{ border: "1px solid rgba(124,58,237,0.2)" }}
                    >
                        <div className="flex flex-wrap gap-1.5">
                            {EMOJI_LIST.map((em) => (
                                <button
                                    key={em} type="button"
                                    onClick={() => { setSelectedEmoji(em); setShowEmoji(false); }}
                                    className={`text-xl hover:scale-125 transition-transform rounded p-0.5 ${selectedEmoji === em ? "bg-purple-600/30" : ""}`}
                                >{em}</button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{text.length}/1000</span>
                <button
                    type="submit"
                    disabled={isPending || !text.trim()}
                    className="btn-primary text-xs py-1.5 px-3"
                >
                    {isPending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                    {isPending ? "Posting..." : buttonLabel}
                </button>
            </div>
        </form>
    );
}

// ── Single comment thread (recursive) ────────────────────────────────────────
function CommentThread({
    comment,
    postId,
    depth = 0,
    onReplyAdded,
}: {
    comment: SerializedComment;
    postId: string;
    depth?: number;
    onReplyAdded: (commentId: string, reply: SerializedComment) => void;
}) {
    const { data: session } = useSession();
    const [showReply, setShowReply] = useState(false);
    const [showReplies, setShowReplies] = useState(false);

    const handleReply = async (text: string, emoji: string) => {
        if (!session?.user) { toast.error("Please login to reply 💬"); return; }
        const result = await addReply(postId, comment._id, text, emoji);
        if (result.success) {
            const newReply: SerializedComment = {
                _id: result.commentId || Date.now().toString(),
                text,
                emoji,
                createdAt: new Date().toISOString(),
                user: { name: session.user.name ?? "You" },
                replies: [],
            };
            onReplyAdded(comment._id, newReply);
            toast.success("Reply added! ✨");
            setShowReply(false);
            setShowReplies(true);
        } else {
            toast.error(result.error || "Failed to add reply");
        }
    };

    return (
        <div className={depth > 0 ? "mt-3" : ""}>
            <div
                className="flex gap-1 md:gap-2 md:gap-2.5"
                style={{
                    marginLeft: depth === 1 ? "1rem" : depth > 1 ? "1.5rem" : "0",
                    borderLeft: depth > 0 ? "2px solid rgba(124,58,237,0.15)" : "none",
                    paddingLeft: depth > 0 ? "0.5rem" : "0",
                }}
            >
                {/* Avatar */}
                <div
                    className="w-5 h-5 md:w-7 md:h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
                >
                    {getInitials(comment.user.name)}
                </div>

                <div className="flex-1 min-w-0">
                    {/* Bubble */}
                    <div className="rounded-xl rounded-tl-none p-2.5 mb-1.5"
                        style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.12)" }}>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-purple-300">{comment.user.name}</span>
                            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                {formatTime(comment.createdAt)}
                            </span>
                        </div>
                        <CommentText text={comment.text} emoji={comment.emoji} />
                    </div>

                    {/* Actions */}
                    {depth < 4 && (
                        <div className="flex items-center gap-3 mb-2">
                            <button
                                onClick={() => {
                                    if (!session?.user) { toast.error("Login to reply 💬"); return; }
                                    setShowReply((v) => !v);
                                }}
                                className="flex items-center gap-1 text-xs transition-colors hover:text-purple-300"
                                style={{ color: "var(--color-text-muted)" }}
                            >
                                <Reply size={11} /> Reply
                            </button>

                            {comment.replies.length > 0 && (
                                <button
                                    onClick={() => setShowReplies((v) => !v)}
                                    className="flex items-center gap-1 text-xs transition-colors hover:text-purple-300"
                                    style={{ color: "var(--color-text-muted)" }}
                                >
                                    {showReplies ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                                    {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Reply input */}
                    <AnimatePresence>
                        {showReply && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-3 overflow-hidden">
                                <CommentInput onSubmit={handleReply} placeholder={`Reply to ${comment.user.name}...`} buttonLabel="Reply" compact />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Nested replies rendered OUTSIDE the parent's flex scope so they don't implicitly stack padding unnecessarily */}
            <AnimatePresence>
                {showReplies && comment.replies.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col">
                        {comment.replies.map((reply) => (
                            <CommentThread
                                key={reply._id}
                                comment={reply}
                                postId={postId}
                                depth={depth + 1}
                                onReplyAdded={onReplyAdded}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function CommentsSection({ postId }: { postId: string }) {
    const { data: session } = useSession();
    const [comments, setComments] = useState<SerializedComment[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch on mount
    useEffect(() => {
        fetchPostComments(postId).then(({ comments: fetched }) => {
            setComments(fetched);
            setLoading(false);
        });
    }, [postId]);

    const handleComment = async (text: string, emoji: string) => {
        if (!session?.user) { toast.error("Please login to comment 💬"); return; }
        const result = await addComment(postId, text, emoji);
        if (result.success) {
            const newComment: SerializedComment = {
                _id: result.commentId || Date.now().toString(),
                text, emoji,
                createdAt: new Date().toISOString(),
                user: { name: session.user.name ?? "You" },
                replies: [],
            };
            setComments((prev) => [newComment, ...prev]);
            toast.success("Comment posted! 🎉");
        } else {
            toast.error(result.error || "Failed to post comment");
        }
    };

    // Recursive state update for replies
    function addReplyToComment(
        list: SerializedComment[],
        parentId: string,
        reply: SerializedComment
    ): SerializedComment[] {
        return list.map((c) => {
            if (c._id === parentId) return { ...c, replies: [...c.replies, reply] };
            return { ...c, replies: addReplyToComment(c.replies, parentId, reply) };
        });
    }

    const handleReplyAdded = (commentId: string, reply: SerializedComment) => {
        setComments((prev) => addReplyToComment(prev, commentId, reply));
    };

    return (
        <div className="space-y-4 pt-4 border-t" style={{ borderColor: "rgba(124,58,237,0.15)" }}>
            {/* Add comment */}
            <div className="glass rounded-xl p-3" style={{ border: "1px solid rgba(124,58,237,0.18)" }}>
                {session?.user ? (
                    <>
                        <div className="flex items-center gap-2 mb-2">
                            <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                                style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
                            >
                                {getInitials(session.user.name ?? "U")}
                            </div>
                            <span className="text-xs font-medium text-purple-300">{session.user.name}</span>
                        </div>
                        <CommentInput onSubmit={handleComment} compact />
                    </>
                ) : (
                    <div className="flex items-center justify-between">
                        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Login to join the conversation 💬</p>
                        <a href="/login" className="btn-primary text-xs py-1.5 px-3">Login</a>
                    </div>
                )}
            </div>

            {/* Comment list */}
            {loading ? (
                <div className="flex items-center justify-center py-6">
                    <Loader2 size={20} className="animate-spin text-purple-400" />
                </div>
            ) : comments.length === 0 ? (
                <p className="text-center text-xs py-4" style={{ color: "var(--color-text-muted)" }}>
                    No comments yet. Be the first! 💬
                </p>
            ) : (
                <div className="space-y-3">
                    {comments.map((comment) => (
                        <CommentThread
                            key={comment._id}
                            comment={comment}
                            postId={postId}
                            depth={0}
                            onReplyAdded={handleReplyAdded}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
