import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function proxy(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Public routes are free
  if (
    pathname === "/" ||
    pathname.startsWith("/properties") ||
    pathname.startsWith("/property/") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  // Restrict /admin and /partner
  if (pathname.startsWith("/admin") || pathname.startsWith("/partner")) {
    if (!token) return NextResponse.redirect(new URL("/login", req.url));
    const role = token.role;
    if (pathname.startsWith("/admin") && role !== "admin")
      return NextResponse.redirect(new URL("/", req.url));
    if (
      pathname.startsWith("/partner") &&
      role !== "partner" &&
      role !== "admin"
    )
      return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/partner/:path*"],
};
