import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { fetchMyPosts } from "@/app/actions/postActions";
import type { Metadata } from "next";
import UserDashboardClient from "@/app/components/UserDashboardClient";

export const metadata: Metadata = {
    title: "My Dashboard | Shayariprime",
    robots: { index: false, follow: false },
};

export default async function MyDashboardPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login?error=Please+login+to+continue");
    }

    const posts = await fetchMyPosts();

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold gradient-text mb-1">
                    📝 My Dashboard
                </h1>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                    Welcome, {session.user.name} — {posts.length} shayari submitted
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {[
                    { label: "Total Posts", value: posts.length, color: "#a78bfa" },
                    { label: "Approved", value: posts.filter(p => p.status === "approved").length, color: "#34d399" },
                    { label: "Pending", value: posts.filter(p => p.status === "pending").length, color: "#fcd34d" },
                    { label: "Rejected", value: posts.filter(p => p.status === "rejected").length, color: "#f87171" },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className="glass rounded-2xl p-5 text-center"
                        style={{ border: "1px solid rgba(124,58,237,0.2)" }}
                    >
                        <p className="text-3xl font-bold mb-1" style={{ color: stat.color }}>
                            {stat.value}
                        </p>
                        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                            {stat.label}
                        </p>
                    </div>
                ))}
            </div>

            {/* Quick Link */}
            <div className="flex flex-wrap gap-3 mb-8">
                <a href="/add-post" className="btn-primary text-sm">
                    + Add New Shayari
                </a>
            </div>

            {/* Posts */}
            <UserDashboardClient posts={posts} />
        </div>
    );
}
