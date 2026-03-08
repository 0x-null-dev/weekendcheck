import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

// GET /api/admin/reviews?projectId=xxx
export async function GET(request: Request) {
  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "projectId required" }, { status: 400 });
  }

  const result = await db
    .select()
    .from(reviews)
    .where(eq(reviews.projectId, projectId))
    .orderBy(desc(reviews.reviewNumber));

  return NextResponse.json(result);
}

// POST /api/admin/reviews — create a review
export async function POST(request: Request) {
  const body = await request.json();

  // Get next review number for this project
  const existing = await db
    .select()
    .from(reviews)
    .where(eq(reviews.projectId, body.projectId))
    .orderBy(desc(reviews.reviewNumber));

  const nextNumber = existing.length > 0 ? existing[0].reviewNumber + 1 : 1;
  const id = `rev-${Date.now()}`;

  await db.insert(reviews).values({
    id,
    projectId: body.projectId,
    reviewNumber: nextNumber,
    text: body.text || "",
    loomUrl: body.loomUrl || null,
    screenshots: body.screenshots || [],
    published: body.published ?? false,
  });

  return NextResponse.json({ id, reviewNumber: nextNumber });
}
