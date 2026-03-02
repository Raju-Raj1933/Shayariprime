import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, Calendar, User } from "lucide-react";
import {
    fetchPost,
    fetchRelatedPosts,
    fetchAdjacentPosts,
    fetchAllSlugs,
} from "@/app/actions/postActions";
import Breadcrumb from "@/app/components/Breadcrumb";
import RelatedPosts from "@/app/components/RelatedPosts";
import PrevNextNav from "@/app/components/PrevNextNav";
import KavitaDetailClient from "@/app/components/KavitaDetailClient";

const BASE_URL = process.env.NEXTAUTH_URL || "https://shayariprime.com";

const categoryConfig = {
    sad: { label: "दर्द / Sad", emoji: "💔", className: "badge-sad", slug: "sad" },
    romantic: { label: "रोमांस / Romantic", emoji: "🌹", className: "badge-romantic", slug: "romantic" },
    motivational: { label: "प्रेरणा / Motivational", emoji: "✨", className: "badge-motivational", slug: "motivational" },
};

export async function generateStaticParams() {
    const slugs = await fetchAllSlugs();
    return slugs
        .filter((s) => s.type === "kavita")
        .map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const post = await fetchPost(slug);

    if (!post || post.status !== "approved" || post.type !== "kavita") {
        return { title: "Kavita Not Found | Shayariprime" };
    }

    const description =
        post.metaDescription ||
        post.content.replace(/\n/g, " ").trim().substring(0, 155);
    const canonicalUrl = `${BASE_URL}/kavita/${slug}`;

    return {
        title: post.title,
        description,
        alternates: { canonical: canonicalUrl },
        openGraph: {
            type: "article",
            title: post.title,
            description,
            url: canonicalUrl,
            images: [{ url: post.image, width: 800, height: 600, alt: post.title }],
            siteName: "Shayariprime",
            locale: "hi_IN",
            publishedTime: post.createdAt,
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description,
            images: [post.image],
            site: "@shayariprime",
        },
        robots: { index: true, follow: true },
    };
}

export const revalidate = 300;

