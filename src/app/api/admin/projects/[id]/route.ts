import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET /api/admin/projects/:id
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id));

  if (!project) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(project);
}

// PATCH /api/admin/projects/:id — update project fields
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  // Build update object from allowed fields
  const allowed = [
    "name", "slug", "logoUrl", "xProfilePic", "founderName",
    "url", "githubUrl", "description", "xHandle", "xThreadUrl",
    "tags", "status", "upvotes", "featured", "toolsIUse",
    "bestLastWeek", "reviewedAt",
  ];

  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) {
      update[key] = body[key];
    }
  }

  // If status changes to "checked", set reviewedAt
  if (body.status === "checked" && !body.reviewedAt) {
    update.reviewedAt = new Date();
  }

  // Guard: only 1 project can be in_review at a time
  if (body.status === "in_review") {
    const [existing] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.status, "in_review"));
    if (existing && existing.id !== id) {
      return NextResponse.json(
        { error: "another project is already in review" },
        { status: 409 }
      );
    }
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "no fields to update" }, { status: 400 });
  }

  await db.update(projects).set(update).where(eq(projects.id, id));

  const [updated] = await db.select().from(projects).where(eq(projects.id, id));
  return NextResponse.json(updated);
}

// DELETE /api/admin/projects/:id
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(projects).where(eq(projects.id, id));
  return NextResponse.json({ ok: true });
}
