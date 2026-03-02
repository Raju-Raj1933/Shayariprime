/**
 * Run with: node scripts/make-admin.mjs <email>
 * Example:  node scripts/make-admin.mjs rajraju1610@gmail.com
 */

import mongoose from "mongoose";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local manually
const envPath = resolve(process.cwd(), ".env.local");
const envContent = readFileSync(envPath, "utf-8");
const envLines = envContent.split("\n");
for (const line of envLines) {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join("=").trim();
    }
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI not found in .env.local");
    process.exit(1);
}

const email = process.argv[2];
if (!email) {
    console.error("❌ Usage: node scripts/make-admin.mjs <email>");
    process.exit(1);
}

// Simple User schema
const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: { type: String, default: "user" },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function makeAdmin() {
    console.log(`🔌 Connecting to MongoDB...`);
    await mongoose.connect(MONGODB_URI);
    console.log(`✅ Connected`);

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        console.error(`❌ No user found with email: ${email}`);
        await mongoose.disconnect();
        process.exit(1);
    }

    user.role = "admin";
    await user.save();

    console.log(`✅ Success! "${user.name}" (${email}) is now an admin.`);
    console.log(`👉 Please restart the dev server and log in again.`);
    await mongoose.disconnect();
}

makeAdmin().catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
});
