import { useEffect, useRef } from "react";
import { incrementView } from "@/app/actions/postActions";

/**
 * Instagram-style view tracker using IntersectionObserver.
 *
 * Rules (same as how major social feeds work):
 *  - Card must be ≥50% visible on screen.
 *  - Must stay visible for 2 seconds continuously.
 *  - Counted at most ONCE per browser session (sessionStorage guard).
 *  - Timer resets if the user scrolls the card away before 2s.
 *
 * Usage:
 *   const cardRef = useViewTracker(post._id);
 *   return <div ref={cardRef}> ... </div>;
 */
export function useViewTracker(postId: string) {
    const ref = useRef<HTMLDivElement>(null);
    const fired = useRef(false);

    useEffect(() => {
        // Already counted this session — nothing to do
        const key = `v_${postId}`;
        if (fired.current || sessionStorage.getItem(key)) {
            fired.current = true;
            return;
        }

        let timer: ReturnType<typeof setTimeout>;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    // Start 2-second dwell timer
                    timer = setTimeout(() => {
                        fired.current = true;
                        sessionStorage.setItem(key, "1");
                        incrementView(postId).catch(() => { });
                        observer.disconnect();
                    }, 2000);
                } else {
                    // User scrolled away — cancel timer, don't count
                    clearTimeout(timer);
                }
            },
            { threshold: 0.3 } // 30% of card must be on screen
        );

        const el = ref.current;
        if (el) observer.observe(el);

        return () => {
            observer.disconnect();
            clearTimeout(timer);
        };
    }, [postId]);

    return ref;
}
