"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatWeekRange } from "@/lib/demo-data";
import { isSelected, liveVersion, monday, reviewStatus, trackNames, type Product } from "@/lib/editorial";
import { useAdmin, useUnsaved } from "./admin-context";
import { ProjectLogo } from "../project-logo";
import { ProjectForm } from "./project-form";
import { ProjectImport } from "./project-import";
import { XConnectionStatus } from "./x-schedule";

export function Overview() {
  const { data } = useAdmin();
  const weeks = [...data.weeks].sort((a, b) => b.startsOn.localeCompare(a.startsOn));
  const active = weeks.filter(w => w.state !== "complete");
  const drafts = data.reviews.filter(r => reviewStatus(r) === "Draft");
  const scheduled = data.reviews.filter(r => reviewStatus(r) === "Scheduled");
  return <>
    <div className="desk-heading"><div><h1>Overview</h1></div><Link className="desk-button primary" href="/admin/weeks">Manage weeks →</Link></div>
    <div className="desk-stats">{[[active.length, "Open weeks"], [data.projects.filter(p => !p.archived).length, "Projects"], [drafts.length, "Review drafts"], [scheduled.length, "Scheduled reviews"]].map(([number, label]) => <div key={label}><strong>{number}</strong><span>{label}</span></div>)}</div>
    <section className="desk-panel"><div className="desk-section-heading"><h2>On your desk</h2><Link href="/admin/reviews">All reviews →</Link></div>
      {active.length === 0 && <Empty text="No open weeks. Create a week to start collecting projects." />}
      {active.map(week => <Link className="desk-list-row" href={`/admin/weeks/${week.id}`} key={week.id}><div><strong>{formatWeekRange(week.startsOn)}</strong><small>{week.entries.length} projects · {week.entries.filter(e => isSelected(e.track)).length} picked</small></div><span className="desk-pill">{week.selection ? "Public" : "Private draft"}</span><span>Open week →</span></Link>)}
    </section>
    {scheduled.length > 0 && <section className="desk-panel"><h2>Scheduled reviews</h2>{scheduled.map(review => <Link className="desk-list-row" href={`/admin/reviews/${review.id}`} key={review.id}><strong>{data.projects.find(p => p.id === review.projectId)?.name}</strong><span>{new Date(review.scheduled!.publishedAt).toLocaleString()}</span></Link>)}</section>}
  </>;
}

export function WeeksList() {
  const { data, busy, run } = useAdmin();
  const router = useRouter();
  const [startsOn, setStartsOn] = useState(monday());
  const [filter, setFilter] = useState("all");
  return <>
    <div className="desk-heading"><div><h1>Weeks</h1><p>Collect projects, choose reviews, then publish your picks.</p></div><button className="desk-button primary" disabled={busy} onClick={async () => { const saved = await run({ action: "openWeek", startsOn: monday() }, "Week opened."); if (saved) router.push(`/admin/weeks/${saved.result.id}`); }}>Open this week →</button></div>
    <form className="desk-panel desk-inline desk-week-create" onSubmit={async event => { event.preventDefault(); const saved = await run({ action: "createWeek", startsOn }, "Week created."); if (saved) router.push(`/admin/weeks/${saved.result.id}`); }}>
      <label>Week starting<input type="date" required value={startsOn} onChange={e => setStartsOn(e.target.value)} /></label><button className="desk-button" disabled={busy}>Create week</button>
    </form>
    <div className="desk-toolbar"><select aria-label="Filter weeks" value={filter} onChange={e => setFilter(e.target.value)}><option value="all">All weeks</option><option value="open">Open</option><option value="complete">Complete</option></select></div>
    <section className="desk-panel">{[...data.weeks].filter(w => filter === "all" || (filter === "complete" ? w.state === "complete" : w.state !== "complete")).sort((a, b) => b.startsOn.localeCompare(a.startsOn)).map(week => <Link className="desk-list-row" href={`/admin/weeks/${week.id}`} key={week.id}><div><strong>{formatWeekRange(week.startsOn)}</strong><small>{week.entries.length} projects · {week.entries.filter(e => isSelected(e.track)).length} picked</small></div><span className="desk-pill">{week.state}</span><span className={`desk-pill ${week.selection ? "green" : ""}`}>{week.selection ? "Public" : "Private"}</span><span>→</span></Link>)}{!data.weeks.length && <Empty text="No weeks yet. Create your first one above." />}</section>
  </>;
}

