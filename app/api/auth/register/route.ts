import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/app/actions/authActions";
import { registerLimiter } from "@/app/lib/rateLimit";

export async function POST(request: NextRequest) {
    // Rate limiting
    const limited = registerLimiter(request);
    if (limited) return limited;

    try {
        const { name, email, password, captchaToken } = await request.json();

        const result = await registerUser(
            name || "",
            email || "",
            password || "",
            captchaToken || ""
        );

        return NextResponse.json(result);
    } catch {
        return NextResponse.json(
            { success: false, error: "Invalid request." },
            { status: 400 }
        );
    }
}
