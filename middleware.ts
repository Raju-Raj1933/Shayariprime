import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Middleware uses `getToken` from `next-auth/jwt` — this ONLY reads & verifies
 * the JWT cookie, with no MongoDB or bcryptjs import → fully edge-safe.
 */
export async function middleware(req: NextRequest) {
    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
    });

    const { pathname } = req.nextUrl;
    const isLoggedIn = !!token;
    const isAdmin = token?.role === "admin";

    // Admin-only routes
    if (pathname.startsWith("/dashboard")) {
        if (!isLoggedIn) {
            return NextResponse.redirect(
                new URL("/login?error=Please+login+to+continue", req.url)
            );
        }
        if (!isAdmin) {
            return NextResponse.redirect(
                new URL("/login?error=Access+Denied%3A+Admin+only+area", req.url)
            );
        }
    }

    // Any logged-in user routes
    if (
        pathname.startsWith("/my-dashboard") ||
        pathname.startsWith("/add-post")
    ) {
        if (!isLoggedIn) {
            return NextResponse.redirect(
                new URL("/login?error=Please+login+to+continue", req.url)
            );
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/add-post/:path*", "/my-dashboard/:path*"],
};
