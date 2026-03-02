import mongoose, { Schema, Document, Model } from "mongoose";

// --- Comment Schema (recursive for nesting) ---
export interface IComment {
    _id: string;
    user: {
        _id: string;
        name: string;
    };
    text: string;
    emoji?: string;
    replies: IComment[];
    createdAt: Date;
}

const CommentSchema: Schema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        text: { type: String, required: true, maxlength: 1000 },
        emoji: { type: String, default: "" },
        replies: { type: [Object], default: [] }, // self-referencing stored as subdocs
    },
    { timestamps: true }
);

// Make replies truly recursive by using the same schema
CommentSchema.add({ replies: [CommentSchema] });

// --- Post Schema ---
export interface IPost extends Document {
    title: string;
    content: string;
    excerpt?: string;
    tags?: string[];
    type: "shayari" | "kavita";
    category: "sad" | "romantic" | "motivational";
    image: string;
    imagePublicId?: string;
    views: number;
    likes: mongoose.Types.ObjectId[];
    comments: IComment[];
    author: mongoose.Types.ObjectId;
    slug: string;
    metaDescription?: string;
    status: "pending" | "approved" | "rejected";
    createdAt: Date;
    updatedAt: Date;
}

const PostSchema: Schema<IPost> = new Schema(
    {
        title: { type: String, required: true, trim: true, maxlength: 200 },
        content: { type: String, required: true, maxlength: 5000 },
        excerpt: { type: String, maxlength: 300 },
        tags: [{ type: String, trim: true }],
        type: {
            type: String,
            enum: ["shayari", "kavita"],
            required: true,
            default: "shayari",
        },
        category: {
            type: String,
            enum: ["sad", "romantic", "motivational"],
            required: true,
            default: "sad",
        },
        image: { type: String, required: true },
        imagePublicId: { type: String },
        views: { type: Number, default: 0 },
        likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
        comments: [CommentSchema],
        author: { type: Schema.Types.ObjectId, ref: "User", required: true },
        slug: { type: String, required: true, unique: true },
        metaDescription: { type: String, maxlength: 160 },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);

// --- Compound Indexes for query performance ---

// Public listings: fetchPosts filters by status + optional category, sorts by createdAt
PostSchema.index({ status: 1, category: 1, createdAt: -1 });
PostSchema.index({ status: 1, createdAt: -1 });

// EXTREMELY IMPORTANT: Indexes for fetchPosts which filters by type, status, category, and sorts by views -1, createdAt -1
PostSchema.index({ type: 1, status: 1, views: -1, createdAt: -1 });
PostSchema.index({ type: 1, status: 1, category: 1, views: -1, createdAt: -1 });

// User dashboard: posts by author, filtered by status
PostSchema.index({ author: 1, status: 1, createdAt: -1 });

// Slug lookups (unique already, but explicit index for fast reads)
PostSchema.index({ slug: 1 });

// Views sorting (for trending/popular)
PostSchema.index({ views: -1 });


const Post: Model<IPost> =
    mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);

export default Post;
