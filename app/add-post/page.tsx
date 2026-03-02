"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import {
    Image as ImageIcon,
    Type,
    AlignLeft,
    Tag,
    CheckCircle,
    Loader2,
    Upload,
    AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { addPost } from "@/app/actions/postActions";

// Category options differ by post type
const shayariCategories = [
    { value: "sad", label: "💔 Sad Shayari", labelHi: "दर्द शायरी" },
    { value: "romantic", label: "🌹 Romantic Shayari", labelHi: "रोमांटिक शायरी" },
    { value: "motivational", label: "✨ Motivational Shayari", labelHi: "प्रेरणादायक शायरी" },
];

const kavitaCategories = [
    { value: "sad", label: "💔 Sad Kavita", labelHi: "दर्द कविता" },
    { value: "romantic", label: "🌹 Romantic Kavita", labelHi: "रोमांटिक कविता" },
    { value: "motivational", label: "✨ Motivational Kavita", labelHi: "प्रेरणादायक कविता" },
];

interface FieldError {
    title?: string;
    category?: string;
    content?: string;
    image?: string;
}

function FieldErrorMsg({ msg }: { msg?: string }) {
    if (!msg) return null;
    return (
        <p className="flex items-center gap-1 mt-1.5 text-xs" style={{ color: "#f87171" }} role="alert">
            <AlertCircle size={12} />
            {msg}
        </p>
    );
}

