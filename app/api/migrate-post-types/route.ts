import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Post from "@/app/models/Post";
import { auth } from "@/auth";

/**
 * One-time migration: set type="shayari" on all posts missing the type field.
 * Only admins can call this. Call once then this route can be removed.
 * GET /api/migrate-post-types
 */
export async function GET() {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await connectDB();
        const result = await Post.updateMany(
            { $or: [{ type: { $exists: false } }, { type: null }, { type: "" }] },
            { $set: { type: "shayari" } }
        );
        return NextResponse.json({
            success: true,
            updated: result.modifiedCount,
            message: `Set type="shayari" on ${result.modifiedCount} old posts`,
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