export function ProjectsList() {
  const { data } = useAdmin();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("active");
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState(false);
  const [weekId, setWeekId] = useState("");
  const week = data.weeks.find(w => w.id === weekId);
  const filtered = data.projects.filter(p => (filter === "archived" ? p.archived : !p.archived) && `${p.name} ${p.url} ${p.handle}`.toLowerCase().includes(query.toLowerCase()));
  return <>
    <div className="desk-heading"><div><h1>Projects</h1><p>All collected projects, across every week.</p></div><div className="desk-form-actions"><button data-leave-form className="desk-button" onClick={() => { setImporting(!importing); setAdding(false); }}>Import from X</button><button data-leave-form className="desk-button primary" onClick={() => { setAdding(!adding); setImporting(false); }}>{adding ? "Close form" : "Add project"}</button></div></div>
    {(adding || importing) && <section className="desk-panel"><label>Add to week<select value={weekId} onChange={e => setWeekId(e.target.value)}><option value="">{importing ? "Choose a week" : "Project library only"}</option>{[...data.weeks].filter(w => w.state !== "complete").sort((a,b) => b.startsOn.localeCompare(a.startsOn)).map(w => <option key={w.id} value={w.id}>{formatWeekRange(w.startsOn)}</option>)}</select></label></section>}
    {adding && <ProjectForm weekId={weekId || undefined} onSaved={() => setAdding(false)} />}
    {importing && week && <ProjectImport key={week.id} week={week} />}
    <div className="desk-toolbar"><input placeholder="Search name, website, or founder…" aria-label="Search projects" value={query} onChange={e => setQuery(e.target.value)} /><select aria-label="Filter projects" value={filter} onChange={e => setFilter(e.target.value)}><option value="active">Active projects</option><option value="archived">Archived projects</option></select><span>{filtered.length} projects</span></div>
    <section className="desk-panel">{filtered.map(project => {
      const reviewed = Boolean(project.reviewedInWeek) || data.reviews.some(r => r.projectId === project.id && liveVersion(r));
      const scheduled = data.reviews.some(r => r.projectId === project.id && reviewStatus(r) === "Scheduled");
      const picked = data.weeks.some(w => w.entries.some(e => e.projectId === project.id && isSelected(e.track)));
      return <Link className="desk-list-row" key={project.id} href={`/admin/projects/${project.id}`}><ProjectLogo project={project} /><div className="desk-grow"><strong>{project.name}</strong><small>{project.url}</small></div><span>{data.weeks.filter(w => w.entries.some(e => e.projectId === project.id)).length} weeks</span><span className={`desk-pill ${reviewed ? "green" : ""}`}>{reviewed ? "Reviewed" : scheduled ? "Scheduled" : picked ? "Selected for review" : "Not reviewed"}</span><span>→</span></Link>;
    })}{!filtered.length && <Empty text="No projects match this view." />}</section>
  </>;
}

