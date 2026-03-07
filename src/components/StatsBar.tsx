interface StatsBarProps {
  submitted: number;
  reviewed: number;
  inReview: number;
  inQueue: number;
}

export function StatsBar({ submitted, reviewed, inReview, inQueue }: StatsBarProps) {
  return (
    <div className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-center gap-6 px-6 py-2.5">
        <Stat value={submitted} label="submitted" />
        <span className="text-border">·</span>
        <Stat value={reviewed} label="reviewed" highlight />
        <span className="text-border">·</span>
        <Stat value={inReview} label="in review" pulse />
        <span className="text-border">·</span>
        <Stat value={inQueue} label="in queue" />
      </div>
    </div>
  );
}

function Stat({ value, label, highlight, pulse }: { value: number; label: string; highlight?: boolean; pulse?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
        </span>
      )}
      <span className={`font-mono text-sm font-bold ${highlight ? "text-green" : "text-foreground"}`}>
        {value}
      </span>
      <span className="text-xs text-muted">{label}</span>
    </div>
  );
}
