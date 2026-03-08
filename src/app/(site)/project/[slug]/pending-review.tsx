"use client";

import Link from "next/link";

export function PendingReview({
  isReviewing,
  queuePosition,
}: {
  isReviewing: boolean;
  queuePosition: number | null;
}) {
  return (
    <div className="flex flex-col items-center py-16">
      {isReviewing ? (
        <div className="text-center max-w-md">
          {/* Mini browser with animated cursor */}
          <div className="mx-auto w-72 mb-8">
            <div className="rounded-t-lg border border-border border-b-0 bg-surface px-3 py-2 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-400/60" />
              <span className="h-2 w-2 rounded-full bg-yellow-400/60" />
              <span className="h-2 w-2 rounded-full bg-green-400/60" />
              <div className="ml-2 flex-1 h-4 rounded-full bg-border/40 flex items-center px-2">
                <span className="text-[8px] font-mono text-muted/60 truncate">reviewing...</span>
              </div>
            </div>
            <div className="relative rounded-b-lg border border-border bg-background p-4 h-40 overflow-hidden">
              {/* Fake page content lines */}
              <div className="space-y-2.5">
                <div className="h-3 w-3/4 rounded-sm bg-foreground/8" />
                <div className="h-2 w-full rounded-sm bg-foreground/5" />
                <div className="h-2 w-5/6 rounded-sm bg-foreground/5" />
                <div className="h-8 w-1/2 rounded-sm bg-accent/10 mt-3" />
                <div className="h-2 w-2/3 rounded-sm bg-foreground/5" />
                <div className="h-2 w-3/4 rounded-sm bg-foreground/5" />
                <div className="flex gap-2 mt-2">
                  <div className="h-6 w-16 rounded-sm bg-foreground/8" />
                  <div className="h-6 w-16 rounded-sm bg-accent/15" />
                </div>
              </div>

              {/* Animated cursor */}
              <svg
                className="absolute animate-[wander_8s_ease-in-out_infinite]"
                width="16"
                height="20"
                viewBox="0 0 16 20"
                fill="none"
                style={{ top: "30%", left: "40%" }}
              >
                <path
                  d="M1 1 L1 14 L4.5 10.5 L8 17 L10 16 L6.5 9.5 L11 9 Z"
                  fill="#1a1a1a"
                  stroke="white"
                  strokeWidth="1"
                />
              </svg>

              {/* Click ripple */}
              <div
                className="absolute h-4 w-4 rounded-full border border-accent animate-[clickRipple_8s_ease-in-out_infinite]"
                style={{ top: "30%", left: "40%" }}
              />
            </div>
          </div>

          <h2 className="text-xl font-bold text-foreground">
            review in progress
          </h2>
          <p className="mt-3 text-[15px] text-muted leading-relaxed">
            0xNull is currently poking around this product. signing up, clicking buttons, breaking things. the full review will drop here once it&apos;s done.
          </p>

          <style jsx>{`
            @keyframes wander {
              0% { transform: translate(0, 0); }
              15% { transform: translate(30px, 20px); }
              25% { transform: translate(30px, 20px) scale(0.9); }
              28% { transform: translate(30px, 20px) scale(1); }
              40% { transform: translate(-20px, 40px); }
              55% { transform: translate(50px, -10px); }
              65% { transform: translate(50px, -10px) scale(0.9); }
              68% { transform: translate(50px, -10px) scale(1); }
              80% { transform: translate(-10px, 15px); }
              100% { transform: translate(0, 0); }
            }
            @keyframes clickRipple {
              0%, 14%, 27%, 54%, 67%, 100% { opacity: 0; transform: translate(0, 0) scale(0); }
              25% { opacity: 0.6; transform: translate(30px, 20px) scale(1); }
              26% { opacity: 0; transform: translate(30px, 20px) scale(2); }
              65% { opacity: 0.6; transform: translate(50px, -10px) scale(1); }
              66% { opacity: 0; transform: translate(50px, -10px) scale(2); }
            }
          `}</style>
        </div>
      ) : (
        /* Waiting in queue state */
        <div className="text-center max-w-md">
          <div className="mb-6 flex items-center justify-center gap-1">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`rounded-sm border transition-all ${
                  i === 0
                    ? "h-8 w-8 border-accent bg-accent/10"
                    : "h-6 w-6 border-border bg-surface"
                }`}
                style={{
                  transform: `rotate(${(i - 3) * 2}deg)`,
                  opacity: 1 - i * 0.1,
                }}
              />
            ))}
          </div>

          <h2 className="text-xl font-bold text-foreground">
            #{queuePosition} in the pile
          </h2>
          <p className="mt-3 text-[15px] text-muted leading-relaxed">
            this project is waiting to be reviewed. the community upvotes help us decide what to check next.
          </p>
          <Link
            href="/queue"
            className="mt-5 inline-block rounded-full bg-foreground px-5 py-2 text-[15px] font-medium text-background transition-colors hover:bg-foreground/80"
          >
            view the pile →
          </Link>
        </div>
      )}
    </div>
  );
}