export default function AddPostPage() {
    const router = useRouter();
    const fileRef = useRef<HTMLInputElement>(null);
    const [isPending, startTransition] = useTransition();
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [charCount, setCharCount] = useState(0);
    const [formError, setFormError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<FieldError>({});
    const [postType, setPostType] = useState<"shayari" | "kavita">("shayari");

    const MAX_IMAGE_MB = 1;
    const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024;

    const categories = postType === "kavita" ? kavitaCategories : shayariCategories;
    const typeLabel = postType === "kavita" ? "Kavita" : "Shayari";

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > MAX_IMAGE_BYTES) {
            toast.error(
                `⚠️ Image too large! Please upload an image below ${MAX_IMAGE_MB} MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)} MB.`,
                { duration: 5000 }
            );
            e.target.value = "";
            setImagePreview(null);
            return;
        }
        // Clear image error once user selects a valid file
        setFieldErrors((prev) => ({ ...prev, image: undefined }));
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    // ── Per-field validation ─────────────────────────────────────────────
    const validate = (formData: FormData): FieldError => {
        const errors: FieldError = {};
        const title = (formData.get("title") as string)?.trim();
        const content = (formData.get("content") as string)?.trim();
        const category = formData.get("category") as string;
        const imageFile = formData.get("image") as File;

        if (!title) errors.title = "Title is required.";
        else if (title.length < 3) errors.title = "Title must be at least 3 characters.";

        if (!category) errors.category = "Please select a category.";

        if (!content) errors.content = `${typeLabel} content is required.`;
        else if (content.length < 10) errors.content = "Content is too short (min 10 characters).";

        if (!imageFile || !imageFile.size) {
            errors.image = "Please upload a cover image — it is required.";
        } else if (imageFile.size > MAX_IMAGE_BYTES) {
            errors.image = `Image too large! Max allowed: ${MAX_IMAGE_MB} MB. Your file: ${(imageFile.size / 1024 / 1024).toFixed(1)} MB.`;
        }

        return errors;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormError(null);
        const formData = new FormData(e.currentTarget);

        const errors = validate(formData);
        setFieldErrors(errors);

        if (Object.keys(errors).length > 0) {
            setFormError("Please fill in all required fields before submitting.");
            // Scroll to first error
            const firstErrorEl = document.querySelector("[data-field-error]");
            firstErrorEl?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }

        startTransition(async () => {
            const result = await addPost(formData);
            if (result.success) {
                if (result.status === "approved") {
                    toast.success(`${typeLabel} published! 🎉`);
                    router.push(postType === "kavita" ? "/kavita" : "/");
                } else {
                    toast.success(`${typeLabel} submitted! It will go live after admin review. ⏳`);
                    router.push("/my-dashboard");
                }
            } else {
                setFormError(result.error || "Failed to publish. Try again.");
                toast.error(result.error || "Failed to publish");
            }
        });
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                        ✍️ Add New Post
                    </h1>
                    <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                        Share your poem with the Shayariprime community
                    </p>
                </div>

                {/* Global form error */}
                {formError && (
                    <div
                        className="mb-6 p-4 rounded-xl text-sm flex items-start gap-2"
                        style={{
                            background: "rgba(239,68,68,0.1)",
                            border: "1px solid rgba(239,68,68,0.3)",
                            color: "#fca5a5",
                        }}
                        role="alert"
                        aria-live="assertive"
                    >
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        {formError}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="glass rounded-2xl p-6 md:p-8 space-y-6"
                    style={{ border: "1px solid rgba(124,58,237,0.2)" }}
                >
                    {/* ── Type Toggle — Shayari or Kavita ────────────── */}
                    <div>
                        <p className="text-sm font-medium mb-3 text-purple-300">
                            📌 Post Type <span className="text-pink-400">*</span>
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            {(["shayari", "kavita"] as const).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => {
                                        setPostType(t);
                                        // Reset category error when type changes
                                        setFieldErrors((prev) => ({ ...prev, category: undefined }));
                                    }}
                                    className="rounded-xl py-4 px-4 font-semibold text-sm transition-all border-2"
                                    style={{
                                        background: postType === t ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.04)",
                                        borderColor: postType === t ? "#7c3aed" : "rgba(124,58,237,0.2)",
                                        color: postType === t ? "#e9d5ff" : "var(--color-text-muted)",
                                        boxShadow: postType === t ? "0 0 20px rgba(124,58,237,0.2)" : "none",
                                    }}
                                >
                                    {t === "shayari" ? "🖊️ Shayari" : "📜 Kavita"}
                                    <span className="block text-xs mt-0.5 opacity-70">
                                        {t === "shayari" ? "Goes on Home page" : "Goes on Kavita page"}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <input type="hidden" name="type" value={postType} />
                    </div>

                    {/* ── Title ──────────────────────────────────────── */}
                    <div data-field-error={fieldErrors.title ? "true" : undefined}>
                        <label
                            htmlFor="title"
                            className="flex items-center gap-2 text-sm font-medium mb-2 text-purple-300"
                        >
                            <Type size={15} />
                            {typeLabel} Title <span className="text-pink-400">*</span>
                        </label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            maxLength={200}
                            placeholder="E.g. दर्द की इन्तेहा"
                            className="input-field"
                            aria-invalid={!!fieldErrors.title}
                            aria-describedby={fieldErrors.title ? "title-err" : undefined}
                            style={fieldErrors.title ? { borderColor: "rgba(239,68,68,0.6)" } : {}}
                            onChange={() => setFieldErrors((prev) => ({ ...prev, title: undefined }))}
                        />
                        <span id="title-err"><FieldErrorMsg msg={fieldErrors.title} /></span>
                    </div>

                    {/* ── Category ───────────────────────────────────── */}
                    <div data-field-error={fieldErrors.category ? "true" : undefined}>
                        <label
                            htmlFor="category"
                            className="flex items-center gap-2 text-sm font-medium mb-2 text-purple-300"
                        >
                            <Tag size={15} />
                            Category <span className="text-pink-400">*</span>
                        </label>
                        <select
                            id="category"
                            name="category"
                            className="input-field"
                            defaultValue="sad"
                            aria-invalid={!!fieldErrors.category}
                            aria-describedby={fieldErrors.category ? "cat-err" : undefined}
                            style={fieldErrors.category ? { borderColor: "rgba(239,68,68,0.6)" } : {}}
                            onChange={() => setFieldErrors((prev) => ({ ...prev, category: undefined }))}
                        >
                            {categories.map((c) => (
                                <option key={c.value} value={c.value} style={{ background: "#1a1030" }}>
                                    {c.label} — {c.labelHi}
                                </option>
                            ))}
                        </select>
                        <span id="cat-err"><FieldErrorMsg msg={fieldErrors.category} /></span>
                    </div>

                    {/* ── Content ────────────────────────────────────── */}
                    <div data-field-error={fieldErrors.content ? "true" : undefined}>
                        <label
                            htmlFor="content"
                            className="flex items-center gap-2 text-sm font-medium mb-2 text-purple-300"
                        >
                            <AlignLeft size={15} />
                            {typeLabel} Content <span className="text-pink-400">*</span>
                        </label>
                        <textarea
                            id="content"
                            name="content"
                            rows={8}
                            maxLength={5000}
                            placeholder={postType === "kavita"
                                ? "तेरी याद में, एक पल भी चैन नहीं,\nदिल में तेरी धड़कन है, फिर भी तन्हाई है..."
                                : "तेरी याद में रोया करते हैं,\nदिल को खोया करते हैं..."}
                            className="input-field resize-none shayari-text"
                            aria-invalid={!!fieldErrors.content}
                            aria-describedby={fieldErrors.content ? "content-err" : undefined}
                            style={fieldErrors.content ? { borderColor: "rgba(239,68,68,0.6)" } : {}}
                            onChange={(e) => {
                                setCharCount(e.target.value.length);
                                setFieldErrors((prev) => ({ ...prev, content: undefined }));
                            }}
                        />
                        <div className="flex items-center justify-between mt-1">
                            <span id="content-err"><FieldErrorMsg msg={fieldErrors.content} /></span>
                            <p className="text-xs ml-auto" style={{ color: "var(--color-text-muted)" }}>
                                {charCount}/5000
                            </p>
                        </div>
                    </div>

                    {/* ── Image Upload ───────────────────────────────── */}
                    <div data-field-error={fieldErrors.image ? "true" : undefined}>
                        <label
                            className="flex items-center gap-2 text-sm font-medium mb-2 text-purple-300"
                        >
                            <ImageIcon size={15} />
                            Cover Image <span className="text-pink-400">* (Required)</span>
                        </label>

                        <input
                            ref={fileRef}
                            id="image"
                            name="image"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />

                        {imagePreview ? (
                            <div className="relative h-48 rounded-xl overflow-hidden cursor-pointer group"
                                onClick={() => fileRef.current?.click()}>
                                <Image
                                    src={imagePreview}
                                    alt="Preview"
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">
                                        Click to change image
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileRef.current?.click()}
                                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors hover:border-purple-400"
                                style={{
                                    borderColor: fieldErrors.image
                                        ? "rgba(239,68,68,0.5)"
                                        : "rgba(124,58,237,0.3)",
                                }}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
                                aria-label="Upload cover image"
                            >
                                <Upload size={32} className="mx-auto mb-3 text-purple-400/60" />
                                <p className="text-sm font-medium text-purple-300/60">
                                    Click to upload cover image
                                </p>
                                <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                                    PNG, JPG, WEBP — Max 1 MB
                                </p>
                            </div>
                        )}
                        <FieldErrorMsg msg={fieldErrors.image} />
                    </div>

                    {/* ── Submit ─────────────────────────────────────── */}
                    <button
                        type="submit"
                        disabled={isPending}
                        className="btn-primary w-full justify-center py-3.5 text-base"
                    >
                        {isPending ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Publishing...
                            </>
                        ) : (
                            <>
                                <CheckCircle size={18} />
                                Publish {typeLabel}
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
