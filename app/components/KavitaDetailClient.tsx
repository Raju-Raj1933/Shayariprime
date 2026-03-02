"use client";

import { useEffect } from "react";
import { incrementView } from "@/app/actions/postActions";
import SocialShare from "./SocialShare";

interface KavitaDetailClientProps {
    postId: string;
    postSlug: string;
    postTitle: string;
    canonicalUrl: string;
    metaDescription: string;
}

/**
 * Client-side wrapper for the kavita detail page.
 * Increments the view count once per mount and renders social share buttons.
 */
export default function KavitaDetailClient({
    postId,
    postSlug,
    postTitle,
    canonicalUrl,
    metaDescription,
}: KavitaDetailClientProps) {
    useEffect(() => {
        incrementView(postId, postSlug, "kavita");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [postId]);

    return (
        <div className="mt-6">
            <SocialShare
                url={canonicalUrl}
                title={postTitle}
                description={metaDescription}
            />
        </div>
    );
}
