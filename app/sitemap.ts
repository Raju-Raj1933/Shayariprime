import { MetadataRoute } from "next";
import { fetchAllSlugs } from "@/app/actions/postActions";

const BASE_URL = "https://shayariprime.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

    const staticRoutes: MetadataRoute.Sitemap = [
        { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
        { url: `${BASE_URL}/kavita`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
        { url: `${BASE_URL}/category/sad`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
        { url: `${BASE_URL}/category/romantic`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
        { url: `${BASE_URL}/category/motivational`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
        { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
        { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
        { url: `${BASE_URL}/privacy-policy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
        { url: `${BASE_URL}/disclaimer`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
        { url: `${BASE_URL}/terms-and-conditions`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
        { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
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
