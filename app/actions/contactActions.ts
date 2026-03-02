"use server";

import connectDB from "@/app/lib/mongodb";
import Contact from "@/app/models/Contact";
import { verifyRecaptcha } from "@/app/lib/captcha";
import { Resend } from "resend";

export async function submitContactForm(formData: {
    name: string;
    email: string;
    message: string;
    captchaToken: string;
}) {
    try {
        const { name, email, message, captchaToken } = formData;

        if (!name || !email || !message || !captchaToken) {
            return { error: "All fields and CAPTCHA are required." };
        }

        if (message.length > 2000) {
            return { error: "Message is too long. Maximum 2000 characters allowed." };
        }

        // Verify reCAPTCHA
        const isHuman = await verifyRecaptcha(captchaToken);
        if (!isHuman) {
            return { error: "CAPTCHA verification failed. Please try again." };
        }

        // Connect to MongoDB and save
        await connectDB();
        await Contact.create({
            name,
            email,
            message,
        });

        // Send email via Resend
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            console.error("[contactActions] RESEND_API_KEY is not set.");
            return { error: "Email service is temporarily unavailable, but your message was saved." };
        }

        const resend = new Resend(apiKey);
        const from = process.env.FROM_EMAIL || "contact@shayariprime.com";

        const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9fafb;border-radius:12px;border:1px solid #e2e8f0;color:#1e293b">
            <h2 style="color:#7c3aed;border-bottom:2px solid #e2e8f0;padding-bottom:10px;">New Contact Form Submission</h2>
            <p>You have received a new message from the Shayariprime contact form.</p>
            <div style="background:#ffffff;padding:15px;border-radius:8px;border:1px solid #e2e8f0;margin-top:20px;">
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p style="white-space:pre-wrap;background:#f1f5f9;padding:15px;border-radius:6px;font-style:italic;">${message}</p>
            </div>
            <p style="margin-top:30px;font-size:12px;color:#64748b;text-align:center;">
                Sent automatically from Shayariprime.com
            </p>
        </div>
        `;

        const { error } = await resend.emails.send({
            from, // Valid verified sender email
            to: "rajraju1610@gmail.com", // Send to admin email as requested
            replyTo: email, // Set visitor's email as replyTo for easy answering
            subject: `[Shayariprime] New Message from ${name}`,
            html,
        });

        if (error) {
            console.error("[contactActions] Failed to send email via resend:", error);
            // We return success even if email failed because it is saved in MongoDB.
            return { success: true, warning: "Message saved, but admin email notification failed." };
        }

        return { success: true };

    } catch (error) {
        console.error("[contactActions] Error submitting contact form:", error);
        return { error: "An unexpected error occurred. Please try again later." };
    }
}
