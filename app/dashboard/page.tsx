import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { fetchPosts, deletePost } from "@/app/actions/postActions";
import type { Metadata } from "next";
import DashboardClient from "@/app/components/DashboardClient";

export const metadata: Metadata = {
    title: "Admin Dashboard | Shayariprime",
    robots: { index: false, follow: false },
};

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
        redirect("/login?error=Access+Denied%3A+Admins+only");
    }

    const { posts, total } = await fetchPosts(undefined, 200, 1, true);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold gradient-text mb-1">
                    🛡️ Admin Dashboard
                </h1>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                    Welcome, {session.user.name} — {total} total Shayari published
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {[
                    { label: "Total Posts", value: total, color: "#a78bfa" },
                    {
                        label: "Sad",
                        value: posts.filter((p) => p.category === "sad").length,
                        color: "#93c5fd",
                    },
                    {
                        label: "Romantic",
                        value: posts.filter((p) => p.category === "romantic").length,
                        color: "#f9a8d4",
                    },
                    {
                        label: "Motivational",
                        value: posts.filter((p) => p.category === "motivational").length,
                        color: "#fcd34d",
                    },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className="glass rounded-2xl p-5 text-center"
                        style={{ border: "1px solid rgba(124,58,237,0.2)" }}
                    >
                        <p
                            className="text-3xl font-bold mb-1"
                            style={{ color: stat.color }}
                        >
                            {stat.value}
                        </p>
                        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                            {stat.label}
                        </p>
                    </div>
                ))}
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap gap-3 mb-8">
                <a href="/add-post" className="btn-primary text-sm">
                    + Add New Shayari
                </a>
            </div>

            {/* Posts Table */}
            <DashboardClient posts={posts} />
        </div>
    );
}
