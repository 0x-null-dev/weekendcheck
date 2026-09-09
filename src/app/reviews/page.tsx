import Link from "next/link";
import { getPublicData } from "@/lib/public-data";
import { SiteFooter, SiteHeader } from "@/components/mark";
import { KindBadge } from "@/components/badges";

export const dynamic = "force-dynamic";
export default async function ReviewsPage() {
  const { reviewedProjects, settings } = await getPublicData();
  return <><SiteHeader settings={settings} /><main className="page"><p className="eyebrow">THE REVIEW SHELF</p><h1 className="page-title">Worth a closer look.</h1><p className="lede">Published notes from the projects that made it past the weekly shortlist.</p><div className="reviews-grid">{reviewedProjects.map(project => <Link href={`/projects/${project.slug}`} className="review-card" key={project.slug}><KindBadge kind={project.reviewed!} /><p className="review-category">{project.category}</p><h2>{project.reviewTitle}</h2><p>{project.reviewExcerpt}</p><div><b>{project.name}</b><span>{project.handle && `@${project.handle}`}</span></div><span className="read-arrow">Read review →</span></Link>)}</div>{!reviewedProjects.length && <p>No reviews published yet. Check back after the next weekly selection.</p>}</main><SiteFooter settings={settings} /></>;
}
