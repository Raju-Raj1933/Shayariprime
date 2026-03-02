"use server";

import connectDB from "@/app/lib/mongodb";
import Post, { IComment } from "@/app/models/Post";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

// --- SERIALIZED COMMENT TYPE (safe for Client Components) ---
export interface SerializedComment {
    _id: string;
    text: string;
    emoji: string;
    createdAt: string;
    user: { name: string };
    replies: SerializedComment[];
}

function serializeComment(c: Record<string, unknown>): SerializedComment {
    const user = c.user as { name?: string } | null;
    return {
        _id: (c._id as { toString(): string }).toString(),
        text: c.text as string,
        emoji: (c.emoji as string) || "",
        createdAt: new Date((c.createdAt as Date | string)).toISOString(),
        user: { name: user?.name ?? "User" },
        replies: ((c.replies || []) as Record<string, unknown>[]).map(serializeComment),
    };
}

// --- FETCH COMMENTS FOR A POST (public) ---
export async function fetchPostComments(postId: string): Promise<{ comments: SerializedComment[] }> {
    try {
        await connectDB();
        const post = await Post.findById(postId)
            .populate("comments.user", "name")
            .populate("comments.replies.user", "name")
            .lean();
        if (!post) return { comments: [] };
        return {
            comments: (post.comments as unknown as Record<string, unknown>[]).map(serializeComment),
        };
    } catch (error) {
        console.error("Fetch comments error:", error);
        return { comments: [] };
    }
}

// --- ADD TOP-LEVEL COMMENT ---
export async function addComment(postId: string, text: string, emoji: string = "") {
    const session = await auth();
    if (!session?.user) {
        return { success: false, error: "Login required to comment" };
    }

    if (!text.trim()) {
        return { success: false, error: "Comment cannot be empty" };
    }

    const userId = (session.user as { id: string }).id;

    try {
        await connectDB();
        const post = await Post.findById(postId);
        if (!post) return { success: false, error: "Post not found" };

        const newId = new mongoose.Types.ObjectId();
        post.comments.push({
            user: userId as unknown as typeof post.comments[0]["user"],
            text: text.trim(),
            emoji,
            replies: [],
            _id: newId as unknown as string,
            createdAt: new Date(),
        });

        await post.save();
        revalidatePath("/");
        revalidatePath("/kavita");
        return { success: true, commentId: newId.toString() };
    } catch (error) {
        console.error("Add comment error:", error);
        return { success: false, error: "Failed to add comment" };
    }
}

// --- ADD REPLY TO COMMENT ---
export async function addReply(
    postId: string,
    commentId: string,
    text: string,
    emoji: string = ""
) {
    const session = await auth();
    if (!session?.user) {
        return { success: false, error: "Login required to reply" };
    }

    if (!text.trim()) {
        return { success: false, error: "Reply cannot be empty" };
    }

    const userId = (session.user as { id: string }).id;

    try {
        await connectDB();
        const post = await Post.findById(postId);
        if (!post) return { success: false, error: "Post not found" };

        let newReplyId = "";

        // Recursive function to find and add reply to nested comments
        function findAndAddReply(comments: IComment[]): boolean {
            for (const comment of comments) {
                if (comment._id.toString() === commentId) {
                    const newId = new mongoose.Types.ObjectId();
                    newReplyId = newId.toString();
                    comment.replies.push({
                        user: userId as unknown as IComment["user"],
                        text: text.trim(),
                        emoji,
                        replies: [],
                        _id: newId as unknown as string,
                        createdAt: new Date(),
                    });
                    return true;
                }
                if (comment.replies && comment.replies.length > 0) {
                    if (findAndAddReply(comment.replies as IComment[])) {
                        return true;
                    }
                }
            }
            return false;
        }

        const found = findAndAddReply(post.comments);
        if (!found) return { success: false, error: "Comment not found" };

        await post.save();
        revalidatePath("/");
        revalidatePath("/kavita");
        return { success: true, commentId: newReplyId };
    } catch (error) {
        console.error("Add reply error:", error);
        return { success: false, error: "Failed to add reply" };
    }
}


