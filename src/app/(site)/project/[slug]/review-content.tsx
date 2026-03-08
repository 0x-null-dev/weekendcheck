"use client";

import { useState, useRef, useEffect } from "react";
import type { Review } from "@/lib/types";

function parseReviewSections(text: string) {
  const sections: { heading: string; body: string }[] = [];
  const lines = text.split("\n");
  let current: { heading: string; body: string } | null = null;

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (current) sections.push(current);
      current = { heading: line.replace("## ", ""), body: "" };
    } else if (current) {
      current.body += (current.body ? "\n" : "") + line;
    }
  }
  if (current) sections.push(current);
  return sections;
}

export function ReviewContent({
  reviews,
  projectName,
  projectSlug,
  projectXHandle,
  projectUrl,
}: {
  reviews: Review[];
  projectName: string;
  projectSlug: string;
  projectXHandle: string;
  projectUrl: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const review = reviews[selectedIndex];
  const sections = parseReviewSections(review.text);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="relative inline-block" ref={dropdownRef}>
            <button
              onClick={() => reviews.length > 1 && setDropdownOpen(!dropdownOpen)}
              className={`flex items-center gap-2 text-lg font-bold text-foreground ${
                reviews.length > 1 ? "cursor-pointer hover:text-accent transition-colors" : ""
              }`}
            >
              review #{String(review.review_number).padStart(3, "0")}
              {reviews.length > 1 && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              )}
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-56 rounded-lg border border-border bg-background shadow-lg z-10">
                {reviews.map((r, i) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedIndex(i);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 flex items-center justify-between transition-colors first:rounded-t-lg last:rounded-b-lg ${
                      i === selectedIndex
                        ? "bg-accent/10 text-accent"
                        : "hover:bg-surface text-foreground"
                    }`}
                  >
                    <span className="text-sm font-medium">
                      review #{String(r.review_number).padStart(3, "0")}
                    </span>
                    <span className="text-[11px] font-mono text-muted">
                      {new Date(r.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="text-xs font-mono text-muted mt-0.5">
            by{" "}
            <a
              href="https://x.com/0x_null_dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              @0x_null_dev
            </a>
            {"  "}
            {new Date(review.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <a
          href={`https://x.com/intent/tweet?text=${encodeURIComponent(
            `just read the review of ${projectName} by @0x_null_dev on weekendcheck`
          )}&url=${encodeURIComponent(`https://weekendcheck.com/project/${projectSlug}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground hover:border-foreground/30"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          share review
        </a>
      </div>

      {/* Video walkthrough */}
      {review.loom_url && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="3" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" className="text-muted" />
              <path d="M11 6.5 L15 4.5 V11.5 L11 9.5 Z" fill="currentColor" className="text-muted" />
            </svg>
            <span className="text-xs font-mono text-muted uppercase tracking-wider">
              video walkthrough
            </span>
          </div>
          <div className="relative w-full rounded-lg overflow-hidden border border-border bg-foreground/5" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src={review.loom_url}
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        </div>
      )}

      {/* Review sections */}
      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.heading}>
            <h3 className="text-base font-bold text-foreground mb-3">
              {section.heading}
            </h3>
            <div className="text-sm text-foreground/70 leading-relaxed">
              {section.body
                .trim()
                .split("\n")
                .map((line, i) => {
                  if (line.startsWith("- ")) {
                    return (
                      <div key={i} className="flex gap-2 mt-1.5">
                        <span className="text-accent shrink-0">-</span>
                        <span>{line.slice(2)}</span>
                      </div>
                    );
                  }
                  return line ? <p key={i}>{line}</p> : null;
                })}
            </div>
          </div>
        ))}
      </div>

      {/* ===== BIG SHARE CTA ===== */}
      <div className="mt-14 rounded-2xl bg-foreground p-8 sm:p-10 text-center">
        <p className="text-xs font-mono text-background/50 uppercase tracking-widest mb-3">
          tried {projectName}?
        </p>
        <h3 className="text-xl sm:text-2xl font-bold text-background">
          leave your review on X
        </h3>
        <p className="mt-2 text-sm text-background/60 max-w-md mx-auto">
          share your honest take on {projectName}. tag @{projectXHandle} and help the community discover great products.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={`https://x.com/intent/tweet?text=${encodeURIComponent(
              `my thoughts on ${projectName} by @${projectXHandle}:\n\n`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-background transition-colors hover:bg-accent/80"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            write your review
          </a>
          <a
            href={`https://x.com/intent/tweet?text=${encodeURIComponent(
              `just reviewed ${projectName} by @${projectXHandle}\n\nfull review on weekendcheck`
            )}&url=${encodeURIComponent(`https://weekendcheck.com/project/${projectSlug}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full border border-background/20 px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-background/10"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            share this review
          </a>
        </div>
      </div>
    </div>
  );
}
