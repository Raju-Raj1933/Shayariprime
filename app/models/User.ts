import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    role: "user" | "admin";
    avatar?: string;
    // Auth provider — never overwritten after first set for credentials users
    provider: "credentials" | "google";
    googleId?: string;
    // Email verification
    isEmailVerified: boolean;
    verificationToken?: string;      // SHA-256 hash of raw opaque token, cleared after use
    verificationTokenExpiry?: Date;  // Used to decide whether to allow resend
    // Password reset
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 100 },
        email: {
            type: String,
            required: true,
            unique: true,   // unique: true creates the index — no schema.index() duplicate needed
            lowercase: true,
            trim: true,
        },
        password: { type: String, minlength: 6 }, // Optional: Google-only users have no password
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        avatar: { type: String },
        provider: {
            type: String,
            enum: ["credentials", "google"],
            default: "credentials",
        },
        googleId: { type: String },
        isEmailVerified: { type: Boolean, default: false },
        // Stored as SHA-256 hash; the raw token lives only in the email link
        verificationToken: { type: String, select: false },
        verificationTokenExpiry: { type: Date, select: false },
        resetPasswordToken: { type: String, select: false },
        resetPasswordExpires: { type: Date, select: false },
    },
    { timestamps: true }
);

// googleId — sparse (many users won't have it), NOT unique (provider handles uniq logic)
UserSchema.index({ googleId: 1 }, { sparse: true });

// verificationToken — sparse (cleared after use), NOT unique (no constraint needed)
UserSchema.index({ verificationToken: 1 }, { sparse: true });

// resetPasswordToken — sparse, for fast token lookup during reset flow
UserSchema.index({ resetPasswordToken: 1 }, { sparse: true });

const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
