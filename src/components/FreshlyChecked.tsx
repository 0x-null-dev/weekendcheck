"use client";

import { CheckedProjectWithReview } from "@/lib/data";
import Link from "next/link";

function shareUrl(project: { name: string; url: string; x_handle: string }) {
  const text = `check out ${project.name} by @${project.x_handle} : found it on @0x_null_dev's weekendcheck`;
  return `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(project.url)}`;
}

export function FreshlyChecked({ items }: { items: CheckedProjectWithReview[] }) {
  if (items.length === 0) return null;

  return (
    <section className="py-10">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">freshly checked</h2>
            <p className="text-xs text-muted">
              projects we actually used and reviewed
            </p>
          </div>
          <Link
            href="/checked"
            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 font-mono text-xs font-medium text-foreground transition-colors hover:bg-surface-hover"
          >
            all reviews →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {items.map(({ project, review, snippet }) => (
            <div
              key={project.id}
              className="group bg-surface border border-border rounded-sm p-5 transition-all hover:border-border-strong hover:shadow-sm"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.logo_url}
                  alt={project.name}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-lg object-contain"
                />
                <div className="min-w-0 flex-1">
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-foreground hover:text-accent transition-colors truncate block"
                  >
                    {project.name}
                  </a>
                  <a
                    href={`https://x.com/${project.x_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[11px] text-muted hover:text-accent transition-colors"
                  >
                    @{project.x_handle}
                  </a>
                </div>
                <span className="flex items-center gap-1 text-green">
                  <span className="h-1.5 w-1.5 rounded-full bg-green" />
                  <span className="text-[10px] font-medium">reviewed</span>
                </span>
              </div>

              {/* Review snippet */}
              <p className="text-sm text-muted leading-relaxed mb-4">
                &ldquo;{snippet}&rdquo;
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-muted">
                    review #{review.review_number}
                  </span>
                  <span className="font-mono text-[10px] text-muted">
                    {new Date(review.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={shareUrl(project)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 rounded-sm border border-border px-2 py-0.5 text-[10px] font-medium text-muted transition-all hover:border-border-strong hover:text-foreground"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                    share
                  </a>
                  <Link
                    href={`/project/${project.slug}`}
                    className="rounded-sm bg-foreground px-2.5 py-0.5 text-[10px] font-medium text-background transition-colors hover:bg-foreground/80"
                  >
                    read review →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
