import { NextRequest, NextResponse } from "next/server";
import { forgotPassword } from "@/app/actions/authActions";
import { forgotPasswordLimiter } from "@/app/lib/rateLimit";

export async function POST(request: NextRequest) {
    // Rate limiting
    const limited = forgotPasswordLimiter(request);
    if (limited) return limited;

    try {
        const { email } = await request.json();
        const result = await forgotPassword(email || "");
        return NextResponse.json(result);
    } catch {
        return NextResponse.json(
            { success: false, error: "Invalid request." },
            { status: 400 }
        );
    }
}
