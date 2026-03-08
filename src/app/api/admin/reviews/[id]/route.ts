import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// PATCH /api/admin/reviews/:id
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const allowed = ["text", "loomUrl", "screenshots", "published"];
  const update: Record<string, unknown> = { updatedAt: new Date() };

  for (const key of allowed) {
    if (key in body) {
      update[key] = body[key];
    }
  }

  await db.update(reviews).set(update).where(eq(reviews.id, id));

  const [updated] = await db.select().from(reviews).where(eq(reviews.id, id));
  return NextResponse.json(updated);
}

// DELETE /api/admin/reviews/:id
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(reviews).where(eq(reviews.id, id));
  return NextResponse.json({ ok: true });
}
