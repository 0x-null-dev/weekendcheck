export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { getQueueProjects, getAllProjects, getCheckedProjects } from "@/lib/db/queries";
import { QueueList } from "./queue-list";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The Pile — Projects Waiting for Review",
  description:
    "Upvote the projects you want reviewed next. The community decides what gets checked every weekend.",
};

export default async function QueuePage() {
  const [queue, allProjects, checked] = await Promise.all([
    getQueueProjects(),
    getAllProjects(),
    getCheckedProjects(),
  ]);
  const sorted = [...queue].sort((a, b) => b.upvotes - a.upvotes);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">the pile</h1>
          <span className="rounded-full bg-accent/10 border border-accent/20 px-2.5 py-0.5 font-mono text-sm font-bold text-accent">
            {queue.length}
          </span>
        </div>
        <p className="mt-1 text-[15px] text-muted max-w-xl">
          upvote the ones you want us to check next. click any project to try it yourself.
        </p>

        {/* Action bar */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link
            href="/submit"
            className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-background transition-colors hover:bg-accent-hover"
          >
            submit yours →
          </Link>
          <div className="flex items-center gap-4 text-sm text-muted">
            <span className="flex items-center gap-1.5">
              <span className="text-accent font-bold">▲</span> upvote to prioritize
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-accent font-bold">↗</span> click name to open
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-accent font-bold">@</span> click handle for X
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 flex items-center gap-4 text-sm font-mono">
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

      <QueueList projects={sorted} />
    </div>
  );
}
