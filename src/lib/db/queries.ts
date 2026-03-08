import { db } from ".";
import { projects, reviews } from "./schema";
import { eq, desc, asc, and, count, sql } from "drizzle-orm";

// Map DB row to frontend Project type
function toProject(row: typeof projects.$inferSelect) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    logo_url: row.logoUrl,
    x_profile_pic: row.xProfilePic ?? undefined,
    founder_name: row.founderName ?? undefined,
    url: row.url,
    github_url: row.githubUrl ?? undefined,
    description: row.description,
    x_handle: row.xHandle,
    x_thread_url: row.xThreadUrl ?? undefined,
    tags: row.tags,
    status: row.status,
    upvotes: row.upvotes,
    featured: row.featured,
    tools_i_use: row.toolsIUse,
    best_last_week: row.bestLastWeek,
    queue_order: row.queueOrder,
    created_at: row.createdAt.toISOString(),
    reviewed_at: row.reviewedAt?.toISOString(),
  };
}

function toReview(row: typeof reviews.$inferSelect) {
  return {
    id: row.id,
    project_id: row.projectId,
    review_number: row.reviewNumber,
    text: row.text,
    loom_url: row.loomUrl ?? undefined,
    screenshots: row.screenshots,
    published: row.published,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };
}

export async function getAllProjects() {
  const rows = await db.select().from(projects).orderBy(desc(projects.createdAt));
  return rows.map(toProject);
}

export async function getProjectBySlug(slug: string) {
  const [row] = await db.select().from(projects).where(eq(projects.slug, slug));
  return row ? toProject(row) : undefined;
}

export async function getReviewsForProject(projectId: string) {
  const rows = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.projectId, projectId), eq(reviews.published, true)))
    .orderBy(desc(reviews.reviewNumber));
  return rows.map(toReview);
}

export async function getInReviewProject() {
  const [row] = await db
    .select()
    .from(projects)
    .where(eq(projects.status, "in_review"));
  return row ? toProject(row) : undefined;
}

export async function getQueueProjects() {
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.status, "in_queue"))
    .orderBy(asc(projects.queueOrder), desc(projects.createdAt));
  return rows.map(toProject);
}

export async function getCheckedProjects() {
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.status, "checked"));
  return rows.map(toProject);
}

export async function getBestLastWeek() {
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.bestLastWeek, true));
  return rows.map(toProject);
}

export async function getFeaturedProjects() {
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.featured, true));
  return rows.map(toProject);
}

export interface CheckedProjectWithReview {
  project: ReturnType<typeof toProject>;
  review: ReturnType<typeof toReview>;
  snippet: string;
}

export async function getCheckedProjectsWithReviews(): Promise<CheckedProjectWithReview[]> {
  const checkedProjects = await getCheckedProjects();
  const results: CheckedProjectWithReview[] = [];

  for (const project of checkedProjects) {
    const projectReviews = await getReviewsForProject(project.id);
    const review = projectReviews[0];
    if (!review) continue;

    const lines = review.text.split("\n").filter((l) => !l.startsWith("#") && l.trim());
    const snippet = lines.slice(0, 2).join(" ").slice(0, 160);

    results.push({ project, review, snippet });
  }

  return results;
}

// ===== ADMIN QUERIES =====

export async function getProjectCounts() {
  const rows = await db
    .select({ status: projects.status, count: count() })
    .from(projects)
    .groupBy(projects.status);

  const counts: Record<string, number> = {};
  let total = 0;
  for (const row of rows) {
    counts[row.status] = row.count;
    total += row.count;
  }

  return {
    total,
    inQueue: counts["in_queue"] || 0,
    inReview: counts["in_review"] || 0,
    checked: counts["checked"] || 0,
    archived: counts["archived"] || 0,
    watching: counts["watching"] || 0,
  };
}

export async function getRecentProjects(limit = 8) {
  const rows = await db
    .select()
    .from(projects)
    .orderBy(desc(projects.createdAt))
    .limit(limit);
  return rows.map(toProject);
}

export async function getCheckedProjectsAdmin(limit = 6) {
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.status, "checked"))
    .orderBy(desc(projects.reviewedAt))
    .limit(limit);
  return rows.map(toProject);
}

export async function getReviewCounts() {
  const [total] = await db.select({ count: count() }).from(reviews);
  const [published] = await db
    .select({ count: count() })
    .from(reviews)
    .where(eq(reviews.published, true));

  return {
    total: total.count,
    published: published.count,
  };
}
