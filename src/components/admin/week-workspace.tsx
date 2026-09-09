"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatWeekRange } from "@/lib/demo-data";
import { isSelected, liveVersion, reviewStatus, trackNames, type Entry, type Week, type Track } from "@/lib/editorial";
import { selectionBlock } from "@/lib/editorial-selection";
import { useAdmin, useUnsaved, copyText } from "./admin-context";
import { Empty } from "./admin-lists";
import { ProjectForm } from "./project-form";
import { ProjectImport } from "./project-import";
import { ProjectLogo } from "../project-logo";

export function WeekWorkspace({ id }: { id: string }) {
  const { data, run, busy } = useAdmin();
  const router = useRouter();
  const [tab, setTab] = useState("projects");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const week = data.weeks.find(w => w.id === id);
  if (!week) return <Empty text="Week not found." />;
  const locked = week.state === "complete";
  const picked = week.entries.filter(e => isSelected(e.track));
  const finished = data.reviews.filter(r => r.weekId === id && liveVersion(r)).length;
  const entries = week.entries.filter(e => {
    const product = data.projects.find(p => p.id === e.projectId)!;
    return (filter === "all" || e.track === filter) && `${product.name} ${product.handle} ${product.url}`.toLowerCase().includes(query.toLowerCase());
  }).sort((a, b) => {
    const order: Record<Track, number> = { deep: 0, quick: 1, shortlisted: 2, inbox: 3, passed: 4 };
    return order[a.track] - order[b.track];
  });
  const selectedEntry = week.entries.find(e => e.projectId === editing);
  const changed = JSON.stringify(week.selection) !== JSON.stringify(week.entries.map(e => ({ projectId: e.projectId, track: e.track })));
  return <>
    <Link className="desk-back" href="/admin/weeks">← All weeks</Link>
    <div className="desk-heading"><div><p className="eyebrow">{week.state.toUpperCase()} · {week.selection ? "PUBLIC" : "PRIVATE DRAFT"}</p><h1>{formatWeekRange(week.startsOn)}</h1><p>{week.selection && changed ? "Unpublished selection changes. Publish again to update the public week." : "Your weekly collection, selection, and review progress."}</p></div><button className="desk-button primary" disabled={busy || locked || !changed} onClick={() => { if (window.confirm("Publish this week's project list and selection on your website?")) void run({ action: "publishSelection", weekId: id }, "Weekly selection published."); }}>{week.selection ? "Publish changes" : "Publish selection"}</button></div>
    <div className="desk-stats"><div><strong>{week.entries.length}</strong><span>Projects collected</span></div><div><strong>{picked.filter(e => e.track === "quick").length}</strong><span>Quick takes</span></div><div><strong>{picked.filter(e => e.track === "deep").length}</strong><span>Deep reviews</span></div><div><strong>{finished} / {picked.length}</strong><span>Reviews published</span></div></div>
    <div className="desk-tabs" aria-label="Week sections">{[["projects", "Projects"], ["add", "Add / import"], ["share", "Share on X"], ["settings", "Week settings"]].map(([value, label]) => <button data-leave-form key={value} aria-pressed={tab === value} className={tab === value ? "active" : ""} onClick={() => setTab(value)}>{label}</button>)}</div>
    {tab === "projects" && <>
      <div className="desk-toolbar"><input placeholder="Search this week…" aria-label="Search weekly projects" value={query} onChange={e => setQuery(e.target.value)} /><select aria-label="Selection filter" value={filter} onChange={e => setFilter(e.target.value)}><option value="all">All projects</option>{Object.entries(trackNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button className="desk-button" disabled={locked} onClick={() => setTab("add")}>Add / import projects</button></div>
      <section className="desk-panel">{entries.map(entry => {
        const project = data.projects.find(p => p.id === entry.projectId)!;
        const review = data.reviews.find(r => r.weekId === id && r.projectId === project.id);
        const block = selectionBlock(data, week, entry);
        return <div className="desk-project-row" key={entry.projectId}>
          <ProjectLogo project={project} /><div className="desk-grow"><Link className="desk-project-name" href={`/admin/projects/${project.id}`}>{project.name}</Link><p>{project.description || "No description yet"}</p><small>{project.handle ? `@${project.handle} · ` : ""}<a href={project.url} target="_blank" rel="noreferrer">{new URL(project.url).hostname} ↗</a></small>{block && <small className="desk-warning">{block}</small>}</div>
          <div className="desk-row-actions"><select aria-label={`Review choice for ${project.name}`} value={entry.track} disabled={locked || busy} onChange={e => void run({ action: "saveEntry", weekId: id, ...entry, track: e.target.value }, "Review choice saved.")}>{Object.entries(trackNames).map(([value, label]) => <option value={value} key={value} disabled={Boolean(block) && isSelected(value as Track)}>{label}</option>)}</select>
          <button className="desk-link-button" onClick={() => setEditing(entry.projectId)}>{locked ? "View selection" : "Edit selection"}</button>
          {isSelected(entry.track) && <button className="desk-link-button" disabled={busy} onClick={async () => { const saved = await run({ action: "prepareReview", weekId: id, projectId: entry.projectId }, "Review opened."); if (saved) router.push(`/admin/reviews/${saved.result.id}`); }}>{review ? `${reviewStatus(review)} · Edit review →` : "Write review →"}</button>}</div>
        </div>;
      })}{!entries.length && <Empty text={week.entries.length ? "No projects match this filter." : "Your week is empty. Add a project or import replies to get started."} />}</section>
    </>}
    {tab === "add" && (locked ? <Empty text="Reopen this week in Week settings before adding projects." /> : <AddProjects week={week} />)}
    {tab === "share" && <WeekShare week={week} />}
    {tab === "settings" && <WeekSettings week={week} />}
    {selectedEntry && <SelectionDialog key={selectedEntry.projectId} entry={selectedEntry} week={week} close={() => setEditing(null)} />}
  </>;
}
function AddProjects({ week }: { week: Week }) {
  const { data, run, busy } = useAdmin();
  const [mode, setMode] = useState("manual");
  const [existing, setExisting] = useState("");
  return <>
    <div className="desk-tabs">{[["manual", "New project"], ["existing", "Existing project"], ["import", "Import from X / paste"]].map(([value, label]) => <button data-leave-form key={value} aria-pressed={mode === value} className={mode === value ? "active" : ""} onClick={() => setMode(value)}>{label}</button>)}</div>
    {mode === "manual" && <ProjectForm weekId={week.id} />}
    {mode === "existing" && <form className="desk-panel" onSubmit={async e => { e.preventDefault(); if (await run({ action: "addExisting", weekId: week.id, projectId: existing }, "Project added to week.")) setExisting(""); }}><h2>Add from your project library</h2><label>Project<select required value={existing} onChange={e => setExisting(e.target.value)}><option value="">Choose a project</option>{data.projects.filter(p => !p.archived && !week.entries.some(e => e.projectId === p.id)).map(p => <option key={p.id} value={p.id}>{p.name}{(p.reviewedInWeek || data.reviews.some(r => r.projectId === p.id && reviewStatus(r) !== "Draft")) ? " · already reviewed / scheduled" : ""}</option>)}</select></label><p className="desk-hint">Previously reviewed projects can appear in the collection but cannot be picked again.</p><button className="desk-button primary" disabled={busy || !existing}>Add to week</button></form>}
    {mode === "import" && <ProjectImport week={week} />}
  </>;
}
function SelectionDialog({ week, entry, close }: { week: Week; entry: Entry; close: () => void }) {
  const { data, busy, run } = useAdmin();
  const [form, setForm] = useState(entry);
  const project = data.projects.find(p => p.id === entry.projectId)!;
  const locked = week.state === "complete";
  const dirty = JSON.stringify(form) !== JSON.stringify(entry);
  useUnsaved(dirty);
  return <div className="desk-modal-backdrop"><dialog open className="desk-dialog" aria-labelledby="selection-heading" onCancel={event => { event.preventDefault(); if (!dirty || window.confirm("Discard selection edits?")) close(); }}>
    <div className="desk-section-heading"><h2 id="selection-heading">{project.name}</h2><button aria-label="Close selection" onClick={() => { if (!dirty || window.confirm("Discard selection edits?")) close(); }}>×</button></div>
    <form onSubmit={async e => { e.preventDefault(); if (await run({ action: "saveEntry", weekId: week.id, ...form }, "Selection saved.")) close(); }}>
      <fieldset disabled={locked || busy}>
      <div className="desk-form-grid"><label>Review track<select value={form.track} onChange={e => setForm({ ...form, track: e.target.value as Track })}>{Object.entries(trackNames).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
      <label className="wide">Source reply URL<input value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} /></label><label className="wide">Private notes<textarea aria-label="Private notes" rows={3} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} /></label></div>
      <div className="desk-form-actions"><button className="desk-button primary">Save selection</button><button type="button" className="desk-button danger" onClick={async () => { if (window.confirm("Remove this project and its review draft from this week? The project record stays in your library.") && await run({ action: "removeEntry", weekId: week.id, projectId: entry.projectId })) close(); }}>Remove from week</button></div></fieldset>
    </form>
  </dialog></div>;
}
function WeekSettings({ week }: { week: Week }) {
  const { run, busy } = useAdmin();
  const router = useRouter();
  const [form, setForm] = useState({ state: week.state, callUrl: week.callUrl });
  const dirty = form.state !== week.state || form.callUrl !== week.callUrl;
  useUnsaved(dirty);
  return <><form className="desk-panel" onSubmit={async e => { e.preventDefault(); await run({ action: "saveWeek", ...week, ...form, weekId: week.id }); }}><h2>Week settings</h2><div className="desk-form-grid"><label>Stage<select value={form.state} onChange={e => setForm({ ...form, state: e.target.value as Week["state"] })}><option value="collecting">Collecting projects</option><option value="curating">Curating / reviewing</option><option value="complete">Complete</option></select></label><label>Weekly X call URL<input value={form.callUrl} onChange={e => setForm({ ...form, callUrl: e.target.value })} placeholder="https://x.com/.../status/..." /></label></div><button disabled={busy || !dirty} className="desk-button primary">Save week settings</button></form>
    <section className="desk-panel"><h2>Visibility</h2><p>{week.selection ? "This week is visible on the public site." : "This week is a private draft."}</p>{week.selection && <button className="desk-button" disabled={busy} onClick={() => { if (window.confirm("Hide this week and its reviews from the public site?")) void run({ action: "hideWeek", weekId: week.id }, "Week hidden."); }}>Hide from site</button>}</section>
    {!week.selection && <section className="desk-panel"><h2>Delete draft week</h2><p>Removes this week&apos;s entries and unpublished review drafts. The project library is preserved.</p><button disabled={busy} className="desk-button danger" onClick={async () => { if (window.confirm("Permanently delete this draft week and its drafts?") && await run({ action: "deleteWeek", weekId: week.id }, "Draft week deleted.")) router.push("/admin/weeks"); }}>Delete week</button></section>}</>;
}
function WeekShare({ week }: { week: Week }) {
  const { data, busy, run, notify } = useAdmin();
  const selected = week.entries.filter(e => isSelected(e.track));
  const generated = `This week I'm reviewing:\n\n${selected.map(e => `${data.projects.find(p => p.id === e.projectId)?.name} — ${trackNames[e.track]}`).join("\n")}\n\nAll projects and reviews: ${data.settings.siteUrl.replace(/\/$/, "")}/?week=${week.id}#weeks`;
  const [text, setText] = useState(week.announcement || generated);
  const [url, setUrl] = useState(week.announcementUrl);
  const [baseline, setBaseline] = useState(JSON.stringify([text, url]));
  useUnsaved(JSON.stringify([text, url]) !== baseline);
  return <form className="desk-panel" onSubmit={async e => { e.preventDefault(); if (await run({ action: "saveWeek", ...week, weekId: week.id, announcement: text, announcementUrl: url }, "X announcement saved.")) setBaseline(JSON.stringify([text, url])); }}>
    <div className="desk-section-heading"><h2>Announce your picks</h2><button className="desk-link-button" type="button" onClick={() => { if (window.confirm("Replace this draft with the current selection?")) setText(generated); }}>Regenerate from picks</button></div>
    {!week.selection && <p className="desk-warning">Publish the selection before sharing its public link.</p>}
    <label>Post copy<textarea aria-label="Post copy" rows={10} value={text} onChange={e => setText(e.target.value)} /></label><p className="desk-hint">{text.length} characters · Copy and edit to fit your X account&apos;s post limit.</p>
    <div className="desk-form-actions"><button type="button" className="desk-button" onClick={() => void copyText(text, notify)}>Copy post</button><a className="desk-button" href={`https://x.com/intent/tweet?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer">Open draft on X ↗</a></div>
    <label>Published X post URL<input value={url} onChange={e => setUrl(e.target.value)} placeholder="Paste the link after posting on X" /></label><button disabled={busy} className="desk-button primary">Save announcement</button>
  </form>;
}
