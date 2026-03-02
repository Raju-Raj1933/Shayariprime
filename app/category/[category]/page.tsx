import type { Metadata } from "next";
import { getCachedPosts } from "@/app/actions/postActions";
import ShayariGrid from "@/app/components/ShayariGrid";

type Category = "sad" | "romantic" | "motivational";

const categoryMeta: Record<Category, { title: string; description: string; hi: string; emoji: string }> = {
    sad: {
        emoji: "💔",
        hi: "दर्द भरी शायरी",
        title: "Sad Shayari in Hindi | दर्द भरी शायरी | Shayariprime",
        description:
            "Read the best Sad Shayari in Hindi on Shayariprime. Heart-touching sad poetry, dard bhari shayari, and emotional kavita that express your pain.",
    },
    romantic: {
        emoji: "🌹",
        hi: "रोमांटिक शायरी",
        title: "Romantic Shayari in Hindi | Love Poetry | Shayariprime",
        description:
            "Discover beautiful Romantic Shayari and Love Poetry in Hindi on Shayariprime. Express your love with the most heartfelt romantic kavita.",
    },
    motivational: {
        emoji: "✨",
        hi: "प्रेरणादायक शायरी",
        title: "Motivational Shayari & Quotes in Hindi | Shayariprime",
        description:
            "Find the most inspiring Motivational Shayari and life quotes in Hindi on Shayariprime. Poetry that uplifts your spirit and encourages you.",
    },
};

interface Props {
    params: Promise<{ category: string }>;
    searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { category } = await params;
    const meta = categoryMeta[category as Category];
    if (!meta) return { title: "Shayariprime" };

    return {
        title: meta.title,
        description: meta.description,
        alternates: { canonical: `/category/${category}` },
        openGraph: { title: meta.title, description: meta.description },
    };
}

export function generateStaticParams() {
    return [
        { category: "sad" },
        { category: "romantic" },
        { category: "motivational" },
    ];
}

export default async function CategoryPage({ params, searchParams }: Props) {
    const { category } = await params;
    const sp = await searchParams;
    const page = parseInt(sp.page ?? "1", 10);

    const meta = categoryMeta[category as Category];
    if (!meta) {
        return (
            <div className="text-center py-32">
                <h1 className="text-2xl text-purple-300">Category not found</h1>
            </div>
        );
    }

    const { posts, total } = await getCachedPosts(category, 12, page);
    const totalPages = Math.ceil(total / 12);

    return (
        <>
            {/* Hero */}
            <section className="pt-8 pb-10 px-4 text-center">
                <div className="max-w-2xl mx-auto">
                    <div className="text-5xl mb-4">{meta.emoji}</div>
                    <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
                        {meta.hi}
                    </h1>
                    <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                        {total} beautiful {category} shayari — sorted by popularity
                    </p>
                </div>
            </section>

            {/* Grid */}
            <section className="px-4 pb-12 max-w-7xl mx-auto">
                {posts.length > 0 ? (
                    <>
                        <ShayariGrid posts={posts} />
                        {/* Pagination */}
                        {totalPages > 1 && (
                            <nav className="flex justify-center items-center gap-2 mt-12" aria-label="Pagination">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <a
                                        key={p}
                                        href={`?page=${p}`}
                                        className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all ${p === page
                                            ? "bg-purple-600 text-white"
                                            : "text-purple-300/60 hover:bg-purple-600/20 hover:text-purple-300"
                                            }`}
                                        aria-current={p === page ? "page" : undefined}
                                    >
                                        {p}
                                    </a>
                                ))}
                            </nav>
                        )}
                    </>
                ) : (
                    <div className="text-center py-24">
                        <div className="text-5xl mb-4">{meta.emoji}</div>
                        <p className="text-purple-300/60">No {category} shayari yet. Check back soon!</p>
                    </div>
                )}
            </section>
        </>
    );
}
