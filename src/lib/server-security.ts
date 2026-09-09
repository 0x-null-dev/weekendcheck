import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, validSession } from "./admin-auth";

export function appOrigin(request?: Request) {
  const configured = process.env.APP_URL;
  if (!configured && process.env.NODE_ENV === "production") throw new Error("APP_URL is required in production.");
  const url = new URL(configured || request?.url || "http://localhost:3000");
  if (url.username || url.password || !["http:","https:"].includes(url.protocol)) throw new Error("Invalid APP_URL.");
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:" && !["localhost","127.0.0.1","[::1]"].includes(url.hostname)) throw new Error("Production APP_URL must use HTTPS.");
  return url.origin;
}
export function safeOrigin(request: Request) { return request.headers.get("origin") === appOrigin(request) && request.headers.get("sec-fetch-site") !== "cross-site"; }
export async function isAdmin() { return validSession((await cookies()).get(SESSION_COOKIE)?.value); }
export async function requireAdminPage() { if (!await isAdmin()) redirect("/login"); }
export async function adminApiGuard(request: Request) {
  try {
    if (!await isAdmin()) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
    if (!["GET","HEAD"].includes(request.method) && !safeOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    return null;
  } catch { return NextResponse.json({ error: "Server unavailable. Please try again shortly." }, { status: 503 }); }
}
export const noStore = { "Cache-Control": "private, no-store" };
