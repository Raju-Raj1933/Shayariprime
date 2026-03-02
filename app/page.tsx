import type { Metadata } from "next";
import { getCachedPosts } from "@/app/actions/postActions";
import ShayariGrid from "@/app/components/ShayariGrid";
import Link from "next/link";
import { Sparkles, TrendingUp, BookOpen, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const categoryMeta: Record<string, { hi: string; title: string; description: string }> = {
  all: {
    hi: "सभी शायरी",
    title: "Shayariprime – Best Hindi Shayari, Kavita & Poetry",
    description: "Read the most heartfelt Hindi Shayari, Sad Shayari, Romantic Shayari, and Motivational Poetry on Shayariprime. Discover poetry that speaks your emotions.",
  },
  sad: {
    hi: "दर्द शायरी",
    title: "Sad Shayari - दर्द भरी शायरी | Shayariprime",
    description: "Read latest Sad Shayari and दर्द भरी शायरी collection with 100% original content. Express your unspoken pain through words.",
  },
  romantic: {
    hi: "रोमांस शायरी",
    title: "Romantic Shayari - लव शायरी | Shayariprime",
    description: "Discover beautiful Romantic Shayari and Love Poetry in Hindi. Perfect lines to share with your loved ones.",
  },
  motivational: {
    hi: "प्रेरणा शायरी",
    title: "Motivational Shayari - प्रेरणादायक शायरी | Shayariprime",
    description: "Find the most inspiring Motivational Shayari in Hindi. Words that uplift your spirit and fuel your goals.",
  },
};

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ category?: string }> }): Promise<Metadata> {
  const params = await searchParams;
  const category = params.category || "all";
  const meta = categoryMeta[category] || categoryMeta.all;
  const url = category === "all" ? "https://shayariprime.com/" : `https://shayariprime.com/?category=${category}`;

  return {
    title: meta.title,
    description: meta.description,
    keywords: `hindi shayari, ${category} shayari, kavita, poetry, ${meta.hi}`,
    alternates: { canonical: url },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url,
      type: "website",
      siteName: "Shayariprime",
      locale: "hi_IN",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
    },
  };
}

// ISR: revalidate every 60 seconds
export const revalidate = 60;

