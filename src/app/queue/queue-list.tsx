"use client";

import { Project } from "@/lib/types";
import { useState } from "react";

export function QueueList({ projects }: { projects: Project[] }) {
  const [votes, setVotes] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    projects.forEach((p) => { init[p.id] = p.upvotes; });
    return init;
  });
  const [voted, setVoted] = useState<Set<string>>(new Set());

  function handleVote(projectId: string) {
    if (voted.has(projectId)) return;
    setVotes((prev) => ({ ...prev, [projectId]: (prev[projectId] || 0) + 1 }));
    setVoted((prev) => new Set(prev).add(projectId));
  }

  const sorted = [...projects].sort((a, b) => (votes[b.id] || 0) - (votes[a.id] || 0));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {sorted.map((project, i) => {
        const rank = i + 1;
        const hasVoted = voted.has(project.id);
        const count = votes[project.id] || 0;

        return (
          <div
            key={project.id}
            className="group flex items-center gap-3 rounded-sm border border-border bg-surface px-3 py-2.5 transition-all hover:border-border-strong hover:shadow-sm"
          >
            {/* Rank */}
            <span className="font-mono text-[10px] text-muted w-5 text-right shrink-0">
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
              <span className={`text-[9px] transition-transform ${hasVoted ? "scale-125" : ""}`}>▲</span>
              <span className="font-mono text-[10px] font-medium">{count}</span>
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
                className="text-xs font-bold text-foreground hover:text-accent transition-colors truncate block"
              >
                {project.name}
              </a>
              <a
                href={`https://x.com/${project.x_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] text-muted hover:text-accent transition-colors truncate block"
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
