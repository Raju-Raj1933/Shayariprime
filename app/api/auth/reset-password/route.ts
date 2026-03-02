import { NextRequest, NextResponse } from "next/server";
import { resetPassword } from "@/app/actions/authActions";

export async function POST(request: NextRequest) {
    try {
        const { token, password, confirmPassword } = await request.json();

        if (!token) {
            return NextResponse.json(
                { success: false, error: "Reset token is missing." },
                { status: 400 }
            );
        }

        const result = await resetPassword(token, password || "", confirmPassword || "");
        return NextResponse.json(result);
    } catch {
        return NextResponse.json(
            { success: false, error: "Invalid request." },
            { status: 400 }
        );
    }
}
