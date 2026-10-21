"use client";
import { useState } from "react";
import { isSelected, reviewAccessNames, type Entry } from "@/lib/editorial";
import { useAdmin } from "./admin-context";

const euros = (cents?: number) => cents ? (cents / 100).toFixed(2) : "";

export function ReviewAccessSelect({ entry, weekId, projectName }: { entry: Entry; weekId: string; projectName: string }) {
  const { run, busy } = useAdmin();
  const [cost, setCost] = useState(euros(entry.costCents));
  if (!isSelected(entry.track)) return null;
  const command = { action: "saveReviewAccess", weekId, projectId: entry.projectId };
  function saveCost() {
    if (cost.trim() === euros(entry.costCents)) return;
    void run({ ...command, access: "paid", cost: cost.trim() || null }, cost.trim() ? "Amount saved." : "Amount removed.");
  }
  return <>
    <select aria-label={`Access for ${projectName}`} value={entry.access || ""} disabled={busy} onChange={e => void run({ ...command, access: e.target.value || null, cost: e.target.value === "paid" ? entry.costCents && euros(entry.costCents) : null }, "Access saved.")}>
      <option value="">Choose access…</option>
      {Object.entries(reviewAccessNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
    </select>
    {entry.access === "paid" && <label className="desk-cost">Paid (€)<input inputMode="decimal" placeholder="4.64" value={cost} disabled={busy} aria-label={`Amount paid for ${projectName} in euros`} onChange={e => setCost(e.target.value)} onBlur={saveCost} onKeyDown={e => { if (e.key === "Enter") saveCost(); }} /></label>}
  </>;
}
