import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface NavPost {
    title: string;
    slug: string;
}

interface PrevNextNavProps {
    prev: NavPost | null;
    next: NavPost | null;
    type: "kavita" | "shayari";
}

/**
 * Previous / Next navigation for detail pages.
 * Server component – pure HTML links.
 */
export default function PrevNextNav({ prev, next, type }: PrevNextNavProps) {
    if (!prev && !next) return null;

    const baseHref = `/${type}`;

    return (
        <nav
            aria-label="Post navigation"
            className="flex gap-3 mt-10 flex-col sm:flex-row"
        >
            {/* Previous */}
            {prev ? (
                <Link
                    href={`${baseHref}/${prev.slug}`}
                    className="flex-1 flex items-start gap-3 rounded-xl p-4 group transition-all hover:-translate-y-0.5"
                    style={{
                        background: "rgba(26,16,48,0.8)",
                        border: "1px solid rgba(124,58,237,0.2)",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                    }}
                >
                    <span
                        className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors group-hover:bg-purple-600/30"
                        style={{ background: "rgba(124,58,237,0.12)" }}
                    >
                        <ChevronLeft size={16} style={{ color: "#a78bfa" }} />
                    </span>
                    <div className="min-w-0">
                        <p
                            className="text-[10px] uppercase tracking-wider font-semibold mb-0.5"
                            style={{ color: "var(--color-text-muted)" }}
                        >
                            ← Previous
                        </p>
                        <p
                            className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-purple-300 transition-colors"
                            style={{ color: "#f0e6ff" }}
                        >
                            {prev.title}
                        </p>
                    </div>
                </Link>
            ) : (
                <div className="flex-1" />
            )}

            {/* Next */}
            {next ? (
                <Link
                    href={`${baseHref}/${next.slug}`}
                    className="flex-1 flex items-start gap-3 rounded-xl p-4 text-right group transition-all hover:-translate-y-0.5 flex-row-reverse"
                    style={{
                        background: "rgba(26,16,48,0.8)",
                        border: "1px solid rgba(124,58,237,0.2)",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                    }}
                >
                    <span
                        className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors group-hover:bg-purple-600/30"
                        style={{ background: "rgba(124,58,237,0.12)" }}
                    >
                        <ChevronRight size={16} style={{ color: "#a78bfa" }} />
                    </span>
                    <div className="min-w-0">
                        <p
                            className="text-[10px] uppercase tracking-wider font-semibold mb-0.5"
                            style={{ color: "var(--color-text-muted)" }}
                        >
                            Next →
                        </p>
                        <p
                            className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-purple-300 transition-colors"
                            style={{ color: "#f0e6ff" }}
                        >
                            {next.title}
                        </p>
                    </div>
                </Link>
            ) : (
                <div className="flex-1" />
            )}
        </nav>
    );
}
