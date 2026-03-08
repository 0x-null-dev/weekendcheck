import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { asc, desc, eq } from "drizzle-orm";

// GET /api/admin/projects — list all projects
export async function GET(request: Request) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status");

  const result = status
    ? await db
        .select()
        .from(projects)
        .where(eq(projects.status, status as "in_queue" | "in_review" | "checked" | "archived" | "watching"))
        .orderBy(status === "in_queue" ? asc(projects.queueOrder) : desc(projects.createdAt))
    : await db.select().from(projects).orderBy(desc(projects.createdAt));

  return NextResponse.json(result);
}

// POST /api/admin/projects — create a project
export async function POST(request: Request) {
  const body = await request.json();

  const slug = body.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const id = `proj-${Date.now()}`;

  // Get all queue items in order
  const queueItems = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.status, "in_queue"))
    .orderBy(asc(projects.queueOrder));

  const nextOrder = queueItems.length;

  await db.insert(projects).values({
    id,
    slug,
    name: body.name,
    logoUrl: body.logoUrl || `https://www.google.com/s2/favicons?domain=${new URL(body.url).hostname}&sz=64`,
    xProfilePic: body.xProfilePic || null,
    founderName: body.founderName || null,
    url: body.url,
    githubUrl: body.githubUrl || null,
    description: body.description || "",
    xHandle: body.xHandle,
    xThreadUrl: body.xThreadUrl || null,
    tags: body.tags || [],
    status: "in_queue",
    upvotes: 0,
    queueOrder: nextOrder,
  });

  // If queuePosition specified, reorder to insert at that position
  if (body.queuePosition != null) {
    const targetPos = Math.max(0, Math.min(body.queuePosition - 1, queueItems.length));
    // Build new order: insert the new project at targetPos
    const orderedIds = queueItems.map((p: { id: string }) => p.id);
    orderedIds.splice(targetPos, 0, id);

    // Update all queue orders
    for (let i = 0; i < orderedIds.length; i++) {
      await db
        .update(projects)
        .set({ queueOrder: i })
        .where(eq(projects.id, orderedIds[i]));
    }
  }

  return NextResponse.json({ id, slug });
}
