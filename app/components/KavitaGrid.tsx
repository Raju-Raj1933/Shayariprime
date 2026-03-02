"use client";

import { useState } from "react";
import KavitaCard from "./KavitaCard";
import type { PostData } from "@/app/actions/postActions";

interface KavitaGridProps {
    posts: PostData[];
}

/**
 * Grid wrapper for Kavita listing page.
 * Uses KavitaCard (excerpt + Read More) instead of ShayariCard (full content).
 * Manages accordion-style comment panels independently from ShayariGrid.
 */
export default function KavitaGrid({ posts }: KavitaGridProps) {
    const [activeCommentId, setActiveCommentId] = useState<string | null>(null);

    const handleCommentToggle = (postId: string) => {
        setActiveCommentId((prev) => (prev === postId ? null : postId));
    };

    return (
        <div className="cards-grid">
            {posts.map((post, i) => (
                <KavitaCard
                    key={post._id}
                    post={post}
                    index={i}
                    showComments={activeCommentId === post._id}
                    onCommentToggle={handleCommentToggle}
                />
            ))}
        </div>
    );
}