export default async function KavitaDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const post = await fetchPost(slug);

    if (!post || post.status !== "approved" || post.type !== "kavita") {
        notFound();
    }

    const cat = categoryConfig[post.category as keyof typeof categoryConfig] ?? categoryConfig.sad;

    const [related, adjacent] = await Promise.all([
        fetchRelatedPosts(slug, post.category, "kavita", 4),
        fetchAdjacentPosts(slug, post.createdAt, "kavita"),
    ]);

    const canonicalUrl = `${BASE_URL}/kavita/${slug}`;
    const publishDate = new Date(post.createdAt).toLocaleDateString("hi-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    const publishDateISO = new Date(post.createdAt).toISOString();
    const authorName = (post.author as { name?: string } | null)?.name ?? "Shayariprime";

    const articleJsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.metaDescription || post.content.replace(/\n/g, " ").trim().substring(0, 155),
        image: post.image,
        url: canonicalUrl,
        datePublished: publishDateISO,
        dateModified: post.updatedAt || publishDateISO,
        author: { "@type": "Person", name: authorName },
        publisher: { "@type": "Organization", name: "Shayariprime", url: BASE_URL },
        inLanguage: "hi",
        keywords: post.category,
        mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    };

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": `${BASE_URL}/`
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Kavita",
                "item": `${BASE_URL}/kavita`
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": cat.label,
                "item": `${BASE_URL}/kavita?category=${cat.slug}`
            },
            {
                "@type": "ListItem",
                "position": 4,
                "name": post.title,
                "item": canonicalUrl
            }
        ]
    };

    return (
        /* ── Kota Factory Black & White wrapper ─────────────────────── */
        <div className="kavita-bw">
            {/* JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([articleJsonLd, breadcrumbJsonLd]) }}
            />

            <div className="max-w-3xl mx-auto px-4 py-8">

                {/* Breadcrumb */}
                <nav aria-label="Breadcrumb" className="kv-breadcrumb flex items-center gap-1 text-xs flex-wrap mb-5 font-mono">
                    <Link href="/" style={{ color: "var(--kv-text-muted)" }} className="hover:text-white transition-colors">Home</Link>
                    <span style={{ color: "var(--kv-border-mid)" }}> / </span>
                    <Link href="/kavita" style={{ color: "var(--kv-text-muted)" }} className="hover:text-white transition-colors">Kavita</Link>
                    <span style={{ color: "var(--kv-border-mid)" }}> / </span>
                    <Link href={`/kavita?category=${cat.slug}`} style={{ color: "var(--kv-text-muted)" }} className="hover:text-white transition-colors">{cat.label}</Link>
                    <span style={{ color: "var(--kv-border-mid)" }}> / </span>
                    <span className="kv-breadcrumb-current truncate max-w-[180px]" style={{ color: "var(--kv-text-sub)" }}>{post.title}</span>
                </nav>

                {/* ── Main Article ─────────────────────────────────────────── */}
                <article itemScope itemType="https://schema.org/Article">

                    {/* Featured Image — monochrome border */}
                    <div className="card-image-gradient-border rounded-2xl overflow-hidden mb-6">
                        <div
                            className="relative rounded-[14px] overflow-hidden w-full"
                            style={{ aspectRatio: "400 / 360", background: "#000" }}
                        >
                            {/* Grayscale filter on image for BW feel */}
                            <Image
                                src={post.image}
                                alt={post.title}
                                fill
                                className="object-cover"
                                style={{ filter: "grayscale(0.7) contrast(1.1)" }}
                                sizes="(max-width: 768px) 100vw, 768px"
                                priority
                                itemProp="image"
                            />
                            {/* Dark overlay */}
                            <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.35)" }} />
                            {/* Watermark */}
                            <div
                                className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
                                aria-hidden="true"
                                style={{ zIndex: 10 }}
                            >
                                <span
                                    style={{
                                        fontSize: "12px",
                                        fontWeight: 700,
                                        color: "rgba(255,255,255,0.7)",
                                        letterSpacing: "0.18em",
                                        transform: "rotate(-30deg)",
                                        whiteSpace: "nowrap",
                                        userSelect: "none",
                                        textTransform: "uppercase",
                                        background: "rgba(0,0,0,0.5)",
                                        padding: "4px 14px",
                                        borderRadius: "2px",
                                        border: "1px solid rgba(255,255,255,0.15)",
                                    }}
                                >
                                    shayariprime.com
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-3 mb-5 font-mono text-xs" style={{ color: "var(--kv-text-muted)" }}>
                        {/* Category — monochrome */}
                        <Link
                            href={`/kavita?category=${cat.slug}`}
                            className={`badge-sad badge-romantic badge-motivational ${cat.className} px-3 py-1 rounded-sm text-xs font-mono uppercase tracking-widest hover:opacity-80 transition-opacity`}
                            aria-label={`Category: ${cat.label}`}
                        >
                            § {cat.emoji} {cat.label}
                        </Link>

                        <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            <time dateTime={publishDateISO} itemProp="datePublished">{publishDate}</time>
                        </span>

                        <span className="flex items-center gap-1">
                            <Eye size={11} />
                            {(post.views * 100).toLocaleString()} reads
                        </span>

                        <span
                            className="flex items-center gap-1"
                            itemProp="author"
                            itemScope
                            itemType="https://schema.org/Person"
                        >
                            <User size={11} />
                            <span itemProp="name">{authorName}</span>
                        </span>
                    </div>

                    {/* Title — h1 with red underline accent */}
                    <h1
                        className="kv-detail-h1 text-3xl sm:text-4xl font-bold mb-8 leading-tight"
                        itemProp="headline"
                    >
                        {post.title}
                    </h1>

                    {/* ── Poem content — "blackboard" block ─────────────── */}
                    <div
                        className="kv-poem-block rounded-sm px-6 py-8 mb-6 relative overflow-hidden"
                    >
                        {/* Corner markers — like a chalkboard frame */}
                        <span className="absolute top-2 left-2 font-mono text-[10px]" style={{ color: "var(--kv-border-mid)" }}>┌─</span>
                        <span className="absolute top-2 right-2 font-mono text-[10px]" style={{ color: "var(--kv-border-mid)" }}>─┐</span>
                        <span className="absolute bottom-2 left-2 font-mono text-[10px]" style={{ color: "var(--kv-border-mid)" }}>└─</span>
                        <span className="absolute bottom-2 right-2 font-mono text-[10px]" style={{ color: "var(--kv-border-mid)" }}>─┘</span>

                        <blockquote
                            className="kv-poem-text whitespace-pre-line text-center text-lg md:text-[18px]"
                            itemProp="text"
                        >
                            {post.content}
                        </blockquote>

                        {/* Attribution */}
                        <p
                            className="mt-6 text-right font-mono text-xs"
                            style={{ color: "var(--kv-text-muted)" }}
                        >
                            — shayariprime.com
                        </p>
                    </div>

                    {/* Social share */}
                    <KavitaDetailClient
                        postId={post._id}
                        postSlug={slug}
                        postTitle={post.title}
                        canonicalUrl={canonicalUrl}
                        metaDescription={
                            post.metaDescription ||
                            post.content.replace(/\n/g, " ").trim().substring(0, 155)
                        }
                    />
                </article>

                {/* Divider */}
                <div
                    className="my-10 flex items-center gap-3"
                >
                    <div className="h-px flex-1" style={{ background: "var(--kv-border)" }} />
                    <span className="font-mono text-xs" style={{ color: "var(--kv-text-muted)" }}>∿ ∿ ∿</span>
                    <div className="h-px flex-1" style={{ background: "var(--kv-border)" }} />
                </div>

                {/* Prev/Next nav */}
                <PrevNextNav prev={adjacent.prev} next={adjacent.next} type="kavita" />

                {/* Related — monochrome */}
                <RelatedPosts posts={related} heading="मिलती-जुलती कविताएँ" />

                {/* Back link */}
                <div className="mt-10 text-center">
                    <Link
                        href="/kavita"
                        className="font-mono text-xs uppercase tracking-widest px-5 py-2.5 transition-all"
                        style={{
                            border: "1px solid var(--kv-border-mid)",
                            color: "var(--kv-text-muted)",
                        }}
                    >
                        ← archive
                    </Link>
                </div>
            </div>
        </div>
    );
}
