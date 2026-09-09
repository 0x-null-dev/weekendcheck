import { readState } from "@/lib/editorial-store";
import { adminApiGuard } from "@/lib/server-security";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const denied = await adminApiGuard(request); if (denied) return denied;
  return new Response(JSON.stringify(await readState(), null, 2), { headers: {
    "Content-Type": "application/json", "Cache-Control": "no-store",
    "Content-Disposition": 'attachment; filename="weekendcheck-backup.json"',
  } });
}
