import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: "user" | "admin";
    avatar?: string;
    isVerified: boolean;
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
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: { type: String, required: true, minlength: 6 },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        avatar: { type: String },
        isVerified: { type: Boolean, default: false },
        resetPasswordToken: { type: String, select: false },
        resetPasswordExpires: { type: Date, select: false },
    },
    {
        timestamps: true,
    }
);

// Index for token lookups (fast expiry queries)
UserSchema.index({ resetPasswordToken: 1 }, { sparse: true });

const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
