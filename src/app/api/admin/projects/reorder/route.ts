import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// POST /api/admin/projects/reorder — reorder queue
// Body: { orderedIds: string[] }
export async function POST(request: Request) {
  const { orderedIds } = await request.json();

  if (!Array.isArray(orderedIds)) {
    return NextResponse.json({ error: "orderedIds must be an array" }, { status: 400 });
  }

  // Update queue_order for each project
  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .update(projects)
      .set({ queueOrder: i })
      .where(eq(projects.id, orderedIds[i]));
  }

  return NextResponse.json({ ok: true });
}
