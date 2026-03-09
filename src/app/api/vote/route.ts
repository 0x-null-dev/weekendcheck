import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { votes, projects } from "@/lib/db/schema";
import { eq, and, or, sql, gt } from "drizzle-orm";

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, fingerprint } = body;

    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json({ error: "missing projectId" }, { status: 400 });
    }
    if (!fingerprint || typeof fingerprint !== "string") {
      return NextResponse.json({ error: "missing fingerprint" }, { status: 400 });
    }

    const voterId = request.cookies.get("wc_voter")?.value;
    if (!voterId) {
      return NextResponse.json({ error: "missing voter cookie" }, { status: 400 });
    }

    const ip = getClientIp(request);

    // Check if project exists and is in queue
    const [project] = await db
      .select({ id: projects.id, status: projects.status })
      .from(projects)
      .where(eq(projects.id, projectId));

    if (!project) {
      return NextResponse.json({ error: "project not found" }, { status: 404 });
    }
    if (project.status !== "in_queue") {
      return NextResponse.json({ error: "can only vote on queued projects" }, { status: 400 });
    }

    // Dedup: block if ANY 2 of 3 signals match a previous vote on this project
    // Check each signal individually first
    const existingByVoter = await db
      .select({ id: votes.id })
      .from(votes)
      .where(and(eq(votes.projectId, projectId), eq(votes.voterId, voterId)))
      .limit(1);

    const existingByFp = await db
      .select({ id: votes.id })
      .from(votes)
      .where(and(eq(votes.projectId, projectId), eq(votes.fingerprint, fingerprint)))
      .limit(1);

    const existingByIp = await db
      .select({ id: votes.id })
      .from(votes)
      .where(and(eq(votes.projectId, projectId), eq(votes.ip, ip)))
      .limit(1);

    const matches = [
      existingByVoter.length > 0,
      existingByFp.length > 0,
      existingByIp.length > 0,
    ].filter(Boolean).length;

    if (matches >= 2) {
      return NextResponse.json({ error: "already voted" }, { status: 409 });
    }

    // Also block if voter cookie already voted (strongest signal)
    if (existingByVoter.length > 0) {
      return NextResponse.json({ error: "already voted" }, { status: 409 });
    }

    // Rate limit: max 15 votes per hour per voter
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentVotes = await db
      .select({ id: votes.id })
      .from(votes)
      .where(
        and(
          eq(votes.voterId, voterId),
          gt(votes.createdAt, oneHourAgo)
        )
      );

    if (recentVotes.length >= 15) {
      return NextResponse.json({ error: "rate limited" }, { status: 429 });
    }

    // Insert vote
    const voteId = `vote-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await db.insert(votes).values({
      id: voteId,
      projectId,
      voterId,
      fingerprint,
      ip,
    });

    // Increment project upvote count
    await db
      .update(projects)
      .set({ upvotes: sql`${projects.upvotes} + 1` })
      .where(eq(projects.id, projectId));

    // Get updated count
    const [updated] = await db
      .select({ upvotes: projects.upvotes })
      .from(projects)
      .where(eq(projects.id, projectId));

    return NextResponse.json({ upvotes: updated.upvotes });
  } catch (error: unknown) {
    // Handle unique constraint violation (race condition)
    if (error instanceof Error && error.message?.includes("unique")) {
      return NextResponse.json({ error: "already voted" }, { status: 409 });
    }
    console.error("Vote error:", error);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}

// GET: Check which projects the current voter has voted for
export async function GET(request: NextRequest) {
  const voterId = request.cookies.get("wc_voter")?.value;
  if (!voterId) {
    return NextResponse.json({ votedIds: [] });
  }

  const rows = await db
    .select({ projectId: votes.projectId })
    .from(votes)
    .where(eq(votes.voterId, voterId));

  return NextResponse.json({ votedIds: rows.map((r) => r.projectId) });
}
