"use server";

import connectDB from "@/app/lib/mongodb";
import Post from "@/app/models/Post";
import { auth } from "@/auth";
import { revalidatePath, unstable_cache } from "next/cache";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Generate slug from title
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .substring(0, 80);
}

// Reusable cloudniary upload
async function uploadImageToCloudinary(imageFile: File) {
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const dataUri = `data:${imageFile.type};base64,${base64}`;

    return await cloudinary.uploader.upload(dataUri, {
        folder: "kavitaworld",
        transformation: [
            { width: 800, height: 600, crop: "fill", quality: 80 },
            {
                overlay: { font_family: "Arial", font_size: 22, font_weight: "bold", text: "shayariprime.com" },
                gravity: "south_east",
                x: 12,
                y: 10,
                color: "white",
                opacity: 70,
            },
        ],
    });
}

// Ensure unique slug
async function ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug;
    let count = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const existing = await Post.findOne({ slug });
        if (!existing || (excludeId && existing._id.toString() === excludeId)) break;
        count++;
        slug = `${baseSlug}-${count}`;
    }
    return slug;
}

// --- ADD POST (any logged-in user) ---
export async function addPost(formData: FormData) {
    const session = await auth();
    if (!session?.user) {
        return { success: false, error: "Login required" };
    }

    const isAdmin = (session.user as { role?: string }).role === "admin";
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const category = formData.get("category") as string;
    const postType = (formData.get("type") as string) || "shayari";
    const imageFile = formData.get("image") as File;

    if (!title || !content || !category || !imageFile) {
        return { success: false, error: "All fields including image are required" };
    }
    if (!["shayari", "kavita"].includes(postType)) {
        return { success: false, error: "Invalid post type" };
    }

    try {
        await connectDB();

        // Upload image to Cloudinary
        const uploadResult = await uploadImageToCloudinary(imageFile);

        const baseSlug = generateSlug(title);
        const slug = await ensureUniqueSlug(baseSlug);

        const metaDescription = content
            .replace(/\n/g, " ")
            .trim()
            .substring(0, 155);

        const post = await Post.create({
            title,
            content,
            type: postType,
            category,
            image: uploadResult.secure_url,
            imagePublicId: uploadResult.public_id,
            author: (session.user as { id: string }).id,
            slug,
            metaDescription,
            views: 0,
            // Admins get approved immediately; users go pending
            status: isAdmin ? "approved" : "pending",
        });

        revalidatePath("/");
        revalidatePath("/kavita");
        revalidatePath("/dashboard");
        revalidatePath("/my-dashboard");
        return { success: true, slug: post.slug, status: post.status };
    } catch (error) {
        console.error("Add post error:", error);
        return { success: false, error: "Failed to create post. Please try again." };
    }
}

// --- EDIT POST (owner or admin) ---
export async function editPost(postId: string, formData: FormData) {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Login required" };

    const userId = (session.user as { id: string }).id;
    const isAdmin = (session.user as { role?: string }).role === "admin";

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const category = formData.get("category") as string;
    const imageFile = formData.get("image") as File | null;

    if (!title || !content || !category) {
        return { success: false, error: "Title, content and category are required" };
    }

    try {
        await connectDB();
        const post = await Post.findById(postId);
        if (!post) return { success: false, error: "Post not found" };

        // Only owner or admin can edit
        if (!isAdmin && post.author.toString() !== userId) {
            return { success: false, error: "Unauthorized" };
        }

        // Update fields
        post.title = title.trim();
        post.content = content.trim();
        post.category = category as "sad" | "romantic" | "motivational";
        post.metaDescription = content.replace(/\n/g, " ").trim().substring(0, 155);

        // Update slug if title changed
        const baseSlug = generateSlug(title);
        post.slug = await ensureUniqueSlug(baseSlug, postId);

        // If user (non-admin) edits, reset to pending for re-approval
        if (!isAdmin) {
            post.status = "pending";
        }

        // Replace image if provided
        if (imageFile && imageFile.size > 0) {
            // Delete old image
            if (post.imagePublicId) {
                await cloudinary.uploader.destroy(post.imagePublicId);
            }
            const uploadResult = await uploadImageToCloudinary(imageFile);
            post.image = uploadResult.secure_url;
            post.imagePublicId = uploadResult.public_id;
        }

        await post.save();
        revalidatePath("/");
        revalidatePath("/kavita");
        revalidatePath("/dashboard");
        revalidatePath("/my-dashboard");
        revalidatePath(`/shayari/${post.slug}`);
        return { success: true, slug: post.slug };
    } catch (error) {
        console.error("Edit post error:", error);
        return { success: false, error: "Failed to edit post" };
    }
}

// --- APPROVE POST (admin only) ---
export async function approvePost(postId: string) {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
        return { success: false, error: "Unauthorized" };
    }
    try {
        await connectDB();
        await Post.findByIdAndUpdate(postId, { status: "approved" });
        revalidatePath("/");
        revalidatePath("/kavita");
        revalidatePath("/dashboard");
        revalidatePath("/my-dashboard");
        return { success: true };
    } catch (error) {
        console.error("Approve error:", error);
        return { success: false, error: "Failed to approve" };
    }
}

