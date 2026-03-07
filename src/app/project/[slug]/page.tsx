import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getProjectBySlug,
  getReviewsForProject,
  projects,
} from "@/lib/data";
import { PendingReview } from "./pending-review";
import { ReviewContent } from "./review-content";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const reviews = getReviewsForProject(project.id);
  const hasReview = reviews.length > 0;

  const queuePosition =
    project.status === "in_queue"
      ? projects
          .filter((p) => p.status === "in_queue")
          .sort((a, b) => b.upvotes - a.upvotes)
          .findIndex((p) => p.id === project.id) + 1
      : null;

  return (
    <div>
      {/* ===== PROJECT HEADER ===== */}
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-4xl px-6 py-10">
          {/* Back nav */}
          <Link
            href={hasReview ? "/checked" : "/queue"}
            className="inline-flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors mb-6"
          >
            <span>←</span> back to {hasReview ? "checked" : "the pile"}
          </Link>

          <div className="flex flex-col sm:flex-row gap-8">
            {/* Left: Logo + project info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-4 mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.logo_url}
                  alt={project.name}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-2xl object-contain shrink-0 border border-border"
                />
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-foreground">
                      {project.name}
                    </h1>
                    {project.status === "checked" && (
                      <span className="rounded-full bg-green/10 border border-green/20 px-2.5 py-0.5 text-[10px] font-mono font-bold text-green">
                        reviewed
                      </span>
                    )}
                    {project.status === "in_queue" && (
                      <span className="rounded-full bg-accent/10 border border-accent/20 px-2.5 py-0.5 text-[10px] font-mono font-bold text-accent">
                        in queue
                      </span>
                    )}
                    {project.status === "in_review" && (
                      <span className="rounded-full bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-0.5 text-[10px] font-mono font-bold text-yellow-600">
                        reviewing now
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="font-mono text-xs text-muted">▲ {project.upvotes}</span>
                    {queuePosition && (
                      <>
                        <span className="text-border text-xs">|</span>
                        <span className="font-mono text-xs text-muted">#{queuePosition} in queue</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {project.description && (
                <p className="text-sm text-foreground/70 leading-relaxed max-w-lg">
                  {project.description}
                </p>
              )}

              {/* Tags */}
              {project.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-background border border-border px-2.5 py-0.5 text-[11px] font-mono text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/80"
                >
                  visit project ↗
                </a>
                <a
                  href={`https://x.com/${project.x_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  get in touch
                </a>
              </div>
            </div>

            {/* Right: Founder card */}
            <div className="sm:w-56 shrink-0">
              <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-3">
                founder
              </p>
              <a
                href={`https://x.com/${project.x_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 transition-colors hover:border-accent/30"
              >
                {project.x_profile_pic ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={project.x_profile_pic}
                    alt={project.x_handle}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-foreground/10 flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-muted">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                )}
                <div className="min-w-0">
                  {project.founder_name && (
                    <p className="text-sm font-medium text-foreground truncate">
                      {project.founder_name}
                    </p>
                  )}
                  <p className="font-mono text-xs text-muted truncate">
                    @{project.x_handle}
                  </p>
                </div>
              </a>

              {/* Submitted date */}
              <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-muted">
                <span>submitted</span>
                <span>
                  {new Date(project.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              {project.reviewed_at && (
                <div className="mt-1 flex items-center gap-2 text-[11px] font-mono text-green">
                  <span>reviewed</span>
                  <span>
                    {new Date(project.reviewed_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== INLINE SHARE BAR ===== */}
      {hasReview && (
        <div className="bg-accent/5 border-y border-accent/10">
          <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-accent shrink-0">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div>
                <p className="text-sm font-medium text-foreground">
                  tried {project.name}? drop your review
                </p>
                <p className="text-xs text-muted mt-0.5">
                  share your honest take and help other builders
                </p>
              </div>
            </div>
            <a
              href={`https://x.com/intent/tweet?text=${encodeURIComponent(
                `my thoughts on ${project.name} by @${project.x_handle}:\n\n`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2 text-xs font-bold text-background transition-colors hover:bg-foreground/80 shrink-0"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              review on X
            </a>
          </div>
        </div>
      )}

      {/* ===== CONTENT ===== */}
      <div className="mx-auto max-w-4xl px-6 py-10">
        {hasReview ? (
          <ReviewContent
            reviews={reviews}
            projectName={project.name}
            projectSlug={project.slug}
            projectXHandle={project.x_handle}
            projectUrl={project.url}
          />
        ) : (
          <PendingReview
            isReviewing={project.status === "in_review"}
            queuePosition={queuePosition}
          />
        )}
      </div>
    </div>
  );
}
