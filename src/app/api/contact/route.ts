import { NextResponse } from "next/server";
import { ContactInvalid, ContactRateLimited, saveContact } from "@/lib/contact";
import { noStore, safeOrigin } from "@/lib/server-security";
import { readJson } from "@/lib/request-body";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    if (!safeOrigin(request)) return NextResponse.json({ error: "Please send the form from this website." }, { status: 403, headers: noStore });
    const body = await readJson(request, 16_384);
    // Bots fill the hidden "website" field; pretend success so they move on.
    if (typeof body.website === "string" && body.website.trim()) return NextResponse.json({ ok: true }, { headers: noStore });
    // Vercel sets x-real-ip to the client address; it is only used, hashed, for rate limiting.
    const client = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    await saveContact(body, client);
    return NextResponse.json({ ok: true }, { status: 201, headers: noStore });
  } catch (error) {
    if (error instanceof ContactInvalid) return NextResponse.json({ error: error.message, fields: error.fields }, { status: 400, headers: noStore });
    if (error instanceof ContactRateLimited) return NextResponse.json({ error: error.message }, { status: 429, headers: { ...noStore, "Retry-After": "3600" } });
    return NextResponse.json({ error: "Your message could not be sent right now. Please try again, or message me on X." }, { status: 503, headers: noStore });
  }
}
