import { NextResponse } from "next/server";
import { updateContactMessage } from "@/lib/contact";
import { adminApiGuard, noStore } from "@/lib/server-security";
import { readJson } from "@/lib/request-body";

export const runtime = "nodejs";
export async function POST(request: Request) {
  const denied = await adminApiGuard(request); if (denied) return denied;
  try {
    const body = await readJson(request, 1024);
    await updateContactMessage(body.id, body.status);
    return NextResponse.json({ ok: true }, { headers: noStore });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error && !("code" in error) ? error.message : "Database unavailable. Please retry." }, { status: 400, headers: noStore });
  }
}
