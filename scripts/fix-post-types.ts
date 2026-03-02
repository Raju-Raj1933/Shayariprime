// Run with: npx tsx scripts/fix-post-types.ts
import connectDB from "../app/lib/mongodb";
import Post from "../app/models/Post";

async function run() {
    await connectDB();
    // Update all posts that have no type or empty type → set to "shayari"
    const result = await Post.updateMany(
        { $or: [{ type: { $exists: false } }, { type: null }, { type: "" }] },
        { $set: { type: "shayari" } }
    );
    console.log(`✅ Updated ${result.modifiedCount} posts → type set to "shayari"`);
    process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
