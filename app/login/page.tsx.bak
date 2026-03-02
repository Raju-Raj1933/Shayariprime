import { Suspense } from "react";
import type { Metadata } from "next";
import LoginPage from "./LoginPageClient";

export const metadata: Metadata = {
    title: "Login | Shayariprime",
    description: "Login or register to Shayariprime to like, comment, and share your favourite Shayari.",
    robots: { index: false, follow: false },
};

export default function LoginRoute() {
    return (
        <Suspense fallback={
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
            </div>
        }>
            <LoginPage />
        </Suspense>
    );
}
