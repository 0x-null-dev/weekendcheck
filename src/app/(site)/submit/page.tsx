export const dynamic = "force-dynamic";

import Link from "next/link";
import { getAllProjects, getQueueProjects, getCheckedProjects } from "@/lib/db/queries";

export default async function SubmitPage() {
  const [allProjects, queue, checked] = await Promise.all([
    getAllProjects(),
    getQueueProjects(),
    getCheckedProjects(),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto max-w-3xl px-6 py-10">
      {/* Hero */}
      <div className="relative">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          submit your project.
          <br />
          <span className="relative inline-block">
            <span className="text-accent">get real feedback.</span>
            <svg
              className="absolute -inset-x-3 -inset-y-2 w-[calc(100%+24px)] h-[calc(100%+16px)]"
              viewBox="0 0 300 50"
              fill="none"
              preserveAspectRatio="none"
            >
              <ellipse cx="150" cy="25" rx="145" ry="22" stroke="#ff6b35" strokeWidth="1.5" strokeDasharray="4 3" transform="rotate(-1 150 25)" opacity="0.4" />
            </svg>
          </span>
        </h1>
        <p className="mt-3 text-sm text-muted max-w-md leading-relaxed">
          no forms. no signups. just DM your link and we&apos;ll actually use your product,
          then write what we think.
        </p>

        {/* Stats inline */}
        <div className="mt-4 flex items-center gap-4 text-xs font-mono">
          <span>
            <span className="font-bold text-foreground">{allProjects.length}</span>
            <span className="text-muted ml-1">submitted</span>
          </span>
          <span className="text-border">·</span>
          <span>
            <span className="font-bold text-accent">{queue.length}</span>
            <span className="text-muted ml-1">in queue</span>
          </span>
          <span className="text-border">·</span>
          <span>
            <span className="font-bold text-green">{checked.length}</span>
            <span className="text-muted ml-1">reviewed</span>
          </span>
        </div>
      </div>

      {/* Steps — with connecting line */}
      <div className="mt-10 relative">
        {/* Vertical sketch line */}
        <svg className="absolute left-[15px] top-4 bottom-4 w-[2px] h-[calc(100%-32px)]" preserveAspectRatio="none">
          <line x1="1" y1="0" x2="1" y2="100%" stroke="#e5e5e5" strokeWidth="1.5" strokeDasharray="4 3" />
        </svg>

        <div className="flex flex-col gap-8">
          <div className="flex gap-4 relative">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-bold text-background z-10">
              1
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">follow on X</h3>
              <p className="mt-1 text-sm text-muted leading-relaxed">
                follow{" "}
                <a href="https://x.com/0x_null_dev" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-medium">@0x_null_dev</a>
                {" "}: reviews, updates, and picks all get posted there.
              </p>
              <a
                href="https://x.com/0x_null_dev"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-surface-hover"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                follow @0x_null_dev
              </a>
            </div>
          </div>

          <div className="flex gap-4 relative">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-bold text-background z-10">
              2
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">DM your project link</h3>
              <p className="mt-1 text-sm text-muted leading-relaxed">
                send a DM with your project URL and optionally a one-liner about what it does.
                that&apos;s it. no 50-question intake.
              </p>
            </div>
          </div>

          <div className="flex gap-4 relative">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-bold text-background z-10">
              3
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">get in the pile</h3>
              <p className="mt-1 text-sm text-muted leading-relaxed">
                your project joins{" "}
                <Link href="/queue" className="text-accent hover:underline font-medium">{queue.length} others in the pile</Link>.
                the community upvotes to help us pick what&apos;s next.
              </p>
            </div>
          </div>

          <div className="flex gap-4 relative">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-background z-10">
              4
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                get reviewed & promoted
                <svg className="inline-block ml-1 -mt-1" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1 L9.5 6 L15 6.5 L10.5 10 L12 15 L8 12 L4 15 L5.5 10 L1 6.5 L6.5 6 Z" stroke="#ff6b35" strokeWidth="0.8" fill="none" />
                </svg>
              </h3>
              <p className="mt-1 text-sm text-muted leading-relaxed">
                we sign up, click around, test the flows. then write what works,
                what doesn&apos;t, and what to build next. posted here + on X.
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* CTA — full width */}
      <div className="bg-foreground pt-10 pb-6 px-6 text-center flex-1 flex flex-col justify-center">
        <p className="text-lg font-bold text-white">
          {allProjects.length} builders already in. you next?
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <a
            href="https://x.com/0x_null_dev"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full bg-accent px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-accent-hover"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            follow & DM
          </a>
          <Link
            href="/queue"
            className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            browse the pile →
          </Link>
        </div>
      </div>
    </div>
  );
}
