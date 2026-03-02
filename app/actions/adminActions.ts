"use server";

import { auth } from "@/auth";
import connectDB from "@/app/lib/mongodb";
import User from "@/app/models/User";

/**
 * Verify admin secret password against the one stored in .env.local
 * If correct, update the user's role to "admin" in the DB.
 * The client then calls `update()` from useSession to refresh the JWT.
 */
export async function verifyAdminSecret(secret: string): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session?.user) {
        return { success: false, error: "Not authenticated" };
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminSecret = process.env.ADMIN_SECRET;

    if (!adminEmail || !adminSecret) {
        return { success: false, error: "Admin credentials not configured" };
    }

    // Only the designated admin email can go through this flow
    if (session.user.email?.toLowerCase() !== adminEmail.toLowerCase()) {
        return { success: false, error: "Unauthorized" };
    }

    // Verify the secret
    if (secret !== adminSecret) {
        return { success: false, error: "Wrong admin secret. Please try again." };
    }

    // Promote user to admin in DB
    try {
        await connectDB();
        await User.findByIdAndUpdate(
            (session.user as { id: string }).id,
            { role: "admin" }
        );
        return { success: true };
    } catch (error) {
        console.error("Admin verify error:", error);
        return { success: false, error: "Failed to update role. Try again." };
    }
}
