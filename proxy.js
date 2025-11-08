// proxy.js
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

/**
 * Role-based protection for dashboard routes.
 *
 * Rules:
 * - Only runs for /seller, /partner, /admin routes (see config.matcher)
 * - If no valid NextAuth token -> redirect to /login
 * - If token.role === 'admin' -> allow (admins can access all)
 * - If token.role matches requiredRole -> allow
 * - Otherwise redirect the user to their correct dashboard (if role exists) or /login
 */
export async function proxy(req) {
  const url = req.nextUrl.clone();
  const pathname = req.nextUrl.pathname;

  // Which protected prefix is being accessed and what's the required role
  const mapping = [
    { prefix: "/seller", role: "seller" },
    { prefix: "/partner", role: "partner" },
    { prefix: "/admin", role: "admin" },
  ];

  const match = mapping.find((m) => pathname.startsWith(m.prefix));
  if (!match) {
    // Not one of the protected prefixes. Let it pass.
    return NextResponse.next();
  }

  // Try to get token (NextAuth JWT). Requires NEXTAUTH_SECRET env.
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // If not logged in -> send to login (preserve original path as redirect param)
  if (!token) {
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const userRole = (token.role || "").toString();

  // Admin can access all protected dashboards
  if (userRole === "admin") {
    return NextResponse.next();
  }

  // If user's role matches the route's required role -> allow
  if (userRole === match.role) {
    return NextResponse.next();
  }

  // User is authenticated but role mismatch.
  // Redirect them to their appropriate dashboard if we can determine it,
  // otherwise send to /login.
  const roleToPath = {
    buyer: "/",
    seller: "/seller",
    partner: "/partner",
    admin: "/admin",
  };

  const redirectPath = roleToPath[userRole] || "/login";
  url.pathname = redirectPath;
  return NextResponse.redirect(url);
}

// Only run middleware for protected dashboard routes
export const config = {
  matcher: ["/seller/:path*", "/partner/:path*", "/admin/:path*"],
};