const LIMIT = 15;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const category = params.category;

  const { posts, total } = await getCachedPosts(
    category && category !== "all" ? category : undefined,
    LIMIT,
    page,
    false,
    "shayari"
  );

  const totalPages = Math.ceil(total / LIMIT);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Shayariprime",
    "url": "https://shayariprime.com",
    "description": categoryMeta[category || "all"]?.description || categoryMeta.all.description,
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://shayariprime.com/?category={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero */}
      <section className="relative pt-8 pb-12 md:pt-12 md:pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6"
            style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", color: "#a78bfa" }}
          >
            <Sparkles size={14} />
            India&apos;s #1 Shayari Portal
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight">
            <span className="gradient-text">भावों का संसार</span>
          </h1>
          <p className="text-xl text-purple-200/60 font-medium mb-2">
            Discover Poetry That Speaks Your Soul
          </p>
          <p className="text-base text-purple-300/50 max-w-2xl mx-auto">
            Best <Link href="/" className="hover:text-purple-300 transition-colors">Hindi Shayari</Link>, <Link href="/kavita?category=sad" className="hover:text-pink-300 transition-colors">Sad Kavita</Link>, <Link href="/?category=romantic" className="hover:text-pink-300 transition-colors">Romantic Poetry</Link> &amp; Motivational Quotes
            — hand-picked for Indian hearts
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 md:gap-10 mt-8">
            {[
              { icon: <BookOpen size={16} />, label: `${total}+ Shayari` },
              { icon: <TrendingUp size={16} />, label: "Daily Updated" },
              { icon: <Sparkles size={16} />, label: "100% Original" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2 text-sm font-medium" style={{ color: "#a78bfa" }}>
                {s.icon} {s.label}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Link href="/kavita" className="btn-primary">
              Browse Kavita <ArrowRight size={16} />
            </Link>
            <Link href="/add-post" className="btn-ghost">
              + Share Shayari
            </Link>
          </div>
        </div>
      </section>

      {/* Category filter pills */}
      <section className="px-4 mb-6 max-w-7xl mx-auto">
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            { label: "✨ All", value: "all" },
            { label: "💔 Sad", value: "sad" },
            { label: "🌹 Romantic", value: "romantic" },
            { label: "⚡ Motivational", value: "motivational" },
          ].map((cat) => {
            const active = (category || "all") === cat.value;
            return (
              <Link
                key={cat.value}
                href={`/?category=${cat.value}&page=1`}
                className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
                style={{
                  background: active ? "rgba(124,58,237,0.35)" : "rgba(124,58,237,0.08)",
                  border: `1px solid ${active ? "#7c3aed" : "rgba(124,58,237,0.2)"}`,
                  color: active ? "#e9d5ff" : "var(--color-text-muted)",
                }}
              >
                {cat.label}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Shayari Grid */}
      <section className="px-4 pb-12 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={20} style={{ color: "#a78bfa" }} />
          <h2 className="text-2xl font-bold gradient-text">
            {category && category !== "all"
              ? category.charAt(0).toUpperCase() + category.slice(1) + " Shayari"
              : "Trending Shayari"}
          </h2>
          {page > 1 && (
            <span className="text-sm ml-2" style={{ color: "var(--color-text-muted)" }}>
              — Page {page}
            </span>
          )}
        </div>

        {posts.length > 0 ? (
          <>
            <ShayariGrid posts={posts} />

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="flex justify-center items-center gap-2 mt-12" aria-label="Pagination">
                {/* Prev */}
                {page > 1 && (
                  <Link
                    href={`/?category=${category || "all"}&page=${page - 1}`}
                    className="w-9 h-9 flex items-center justify-center rounded-full text-purple-300/60 hover:bg-purple-600/20 hover:text-purple-300 transition-all"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                  </Link>
                )}

                {/* Page numbers — show max 5 around current */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center gap-1">
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="text-purple-300/30 text-xs px-1">…</span>
                      )}
                      <Link
                        href={`/?category=${category || "all"}&page=${p}`}
                        className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-all ${p === page
                          ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                          : "text-purple-300/60 hover:bg-purple-600/20 hover:text-purple-300"
                          }`}
                        aria-current={p === page ? "page" : undefined}
                      >
                        {p}
                      </Link>
                    </span>
                  ))}

                {/* Next */}
                {page < totalPages && (
                  <Link
                    href={`/?category=${category || "all"}&page=${page + 1}`}
                    className="w-9 h-9 flex items-center justify-center rounded-full text-purple-300/60 hover:bg-purple-600/20 hover:text-purple-300 transition-all"
                    aria-label="Next page"
                  >
                    <ChevronRight size={16} />
                  </Link>
                )}
              </nav>
            )}
          </>
        ) : (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">📖</div>
            <h2 className="text-xl font-semibold text-purple-200/60 mb-2">No Shayari Found</h2>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Check back soon — new shayari added daily!
            </p>
          </div>
        )}
      </section>

      {/* SEO Text Block */}
      <section className="px-4 py-12 max-w-4xl mx-auto text-center" aria-label="About shayariprime">
        <div className="rounded-2xl p-8 glass" style={{ border: "1px solid rgba(124,58,237,0.15)" }}>
          <h2 className="text-2xl font-bold gradient-text mb-4">Shayariprime – आपका शायरी का घर</h2>
          <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            Welcome to Shayariprime — India&apos;s premier destination for beautiful{" "}
            <Link href="/?category=sad" className="text-purple-400 hover:underline">Sad Shayari</Link>,{" "}
            <Link href="/?category=romantic" className="text-pink-400 hover:underline">Romantic Poetry</Link>, and{" "}
            <Link href="/?category=motivational" className="text-yellow-400 hover:underline">Motivational Kavita</Link>.
            Every shayari is crafted to touch your heart and express what words often fail to say.
          </p>
        </div>
      </section>
    </>
  );
}
