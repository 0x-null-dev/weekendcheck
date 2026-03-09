import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-me"
);

function generateId() {
  return crypto.randomUUID();
}

export async function middleware(request: NextRequest) {
  // Only protect /admin routes (not /admin/login)
  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    request.nextUrl.pathname !== "/admin/login"
  ) {
    const token = request.cookies.get("wc_admin_token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      await jwtVerify(token, SECRET);
    } catch {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Protect /api/admin routes (except login)
  if (
    request.nextUrl.pathname.startsWith("/api/admin") &&
    !request.nextUrl.pathname.endsWith("/login")
  ) {
    const token = request.cookies.get("wc_admin_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    try {
      await jwtVerify(token, SECRET);
    } catch {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  // Set voter cookie on all public pages and vote API
  const response = NextResponse.next();
  const voterCookie = request.cookies.get("wc_voter")?.value;

  if (!voterCookie) {
    response.cookies.set("wc_voter", generateId(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365 * 2, // 2 years
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/", "/queue", "/checked", "/submit", "/project/:path*", "/api/vote"],
};
