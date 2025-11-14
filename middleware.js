import { NextResponse } from "next/server";
import { verifyToken } from "./lib/jwt";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip middleware for these paths
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".") // Skip files with extensions
  ) {
    return NextResponse.next();
  }

  // Public paths - no auth required
  const publicPaths = ["/", "/login"];
  const isPublicPath = publicPaths.includes(pathname);
  const isSpaPath = pathname.startsWith("/spa/");

  if (isPublicPath || isSpaPath) {
    return NextResponse.next();
  }

  // For dashboard routes, check authentication
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      console.log("[Middleware] No token found, redirecting to login");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const decoded = await verifyToken(token);
      if (!decoded) {
        console.log("[Middleware] Invalid token, redirecting to login");
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("token");
        return response;
      }
      console.log(
        "[Middleware] Valid token for user:",
        decoded.name,
        "role:",
        decoded.role
      );
    } catch (error) {
      console.log("[Middleware] Token verification error:", error.message);
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
};
