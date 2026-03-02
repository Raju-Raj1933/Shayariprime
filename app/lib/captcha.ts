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

    try {
        const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `secret=${secret}&response=${token}`,
        });

        const data = await res.json();
        return data.success === true;
    } catch (err) {
        console.error("[reCAPTCHA] Verification failed:", err);
        return false;
    }
}
