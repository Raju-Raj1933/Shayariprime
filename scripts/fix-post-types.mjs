/**
 * One-time migration: set type="shayari" on all posts missing the type field.
 * Run with: node scripts/fix-post-types.mjs
 */

import { config } from "dotenv";
import { resolve } from "path";
import mongoose from "mongoose";

// Load .env.local
config({ path: resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error("MONGODB_URI not found in .env.local");
    process.exit(1);
}

await mongoose.connect(MONGODB_URI);
console.log("Connected to MongoDB");

const result = await mongoose.connection.db
    .collection("posts")
    .updateMany(
        { $or: [{ type: { $exists: false } }, { type: null }, { type: "" }] },
        { $set: { type: "shayari" } }
    );

console.log("Updated " + result.modifiedCount + " posts → type set to shayari");
await mongoose.disconnect();
console.log("Disconnected");
