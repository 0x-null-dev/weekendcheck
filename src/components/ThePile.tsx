"use client";

import { Project } from "@/lib/types";
import Link from "next/link";
import { useState } from "react";
import { useVotes } from "@/lib/use-votes";

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function getCardStyle(index: number) {
  const seed = index * 17 + 7;
  const rotation = (seededRandom(seed) - 0.5) * 8;
  const nudgeY = (seededRandom(seed + 1) - 0.5) * 8;
  const nudgeX = (seededRandom(seed + 2) - 0.5) * 5;
  return { rotation, nudgeY, nudgeX };
}

export function ThePile({ projects }: { projects: Project[] }) {
  const sorted = [...projects].sort((a, b) => b.upvotes - a.upvotes);
  const pile = sorted.slice(0, 24);
  const [hovered, setHovered] = useState<string | null>(null);

  const initialVotes: Record<string, number> = {};
  pile.forEach((p) => { initialVotes[p.id] = p.upvotes; });

  const { votes, voted, handleVote } = useVotes(initialVotes);

  return (
    <section className="py-10 relative z-0">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">the pile</h2>
            <p className="text-sm text-muted">
              {projects.length} projects submitted : upvote to help us pick what to review next
            </p>
          </div>
          <Link
            href="/queue"
            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 font-mono text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
          >
            view all {projects.length} →
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
          {pile.map((project, i) => {
            const { rotation, nudgeY, nudgeX } = getCardStyle(i);
            const isHovered = hovered === project.id;
            const rank = i + 1;
            const hasVoted = voted.has(project.id);
            const count = votes[project.id] || 0;

            return (
              <div
                key={project.id}
                className="sketch-border-light bg-surface p-2 transition-all duration-200 relative group"
                style={{
                  transform: isHovered
                    ? `rotate(0deg) scale(1.08) translate(0, -4px)`
                    : `rotate(${rotation}deg) translate(${nudgeX}px, ${nudgeY}px)`,
                  zIndex: isHovered ? 50 : "auto",
                }}
                onMouseEnter={() => setHovered(project.id)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Rank number */}
                <span className="absolute -top-1 -left-1 font-mono text-[11px] text-muted bg-background px-1 rounded-sm border border-border">
                  {rank}
                </span>

                {/* Clickable card area — opens project */}
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center text-center gap-1"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={project.logo_url}
                    alt={project.name}
                    width={24}
                    height={24}
                    className="h-6 w-6 rounded object-contain"
                  />
                  <h3 className="text-[13px] font-medium text-foreground truncate w-full hover:text-accent transition-colors">
                    {project.name}
                  </h3>
                </a>

                {/* X handle — opens X profile */}
                <a
                  href={`https://x.com/${project.x_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="block text-center text-[11px] text-muted truncate hover:text-accent transition-colors"
                >
                  @{project.x_handle}
                </a>

                {/* Clickable upvote */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleVote(project.id);
                  }}
                  className={`mt-1.5 flex w-full items-center justify-center gap-0.5 rounded-sm py-0.5 transition-all active:scale-90 ${
                    hasVoted
                      ? "bg-accent/10 text-accent border border-accent/20"
                      : "text-muted border border-transparent group-hover:bg-accent/5 group-hover:text-accent group-hover:border-accent/15 active:bg-accent/15 active:text-accent"
                  }`}
                >
                  <span className={`text-[11px] transition-transform duration-200 ${hasVoted ? "scale-150 -translate-y-0.5" : ""}`}>▲</span>
                  <span className="font-mono text-[12px] font-medium">{count}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
