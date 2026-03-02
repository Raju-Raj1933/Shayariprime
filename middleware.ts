import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const isProduction = process.env.NODE_ENV === "production";

    // getToken uses secureCookie option to correctly read NextAuth v5's __Secure- prefix
    const token = await getToken({
        req,
        secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
        secureCookie: isProduction,
        salt: isProduction ? "__Secure-authjs.session-token" : "authjs.session-token"
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
