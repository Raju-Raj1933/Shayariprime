"use client";

import Link from "next/link";

interface CategoryOption {
    value: string;
    label: string;
    labelHi: string;
}

interface CategoryFilterProps {
    active: string;
    categories: CategoryOption[];
}

export default function CategoryFilter({ active, categories }: CategoryFilterProps) {
    return (
        <div
            className="flex flex-wrap gap-2 justify-center"
            role="navigation"
            aria-label="Category filter"
        >
            {categories.map((cat) => (
                <Link
                    key={cat.value}
                    href={`?category=${cat.value}&page=1`}
                    scroll={false}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${active === cat.value
                        ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-600/25"
                        : "text-purple-300/70 hover:text-white"
                        }`}
                    style={
                        active !== cat.value
                            ? {
                                background: "rgba(124,58,237,0.1)",
                                border: "1px solid rgba(124,58,237,0.2)",
                            }
                            : {}
                    }
                    aria-current={active === cat.value ? "page" : undefined}
                >
                    {cat.label}
                </Link>
            ))}
        </div>
    );
}
