import mongoose, { Schema, Document, Model } from "mongoose";

export interface IContact extends Document {
    name: string;
    email: string;
    message: string;
    createdAt: Date;
}

const ContactSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            maxlength: 100,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please add a valid email address",
            ],
            trim: true,
            lowercase: true,
        },
        message: {
            type: String,
            required: [true, "Message is required"],
            maxlength: 2000,
        },
    },
    {
        timestamps: true,
    }
);

// Add index on createdAt for sorting/cleanup
ContactSchema.index({ createdAt: -1 });

const Contact: Model<IContact> =
    mongoose.models.Contact || mongoose.model<IContact>("Contact", ContactSchema);

export default Contact;