// --- REJECT POST (admin only) ---
export async function rejectPost(postId: string) {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
        return { success: false, error: "Unauthorized" };
    }
    try {
        await connectDB();
        await Post.findByIdAndUpdate(postId, { status: "rejected" });
        revalidatePath("/");
        revalidatePath("/kavita");
        revalidatePath("/dashboard");
        revalidatePath("/my-dashboard");
        return { success: true };
    } catch (error) {
        console.error("Reject error:", error);
        return { success: false, error: "Failed to reject" };
    }
}

// --- FETCH POSTS (public – only approved) ---
export interface PostData {
    _id: string;
    title: string;
    content: string;
    excerpt?: string;
    tags?: string[];
    type: "shayari" | "kavita";
    category: string;
    image: string;
    views: number;
    likes: string[];
    slug: string;
    createdAt: string;
    author?: { name: string };
    status?: string;
    metaDescription?: string;
}

export async function fetchPosts(
    category?: string,
    limit: number = 20,
    page: number = 1,
    includeAll: boolean = false,
    postType?: "shayari" | "kavita"
): Promise<{ posts: PostData[]; total: number }> {
    try {
        await connectDB();

        const query: Record<string, unknown> = {};
        if (!includeAll) {
            query.status = "approved";
        }
        if (category && category !== "all") {
            query.category = category;
        }
        if (postType) {
            // For "shayari", also match posts where type is missing/null (backward compat)
            // since older posts were created before the type field was added.
            if (postType === "shayari") {
                query.type = { $in: ["shayari", null] };
            } else {
                query.type = postType;
            }
        }

        const skip = (page - 1) * limit;
        const [posts, total] = await Promise.all([
            Post.find(query)
                .sort({ views: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("author", "name")
                .lean(),
            Post.countDocuments(query),
        ]);

        return {
            posts: posts.map((p) => {
                // Explicitly serialize author to avoid ObjectId toJSON error
                const rawAuthor = p.author as unknown as { _id: { toString(): string }; name: string } | null;
                return {
                    _id: p._id.toString(),
                    title: p.title,
                    content: p.content,
                    excerpt: (p as unknown as { excerpt?: string }).excerpt,
                    tags: (p as unknown as { tags?: string[] }).tags,
                    type: (p.type as "shayari" | "kavita") ?? "shayari",
                    category: p.category,
                    image: p.image,
                    views: p.views,
                    likes: p.likes.map((l) => l.toString()),
                    slug: p.slug,
                    createdAt: p.createdAt.toISOString(),
                    author: rawAuthor ? { name: rawAuthor.name } : undefined,
                    status: p.status,
                    metaDescription: p.metaDescription,
                };
            }),
            total,
        };
    } catch (error) {
        console.error("Fetch posts error:", error);
        return { posts: [], total: 0 };
    }
}

// --- FETCH MY POSTS (user's own posts) ---
export async function fetchMyPosts(): Promise<PostData[]> {
    const session = await auth();
    if (!session?.user) return [];
    const userId = (session.user as { id: string }).id;

    try {
        await connectDB();
        const posts = await Post.find({ author: userId })
            .sort({ createdAt: -1 })
            .lean();

        return posts.map((p) => ({
            _id: p._id.toString(),
            title: p.title,
            content: p.content,
            type: (p.type as "shayari" | "kavita") ?? "shayari",
            category: p.category,
            image: p.image,
            views: p.views,
            likes: p.likes.map((l) => l.toString()),
            slug: p.slug,
            createdAt: p.createdAt.toISOString(),
            status: p.status,
        }));
    } catch (error) {
        console.error("Fetch my posts error:", error);
        return [];
    }
}

// --- FETCH SINGLE POST ---
export async function fetchPost(slug: string) {
    try {
        await connectDB();
        const post = await Post.findOne({ slug })
            .populate("author", "name")
            .populate("comments.user", "name avatar")
            .lean();

        if (!post) return null;

        return {
            ...post,
            _id: post._id.toString(),
            author: post.author,
            likes: post.likes.map((l) => l.toString()),
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString(),
        };
    } catch (error) {
        console.error("Fetch post error:", error);
        return null;
    }
}

// --- INCREMENT VIEW ---
export async function incrementView(postId: string, slug?: string, type?: string) {
    try {
        await connectDB();
        await Post.findByIdAndUpdate(postId, { $inc: { views: 1 } });
        if (slug && type) {
            revalidatePath(`/${type}/${slug}`);
        }
    } catch (error) {
        console.error("Increment view error:", error);
    }
}

// --- FETCH RELATED POSTS ---
export async function fetchRelatedPosts(
    currentSlug: string,
    category: string,
    type: "shayari" | "kavita",
    limit: number = 4
): Promise<PostData[]> {
    try {
        await connectDB();
        const posts = await Post.find({
            status: "approved",
            category,
            type,
            slug: { $ne: currentSlug },
        })
            .sort({ views: -1, createdAt: -1 })
            .limit(limit)
            .populate("author", "name")
            .lean();

        return posts.map((p) => {
            const rawAuthor = p.author as unknown as { _id: { toString(): string }; name: string } | null;
            return {
                _id: p._id.toString(),
                title: p.title,
                content: p.content,
                excerpt: (p as unknown as { excerpt?: string }).excerpt,
                type: (p.type as "shayari" | "kavita") ?? "shayari",
                category: p.category,
                image: p.image,
                views: p.views,
                likes: p.likes.map((l) => l.toString()),
                slug: p.slug,
                createdAt: p.createdAt.toISOString(),
                author: rawAuthor ? { name: rawAuthor.name } : undefined,
                status: p.status,
            };
        });
    } catch (error) {
        console.error("Fetch related posts error:", error);
        return [];
    }
}

// --- FETCH ADJACENT POSTS (Prev / Next navigation) ---
export async function fetchAdjacentPosts(
    currentSlug: string,
    currentCreatedAt: string,
    type: "shayari" | "kavita"
): Promise<{
    prev: { title: string; slug: string } | null;
    next: { title: string; slug: string } | null;
}> {
    try {
        await connectDB();
        const current = new Date(currentCreatedAt);

        const [prevPost, nextPost] = await Promise.all([
            Post.findOne({
                status: "approved",
                type,
                createdAt: { $lt: current },
                slug: { $ne: currentSlug },
            })
                .sort({ createdAt: -1 })
                .select("title slug")
                .lean(),
            Post.findOne({
                status: "approved",
                type,
                createdAt: { $gt: current },
                slug: { $ne: currentSlug },
            })
                .sort({ createdAt: 1 })
                .select("title slug")
                .lean(),
        ]);

        return {
            prev: prevPost ? { title: prevPost.title, slug: prevPost.slug } : null,
            next: nextPost ? { title: nextPost.title, slug: nextPost.slug } : null,
        };
    } catch (error) {
        console.error("Fetch adjacent posts error:", error);
        return { prev: null, next: null };
    }
}

// --- FETCH ALL SLUGS (for sitemap) ---
export async function fetchAllSlugs(): Promise<{ slug: string; type: string; updatedAt: string }[]> {
    try {
        await connectDB();
        const posts = await Post.find({ status: "approved" })
            .select("slug type updatedAt")
            .lean();
        return posts.map((p) => ({
            slug: p.slug,
            type: p.type ?? "shayari",
            updatedAt: p.updatedAt.toISOString(),
        }));
    } catch (error) {
        console.error("Fetch all slugs error:", error);
        return [];
    }
}

// --- LIKE POST ---
export async function likePost(postId: string) {
    const session = await auth();
    if (!session?.user) {
        return { success: false, error: "Login required to like" };
    }

    const userId = (session.user as { id: string }).id;

    try {
        await connectDB();
        const post = await Post.findById(postId);
        if (!post) return { success: false, error: "Post not found" };

        const likedIndex = post.likes.findIndex(
            (id) => id.toString() === userId
        );

        if (likedIndex > -1) {
            post.likes.splice(likedIndex, 1);
        } else {
            post.likes.push(userId as unknown as typeof post.likes[0]);
        }

        await post.save();
        revalidatePath(`/shayari/${post.slug}`);
        return { success: true, liked: likedIndex === -1, count: post.likes.length };
    } catch (error) {
        console.error("Like error:", error);
        return { success: false, error: "Failed to like" };
    }
}

// --- DELETE POST (owner or admin) ---
export async function deletePost(postId: string) {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    const userId = (session.user as { id: string }).id;
    const isAdmin = (session.user as { role?: string }).role === "admin";

    try {
        await connectDB();
        const post = await Post.findById(postId);
        if (!post) return { success: false, error: "Post not found" };

        // Only admin or the post owner can delete
        if (!isAdmin && post.author.toString() !== userId) {
            return { success: false, error: "Unauthorized" };
        }

        // Delete image from Cloudinary
        if (post.imagePublicId) {
            await cloudinary.uploader.destroy(post.imagePublicId);
        }

        await Post.findByIdAndDelete(postId);
        revalidatePath("/");
        revalidatePath("/dashboard");
        revalidatePath("/my-dashboard");
        return { success: true };
    } catch (error) {
        console.error("Delete post error:", error);
        return { success: false, error: "Failed to delete post" };
    }
}

// --- CACHED FETCH POSTS ---
export const getCachedPosts = unstable_cache(
    async (
        category?: string,
        limit: number = 20,
        page: number = 1,
        includeAll: boolean = false,
        postType?: "shayari" | "kavita"
    ) => {
        return fetchPosts(category, limit, page, includeAll, postType);
    },
    ["cached-posts-list"],
    { revalidate: 60, tags: ["posts"] }
);