export function ReviewsList() {
  const { data } = useAdmin();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [kind, setKind] = useState("all");
  const filtered = data.reviews.filter(r => (status === "all" || reviewStatus(r) === status) && (kind === "all" || r.kind === kind) && `${r.title} ${data.projects.find(p => p.id === r.projectId)?.name}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return <>
    <div className="desk-heading"><div><p className="eyebrow">WRITE & PUBLISH</p><h1>Reviews</h1><p>Posts, threads, and recordings. Start a review from a selected project in a week.</p></div><Link className="desk-button" href="/admin/weeks">Choose a project →</Link></div>
    <div className="desk-toolbar"><input placeholder="Search reviews…" aria-label="Search reviews" value={query} onChange={e => setQuery(e.target.value)} /><select aria-label="Review status" value={status} onChange={e => setStatus(e.target.value)}>{["all", "Draft", "Scheduled", "Published"].map(s => <option key={s} value={s}>{s === "all" ? "All statuses" : s}</option>)}</select><select aria-label="Review type" value={kind} onChange={e => setKind(e.target.value)}><option value="all">Both review types</option><option value="deep">Deep reviews</option><option value="quick">Quick takes</option></select></div>
    <section className="desk-panel">{filtered.map(review => <Link className="desk-list-row" href={`/admin/reviews/${review.id}`} key={review.id}><div className="desk-grow"><strong>{data.projects.find(p => p.id === review.projectId)?.name}</strong><small>{review.title || "Untitled draft"} · {review.posts.length} posts</small></div><span>{review.kind === "deep" ? "Deep review" : "Quick take"}</span><span className={`desk-pill ${reviewStatus(review) === "Published" ? "green" : ""}`}>{reviewStatus(review)}</span><span>→</span></Link>)}{!filtered.length && <Empty text="No reviews in this view. Select a project in a week, then choose Write review." />}</section>
  </>;
}

export function SettingsPage() {
  const { data, run, busy, xConnected } = useAdmin();
  const [form, setForm] = useState(data.settings);
  const dirty = JSON.stringify(form) !== JSON.stringify(data.settings);
  useUnsaved(dirty);
  return <>
    <div className="desk-heading"><div><h1>Settings</h1></div></div>
    <form className="desk-panel" onSubmit={async e => { e.preventDefault(); await run({ action: "saveSettings", ...form }); }}>
      <div className="desk-form-grid">{([["name", "Display name"], ["handle", "X handle (without @)"], ["siteUrl", "Website URL"], ["avatarUrl", "Avatar image URL (optional)"]] as const).map(([key, label]) => <label key={key}>{label}<input value={form[key]} required={key !== "avatarUrl"} onChange={e => setForm({ ...form, [key]: e.target.value })} /></label>)}
      </div>
      <button className="desk-button primary" disabled={busy || !dirty}>Save settings</button>
    </form>
    <section className="desk-panel"><h2>X connection</h2><p>Reply import: {xConnected ? "Token configured" : "Not connected"}</p><XConnectionStatus /><Link className="desk-button" href="/admin/schedule">Open schedule →</Link></section>
    <section className="desk-panel"><h2>Your data</h2><p>Projects, reviews, and schedules are saved in Postgres.</p><a className="desk-button" href="/api/admin/export" download>Download data backup ↓</a><p className="desk-hint">This export contains your editorial data. Uploaded media and login credentials are not included.</p></section>
  </>;
}

export function ProjectDetail({ id }: { id: string }) {
  const { data, run, busy } = useAdmin();
  const router = useRouter();
  const [weekId, setWeekId] = useState("");
  const project = data.projects.find(p => p.id === id);
  if (!project) return <Empty text="Project not found." />;
  return <><Link className="desk-back" href="/admin/projects">← Projects</Link><div className="desk-heading"><div><h1>{project.name}</h1><a href={project.url} target="_blank" rel="noreferrer">Visit project ↗</a></div></div>
    <section className="desk-panel"><h2>Reviews & selection</h2>{[...data.weeks].filter(w => w.entries.some(e => e.projectId === id)).sort((a,b) => b.startsOn.localeCompare(a.startsOn)).map(week => {
      const entry = week.entries.find(e => e.projectId === id)!;
      const review = data.reviews.find(r => r.weekId === week.id && r.projectId === id);
      return <div className="desk-list-row" key={week.id}><div className="desk-grow"><Link href={`/admin/weeks/${week.id}`}><strong>{formatWeekRange(week.startsOn)}</strong></Link><small>{trackNames[entry.track]}{review ? ` · ${reviewStatus(review)}` : ""}</small></div>
        {review ? <Link className="desk-button" href={`/admin/reviews/${review.id}`}>Open review →</Link> : isSelected(entry.track) ? <button className="desk-button primary" disabled={busy} onClick={async () => { const saved = await run({ action: "prepareReview", weekId: week.id, projectId: id }); if (saved) router.push(`/admin/reviews/${saved.result.id}`); }}>Write review →</button> : <Link className="desk-button" href={`/admin/weeks/${week.id}`}>Choose review type →</Link>}</div>;
    })}{!data.weeks.some(w => w.entries.some(e => e.projectId === id)) && <p>Add this project to a week to choose a review type.</p>}
    {!project.archived && <form className="desk-inline desk-week-create" onSubmit={async e => { e.preventDefault(); if (await run({ action: "addExisting", weekId, projectId: id }, "Project added to week.")) setWeekId(""); }}><label>Add to week<select required value={weekId} onChange={e => setWeekId(e.target.value)}><option value="">Choose a week</option>{data.weeks.filter(w => w.state !== "complete" && !w.entries.some(e => e.projectId === id)).map(w => <option key={w.id} value={w.id}>{formatWeekRange(w.startsOn)}</option>)}</select></label><button className="desk-button" disabled={busy || !weekId}>Add to week</button></form>}</section>
    <ProjectForm project={project} /><section className="desk-panel"><h2>{project.archived ? "Restore project" : "Archive project"}</h2><button className="desk-button" disabled={busy} onClick={() => { if (window.confirm(project.archived ? "Restore this project?" : "Archive this project? Its history will remain.")) void run({ action: "archiveProject", projectId: id, archived: !project.archived }); }}>{project.archived ? "Restore" : "Archive"}</button></section></>;
}
export function Empty({ text }: { text: string }) { return <div className="desk-empty">{text}</div>; }
export type { Product };
