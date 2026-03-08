import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

// POST /api/admin/projects/finish-review
// Marks current in_review project as checked, promotes next in queue
export async function POST() {
  // Find current in_review project
  const [current] = await db
    .select()
    .from(projects)
    .where(eq(projects.status, "in_review"));

  if (current) {
    await db
      .update(projects)
      .set({ status: "checked", reviewedAt: new Date() })
      .where(eq(projects.id, current.id));
  }

  // Promote next in queue (lowest queueOrder)
  const [next] = await db
    .select()
    .from(projects)
    .where(eq(projects.status, "in_queue"))
    .orderBy(asc(projects.queueOrder))
    .limit(1);

  if (next) {
    await db
      .update(projects)
      .set({ status: "in_review" })
      .where(eq(projects.id, next.id));
  }

  return NextResponse.json({
    finished: current?.id || null,
    promoted: next?.id || null,
  });
}
