import type { Metadata } from "next";
import Link from "next/link";
import { getPublicData } from "@/lib/public-data";
import { ReviewCard } from "@/components/site/review-card";

export const metadata: Metadata = {
  title: "Reviews",
  description: "Published reviews of indie apps and AI projects that Alex tried, tested, and sometimes paid for.",
  alternates: { canonical: "/reviews" },
};
export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const { reviewedProjects } = await getPublicData();
  const reviews = [...reviewedProjects].sort((a, b) => (b.weekStartsOn || "").localeCompare(a.weekStartsOn || ""));
  return <div className="wrap page">
    <header className="page-head"><p className="label">Reviews · {reviews.length}</p><h1>Worth a closer look.</h1><p className="lede">What I found after using each product for real. Quick takes are short first impressions; deep reviews go further and often include a paid plan.</p></header>
    {reviews.length ? <div className="review-grid">{reviews.map(project => <ReviewCard project={project} key={project.slug} />)}</div>
      : <p className="empty">No reviews published yet. <Link href="/#weeks">See what I&apos;m checking this week →</Link></p>}
  </div>;
}
