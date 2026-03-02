import Link from "next/link";
import { Feather } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 text-center">
            <div>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 mb-6 shadow-lg">
                    <Feather size={28} className="text-white" />
                </div>
                <h1 className="text-7xl font-bold gradient-text mb-4">404</h1>
                <h2 className="text-xl font-semibold mb-2 text-white">
                    शायरी नहीं मिली
                </h2>
                <p className="text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>
                <Link href="/" className="btn-primary">
                    🏠 Go Home
                </Link>
            </div>
        </div>
    );
}
