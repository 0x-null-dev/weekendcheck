import { NextResponse } from "next/server";
import { login, LoginRateLimited, SESSION_COOKIE, SESSION_SECONDS } from "@/lib/admin-auth";
import { appOrigin, noStore, safeOrigin } from "@/lib/server-security";
import { readJson } from "@/lib/request-body";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    if (!safeOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403, headers: noStore });
    const body = await readJson(request, 4096);
    if (typeof body.password !== "string" || !body.password || body.password.length > 256) return NextResponse.json({ error: "Enter your admin password." }, { status: 400, headers: noStore });
    const token = await login(body.password);
    if (!token) return NextResponse.json({ error: "Incorrect password." }, { status: 401, headers: noStore });
    const response = NextResponse.json({ ok: true }, { headers: noStore });
    response.cookies.set(SESSION_COOKIE, token, { httpOnly: true, secure: appOrigin(request).startsWith("https:"), sameSite: "strict", path: "/", maxAge: SESSION_SECONDS });
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof LoginRateLimited ? error.message : "Sign-in is unavailable. Check the server configuration." }, { status: error instanceof LoginRateLimited ? 429 : 503, headers: { ...noStore, ...(error instanceof LoginRateLimited ? { "Retry-After": "900" } : {}) } });
  }
}
