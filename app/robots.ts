import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/dashboard", "/my-dashboard", "/add-post", "/api/", "/admin/"],
            },
        ],
        sitemap: "https://shayariprime.com/sitemap.xml",
        host: "https://shayariprime.com",
    };
}
