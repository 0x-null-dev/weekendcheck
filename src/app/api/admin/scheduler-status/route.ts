import { NextResponse } from "next/server";
import { schedulerStatus } from "@/lib/x-scheduler-status";
import { adminApiGuard } from "@/lib/server-security";
export const dynamic = "force-dynamic";
export async function GET(request: Request) { const denied = await adminApiGuard(request); if (denied) return denied; return NextResponse.json(await schedulerStatus(), { headers: { "Cache-Control": "no-store" } }); }
