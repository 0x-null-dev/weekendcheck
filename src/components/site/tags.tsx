import type { Project, WeekEntry } from "@/lib/demo-data";
import { formatEuros } from "@/lib/site";

const trackLabels = { inbox: "In consideration", shortlisted: "Shortlist", passed: "Not this week" } as const;

// Review type and access, always as words; colour only repeats what the word says.
export function ReviewTags({ project, track }: { project: Project; track?: WeekEntry["track"] }) {
  const kind = project.reviewed || (track === "quick" || track === "deep" ? track : undefined);
  return <span className="tags">
    {kind ? <span className={`tag ${kind}`}>{kind === "deep" ? "Deep review" : "Quick take"}{!project.reviewed && " · planned"}</span>
      : track && <span className="tag muted">{trackLabels[track as keyof typeof trackLabels]}</span>}
    <AccessTag project={project} />
  </span>;
}

// Only paid access reaches public data (free and trial stay private), so this tag only ever says Paid.
export function AccessTag({ project }: { project: Project }) {
  if (project.access !== "paid") return null;
  return <span className="tag paid">Paid{project.costCents ? ` ${formatEuros(project.costCents)}` : ""}</span>;
}
