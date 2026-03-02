import type { Metadata } from "next";
import { getCachedPosts } from "@/app/actions/postActions";
import KavitaGrid from "@/app/components/KavitaGrid";
import Link from "next/link";
import { BookOpen, TrendingUp, Feather, ChevronLeft, ChevronRight } from "lucide-react";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ category?: string }> }): Promise<Metadata> {
    const params = await searchParams;
    const category = params.category || "all";

    const titles: Record<string, string> = {
        all: "Kavita – Best Hindi Kavita & Poetry | Shayariprime",
        sad: "Sad Kavita - दर्द भरी कविताएँ | Shayariprime",
        romantic: "Romantic Kavita - लव कविताएँ | Shayariprime",
        motivational: "Motivational Kavita - प्रेरणादायक कविताएँ | Shayariprime",
    };

    const descriptions: Record<string, string> = {
        all: "Browse the best Hindi Kavita and Poetry on Shayariprime. Sad Kavita, Romantic Poetry, Motivational Kavita — curated poems that touch your heart.",
        sad: "Read heart-touching Sad Kavita in Hindi. A beautiful collection of dard bhari kavita and emotional poetry with original content.",
        romantic: "Discover deep Romantic Kavita and love poetry in Hindi. Soulful and meaningful words to express your love.",
        motivational: "Find highly inspiring Motivational Kavita in Hindi to encourage and uplift you towards success.",
    };

    const title = titles[category] || titles.all;
    const description = descriptions[category] || descriptions.all;
    const url = category === "all" ? "https://shayariprime.com/kavita" : `https://shayariprime.com/kavita?category=${category}`;

    return {
        title,
        description,
        alternates: { canonical: url },
        openGraph: {
            title,
            description,
            url,
            type: "website",
            siteName: "Shayariprime",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
        },
    };
}

export const revalidate = 60;
const LIMIT = 15;

const categoryMeta: Record<string, { titleHi: string; desc: string; emoji: string }> = {
    all: { titleHi: "सभी कविताएँ", desc: "All Kavita", emoji: "📖" },
    sad: { titleHi: "दर्द की कविताएँ", desc: "Sad Kavita", emoji: "💔" },
    romantic: { titleHi: "रोमांटिक कविताएँ", desc: "Romantic Kavita", emoji: "🌹" },
    motivational: { titleHi: "प्रेरणादायक कविताएँ", desc: "Motivational Kavita", emoji: "✨" },
};

const categories = [
    { value: "all", label: "[ ALL ]" },
    { value: "sad", label: "[ SAD ]" },
    { value: "romantic", label: "[ ROMANTIC ]" },
    { value: "motivational", label: "[ MOTIVATIONAL ]" },
];

