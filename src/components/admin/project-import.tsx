"use client";
import { useEffect, useRef, useState } from "react";
import { parseCandidates, projectKey, type Candidate, type Week } from "@/lib/editorial";
import { useAdmin, useUnsaved } from "./admin-context";

export function ProjectImport({ week }: { week: Week }) {
  const { data, run, busy, notify, xConnected } = useAdmin();
  const [source, setSource] = useState(week.callUrl);
  const [text, setText] = useState("");
  const [rows, setRows] = useState<(Candidate & { checked: boolean })[]>([]);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [fetchedSource, setFetchedSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [replyCount, setReplyCount] = useState(0);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  useUnsaved(rows.length > 0);
  function preview(candidates: Candidate[], append = false) {
    const items = append ? [...rows] : [];
    const seen = new Set(items.map(item => projectKey(item.url)));
    for (const candidate of candidates) {
      if (seen.has(projectKey(candidate.url))) continue;
      seen.add(projectKey(candidate.url));
      const existing = data.projects.find(p => projectKey(p.url) === projectKey(candidate.url));
      const duplicate = existing && (existing.archived || week.entries.some(e => e.projectId === existing.id));
      items.push({ ...candidate, checked: !duplicate });
    }
    setRows(items);
  }
  async function fetchReplies(more = false) {
    setLoading(true); setError("");
    controller.current = new AbortController();
    let token = more ? nextToken : null;
    let count = more ? replyCount : 0;
    const candidates: Candidate[] = [];
    if (!more) { setRows([]); setNextToken(null); setReplyCount(0); }
    setFetchedSource(source);
    try {
      // Follow pagination automatically, with a bounded API-cost budget per click.
      for (let page = 0; page < 10; page++) {
        const response = await fetch("/api/admin/x-import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: source, nextToken: token || undefined }), signal: controller.current.signal });
        const result = await response.json(); if (!response.ok) throw new Error(result.error);
        candidates.push(...result.candidates); count += result.replyCount || 0;
        token = result.nextToken; setNextToken(token); setReplyCount(count);
        preview(candidates, more);
        if (!token) break;
      }
      if (!candidates.length) setError("No project website links found in these replies. You can paste links below.");
    } catch (error) { setError(error instanceof Error && error.name === "AbortError" ? "Fetching stopped. Results fetched so far are kept below." : error instanceof Error ? error.message : "Import failed."); }
    finally { setLoading(false); }
  }
  const selected = rows.filter(row => row.checked);
  return <>
    <section className="desk-panel"><h2>Import projects</h2><p>Fetch replies, extract project links, then check the details before importing.</p><label>X call post URL (optional for paste import)<input disabled={loading} placeholder="https://x.com/.../status/..." value={source} onChange={e => setSource(e.target.value)} /></label><div className="desk-form-actions"><button className="desk-button" disabled={!xConnected || loading || !source} onClick={() => void fetchReplies()}>{loading ? `Fetching… ${replyCount} replies read` : "Fetch replies from X"}</button>{loading && <button className="desk-button" onClick={() => controller.current?.abort()}>Stop fetching</button>}<small>{xConnected ? "Reads available replies from the last 7 days, up to 1,000 per batch. Uses your paid X API allowance." : "X API not connected. Paste copied project links below."}</small></div>
      <label>Paste projects<textarea aria-label="Paste projects" rows={7} value={text} onChange={e => setText(e.target.value)} placeholder={"https://yourapp.com | App name | @builder | What the app does\n\nOr paste copied replies containing website links."} /></label>
      <button className="desk-button primary" disabled={!text.trim() || loading} onClick={() => {
        const candidates = parseCandidates(text).map(candidate => ({ ...candidate, source }));
        preview(candidates); setNextToken(null);
        setError(candidates.length ? "" : "No website URLs found. Include a full URL starting with https://.");
      }}>Preview pasted projects</button>
      {error && <p className="desk-error" role="alert">{error}</p>}
      {replyCount > 0 && !loading && <p className="desk-hint">{replyCount} replies read{!nextToken ? " · All available pages fetched" : " · More replies available"}</p>}
      {nextToken && fetchedSource === source && <button className="desk-button" disabled={loading} onClick={() => void fetchReplies(true)}>Fetch remaining replies</button>}
    </section>
    {rows.length > 0 && <section className="desk-panel"><div className="desk-section-heading"><h2>{rows.length} project candidates</h2><span>{selected.length} selected</span></div><p className="desk-hint">Existing websites reuse your project record. Projects already in this week and archived projects are skipped.</p>
      {rows.map((row, index) => <div className="desk-import-row" key={index}>
        <input type="checkbox" aria-label={`Import ${row.name}`} checked={row.checked} onChange={e => setRows(rows.map((item, i) => i === index ? { ...item, checked: e.target.checked } : item))} />
        <div className="desk-form-grid">{([["name", "Name"], ["url", "Website"], ["handle", "X handle"], ["description", "Description"]] as const).map(([key, label]) => <label key={key}>{label}<input value={row[key]} onChange={e => setRows(rows.map((item, i) => i === index ? { ...item, [key]: e.target.value } : item))} /></label>)}</div>
      </div>)}
      <button className="desk-button primary" disabled={busy || !selected.length || loading} onClick={async () => {
        const batch = selected.slice(0, 200);
        const saved = await run({ action: "importProjects", weekId: week.id, candidates: batch }, "Import finished.");
        if (saved) { setRows(rows.filter(row => row.checked && !batch.includes(row))); notify(`Added ${saved.result.added} projects; skipped ${saved.result.skipped} duplicates or archived projects.`); }
      }}>Import {Math.min(selected.length, 200)} projects</button>
    </section>}
  </>;
}
