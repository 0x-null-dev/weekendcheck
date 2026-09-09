import { EntryTrack, ReviewKind } from "@/lib/demo-data";

export function KindBadge({ kind }: { kind: ReviewKind }) {
  return <span className={`kind ${kind}`}>{kind === "deep" ? "Deep review" : "Quick take"}</span>;
}

export function TrackBadge({ track, reviewed }: { track: EntryTrack; reviewed?: ReviewKind }) {
  const labels = {
    inbox: "In consideration",
    shortlisted: "Shortlist",
    quick: reviewed === "quick" ? "Quick take · published" : "Quick take · planned",
    deep: reviewed === "deep" ? "Deep review · published" : "Deep review · planned",
    passed: "Not this week",
  };
  return <span className={`track ${track} ${reviewed ? "published" : ""}`}>{labels[track]}</span>;
}
