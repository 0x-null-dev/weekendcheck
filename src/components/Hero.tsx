import Link from "next/link";
import { Project } from "@/lib/types";

interface HeroProps {
  submitted: number;
  reviewed: number;
  inQueue: number;
  inReviewProject?: Project;
}

export function Hero({ submitted, reviewed, inQueue, inReviewProject }: HeroProps) {
  return (
    <section className="pt-16 pb-10">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
          {/* Left — value prop */}
          <div className="flex-1 max-w-lg">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
              submit your project.
              <br />
              <span className="relative inline-block">
                <span className="text-accent">get honest feedback.</span>
                <svg
                  className="absolute -inset-x-4 -inset-y-3 w-[calc(100%+32px)] h-[calc(100%+24px)]"
                  viewBox="0 0 300 60"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <ellipse
                    cx="150" cy="30" rx="145" ry="26"
                    stroke="#ff6b35" strokeWidth="1.5"
                    strokeDasharray="4 3"
                    transform="rotate(-1.5 150 30)"
                    opacity="0.5"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-4 text-base text-muted leading-relaxed">
              we pick projects from the pile, actually use them,
              and write what we think. what works, what doesn&apos;t, what to build next.
            </p>

            {/* Steps */}
            <div className="mt-6 flex items-center gap-6 text-sm text-muted">
              <span><span className="font-medium text-foreground">1.</span> follow & DM your link</span>
              <span className="text-border">→</span>
              <span><span className="font-medium text-foreground">2.</span> get in the pile</span>
              <span className="text-border">→</span>
              <span className="relative">
                <span className="font-medium text-foreground">3.</span> get reviewed & promoted
                <svg className="absolute -bottom-1 left-0 w-full h-2" viewBox="0 0 200 8" fill="none" preserveAspectRatio="none">
                  <path d="M0 5 Q 40 1, 80 4 T 160 3 T 200 5" stroke="#ff6b35" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6" />
                </svg>
              </span>
            </div>

            {/* CTA + stats */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/submit"
                className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/80"
              >
                submit your project
              </Link>
              <div className="flex items-center gap-3 text-sm">
                <span className="font-mono font-bold text-foreground">{submitted}</span>
                <span className="text-muted text-xs">submitted</span>
                <span className="text-border">·</span>
                <span className="font-mono font-bold text-green">{reviewed}</span>
                <span className="text-muted text-xs">reviewed</span>
                <span className="text-border">·</span>
                <span className="font-mono font-bold text-foreground">{inQueue}</span>
                <span className="text-muted text-xs">in queue</span>
              </div>
            </div>
          </div>

          {/* Right — currently reviewing card */}
          {inReviewProject && (
            <div className="md:w-80 shrink-0 relative" style={{ transform: "rotate(1.5deg)" }}>
              {/* Hand-drawn arrow pointing to card */}
              <svg className="absolute -left-14 top-8 w-12 h-12 hidden md:block" viewBox="0 0 50 50" fill="none">
                <path d="M4 40 Q 15 38, 25 28 T 44 10" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                <path d="M38 8 L 44 10 L 40 16" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>

              {/* Sketch annotation */}
              <p className="text-[11px] text-muted mb-2 italic" style={{ fontFamily: "var(--font-geist-mono)" }}>
                ~ currently on the desk ~
              </p>

              {/* The card with hand-drawn border */}
              <div className="relative bg-surface p-6">
                {/* Hand-drawn wobbly rectangle border */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" viewBox="0 0 320 300" preserveAspectRatio="none">
                  <path
                    d="M4 3 Q 160 -1, 316 4 Q 319 150, 315 296 Q 160 300, 5 297 Q 1 150, 4 3 Z"
                    fill="none"
                    stroke="#1a1a1a"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Tape/pin at top */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <svg width="60" height="20" viewBox="0 0 60 20" fill="none">
                    <rect x="5" y="4" width="50" height="14" rx="1" fill="#ff6b35" opacity="0.15" stroke="#ff6b35" strokeWidth="0.8" />
                    <line x1="5" y1="11" x2="55" y2="11" stroke="#ff6b35" strokeWidth="0.3" opacity="0.3" />
                  </svg>
                </div>

                {/* Live badge */}
                <div className="flex justify-center mb-4 mt-1">
                  <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3 py-1">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                    </span>
                    <span className="text-[11px] font-medium text-accent">reviewing now</span>
                  </span>
                </div>

                {/* Logo */}
                <div className="mx-auto mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={inReviewProject.logo_url}
                    alt={inReviewProject.name}
                    width={56}
                    height={56}
                    className="mx-auto h-14 w-14 rounded-xl object-contain"
                  />
                </div>

                <h3 className="text-center text-xl font-bold text-foreground">
                  {inReviewProject.name}
                </h3>

                <a
                  href={`https://x.com/${inReviewProject.x_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center font-mono text-xs text-muted hover:text-accent mt-1"
                >
                  @{inReviewProject.x_handle}
                </a>

                {/* Sketch checklist annotation at bottom */}
                <div className="mt-4 pt-3 border-t border-dashed border-border/60">
                  <div className="flex flex-col gap-1 text-[10px] font-mono text-muted/70">
                    <span className="flex items-center gap-1.5">
                      <svg width="10" height="10" viewBox="0 0 10 10"><rect x="1" y="1" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="0.8" fill="none" /><path d="M2.5 5.5 L4 7 L7.5 3" stroke="#ff6b35" strokeWidth="0.8" fill="none" strokeLinecap="round" /></svg>
                      sign up flow
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg width="10" height="10" viewBox="0 0 10 10"><rect x="1" y="1" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="0.8" fill="none" /><path d="M2.5 5.5 L4 7 L7.5 3" stroke="#ff6b35" strokeWidth="0.8" fill="none" strokeLinecap="round" /></svg>
                      core features
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg width="10" height="10" viewBox="0 0 10 10"><rect x="1" y="1" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="0.8" fill="none" /></svg>
                      writing review...
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-3 flex items-center gap-2">
                <Link
                  href={`/project/${inReviewProject.slug}`}
                  className="flex-1 rounded-sm border border-foreground bg-foreground px-3 py-1.5 text-center text-xs font-medium text-background transition-colors hover:bg-foreground/80"
                >
                  view review page →
                </Link>
                <a
                  href={`https://x.com/${inReviewProject.x_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-hover"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  follow
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
