import { NextRequest, NextResponse } from "next/server";

// In-memory store per IP: { count, resetTime }
const store = new Map<string, { count: number; resetAt: number }>();

interface RateLimitOptions {
    windowMs: number; // time window in ms
    maxRequests: number; // max requests per window
    message?: string;
}

function getClientIp(req: NextRequest): string {
    return (
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        "unknown"
    );
}

/**
 * Returns a rate-limiting middleware function.
 * Usage: const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 5 });
 *        const limited = await limiter(request);
 *        if (limited) return limited; // 429 response
 */
export function createRateLimiter(options: RateLimitOptions) {
    const { windowMs, maxRequests, message = "Too many requests. Please try again later." } = options;

    return function rateLimiter(req: NextRequest): NextResponse | null {
        const ip = getClientIp(req);
        const now = Date.now();
        const key = `${ip}`;

        const record = store.get(key);

        if (!record || now > record.resetAt) {
            // First request or window expired — reset
            store.set(key, { count: 1, resetAt: now + windowMs });
            return null; // Allow
        }

        record.count++;
        if (record.count > maxRequests) {
            const retryAfter = Math.ceil((record.resetAt - now) / 1000);
            return NextResponse.json(
                { success: false, error: message },
                {
                    status: 429,
                    headers: {
                        "Retry-After": String(retryAfter),
                        "X-RateLimit-Limit": String(maxRequests),
                        "X-RateLimit-Remaining": "0",
                    },
                }
            );
        }

        return null; // Allow
    };
}

// Pre-built limiters
export const registerLimiter = createRateLimiter({
    windowMs: 60_000,
    maxRequests: 5,
    message: "Too many registration attempts. Please wait 1 minute.",
});

export const loginLimiter = createRateLimiter({
    windowMs: 60_000,
    maxRequests: 10,
    message: "Too many login attempts. Please wait 1 minute.",
});

export const forgotPasswordLimiter = createRateLimiter({
    windowMs: 60_000,
    maxRequests: 5,
    message: "Too many password reset requests. Please wait 1 minute.",
});
