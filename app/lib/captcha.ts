/**
 * Verifies Google reCAPTCHA v2 token server-side.
 * Returns true if valid, false otherwise.
 */
export async function verifyRecaptcha(token: string): Promise<boolean> {
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!secret) {
        console.warn("[reCAPTCHA] RECAPTCHA_SECRET_KEY not set — skipping verification in dev");
        return true; // Skip in development if key not configured
    }

    if (!token) return false;

    // 5-second timeout: prevents slow Google response from blocking registration
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

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
            console.error("[reCAPTCHA] Verification timed out after 5s — rejecting token");
        } else {
            console.error("[reCAPTCHA] Verification failed:", err);
        }
        return false;
    }
}
