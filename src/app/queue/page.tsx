import { getQueueProjects, projects } from "@/lib/data";
import { QueueList } from "./queue-list";
import Link from "next/link";

export default function QueuePage() {
  const queue = getQueueProjects();
  const sorted = [...queue].sort((a, b) => b.upvotes - a.upvotes);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">the pile</h1>
          <span className="rounded-full bg-accent/10 border border-accent/20 px-2.5 py-0.5 font-mono text-xs font-bold text-accent">
            {queue.length}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted max-w-xl">
          upvote the ones you want us to check next. click any project to try it yourself.
        </p>

        {/* Action bar */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link
            href="/submit"
            className="rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-background transition-colors hover:bg-accent-hover"
          >
            submit yours →
          </Link>
          <div className="flex items-center gap-4 text-xs text-muted">
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
        <div className="mt-4 flex items-center gap-4 text-xs font-mono">
          <span>
            <span className="font-bold text-foreground">{projects.length}</span>
            <span className="text-muted ml-1">submitted</span>
          </span>
          <span className="text-border">·</span>
          <span>
            <span className="font-bold text-accent">{queue.length}</span>
            <span className="text-muted ml-1">in queue</span>
          </span>
          <span className="text-border">·</span>
          <span>
            <span className="font-bold text-green">{projects.length - queue.length - 1}</span>
            <span className="text-muted ml-1">reviewed</span>
          </span>
        </div>
      </div>

      <QueueList projects={sorted} />
    </div>
  );
}
