"use client";

import { useEffect } from "react";
import { incrementView } from "@/app/actions/postActions";

export default function ViewTracker({ postId }: { postId: string }) {
    useEffect(() => {
        // Only increment once per session for this post
        const key = `viewed_${postId}`;
        if (!sessionStorage.getItem(key)) {
            sessionStorage.setItem(key, "1");
            incrementView(postId).catch(() => { });
        }
    }, [postId]);

    return null;
}
