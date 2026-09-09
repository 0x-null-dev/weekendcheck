import Link from "next/link";
import { WeekEntry } from "@/lib/demo-data";
import { TrackBadge } from "./badges";
import { ProjectLogo } from "./project-logo";

export function ProjectRow({ project, number, showScore = false }: { project: WeekEntry; number?: number; showScore?: boolean }) {
  return <article className="project-row">
    {number && <span className="row-number">{String(number).padStart(2, "0")}</span>}
    <div className="project-main"><div className="project-identity"><ProjectLogo project={project} /><div><div className="project-title"><a href={project.url} target="_blank" rel="noreferrer">{project.name} ↗</a>{project.reviewed && <Link className="review-link" href={`/projects/${project.slug}`}>Read review →</Link>}</div><p>{project.description}</p><span className="handle">{project.url.replace(/^https?:\/\//, "")} · @{project.handle}</span></div></div></div>
    {showScore && <div className="score"><b>{project.score}</b><small>fit score</small></div>}
    <TrackBadge track={project.track} reviewed={project.reviewed} />
  </article>;
}
