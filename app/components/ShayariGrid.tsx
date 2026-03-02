"use client";

import { useState } from "react";
import ShayariCard from "./ShayariCard";
import type { PostData } from "@/app/actions/postActions";

interface ShayariGridProps {
    posts: PostData[];
}

/**
 * Client wrapper for the card grid.
 * Manages accordion-style comment panels — only one card can have its
 * comment section open at a time. Clicking the same icon again closes it.
 */
export default function ShayariGrid({ posts }: ShayariGridProps) {
    const [activeCommentId, setActiveCommentId] = useState<string | null>(null);

    const handleCommentToggle = (postId: string) => {
        // If the same card is clicked again → close it; otherwise open it (closes any other)
        setActiveCommentId((prev) => (prev === postId ? null : postId));
    };

    return (
        <div className="cards-grid">
            {posts.map((post, i) => (
                <ShayariCard
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
