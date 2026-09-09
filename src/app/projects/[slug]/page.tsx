import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicData } from "@/lib/public-data";
import { SiteFooter, SiteHeader } from "@/components/mark";
import { ProjectLogo } from "@/components/project-logo";
import { ReviewThread } from "@/components/review-thread";
import styles from "./review.module.css";

export const dynamic = "force-dynamic";
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { reviewedProjects, settings } = await getPublicData();
  const { slug } = await params;
  const project = reviewedProjects.find(project => project.slug === slug);
  if (!project || !project.reviewed) notFound();

  return <>
    <SiteHeader settings={settings} />
    <main className={styles.page}>
      <Link href="/reviews" className={styles.back}>← All reviews</Link>
      <section className={styles.header} aria-labelledby="project-name">
        <div className={styles.identity}>
          <div className={styles.logo}><ProjectLogo project={project} /></div>
          <div className={styles.title}>
            <p className="eyebrow">{project.category}</p>
            <h1 id="project-name">{project.name}</h1>
          </div>
        </div>
        <p className={styles.description}>{project.description}</p>
        <div className={styles.links}>
          <a className="button dark" href={project.url} target="_blank" rel="noreferrer">Visit project ↗</a>
          <a className={styles.founder} href={`https://x.com/${project.handle}`} target="_blank" rel="noreferrer">by @{project.handle} ↗</a>
        </div>
        <div className={styles.metadata}>
          <span className={styles.reviewType}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              {project.reviewed === "deep" ? <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m10 9 5 3-5 3Z" /></> : <><path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5" /></>}
            </svg>
            {project.reviewed === "deep" ? "Deep review" : "Quick take"}
          </span>
          <span className={styles.publication}><span className={styles.dot} />Published{project.review?.publishedAt && ` · ${project.review.publishedAt}`}</span>
        </div>
      </section>
      <ReviewThread project={project} author={settings} />
    </main>
    <SiteFooter settings={settings} />
  </>;
}
