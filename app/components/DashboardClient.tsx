"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
    Eye, Heart, Trash2, ExternalLink, Loader2,
    CheckCircle, XCircle, Clock
} from "lucide-react";
import toast from "react-hot-toast";
import { deletePost, approvePost, rejectPost } from "@/app/actions/postActions";
import type { PostData } from "@/app/actions/postActions";

const categoryColors: Record<string, string> = {
    sad: "#93c5fd",
    romantic: "#f9a8d4",
    motivational: "#fcd34d",
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    approved: { label: "Live", color: "#34d399", icon: <CheckCircle size={12} /> },
    pending: { label: "Pending", color: "#fcd34d", icon: <Clock size={12} /> },
    rejected: { label: "Rejected", color: "#f87171", icon: <XCircle size={12} /> },
};

export default function DashboardClient({ posts: initialPosts }: { posts: PostData[] }) {
    const router = useRouter();
    const [posts, setPosts] = useState(initialPosts);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [search, setSearch] = useState("");
    const [filterCat, setFilterCat] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");

    const filtered = posts.filter((p) => {
        const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
        const matchCat = filterCat === "all" || p.category === filterCat;
        const matchStatus = filterStatus === "all" || p.status === filterStatus;
        return matchSearch && matchCat && matchStatus;
    });

    const pendingCount = posts.filter(p => p.status === "pending").length;

    const handleDelete = (id: string, title: string) => {
        if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
        setLoadingId(id);
        startTransition(async () => {
            const result = await deletePost(id);
            if (result.success) {
                setPosts((prev) => prev.filter((p) => p._id !== id));
                toast.success("Post deleted");
                router.refresh();
            } else {
                toast.error(result.error || "Delete failed");
            }
            setLoadingId(null);
        });
    };

    const handleApprove = (id: string) => {
        setLoadingId(id + "_approve");
        startTransition(async () => {
            const result = await approvePost(id);
            if (result.success) {
                setPosts((prev) => prev.map(p => p._id === id ? { ...p, status: "approved" } : p));
                toast.success("Post approved and now live! ✅");
                router.refresh();
            } else {
                toast.error(result.error || "Approve failed");
            }
            setLoadingId(null);
        });
    };

    const handleReject = (id: string) => {
        setLoadingId(id + "_reject");
        startTransition(async () => {
            const result = await rejectPost(id);
            if (result.success) {
                setPosts((prev) => prev.map(p => p._id === id ? { ...p, status: "rejected" } : p));
                toast.success("Post rejected");
                router.refresh();
            } else {
                toast.error(result.error || "Reject failed");
            }
            setLoadingId(null);
        });
    };

    return (
        <div>
            {/* Pending alert */}
            {pendingCount > 0 && (
                <div className="mb-6 p-4 rounded-xl flex items-center gap-3"
                    style={{ background: "rgba(252,211,77,0.1)", border: "1px solid rgba(252,211,77,0.3)" }}>
                    <Clock size={18} style={{ color: "#fcd34d" }} />
                    <p className="text-sm" style={{ color: "#fcd34d" }}>
                        <strong>{pendingCount}</strong> post{pendingCount > 1 ? "s" : ""} waiting for your approval
                    </p>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <input
                    type="search"
                    placeholder="Search posts..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input-field sm:max-w-xs"
                />
                <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="input-field sm:max-w-[160px]">
                    <option value="all" style={{ background: "#1a1030" }}>All Categories</option>
                    <option value="sad" style={{ background: "#1a1030" }}>Sad</option>
                    <option value="romantic" style={{ background: "#1a1030" }}>Romantic</option>
                    <option value="motivational" style={{ background: "#1a1030" }}>Motivational</option>
                </select>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field sm:max-w-[160px]">
                    <option value="all" style={{ background: "#1a1030" }}>All Status</option>
                    <option value="approved" style={{ background: "#1a1030" }}>✅ Approved</option>
                    <option value="pending" style={{ background: "#1a1030" }}>⏳ Pending</option>
                    <option value="rejected" style={{ background: "#1a1030" }}>❌ Rejected</option>
                </select>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
                {filtered.map((post) => {
                    const st = statusConfig[post.status ?? "pending"];
                    return (
                        <div key={post._id} className="glass rounded-xl p-4" style={{ border: "1px solid rgba(124,58,237,0.15)" }}>
                            <div className="flex gap-3 mb-3">
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                                    <Image src={post.image} alt={post.title} fill className="object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate text-white">{post.title}</p>
                                    <span className="text-xs capitalize" style={{ color: categoryColors[post.category] ?? "#a78bfa" }}>
                                        {post.category}
                                    </span>
                                    <div className="flex items-center gap-1 mt-1" style={{ color: st.color, fontSize: "0.7rem" }}>
                                        {st.icon} {st.label}
                                    </div>
                                    {post.author && (
                                        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                                            by {post.author.name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Approve / Reject for pending */}
                            {post.status === "pending" && (
                                <div className="flex gap-2 mb-2">
                                    <button onClick={() => handleApprove(post._id)}
                                        disabled={isPending}
                                        className="flex-1 flex items-center justify-center gap-1 text-xs py-2 rounded-full font-medium transition-all border"
                                        style={{ color: "#34d399", borderColor: "rgba(52,211,153,0.4)", background: "rgba(52,211,153,0.08)" }}>
                                        {loadingId === post._id + "_approve" ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                                        Approve
                                    </button>
                                    <button onClick={() => handleReject(post._id)}
                                        disabled={isPending}
                                        className="flex-1 flex items-center justify-center gap-1 text-xs py-2 rounded-full font-medium transition-all border"
                                        style={{ color: "#f87171", borderColor: "rgba(248,113,113,0.4)", background: "rgba(248,113,113,0.08)" }}>
                                        {loadingId === post._id + "_reject" ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                                        Reject
                                    </button>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Link href="/" className="btn-ghost text-xs flex-1 justify-center">
                                    <ExternalLink size={12} /> View
                                </Link>
                                <button onClick={() => handleDelete(post._id, post.title)}
                                    disabled={isPending && loadingId === post._id}
                                    className="flex-1 flex items-center justify-center gap-1 text-xs py-2 rounded-full font-medium text-pink-300 hover:bg-pink-500/10 transition-all border"
                                    style={{ borderColor: "rgba(236,72,153,0.3)" }}>
                                    {loadingId === post._id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                                    Delete
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block glass rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(124,58,237,0.2)" }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm" aria-label="Posts management table">
                        <thead>
                            <tr style={{ borderBottom: "1px solid rgba(124,58,237,0.15)" }}>
                                {["Image", "Title", "Author", "Category", "Status", "Views", "Likes", "Date", "Actions"].map((h) => (
                                    <th key={h} className="px-4 py-4 text-left font-medium text-purple-300/70 text-xs uppercase tracking-wider">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((post, i) => {
                                const st = statusConfig[post.status ?? "pending"];
                                return (
                                    <tr key={post._id} className="transition-colors hover:bg-purple-600/5"
                                        style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(124,58,237,0.08)" : "none" }}>
                                        <td className="px-4 py-3">
                                            <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                                                <Image src={post.image} alt={post.title} fill className="object-cover" />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium max-w-[180px] truncate text-white">{post.title}</p>
                                        </td>
                                        <td className="px-4 py-3 text-purple-300/60 text-xs">
                                            {post.author?.name ?? "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs capitalize font-medium px-2 py-1 rounded-full"
                                                style={{ color: categoryColors[post.category] ?? "#a78bfa", background: `${categoryColors[post.category]}15`, border: `1px solid ${categoryColors[post.category]}30` }}>
                                                {post.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="flex items-center gap-1 text-xs font-medium" style={{ color: st.color }}>
                                                {st.icon} {st.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-purple-300/60">
                                            <span className="flex items-center gap-1"><Eye size={13} /> {post.views.toLocaleString()}</span>
                                        </td>
                                        <td className="px-4 py-3 text-purple-300/60">
                                            <span className="flex items-center gap-1"><Heart size={13} /> {post.likes?.length ?? 0}</span>
                                        </td>
                                        <td className="px-4 py-3 text-purple-300/40 text-xs">
                                            {new Date(post.createdAt).toLocaleDateString("en-IN")}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <Link href="/"
                                                    className="p-1.5 rounded-lg text-purple-300/60 hover:text-purple-300 hover:bg-purple-500/10 transition-all"
                                                    title="View">
                                                    <ExternalLink size={14} />
                                                </Link>

                                                {post.status === "pending" && (
                                                    <>
                                                        <button onClick={() => handleApprove(post._id)}
                                                            disabled={isPending}
                                                            className="p-1.5 rounded-lg transition-all"
                                                            style={{ color: "#34d399" }}
                                                            title="Approve">
                                                            {loadingId === post._id + "_approve"
                                                                ? <Loader2 size={14} className="animate-spin" />
                                                                : <CheckCircle size={14} />}
                                                        </button>
                                                        <button onClick={() => handleReject(post._id)}
                                                            disabled={isPending}
                                                            className="p-1.5 rounded-lg transition-all"
                                                            style={{ color: "#f87171" }}
                                                            title="Reject">
                                                            {loadingId === post._id + "_reject"
                                                                ? <Loader2 size={14} className="animate-spin" />
                                                                : <XCircle size={14} />}
                                                        </button>
                                                    </>
                                                )}

                                                <button onClick={() => handleDelete(post._id, post.title)}
                                                    disabled={isPending && loadingId === post._id}
                                                    className="p-1.5 rounded-lg text-pink-300/60 hover:text-pink-300 hover:bg-pink-500/10 transition-all"
                                                    title="Delete">
                                                    {loadingId === post._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-4xl mb-3">📭</p>
                        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No posts found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
