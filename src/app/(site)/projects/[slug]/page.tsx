import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatWeekRange } from "@/lib/demo-data";
import { getPublicData } from "@/lib/public-data";
import { siteName, xHandle } from "@/lib/site";
import { ProjectLogo } from "@/components/project-logo";
import { ReviewArticle } from "@/components/site/review-article";
import { AccessTag, ReviewTags } from "@/components/site/tags";

export const dynamic = "force-dynamic";
// Metadata and the page share one database read per request.
const publicData = cache(getPublicData);

function summary(text: string) {
  const plain = text.replace(/\s+/g, " ").trim();
  return plain.length > 155 ? `${plain.slice(0, 155).replace(/\s+\S*$/, "")}…` : plain;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = (await publicData()).reviewedProjects.find(project => project.slug === slug);
  if (!project?.reviewed) return { robots: { index: false } };
  const title = `${project.name} review`;
  const description = summary(project.review?.posts[0]?.text || project.description);
  return {
    title, description,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: { type: "article", siteName, title: project.reviewTitle || title, description, url: `/projects/${slug}` },
    twitter: { card: "summary_large_image", site: `@${xHandle}`, creator: `@${xHandle}`, title: project.reviewTitle || title, description },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { reviewedProjects } = await publicData();
  const { slug } = await params;
  const project = reviewedProjects.find(project => project.slug === slug);
  if (!project || !project.reviewed) notFound();

  return <div className="wrap page review-page">
    <Link href="/reviews" className="back label">← All reviews</Link>
    <header className="review-head">
      <div className="review-identity"><ProjectLogo project={project} /><div>{project.category && <p className="label sea">{project.category}</p>}<h1>{project.name}</h1></div></div>
      {project.description && <p className="lede">{project.description}</p>}
      <div className="actions"><a className="btn" href={project.url} target="_blank" rel="noreferrer">Visit {project.name} ↗</a>{project.handle && <a className="text-link" href={`https://x.com/${project.handle}`} target="_blank" rel="noreferrer">Built by @{project.handle} ↗</a>}</div>
    </header>
    <dl className="facts">
      <div><dt className="label">Review</dt><dd><ReviewTags project={{ ...project, access: undefined }} /></dd></div>
      {project.access === "paid" && <div><dt className="label">Access</dt><dd><AccessTag project={project} /> <span className="fact-note">from the budget</span></dd></div>}
      {project.weekStartsOn && <div><dt className="label">Week</dt><dd>{formatWeekRange(project.weekStartsOn)}</dd></div>}
      {project.review?.publishedAt && <div><dt className="label">Published</dt><dd>{project.review.publishedAt}</dd></div>}
      {project.review?.xPostUrl && <div><dt className="label">On X</dt><dd><a className="text-link" href={project.review.xPostUrl} target="_blank" rel="noreferrer">Read the thread ↗</a></dd></div>}
    </dl>
    <ReviewArticle project={project} />
    <aside className="cta-panel"><div><h2>Built something too?</h2><p>Send me your project and I&apos;ll try it.</p></div><Link className="btn" href="/contact">Send me your project</Link></aside>
  </div>;
}
