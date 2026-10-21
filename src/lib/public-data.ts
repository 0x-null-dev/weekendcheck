import { readState } from "./editorial-store";
import { liveVersion, type EditorialState } from "./editorial";
import type { ReviewWeek, WeekEntry } from "./demo-data";
import { budgetCents } from "./site";

export function publicData(state: EditorialState) {
  const weeks: ReviewWeek[] = state.weeks.filter(week => week.selection !== null)
    .sort((a, b) => b.startsOn.localeCompare(a.startsOn))
    .map((week, index) => ({
      slug: week.id, number: state.weeks.length - index, startsOn: week.startsOn,
      state: week.state === "complete" ? "published" : week.state,
      quickSlots: week.quickSlots, deepSlots: week.deepSlots, callUrl: week.callUrl,
      entries: (week.selection || []).flatMap(selected => {
        const project = state.projects.find(p => p.id === selected.projectId);
        if (!project) return [];
        const review = state.reviews.find(r => r.weekId === week.id && r.projectId === project.id);
        const live = review && liveVersion(review);
        const entry: WeekEntry = {
          slug: project.slug, name: project.name, url: project.url, logoUrl: project.logoUrl,
          handle: project.handle, description: project.description, category: project.category,
          score: 0, track: selected.track, source: "", weekStartsOn: week.startsOn,
        };
        // Only paid access is public, with its amount, because the budget is part of the site. Free and trial stay private.
        const entryState = week.entries.find(e => e.projectId === project.id);
        if (entryState?.access === "paid") { entry.access = "paid"; if (entryState.costCents) entry.costCents = entryState.costCents; }
        if (live && review) {
          entry.reviewed = review.kind;
          entry.reviewTitle = live.title;
          entry.reviewExcerpt = live.posts[0]?.text.slice(0, 160) || "";
          entry.review = {
            publishedAt: new Date(live.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }),
            xPostUrl: review.xPostUrl,
            posts: live.posts.map(post => ({ text: post.text, assets: post.assets })),
          };
        }
        return [entry];
      }),
    }));
  const today = new Date().toISOString().slice(0, 10);
  const currentWeek = weeks.find(week => week.startsOn <= today) || weeks[0];
  const reviewed = weeks.flatMap(w => w.entries).filter(p => p.reviewed);
  const reviewedProjects = [...new Map(reviewed.map(p => [p.slug, p])).values()];
  // Purchases count from the editorial data, so a paid project shows up even before its review is published.
  const purchases = state.weeks.flatMap(week => week.entries.filter(e => e.access === "paid" && e.costCents && (e.track === "quick" || e.track === "deep")).map(e => {
    const project = state.projects.find(p => p.id === e.projectId);
    const review = state.reviews.find(r => r.weekId === week.id && r.projectId === e.projectId);
    return { name: project?.name || "Project", slug: review && liveVersion(review) ? project?.slug : undefined, weekStartsOn: week.startsOn, costCents: e.costCents! };
  })).sort((a, b) => b.weekStartsOn.localeCompare(a.weekStartsOn));
  const spentCents = purchases.reduce((sum, p) => sum + p.costCents, 0);
  const budget = { totalCents: budgetCents, spentCents, leftCents: Math.max(0, budgetCents - spentCents), purchases };
  return { weeks, currentWeek, reviewedProjects, settings: state.settings, budget };
}
export async function getPublicData() { return publicData(await readState()); }
