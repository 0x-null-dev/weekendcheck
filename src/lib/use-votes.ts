"use client";

import { useState, useEffect, useCallback } from "react";

// Simple browser fingerprint — not perfect but adds friction
function generateFingerprint(): string {
  const components = [
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.language,
    navigator.platform,
    navigator.hardwareConcurrency || 0,
  ];
  const raw = components.join("|");
  // Simple hash
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash).toString(36);
}

export function useVotes(initialVotes: Record<string, number>) {
  const [votes, setVotes] = useState<Record<string, number>>(initialVotes);
  const [voted, setVoted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<Set<string>>(new Set());

  // Load previously voted projects from server
  useEffect(() => {
    fetch("/api/vote")
      .then((res) => res.json())
      .then((data) => {
        if (data.votedIds?.length) {
          setVoted(new Set(data.votedIds));
        }
      })
      .catch(() => {});
  }, []);

  const handleVote = useCallback(
    async (projectId: string) => {
      if (voted.has(projectId)) return;
      if (loading.has(projectId)) return;

      // Optimistic update
      setVotes((prev) => ({ ...prev, [projectId]: (prev[projectId] || 0) + 1 }));
      setVoted((prev) => new Set(prev).add(projectId));
      setLoading((prev) => new Set(prev).add(projectId));

      try {
        const res = await fetch("/api/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            fingerprint: generateFingerprint(),
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setVotes((prev) => ({ ...prev, [projectId]: data.upvotes }));
        } else {
          // Revert optimistic update
          setVotes((prev) => ({ ...prev, [projectId]: (prev[projectId] || 1) - 1 }));
          setVoted((prev) => {
            const next = new Set(prev);
            next.delete(projectId);
            return next;
          });
        }
      } catch {
        // Revert on network error
        setVotes((prev) => ({ ...prev, [projectId]: (prev[projectId] || 1) - 1 }));
        setVoted((prev) => {
          const next = new Set(prev);
          next.delete(projectId);
          return next;
        });
      } finally {
        setLoading((prev) => {
          const next = new Set(prev);
          next.delete(projectId);
          return next;
        });
      }
    },
    [voted, loading]
  );

  return { votes, voted, handleVote };
}
