import Link from "next/link";
import type { WeekEntry } from "@/lib/demo-data";
import { ProjectLogo } from "./project-logo";
import { ReviewTags } from "./site/tags";

// A reviewed row is clickable as a whole: the review link stretches over the row, the project link sits above it.
export function ProjectRow({ project }: { project: WeekEntry }) {
  const reviewHref = project.reviewed ? `/projects/${project.slug}` : "";
  return <article className={`project-row${reviewHref ? " has-review" : ""}`}>
    <ProjectLogo project={project} />
    <div className="project-main">
      <div className="project-title"><a className="project-link" href={project.url} target="_blank" rel="noreferrer">{project.name} <span aria-hidden="true">↗</span></a><ReviewTags project={project} track={project.track} /></div>
      {project.description && <p>{project.description}</p>}
      <span className="project-meta">{project.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}{project.handle && ` · @${project.handle}`}</span>
    </div>
    {reviewHref && <Link className="row-action label" href={reviewHref} aria-label={`Read review of ${project.name}`}>Read review <span aria-hidden="true">→</span></Link>}
  </article>;
}
