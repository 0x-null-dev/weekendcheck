import { weeks as demoWeeks } from "./demo-data";
import { defaultSettings, type EditorialState, type Review } from "./editorial";

export function seedState(): EditorialState {
  const state: EditorialState = { version: 1, revision: 0, projects: [], weeks: [], reviews: [], settings: { ...defaultSettings }, xPosts: [] };
  for (const week of demoWeeks) {
    state.weeks.push({
      id: week.slug, startsOn: week.startsOn, state: week.state === "published" ? "complete" : week.state,
      quickSlots: week.quickSlots, deepSlots: week.deepSlots, callUrl: "", announcement: "", announcementUrl: "",
      entries: week.entries.map(project => ({
        projectId: project.slug, track: project.track, source: "", note: project.note || "",
        fit: 3, clarity: project.description ? 4 : 2, interest: 3, ready: true,
      })),
      selection: week.entries.map(project => ({ projectId: project.slug, track: project.track })),
    });
    for (const project of week.entries) {
      if (!state.projects.some(item => item.id === project.slug)) state.projects.push({
        id: project.slug, slug: project.slug, name: project.name,
        url: project.url === "https://example.com" ? `https://example.com/${project.slug}` : project.url,
        logoUrl: project.logoUrl || "", description: project.description, handle: project.handle,
        category: project.category, archived: false, createdAt: `${week.startsOn}T00:00:00Z`,
      });
      if (project.reviewed && project.review) {
        state.projects.find(p => p.id === project.slug)!.reviewedInWeek = week.slug;
        const posts = project.review.posts.map((post, index) => ({ id: `post-${index}`, text: post.text, assets: [] }));
        const review: Review = {
          id: `${week.slug}--${project.slug}`, weekId: week.slug, projectId: project.slug, kind: project.reviewed,
          title: project.reviewTitle || project.name, posts, xPostUrl: "", updatedAt: new Date(project.review.publishedAt).toISOString(),
          published: { title: project.reviewTitle || project.name, posts, publishedAt: new Date(project.review.publishedAt).toISOString() }, scheduled: null,
        };
        state.reviews.push(review);
      }
    }
  }
  return state;
}
