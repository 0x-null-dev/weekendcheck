import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-me"
);

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

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
