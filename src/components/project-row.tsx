import Link from "next/link";
import { WeekEntry } from "@/lib/demo-data";
import { TrackBadge } from "./badges";
import { ProjectLogo } from "./project-logo";

// A reviewed row is clickable as a whole: the review link stretches over the row, the project link sits above it.
export function ProjectRow({ project, number, showScore = false }: { project: WeekEntry; number?: number; showScore?: boolean }) {
  const reviewHref = project.reviewed ? `/projects/${project.slug}` : "";
  return <article className={`project-row${reviewHref ? " has-review" : ""}`}>
    {number && <span className="row-number">{String(number).padStart(2, "0")}</span>}
    <div className="project-main"><div className="project-identity"><ProjectLogo project={project} /><div><div className="project-title"><a className="project-link" href={project.url} target="_blank" rel="noreferrer">{project.name} ↗</a><TrackBadge track={project.track} reviewed={project.reviewed} /></div><p>{project.description}</p><span className="handle">{project.url.replace(/^https?:\/\//, "")}{project.handle && ` · @${project.handle}`}</span></div></div></div>
    {showScore && <div className="score"><b>{project.score}</b><small>fit score</small></div>}
    {reviewHref && <Link className="row-action" href={reviewHref} aria-label={`Read review of ${project.name}`}>Read review <span aria-hidden="true">→</span></Link>}
  </article>;
}
