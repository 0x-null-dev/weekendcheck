import Link from "next/link";
import type { Project } from "@/lib/demo-data";
import { formatWeekRange } from "@/lib/demo-data";
import { ProjectLogo } from "../project-logo";
import { ReviewTags } from "./tags";

export function ReviewCard({ project }: { project: Project }) {
  return <Link className="review-card" href={`/projects/${project.slug}`}>
    <div className="review-card-top"><ProjectLogo project={project} /><ReviewTags project={project} /></div>
    <h3>{project.name}</h3>
    {project.reviewTitle && <p className="review-card-title">{project.reviewTitle}</p>}
    <p>{project.reviewExcerpt}</p>
    <span className="review-card-foot label">{project.weekStartsOn && formatWeekRange(project.weekStartsOn)}<span>Read →</span></span>
  </Link>;
}
