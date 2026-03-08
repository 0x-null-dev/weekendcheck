export const dynamic = "force-dynamic";

import { getCheckedProjectsWithReviews } from "@/lib/db/queries";
import Link from "next/link";

export default async function CheckedPage() {
  const items = await getCheckedProjectsWithReviews();
  const latest = items[items.length - 1];

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">checked</h1>
          <span className="rounded-full bg-green/10 border border-green/20 px-2.5 py-0.5 font-mono text-xs font-bold text-green">
            {items.length} reviewed
          </span>
        </div>
        <p className="mt-1 text-sm text-muted max-w-xl">
          we use the product, test the flows, and write what we think.
          every review covers first impression, what works, what doesn&apos;t, and what to build next.
        </p>
        <div className="mt-3 flex items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="text-green font-bold">→</span> click a review to read the full breakdown
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-accent font-bold">↗</span> open the project to try it yourself
          </span>
        </div>
      </div>

      {/* Latest review — featured */}
      {latest && (
        <div className="mb-8">
          <p className="text-[11px] font-mono text-muted uppercase tracking-widest mb-3">latest review</p>
          <div className="rounded-sm border border-green/20 bg-green/5 p-6">
            <div className="flex items-start gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={latest.project.logo_url}
                alt={latest.project.name}
                width={48}
                height={48}
                className="h-12 w-12 rounded-lg object-contain"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <a
                      href={latest.project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-bold text-foreground hover:text-accent transition-colors"
                    >
                      {latest.project.name}
                    </a>
                    <a
                      href={`https://x.com/${latest.project.x_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block font-mono text-xs text-muted hover:text-accent transition-colors"
                    >
                      @{latest.project.x_handle}
                    </a>
                  </div>
                  <span className="font-mono text-xs text-green font-medium">
                    {new Date(latest.review.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>

                <p className="mt-3 text-sm text-foreground/70 leading-relaxed">
                  &ldquo;{latest.snippet}&rdquo;
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <Link
                    href={`/project/${latest.project.slug}`}
                    className="rounded-sm bg-foreground px-4 py-1.5 text-xs font-medium text-background transition-colors hover:bg-foreground/80"
                  >
                    read full review →
                  </Link>
                  <a
                    href={latest.project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-sm border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-hover"
                  >
                    try it yourself ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All reviews */}
      {items.length > 1 && (
        <>
          <p className="text-[11px] font-mono text-muted uppercase tracking-widest mb-3">all reviews</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {items
              .filter((item) => item !== latest)
              .map(({ project, review, snippet }) => (
                <Link
                  key={project.id}
                  href={`/project/${project.slug}`}
                  className="group rounded-sm border border-border bg-surface p-5 transition-all hover:border-border-strong hover:shadow-sm"
                >
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
                      <h3 className="text-sm font-bold text-foreground group-hover:text-accent transition-colors truncate">
                        {project.name}
                      </h3>
                      <p className="font-mono text-[11px] text-muted">@{project.x_handle}</p>
                    </div>
                    <span className="font-mono text-[10px] text-muted">
                      {new Date(review.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>

                  <p className="text-sm text-muted leading-relaxed">
                    &ldquo;{snippet}&rdquo;
                  </p>

                  <span className="mt-3 inline-block rounded-sm bg-foreground px-2.5 py-1 text-[10px] font-medium text-background group-hover:bg-foreground/80 transition-colors">
                    read review →
                  </span>
                </Link>
              ))}
          </div>
        </>
      )}

      {items.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-muted">no reviews yet: check back soon</p>
        </div>
      )}
    </div>
  );
}
