"use client";

import { Project } from "@/lib/types";
import { useVotes } from "@/lib/use-votes";

export function QueueList({ projects }: { projects: Project[] }) {
  const initialVotes: Record<string, number> = {};
  projects.forEach((p) => { initialVotes[p.id] = p.upvotes; });

  const { votes, voted, handleVote } = useVotes(initialVotes);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {projects.map((project, i) => {
        const rank = i + 1;
        const hasVoted = voted.has(project.id);
        const count = votes[project.id] || 0;

        return (
          <div
            key={project.id}
            className="group flex items-center gap-3 rounded-sm border border-border bg-surface px-3 py-2.5 transition-all hover:border-border-strong hover:shadow-sm"
          >
            {/* Rank */}
            <span className="font-mono text-[12px] text-muted w-5 text-right shrink-0">
              {rank}
            </span>

            {/* Upvote */}
            <button
              onClick={() => handleVote(project.id)}
              className={`flex flex-col items-center gap-0 shrink-0 rounded-sm px-1.5 py-0.5 transition-all active:scale-90 ${
                hasVoted
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:bg-accent/5 hover:text-accent"
              }`}
            >
              <span className={`text-[11px] transition-transform ${hasVoted ? "scale-125" : ""}`}>▲</span>
              <span className="font-mono text-[12px] font-medium">{count}</span>
            </button>

            {/* Logo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.logo_url}
              alt={project.name}
              width={24}
              height={24}
              className="h-6 w-6 rounded object-contain shrink-0"
            />

            {/* Info */}
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
                className="font-mono text-[12px] text-muted hover:text-accent transition-colors truncate block"
              >
                @{project.x_handle}
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
