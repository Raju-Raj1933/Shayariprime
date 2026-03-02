/**
 * KavitaWorld Seed Script
 * Run: npx ts-node --project tsconfig.json scripts/seed.ts
 * Or: node --loader ts-node/esm scripts/seed.ts
 *
 * Make sure .env.local has MONGODB_URI set before running.
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI || MONGODB_URI.includes("<username>")) {
    console.error("❌ Please set a valid MONGODB_URI in .env.local first!");
    process.exit(1);
}

// --- Schemas (inline for seed script) ---
const CommentSchema = new mongoose.Schema({
    user: mongoose.Schema.Types.ObjectId,
    text: String,
    emoji: String,
    replies: { type: [Object], default: [] },
    createdAt: { type: Date, default: Date.now },
});

const PostSchema = new mongoose.Schema(
    {
        title: String,
        content: String,
        category: String,
        image: String,
        views: { type: Number, default: 0 },
        likes: [mongoose.Schema.Types.ObjectId],
        comments: [CommentSchema],
        author: mongoose.Schema.Types.ObjectId,
        slug: { type: String, unique: true },
        metaDescription: String,
    },
    { timestamps: true }
);

const UserSchema = new mongoose.Schema(
    {
        name: String,
        email: { type: String, unique: true },
        password: String,
        role: { type: String, default: "user" },
    },
    { timestamps: true }
);

const Post = mongoose.models.Post || mongoose.model("Post", PostSchema);
const User = mongoose.models.User || mongoose.model("User", UserSchema);

// --- Sample Shayari Data ---
const shayariData = [
    // 7 Sad
    {
        title: "तेरी याद में रोना",
        content:
            "तेरी याद में रोया करते हैं,\nदिल को खोया करते हैं,\nतू मिल जाए काश कभी,\nबस यही सोया करते हैं।",
        category: "sad",
        image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800",
        views: 12400,
        slug: "teri-yaad-mein-rona",
    },
    {
        title: "दर्द की दास्तान",
        content:
            "कुछ दर्द ऐसे होते हैं,\nजो बयां नहीं होते,\nकुछ आंसू ऐसे होते हैं,\nजो जुबां पर नहीं आते।\n\nदिल के किसी कोने में,\nबस रहते हैं ये सब,\nन किसी को दिखते हैं,\nन खुद को समझ आते।",
        category: "sad",
        image: "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=800",
        views: 9800,
        slug: "dard-ki-dastan",
    },
    {
        title: "बिछड़ने का गम",
        content:
            "बिछड़ने का गम तो था,\nपर मिलने की चाहत भी थी,\nतूने जब रुख मोड़ा,\nएक दुनिया साथ चली गई।",
        category: "sad",
        image: "https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?w=800",
        views: 8700,
        slug: "bichhadne-ka-gam",
    },
    {
        title: "अकेलापन",
        content:
            "इस शहर की भीड़ में भी,\nतनहाई मेरी दोस्त है,\nहर चेहरा जाना पहचाना,\nफिर भी हर रात अजनबी सी लगती है।",
        category: "sad",
        image: "https://images.unsplash.com/photo-1475518823041-5a98e4c88f7e?w=800",
        views: 7900,
        slug: "akelapan",
    },
    {
        title: "टूटा हुआ दिल",
        content:
            "टूटे हुए दिल की दास्तान,\nकौन सुनेगा यहाँ,\nहर शख्स अपने दर्द में,\nखुद ही डूबा है यहाँ।\n\nफिर भी मैं लिखता हूँ,\nशायद कोई समझे,\nइस टूटे दिल की भाषा,\nशायद कोई पढ़े।",
        category: "sad",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        views: 6500,
        slug: "toota-hua-dil",
    },
    {
        title: "वो पलछिन",
        content:
            "वो पल जो बीत गए,\nवो छिन जो खो गए,\nकाश लौट आते वो,\nजो तेरे साथ थे।",
        category: "sad",
        image: "https://images.unsplash.com/photo-1434030216411-0b793f4b6f7c?w=800",
        views: 5200,
        slug: "wo-pal-chhin",
    },
    {
        title: "खामोश आंसू",
        content:
            "खामोश आंसू बहते हैं,\nजब रात की तन्हाई में,\nतेरी यादें आ जाती हैं,\nउस अँधेरी परछाई में।",
        category: "sad",
        image: "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=800",
        views: 4800,
        slug: "khamosh-aansu",
    },
    // 1 Romantic
    {
        title: "इश्क की इबादत",
        content:
            "तू जब मुस्कुराती है,\nएक नई दुनिया बसती है,\nतेरे होठों की वो हंसी,\nमेरी जिंदगी सजाती है।\n\nचाहत में हूँ डूबा मैं,\nतेरी महफिल में खोया,\nइश्क की इबादत है ये,\nतेरे प्यार में जो बोया।",
        category: "romantic",
        image: "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=800",
        views: 11200,
        slug: "ishq-ki-ibadat",
    },
    // 1 Motivational
    {
        title: "उठो और चलो",
        content:
            "गिरकर उठना ही जिंदगी है,\nहारकर जीतना ही कहानी है,\nटूटे पंखों से भी उड़ा करो,\nयही सुबह की रवानी है।\n\nहर मुश्किल एक सीढ़ी है,\nजो ऊपर ले जाती है,\nबस हिम्मत रखो दिल में,\nमंजिल खुद आ जाती है।",
        category: "motivational",
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
        views: 15600,
        slug: "utho-aur-chalo",
    },
];

async function seed() {
    console.log("🌱 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected!");

    // Create admin user
    const adminEmail = "admin@kavitaworld.com";
    const existing = await User.findOne({ email: adminEmail });

    let adminUser;
    if (!existing) {
        const hashedPw = await bcrypt.hash("Admin@12345", 12);
        adminUser = await User.create({
            name: "KavitaWorld Admin",
            email: adminEmail,
            password: hashedPw,
            role: "admin",
        });
        console.log("👤 Admin user created:", adminEmail, "| Password: Admin@12345");
    } else {
        adminUser = existing;
        console.log("👤 Admin user already exists:", adminEmail);
    }

    // Create posts
    let created = 0;
    for (const data of shayariData) {
        const existingPost = await Post.findOne({ slug: data.slug });
        if (!existingPost) {
            const metaDesc = data.content.replace(/\n/g, " ").substring(0, 155);
            await Post.create({
                ...data,
                author: adminUser._id,
                metaDescription: metaDesc,
            });
            created++;
            console.log(`📝 Created: ${data.title}`);
        } else {
            console.log(`⏭️  Already exists: ${data.title}`);
        }
    }

    console.log(`\n✅ Seeding complete! ${created} new posts created.`);
    console.log("\n📋 Login credentials:");
    console.log("   Email:    admin@kavitaworld.com");
    console.log("   Password: Admin@12345");
    console.log("\n🚀 Run 'npm run dev' to start the app!");

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
