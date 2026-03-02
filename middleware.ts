import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { pathname } = req.nextUrl;
    const isLoggedIn = !!req.auth;
    const isAdmin = (req.auth?.user as { role?: string })?.role === "admin";

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
});

export const config = {
    matcher: ["/dashboard/:path*", "/add-post/:path*", "/my-dashboard/:path*"],
};
