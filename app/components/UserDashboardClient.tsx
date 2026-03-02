"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
    Eye, Heart, Trash2, ExternalLink, Loader2, Pencil,
    CheckCircle, XCircle, Clock, X, Upload, Tag, AlignLeft, Type
} from "lucide-react";
import toast from "react-hot-toast";
import { deletePost, editPost } from "@/app/actions/postActions";
import type { PostData } from "@/app/actions/postActions";

const categoryColors: Record<string, string> = {
    sad: "#93c5fd",
    romantic: "#f9a8d4",
    motivational: "#fcd34d",
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    approved: { label: "Approved", color: "#34d399", icon: <CheckCircle size={12} /> },
    pending: { label: "Pending Review", color: "#fcd34d", icon: <Clock size={12} /> },
    rejected: { label: "Rejected", color: "#f87171", icon: <XCircle size={12} /> },
};

const categories = [
    { value: "sad", label: "💔 Sad Shayari" },
    { value: "romantic", label: "🌹 Romantic Shayari" },
    { value: "motivational", label: "✨ Motivational" },
];

interface EditModalProps {
    post: PostData;
    onClose: () => void;
    onSave: (updatedPost: PostData) => void;
}

function EditModal({ post, onClose, onSave }: EditModalProps) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [isPending, startTransition] = useTransition();
    const [imagePreview, setImagePreview] = useState<string | null>(post.image);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 1 * 1024 * 1024) {
            toast.error("⚠️ Image must be below 1 MB", { duration: 4000 });
            e.target.value = "";
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            const result = await editPost(post._id, formData);
            if (result.success) {
                toast.success("Shayari updated! Pending re-approval. ✅");
                onSave({ ...post, status: "pending", slug: result.slug ?? post.slug });
                onClose();
            } else {
                toast.error(result.error || "Failed to update");
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/70" aria-hidden="true" />
            <div
                className="relative glass rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                style={{ border: "1px solid rgba(124,58,237,0.3)" }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold gradient-text">✍️ Edit Shayari</h2>
                    <button onClick={onClose} className="p-2 rounded-lg text-purple-300 hover:bg-white/5">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2 text-purple-300">
                            <Type size={14} /> Title
                        </label>
                        <input
                            name="title"
                            defaultValue={post.title}
                            maxLength={200}
                            className="input-field"
                            required
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2 text-purple-300">
                            <Tag size={14} /> Category
                        </label>
                        <select name="category" defaultValue={post.category} className="input-field" required>
                            {categories.map((c) => (
                                <option key={c.value} value={c.value} style={{ background: "#1a1030" }}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Content */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2 text-purple-300">
                            <AlignLeft size={14} /> Shayari
                        </label>
                        <textarea
                            name="content"
                            defaultValue={post.content}
                            rows={7}
                            maxLength={5000}
                            className="input-field resize-none shayari-text"
                            required
                        />
                    </div>

                    {/* Image */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2 text-purple-300">
                            Cover Image <span className="text-purple-400/60 text-xs">(leave empty to keep current)</span>
                        </label>
                        <input ref={fileRef} name="image" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        <div
                            className="relative h-36 rounded-xl overflow-hidden cursor-pointer group"
                            onClick={() => fileRef.current?.click()}
                        >
                            {imagePreview && (
                                <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-sm flex items-center gap-2"><Upload size={14} /> Change Image</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">Cancel</button>
                        <button type="submit" disabled={isPending} className="btn-primary flex-1 justify-center">
                            {isPending ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><CheckCircle size={16} /> Save Changes</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function UserDashboardClient({ posts: initialPosts }: { posts: PostData[] }) {
    const router = useRouter();
    const [posts, setPosts] = useState(initialPosts);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [editingPost, setEditingPost] = useState<PostData | null>(null);
    const [isPending, startTransition] = useTransition();
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    const filtered = posts.filter((p) => {
        const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === "all" || p.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const handleDelete = (id: string, title: string) => {
        if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
        setDeletingId(id);
        startTransition(async () => {
            const result = await deletePost(id);
            if (result.success) {
                setPosts((prev) => prev.filter((p) => p._id !== id));
                toast.success("Post deleted");
                router.refresh(); // Re-sync server data
            } else {
                toast.error(result.error || "Delete failed");
            }
            setDeletingId(null);
        });
    };

    const handleSaveEdit = (updatedPost: PostData) => {
        setPosts((prev) => prev.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
        router.refresh(); // Re-sync server data after edit
    };

    if (posts.length === 0) {
        return (
            <div className="glass rounded-2xl p-12 text-center" style={{ border: "1px solid rgba(124,58,237,0.2)" }}>
                <p className="text-5xl mb-4">📭</p>
                <p className="text-lg font-medium text-purple-300 mb-2">No shayari yet!</p>
                <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
                    Share your first shayari with the world
                </p>
                <a href="/add-post" className="btn-primary">+ Add Your First Shayari</a>
            </div>
        );
    }

    return (
        <>
            {editingPost && (
                <EditModal
                    post={editingPost}
                    onClose={() => setEditingPost(null)}
                    onSave={handleSaveEdit}
                />
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <input
                    type="search"
                    placeholder="Search your posts..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input-field sm:max-w-xs"
                />
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="input-field sm:max-w-[180px]"
                >
                    <option value="all" style={{ background: "#1a1030" }}>All Status</option>
                    <option value="approved" style={{ background: "#1a1030" }}>✅ Approved</option>
                    <option value="pending" style={{ background: "#1a1030" }}>⏳ Pending</option>
                    <option value="rejected" style={{ background: "#1a1030" }}>❌ Rejected</option>
                </select>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {filtered.map((post) => {
                    const st = statusConfig[post.status ?? "pending"];
                    return (
                        <div key={post._id} className="glass rounded-xl p-4" style={{ border: "1px solid rgba(124,58,237,0.15)" }}>
                            <div className="flex gap-3 mb-3">
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                                    <Image src={post.image} alt={post.title} fill className="object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate text-white mb-1">{post.title}</p>
                                    <span className="text-xs capitalize" style={{ color: categoryColors[post.category] ?? "#a78bfa" }}>
                                        {post.category}
                                    </span>
                                    <div className="flex items-center gap-1.5 mt-1.5"
                                        style={{ color: st.color, fontSize: "0.7rem" }}>
                                        {st.icon} {st.label}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {post.status === "approved" && (
                                    <Link href="/" className="btn-ghost text-xs flex-1 justify-center">
                                        <ExternalLink size={12} /> View
                                    </Link>
                                )}
                                <button onClick={() => setEditingPost(post)}
                                    className="flex-1 flex items-center justify-center gap-1 text-xs py-2 rounded-full font-medium text-purple-300 hover:bg-purple-500/10 transition-all border"
                                    style={{ borderColor: "rgba(124,58,237,0.3)" }}>
                                    <Pencil size={12} /> Edit
                                </button>
                                <button onClick={() => handleDelete(post._id, post.title)}
                                    disabled={isPending && deletingId === post._id}
                                    className="flex-1 flex items-center justify-center gap-1 text-xs py-2 rounded-full font-medium text-pink-300 hover:bg-pink-500/10 transition-all border"
                                    style={{ borderColor: "rgba(236,72,153,0.3)" }}>
                                    {deletingId === post._id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
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
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ borderBottom: "1px solid rgba(124,58,237,0.15)" }}>
                                {["Image", "Title", "Category", "Status", "Views", "Likes", "Date", "Actions"].map((h) => (
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
                                            <p className="font-medium max-w-[200px] truncate text-white">{post.title}</p>
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
                                            <span className="flex items-center gap-1"><Eye size={13} /> {post.views}</span>
                                        </td>
                                        <td className="px-4 py-3 text-purple-300/60">
                                            <span className="flex items-center gap-1"><Heart size={13} /> {post.likes?.length ?? 0}</span>
                                        </td>
                                        <td className="px-4 py-3 text-purple-300/40 text-xs">
                                            {new Date(post.createdAt).toLocaleDateString("en-IN")}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {post.status === "approved" && (
                                                    <Link href="/"
                                                        className="p-1.5 rounded-lg text-purple-300/60 hover:text-purple-300 hover:bg-purple-500/10 transition-all"
                                                        title="View Live">
                                                        <ExternalLink size={14} />
                                                    </Link>
                                                )}
                                                <button onClick={() => setEditingPost(post)}
                                                    className="p-1.5 rounded-lg text-blue-300/60 hover:text-blue-300 hover:bg-blue-500/10 transition-all"
                                                    title="Edit">
                                                    <Pencil size={14} />
                                                </button>
                                                <button onClick={() => handleDelete(post._id, post.title)}
                                                    disabled={isPending && deletingId === post._id}
                                                    className="p-1.5 rounded-lg text-pink-300/60 hover:text-pink-300 hover:bg-pink-500/10 transition-all"
                                                    title="Delete">
                                                    {deletingId === post._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
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
        </>
    );
}
