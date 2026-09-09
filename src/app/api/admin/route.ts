import { NextResponse } from "next/server";
import { changeState, readState } from "@/lib/editorial-store";
import { applyAction } from "@/lib/editorial-actions";
import { adminApiGuard, noStore } from "@/lib/server-security";
import { readJson } from "@/lib/request-body";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) { const denied = await adminApiGuard(request); if (denied) return denied; return NextResponse.json(await readState(), { headers: noStore }); }
export async function POST(request: Request) {
  const denied = await adminApiGuard(request); if (denied) return denied;
  try {
    const body = await readJson(request, 2_000_000);
    if (!Number.isInteger(body.revision)) throw new Error("Refresh the admin before saving.");
    const result = await changeState(body.revision as number, state => applyAction(state, body));
    return NextResponse.json(result, { headers: noStore });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error) return NextResponse.json({ error: "Database unavailable. Your changes were not saved; please retry." }, { status: 503 });
    const message = error instanceof Error ? error.message : "Unable to save.";
    return NextResponse.json({ error: message }, { status: message.includes("another tab") ? 409 : 400 });
  }
}
