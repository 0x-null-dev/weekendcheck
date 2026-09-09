"use client";
import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { monday, reviewStatus, type Asset, type Post } from "@/lib/editorial";
import { xPostErrors, xTextLength } from "@/lib/x-post-validation";
import { useAdmin, useUnsaved } from "./admin-context";
import { AssetPreview, ThreadPreview } from "./review-editor";
import { Empty } from "./admin-lists";

const statusNames = { draft: "Draft", scheduled: "Scheduled", publishing: "Publishing…", published: "Published", failed: "Failed", attention: "Check X", cancelled: "Stopped" };
function localTime(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0,16);
}
function shiftDay(day: string, amount: number) {
  const date = new Date(`${day}T12:00:00Z`); date.setUTCDate(date.getUTCDate() + amount); return date.toISOString().slice(0,10);
}
export function XConnectionStatus() {
  const [status, setStatus] = useState<{ configured: boolean; enabled: boolean; running: boolean } | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const update = () => fetch("/api/admin/scheduler-status", { signal: controller.signal, cache: "no-store" }).then(r => { if (!r.ok) throw new Error(); return r.json(); }).then(setStatus).catch(() => {});
    void update(); const interval = setInterval(update, 30000);
    return () => { controller.abort(); clearInterval(interval); };
  }, []);
  return <p className={status?.configured && status.enabled && status.running ? "desk-hint" : "desk-warning"} aria-live="polite">{!status ? "Checking X scheduler…" : !status.configured ? "X posting is not connected. You can plan posts, but they will not send yet." : !status.enabled ? "X posting is paused. Saved schedules will not send." : !status.running ? "Scheduler is offline. Start it before your posts are due." : "X scheduler is running."}</p>;
}
export function XSchedule({ initialWeek }: { initialWeek?: string }) {
  const { data } = useAdmin();
  const [week, setWeek] = useState(initialWeek && /^\d{4}-\d{2}-\d{2}$/.test(initialWeek) && Number.isFinite(Date.parse(initialWeek)) ? monday(new Date(`${initialWeek}T12:00:00`)) : monday());
  const [channel, setChannel] = useState("all");
  const calendar = useRef<HTMLDivElement>(null);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const unscheduled = data.xPosts.filter(p => ["draft", "failed", "attention", "publishing"].includes(p.status));
  const days = Array.from({ length: 7 }, (_, index) => shiftDay(week, index));
  const today = localTime(new Date().toISOString()).slice(0,10);
  const events = [
    ...data.xPosts.filter(p => p.scheduledAt && ["scheduled", "publishing", "published"].includes(p.status)).map(p => ({ id: p.id, at: localTime(p.scheduledAt), title: p.title || p.posts[0]?.text || "Untitled post", href: `/admin/schedule/${p.id}`, channel: "x", label: statusNames[p.status], preview: p.posts[0]?.text || "", count: p.posts.length })),
    ...data.reviews.filter(r => reviewStatus(r) === "Scheduled").map(r => ({ id: r.id, at: localTime(r.scheduled!.publishedAt), title: r.scheduled!.title, href: `/admin/reviews/${r.id}`, channel: "site", label: "Review", preview: r.scheduled!.posts[0]?.text || "", count: r.scheduled!.posts.length })),
  ].filter(event => event.at.slice(0,10) >= week && event.at.slice(0,10) <= days[6] && (channel === "all" || event.channel === channel)).sort((a,b) => a.at.localeCompare(b.at));
  const firstHour = events.length ? Math.max(0, Math.min(...events.map(event => Number(event.at.slice(11,13)))) - 1) : 8;
  useEffect(() => {
    const url = new URL(window.location.href); url.searchParams.set("week", week); window.history.replaceState(null, "", url);
    const row = calendar.current?.querySelector<HTMLElement>(`[data-hour="${firstHour}"]`);
    if (calendar.current && row) calendar.current.scrollTop = row.offsetTop - 76;
  }, [week, firstHour]);
  const range = `${new Date(`${week}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${new Date(`${days[6]}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
  return <>
    <div className="desk-heading"><div><h1>Schedule</h1></div><Link className="desk-button primary" href="/admin/schedule/new">＋ New X post</Link></div>
    <XConnectionStatus />
    <section className="desk-calendar" aria-label="Weekly post calendar">
      <div className="desk-calendar-toolbar"><div className="desk-calendar-navigation"><button className="desk-button" onClick={() => setWeek(monday())}>Today</button><button className="desk-calendar-arrow" aria-label="Previous calendar week" onClick={() => setWeek(shiftDay(week, -7))}>‹</button><button className="desk-calendar-arrow" aria-label="Next calendar week" onClick={() => setWeek(shiftDay(week, 7))}>›</button><strong>{range}</strong></div><div className="desk-calendar-controls"><input aria-label="Calendar week" type="date" value={week} onChange={e => { if (e.target.value) setWeek(monday(new Date(`${e.target.value}T12:00:00`))); }} /><select aria-label="Calendar channel" value={channel} onChange={e => setChannel(e.target.value)}><option value="all">All posts</option><option value="x">X posts</option><option value="site">Website reviews</option></select></div></div>
      <div className="desk-calendar-legend"><span><i className="x-dot" /> X posts</span><span><i className="site-dot" /> Website reviews</span><small>{events.length} planned · {timezone}</small></div>
      <div className="desk-calendar-scroll" ref={calendar} tabIndex={0} role="region" aria-label="Scroll calendar days and hours">
        <div className="desk-calendar-grid">
          <div className="desk-calendar-corner">Time</div>
          {days.map(day => <div className={`desk-calendar-day ${day === today ? "is-today" : ""}`} key={day}><span>{new Date(`${day}T12:00:00`).toLocaleDateString(undefined, { weekday: "short" })}</span><strong>{Number(day.slice(8))}</strong>{day === today && <small>Today</small>}</div>)}
          {Array.from({ length: 48 }, (_, slot) => {
            const hour = Math.floor(slot / 2);
            const minute = slot % 2 === 0 ? 0 : 30;
            const time = `${String(hour).padStart(2,"0")}:${String(minute).padStart(2,"0")}`;
            return <Fragment key={slot}>
            <div className={`desk-calendar-hour ${minute ? "half-hour" : ""}`} data-hour={minute === 0 ? hour : undefined}>{time}</div>
            {days.map(day => {
              const items = events.filter(event => event.at.startsWith(`${day}T${String(hour).padStart(2,"0")}:`) && Math.floor(Number(event.at.slice(14,16)) / 30) * 30 === minute);
              return <div className={`desk-calendar-slot ${minute ? "half-hour" : ""} ${day === today ? "is-today" : ""}`} data-day={day} data-time={time} key={`${day}-${slot}`}>
                <Link className="desk-calendar-add" href={`/admin/schedule/new?date=${day}&time=${time}`} aria-label={`Add X post on ${day} at ${time}`}><span>＋</span></Link>
                {items.map(event => <Link className={`desk-calendar-event ${event.channel}`} href={event.href} key={event.id}><div><span className="desk-calendar-platform">{event.channel === "x" ? "𝕏" : "W"}</span><time>{event.at.slice(11)}</time><span className="desk-calendar-event-status">{event.label}</span></div><strong>{event.title}</strong>{event.preview !== event.title && <p>{event.preview}</p>}{event.count > 1 && <small>{event.count} posts in thread</small>}</Link>)}
              </div>;
            })}
          </Fragment>;
          })}
        </div>
      </div>
      <div className="desk-calendar-footer">Click an empty time slot to add a post.</div>
    </section>
    <section className="desk-panel"><h2>Drafts & needs attention</h2>{unscheduled.map(post => <Link className="desk-list-row" key={post.id} href={`/admin/schedule/${post.id}`}><div className="desk-grow"><strong>{post.title || post.posts[0]?.text.slice(0,80) || "Untitled post"}</strong>{post.error && <small className="desk-warning">{post.error}</small>}</div><span className="desk-pill">{statusNames[post.status]}</span><span>→</span></Link>)}{!unscheduled.length && <small>No drafts or failed posts.</small>}</section>
  </>;
}

export function XPostEditor({ id, date, time }: { id: string; date?: string; time?: string }) {
  const { data } = useAdmin();
  const existing = data.xPosts.find(p => p.id === id);
  if (id !== "new" && !existing) return <Empty text="X post not found." />;
  return <Composer key={id} id={id} initial={{ title: existing?.title || "", posts: existing?.posts || [{ id: "first", text: "", assets: [] }], time: localTime(existing?.scheduledAt || null) || (date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T${time && /^([01]\d|2[0-3]):[0-5]\d$/.test(time) ? time : "10:00"}` : "") }} />;
}
function Composer({ id, initial }: { id: string; initial: { title: string; posts: Post[]; time: string } }) {
  const { data, run, busy } = useAdmin();
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [baseline, setBaseline] = useState(JSON.stringify(initial));
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [resolvedUrl, setResolvedUrl] = useState("");
  const item = data.xPosts.find(p => p.id === id);
  const editable = !item || (["draft", "scheduled", "failed"].includes(item.status) && !item.publishedIds.length);
  const dirty = JSON.stringify(form) !== baseline;
  useUnsaved(editable && dirty);
  const updatePost = (index: number, changes: Partial<Post>) => setForm(previous => ({ ...previous, posts: previous.posts.map((post,i) => i === index ? { ...post, ...changes } : post) }));
  async function save(schedule: boolean) {
    setError("");
    if (schedule) { const errors = xPostErrors(form.posts); if (errors.length) { setError(errors.join(" ")); return; } }
    if (!schedule && item?.status === "scheduled" && !window.confirm("Cancel this schedule and keep the edited post as a draft?")) return;
    const parsed = form.time ? new Date(form.time) : null;
    if (parsed && !Number.isFinite(parsed.getTime())) { setError("Choose a valid date and time."); return; }
    const saved = await run({ action: "saveXPost", postId: item?.id, title: form.title, posts: form.posts, scheduledAt: parsed?.toISOString() || null, schedule }, schedule ? "X post scheduled. Check the scheduler connection above." : "X draft saved.");
    if (saved) { setBaseline(JSON.stringify(form)); if (!item) router.replace(`/admin/schedule/${saved.result.id}`); }
  }
  async function upload(index: number, files: FileList | null) {
    if (!files?.length) return;
    if (form.posts[index].assets.length + files.length > 4) { setError("Attach up to four images, or one video/GIF."); return; }
    setUploading(true); setError("");
    try {
      for (const file of Array.from(files)) {
        const body = new FormData(); body.append("file", file);
        const response = await fetch("/api/admin/upload", { method: "POST", body });
        const asset: Asset & { error?: string } = await response.json(); if (!response.ok) throw new Error(asset.error);
        setForm(previous => ({ ...previous, posts: previous.posts.map((post,i) => i === index ? { ...post, assets: [...post.assets, asset] } : post) }));
      }
    } catch (error) { setError(error instanceof Error ? error.message : "Upload failed."); }
    finally { setUploading(false); }
  }
  return <>
    <Link className="desk-back" href={form.time ? `/admin/schedule?week=${form.time.slice(0,10)}` : "/admin/schedule"}>← Schedule</Link>
    <div className="desk-heading"><div><h1>{id === "new" ? "New X post" : "X post"}</h1><p>{item ? statusNames[item.status] : "Draft"}{dirty ? " · Unsaved changes" : ""}</p></div><button className="desk-button" onClick={() => setPreview(!preview)}>{preview ? "Edit posts" : "Preview thread"}</button></div>
    <XConnectionStatus />
    {item?.reviewId && <p className="desk-hint">Copied from your review. Changes here only affect X. <Link href={`/admin/reviews/${item.reviewId}`}>Open website review →</Link></p>}
    {item?.error && <p className="desk-warning">{item.error}</p>}
    <div className="desk-editor-layout"><div>
      {preview || !editable ? <section className="desk-panel"><ThreadPreview posts={form.posts} /></section> : <>
        <section className="desk-panel"><label>Post label (only for you)<input maxLength={180} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label></section>
        {form.posts.map((post,index) => <section className="desk-panel" key={post.id}>
          <div className="desk-section-heading"><h2>Post {index + 1}</h2><div className="desk-form-actions"><button disabled={uploading || index === 0} aria-label={`Move post ${index + 1} earlier`} onClick={() => { const posts = [...form.posts]; [posts[index - 1], posts[index]] = [posts[index], posts[index - 1]]; setForm({ ...form, posts }); }}>↑</button><button disabled={uploading || form.posts.length === 1} onClick={() => { if (window.confirm("Remove this post from the thread?")) setForm({ ...form, posts: form.posts.filter((_,i) => i !== index) }); }}>Remove post</button></div></div>
          <textarea aria-label={`X post ${index + 1} text`} rows={5} value={post.text} onChange={e => updatePost(index, { text: e.target.value })} placeholder="What would you like to share?" /><small className={xTextLength(post.text) > 280 ? "desk-warning" : ""}>{xTextLength(post.text)} / 280</small>
          {post.assets.map(asset => <div className="desk-asset" key={asset.id}><AssetPreview asset={asset} /><label>Media description<input value={asset.alt} onChange={e => updatePost(index, { assets: post.assets.map(a => a.id === asset.id ? { ...a, alt: e.target.value } : a) })} /></label><button className="desk-link-button" disabled={uploading} onClick={() => updatePost(index, { assets: post.assets.filter(a => a.id !== asset.id) })}>Remove attachment</button></div>)}
          <label>Attach media<input type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif,video/mp4" disabled={uploading || post.assets.length >= 4} onChange={e => { void upload(index, e.target.files); e.target.value = ""; }} /></label><small>Images up to 5 MB · GIF up to 15 MB · MP4 up to 50 MB</small>
        </section>)}
        <button className="desk-button" disabled={uploading || form.posts.length >= 30} onClick={() => setForm({ ...form, posts: [...form.posts, { id: crypto.randomUUID(), text: "", assets: [] }] })}>Add thread reply</button>
      </>}
      {error && <p className="desk-error" role="alert">{error}</p>}
    </div><aside><section className="desk-panel"><h2>Publish on X</h2>{editable ? <>
      <label>Post date and time<input type="datetime-local" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} /></label><small>{Intl.DateTimeFormat().resolvedOptions().timeZone}</small>
      <div className="desk-stacked-actions"><button className="desk-button primary" disabled={busy || uploading || !form.time} onClick={() => void save(true)}>{item?.status === "scheduled" ? "Update schedule" : "Schedule on X"}</button><button className="desk-button" disabled={busy || uploading} onClick={() => void save(false)}>{item?.status === "scheduled" ? "Unschedule & save draft" : "Save draft"}</button></div>
      {item?.status === "scheduled" && <button className="desk-link-button" disabled={busy} onClick={() => void run({ action: "cancelXPost", postId: id }, "X schedule cancelled.")}>Cancel X schedule</button>}
    </> : <p>{item?.status === "publishing" ? "Sending the thread. Refresh after it finishes." : item?.status === "published" ? "Published on X." : "Automatic posting has stopped for this thread."}</p>}
    {item?.xPostUrl && <a className="desk-button" href={item.xPostUrl} target="_blank" rel="noreferrer">Open on X ↗</a>}
    {item && ["attention", "failed"].includes(item.status) && <><label>Published thread URL<input value={resolvedUrl} onChange={e => setResolvedUrl(e.target.value)} placeholder="Check X and finish any missing replies first" /></label><button className="desk-button" disabled={busy || !resolvedUrl} onClick={() => { if (window.confirm("Have you checked X and confirmed the whole thread is published?")) void run({ action: "resolveXPost", postId: id, url: resolvedUrl }, "Marked as published."); }}>Mark as published</button><button className="desk-link-button danger" disabled={busy} onClick={() => { if (window.confirm("Stop this queue item? Any posts already on X will remain there.")) void run({ action: "cancelXPost", postId: id }); }}>Stop this item</button></>}
    {item?.status === "draft" && <button className="desk-link-button danger" disabled={busy} onClick={async () => { if (window.confirm("Delete this unsent X draft?") && await run({ action: "deleteXPost", postId: id })) { setBaseline(JSON.stringify(form)); router.push("/admin/schedule"); } }}>Delete draft</button>}
    </section></aside></div>
  </>;
}
