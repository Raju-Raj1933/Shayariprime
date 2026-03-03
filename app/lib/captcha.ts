/**
 * Verifies Google reCAPTCHA v2 token server-side.
 * Returns true if valid, false otherwise.
 *
 * Fail-open on timeout: if Google's API is slow (common on Vercel cold starts),
 * we let the request through. The rate limiter still protects against bot abuse.
 */
export async function verifyRecaptcha(token: string): Promise<boolean> {
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!secret) {
        console.warn("[reCAPTCHA] RECAPTCHA_SECRET_KEY not set — skipping verification in dev");
        return true; // Skip in development if key not configured
    }

    if (!token) return false;

    // 8-second timeout: gives Google enough headroom on Vercel's network
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
        const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `secret=${secret}&response=${token}`,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const data = await res.json();
        return data.success === true;
    } catch (err) {
        clearTimeout(timeoutId);
        if (err instanceof Error && err.name === "AbortError") {
            // FAIL-OPEN: Google API timed out — allow the request anyway.
            // Rate limiter (5 req/min per IP) still protects against bot abuse.
            console.warn("[reCAPTCHA] Timed out after 8s — failing open to not block real users");
            return true;
        }
        // Real network / parse error — fail-block
        console.error("[reCAPTCHA] Verification failed:", err);
        return false;
    }
}
