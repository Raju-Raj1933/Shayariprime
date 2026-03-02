import Image from "next/image";
import Link from "next/link";
import { Eye } from "lucide-react";
import type { PostData } from "@/app/actions/postActions";

function getCloudinaryUrl(url: string): string {
    if (!url || !url.includes("cloudinary.com")) return url;
    if (url.includes("w_300,h_200")) return url;
    return url.replace("/upload/", "/upload/w_300,h_200,c_pad,b_auto,f_auto,q_auto/");
}

const categoryConfig = {
    sad: { label: "दर्द", className: "badge-sad", emoji: "💔" },
    romantic: { label: "रोमांस", className: "badge-romantic", emoji: "🌹" },
    motivational: { label: "प्रेरणा", className: "badge-motivational", emoji: "✨" },
};

interface RelatedPostsProps {
    posts: PostData[];
    heading?: string;
}

/**
 * Displays a row of related kavita/shayari cards (small format).
 * Server component – no client JS needed.
 */
export default function RelatedPosts({ posts, heading = "Related Kavita" }: RelatedPostsProps) {
    if (!posts.length) return null;

    return (
        <section aria-label="Related posts" className="mt-10">
            <h2
                className="text-xl font-bold mb-5 gradient-text inline-block"
            >
                {heading}
            </h2>
            <div
                className="grid gap-4"
                style={{
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                }}
            >
                {posts.map((post) => {
                    const cat =
                        categoryConfig[post.category as keyof typeof categoryConfig] ??
                        categoryConfig.sad;
                    const detailHref = `/${post.type}/${post.slug}`;
                    const excerpt = post.excerpt || post.content.split("\n").filter(Boolean).slice(0, 2).join("\n");

                    return (
                        <Link
                            key={post._id}
                            href={detailHref}
                            className="group block rounded-xl overflow-hidden transition-transform hover:-translate-y-1"
                            style={{
                                background: "rgba(26,16,48,0.8)",
                                border: "1px solid rgba(124,58,237,0.2)",
                                boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                            }}
                            aria-label={post.title}
                        >
                            {/* Thumbnail */}
                            <div className="relative overflow-hidden" style={{ aspectRatio: "3/2" }}>
                                <Image
                                    src={getCloudinaryUrl(post.image)}
                                    alt={post.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    sizes="(max-width: 640px) 50vw, 25vw"
                                    loading="lazy"
                                />
                                <span
                                    className={`absolute top-1.5 left-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cat.className}`}
                                >
                                    {cat.emoji} {cat.label}
                                </span>
                            </div>

                            {/* Title & excerpt */}
                            <div className="p-3">
                                <h3
                                    className="text-sm font-semibold leading-snug mb-1 line-clamp-2 group-hover:text-purple-300 transition-colors"
                                    style={{ color: "#f0e6ff" }}
                                >
                                    {post.title}
                                </h3>
                                <p
                                    className="text-xs leading-relaxed line-clamp-2 shayari-text"
                                    style={{ color: "var(--color-text-muted)" }}
                                >
                                    {excerpt}
                                </p>
                                <div
                                    className="flex items-center gap-1 mt-2 text-[10px]"
                                    style={{ color: "var(--color-text-muted)" }}
                                >
                                    <Eye size={10} />
                                    <span>{(post.views * 100).toLocaleString()}</span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
