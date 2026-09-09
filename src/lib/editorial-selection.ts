import { type EditorialState, type Entry, type Week, isSelected } from "./editorial";

export function selectionBlock(state: EditorialState, week: Week, entry: Entry): string | null {
  const project = state.projects.find(p => p.id === entry.projectId);
  if (!project || project.archived) return "Archived project";
  if (project.reviewedInWeek && project.reviewedInWeek !== week.id) return "Already reviewed in another week";
  if (state.reviews.some(review => review.projectId === entry.projectId && review.weekId !== week.id && (review.published || review.scheduled))) return "Already reviewed or scheduled in another week";
  if (state.weeks.some(other => other.id !== week.id && other.state !== "complete" && other.entries.some(e => e.projectId === entry.projectId && isSelected(e.track)))) return "Picked in another active week";
  return null;
}
