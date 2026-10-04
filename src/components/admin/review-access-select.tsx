"use client";
import { isSelected, reviewAccessNames, type Entry } from "@/lib/editorial";
import { useAdmin } from "./admin-context";

export function ReviewAccessSelect({ entry, weekId, projectName }: { entry: Entry; weekId: string; projectName: string }) {
  const { run, busy } = useAdmin();
  if (!isSelected(entry.track)) return null;
  return <select aria-label={`Access for ${projectName}`} value={entry.access || ""} disabled={busy} onChange={e => void run({ action: "saveReviewAccess", weekId, projectId: entry.projectId, access: e.target.value || null }, "Access saved.")}>
    <option value="">Choose access…</option>
    {Object.entries(reviewAccessNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
  </select>;
}
