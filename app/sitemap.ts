import { MetadataRoute } from "next";
import { fetchAllSlugs } from "@/app/actions/postActions";

const BASE_URL = "https://shayariprime.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

    const staticRoutes: MetadataRoute.Sitemap = [
        { url: BASE_URL, changeFrequency: "daily", priority: 1.0 },
        { url: `${BASE_URL}/kavita`, changeFrequency: "daily", priority: 0.9 },
        { url: `${BASE_URL}/category/sad`, changeFrequency: "weekly", priority: 0.8 },
        { url: `${BASE_URL}/category/romantic`, changeFrequency: "weekly", priority: 0.8 },
        { url: `${BASE_URL}/category/motivational`, changeFrequency: "weekly", priority: 0.8 },
        { url: `${BASE_URL}/about`, changeFrequency: "yearly", priority: 0.5 },
        { url: `${BASE_URL}/contact`, changeFrequency: "yearly", priority: 0.5 },
        { url: `${BASE_URL}/privacy-policy`, changeFrequency: "yearly", priority: 0.4 },
        { url: `${BASE_URL}/disclaimer`, changeFrequency: "yearly", priority: 0.4 },
        { url: `${BASE_URL}/terms-and-conditions`, changeFrequency: "yearly", priority: 0.4 },
    ];

    // Dynamic post routes
    let postRoutes: MetadataRoute.Sitemap = [];
    try {
        const slugs = await fetchAllSlugs();
        postRoutes = slugs.map((s) => ({
            url: `${BASE_URL}/${s.type === "kavita" ? "kavita" : "shayari"}/${s.slug}`,
            lastModified: new Date(s.updatedAt),
            changeFrequency: "weekly" as const,
            priority: 0.8,
        }));
    } catch {
        // Sitemap can be generated without post routes if DB is unavailable
    }

    return [...staticRoutes, ...postRoutes];
}