export default async function KavitaPage({
    searchParams,
}: {
    searchParams: Promise<{ category?: string; page?: string }>;
}) {
    const params = await searchParams;
    const category = params.category || "all";
    const page = Math.max(1, parseInt(params.page || "1", 10));

    const { posts, total } = await getCachedPosts(
        category === "all" ? undefined : category,
        LIMIT,
        page,
        false,
        "kavita"
    );

    const totalPages = Math.ceil(total / LIMIT);
    const meta = categoryMeta[category] ?? categoryMeta.all;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": meta.titleHi,
        "description": meta.desc,
        "url": category === "all" ? "https://shayariprime.com/kavita" : `https://shayariprime.com/kavita?category=${category}`,
    };

    return (
        /* ── Kota Factory Black & White wrapper ────────────────────── */
        <div className="kavita-bw">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* ── Hero ────────────────────────────────────────────────── */}
            <section className="pt-10 pb-12 px-4 text-center">
                {/* Eyebrow badge */}
                <div
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm text-xs mb-8 font-mono uppercase tracking-[0.2em]"
                    style={{
                        background: "var(--kv-bg-elevated)",
                        border: "1px solid var(--kv-border-mid)",
                        color: "var(--kv-text-muted)",
                        letterSpacing: "0.18em",
                    }}
                >
                    <Feather size={11} />
                    shayariprime.com — poetry archive
                </div>

                {/* Main heading */}
                <h1 className="kavita-hero-title text-4xl sm:text-5xl md:text-6xl font-medium md:font-semibold mb-4 leading-tight">
                    {meta.titleHi}
                </h1>

                {/* Sub-line: scientific / equation style */}
                <p
                    className="font-mono text-sm tracking-widest mb-2 uppercase"
                    style={{ color: "var(--kv-text-muted)" }}
                >
                    /{category !== "all" ? category : "all"} · {total} entries · page {page}
                </p>
                <p
                    className="text-base max-w-xl mx-auto leading-relaxed font-serif"
                    style={{ color: "var(--kv-text-sub)" }}
                >
                    {meta.emoji} {meta.desc} — each poem a world of its own
                </p>

                {/* Stats row */}
                <div className="flex items-center justify-center gap-8 mt-8">
                    {[
                        { icon: <BookOpen size={14} />, label: `${total}+ Kavita` },
                        { icon: <TrendingUp size={14} />, label: "Daily Updated" },
                    ].map((s) => (
                        <div
                            key={s.label}
                            className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest"
                            style={{ color: "var(--kv-text-muted)" }}
                        >
                            {s.icon} {s.label}
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Monochrome Category Filter ──────────────────────────── */}
            <section className="px-4 mb-8 max-w-7xl mx-auto">
                <nav
                    className="flex flex-wrap gap-2 justify-center font-mono"
                    aria-label="Category filter"
                    role="navigation"
                >
                    {categories.map((cat) => {
                        const isActive = category === cat.value;
                        return (
                            <Link
                                key={cat.value}
                                href={`?category=${cat.value}&page=1`}
                                scroll={false}
                                aria-current={isActive ? "page" : undefined}
                                className="px-5 py-2 text-xs uppercase tracking-widest transition-all duration-200"
                                style={{
                                    background: isActive ? "var(--kv-text)" : "var(--kv-bg-elevated)",
                                    color: isActive ? "var(--kv-bg)" : "var(--kv-text-muted)",
                                    border: isActive
                                        ? "1px solid var(--kv-text)"
                                        : "1px solid var(--kv-border-mid)",
                                    fontFamily: "monospace",
                                    borderRadius: "2px",
                                    fontWeight: isActive ? 700 : 400,
                                    boxShadow: isActive
                                        ? "0 0 16px rgba(255,255,255,0.12)"
                                        : "none",
                                }}
                            >
                                {cat.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Horizontal rule */}
                <div
                    className="mt-6 h-px"
                    style={{
                        background:
                            "linear-gradient(to right, transparent, var(--kv-border-mid), transparent)",
                    }}
                />
            </section>

            {/* ── Kavita Grid ─────────────────────────────────────────── */}
            <section
                className="px-4 pb-16 max-w-7xl mx-auto"
                aria-label="Kavita collection"
            >
                {/* Section label — Kota Factory style: monospace  */}
                <div className="flex items-center gap-3 mb-7">
                    <div
                        className="h-px flex-1"
                        style={{ background: "var(--kv-border)" }}
                    />
                    <span
                        className="kavita-section-heading text-sm font-mono uppercase tracking-[0.15em]"
                    >
                        § {page > 1 ? `${meta.desc} — pg.${page}` : meta.desc}
                    </span>
                    <div
                        className="h-px flex-1"
                        style={{ background: "var(--kv-border)" }}
                    />
                </div>

                {posts.length > 0 ? (
                    <>
                        <KavitaGrid posts={posts} />

                        {/* Pagination — monochrome */}
                        {totalPages > 1 && (
                            <nav
                                className="flex justify-center items-center gap-2 mt-12 font-mono"
                                aria-label="Pagination"
                            >
                                {page > 1 && (
                                    <Link
                                        href={`?category=${category}&page=${page - 1}`}
                                        className="w-9 h-9 flex items-center justify-center transition-all"
                                        aria-label="Previous page"
                                        style={{
                                            border: "1px solid var(--kv-border-mid)",
                                            color: "var(--kv-text-muted)",
                                        }}
                                    >
                                        <ChevronLeft size={15} />
                                    </Link>
                                )}
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                                    .map((p, idx, arr) => (
                                        <span key={p} className="flex items-center gap-1">
                                            {idx > 0 && arr[idx - 1] !== p - 1 && (
                                                <span style={{ color: "var(--kv-text-muted)" }} className="text-xs">…</span>
                                            )}
                                            <Link
                                                href={`?category=${category}&page=${p}`}
                                                className="w-9 h-9 flex items-center justify-center text-xs transition-all"
                                                aria-current={p === page ? "page" : undefined}
                                                style={
                                                    p === page
                                                        ? {
                                                            background: "var(--kv-text)",
                                                            color: "var(--kv-bg)",
                                                            fontWeight: 700,
                                                            border: "1px solid var(--kv-text)",
                                                        }
                                                        : {
                                                            border: "1px solid var(--kv-border-mid)",
                                                            color: "var(--kv-text-muted)",
                                                        }
                                                }
                                            >
                                                {p}
                                            </Link>
                                        </span>
                                    ))}
                                {page < totalPages && (
                                    <Link
                                        href={`?category=${category}&page=${page + 1}`}
                                        className="w-9 h-9 flex items-center justify-center transition-all"
                                        aria-label="Next page"
                                        style={{
                                            border: "1px solid var(--kv-border-mid)",
                                            color: "var(--kv-text-muted)",
                                        }}
                                    >
                                        <ChevronRight size={15} />
                                    </Link>
                                )}
                            </nav>
                        )}
                    </>
                ) : (
                    <div className="text-center py-24">
                        <p
                            className="font-mono text-4xl mb-4 tracking-widest"
                            style={{ color: "var(--kv-border-mid)" }}
                        >
                            — ∅ —
                        </p>
                        <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--kv-text-sub)" }}>
                            No Kavita Found
                        </h2>
                        <p className="text-sm font-mono" style={{ color: "var(--kv-text-muted)" }}>
                            Check back soon — new kavita added daily
                        </p>
                    </div>
                )}
            </section>

            {/* ── SEO Text Block ───────────────────────────────────────── */}
            <section
                className="px-4 py-12 max-w-3xl mx-auto text-center"
                aria-label="About Shayariprime Kavita"
            >
                <div className="kv-seo-block rounded-sm p-8">
                    <p
                        className="font-mono text-xs uppercase tracking-[0.2em] mb-4"
                        style={{ color: "var(--kv-text-muted)" }}
                    >
                        // about
                    </p>
                    <h2
                        className="text-xl font-bold mb-4"
                        style={{
                            color: "var(--kv-text)",
                        }}
                    >
                        Shayariprime – कविता का संसार
                    </h2>
                    <p
                        className="text-sm leading-relaxed"
                        style={{ color: "var(--kv-text-sub)" }}
                    >
                        India&apos;s premier destination for{" "}
                        <Link href="/kavita?category=sad" style={{ color: "var(--kv-red)" }}>Sad Kavita</Link>,{" "}
                        <Link href="/kavita?category=romantic" style={{ color: "var(--kv-text)" }}>Romantic Poetry</Link>, and{" "}
                        <Link href="/kavita?category=motivational" style={{ color: "var(--kv-text-sub)" }}>Motivational Shayari</Link>.
                    </p>
                </div>
            </section>
        </div>
    );
}
