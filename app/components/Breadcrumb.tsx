import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

/**
 * Renders an accessible breadcrumb trail.
 * Also emits JSON-LD BreadcrumbList schema for Google.
 */
export default function Breadcrumb({ items }: BreadcrumbProps) {
    const origin =
        typeof process !== "undefined"
            ? process.env.NEXTAUTH_URL || "https://shayariprime.com"
            : "https://shayariprime.com";

    const schemaItems = [
        { label: "Home", href: "/" },
        ...items.filter((item) => item.href || items.indexOf(item) === items.length - 1),
    ];

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: schemaItems.map((item, idx) => ({
            "@type": "ListItem",
            position: idx + 1,
            name: item.label,
            item: item.href ? `${origin}${item.href}` : undefined,
        })),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs flex-wrap mb-4">
                <Link
                    href="/"
                    className="flex items-center gap-1 hover:text-purple-300 transition-colors"
                    style={{ color: "var(--color-text-muted)" }}
                >
                    <Home size={12} />
                    <span>Home</span>
                </Link>
                {items.map((item, idx) => (
                    <span key={idx} className="flex items-center gap-1">
                        <ChevronRight size={12} style={{ color: "var(--color-text-muted)", opacity: 0.5 }} />
                        {item.href && idx < items.length - 1 ? (
                            <Link
                                href={item.href}
                                className="hover:text-purple-300 transition-colors"
                                style={{ color: "var(--color-text-muted)" }}
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span
                                aria-current="page"
                                style={{ color: "#a78bfa" }}
                                className="font-medium truncate max-w-[200px]"
                            >
                                {item.label}
                            </span>
                        )}
                    </span>
                ))}
            </nav>
        </>
    );
}
