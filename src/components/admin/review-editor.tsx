"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { liveVersion, reviewStatus, type Asset, type Post } from "@/lib/editorial";
import { useAdmin, useUnsaved, copyText } from "./admin-context";
import { Empty } from "./admin-lists";

export function ReviewEditor({ id }: { id: string }) {
  const { data } = useAdmin();
  const review = data.reviews.find(r => r.id === id);
  if (!review) return <Empty text="Review not found. Start one from a selected project in a week." />;
  return <Editor key={id} id={id} initial={{ title: review.title, posts: review.posts, xPostUrl: review.xPostUrl }} />;
}
function Editor({ id, initial }: { id: string; initial: { title: string; posts: Post[]; xPostUrl: string } }) {
  const { data, busy, run, notify } = useAdmin();
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [baseline, setBaseline] = useState(JSON.stringify(initial));
  const [preview, setPreview] = useState(false);
  const [publishAt, setPublishAt] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const review = data.reviews.find(r => r.id === id)!;
  const product = data.projects.find(p => p.id === review.projectId)!;
  const dirty = JSON.stringify(form) !== baseline;
  useUnsaved(dirty);
  const updatePost = (index: number, change: Partial<Post>) => setForm(previous => ({ ...previous, posts: previous.posts.map((p, i) => i === index ? { ...p, ...change } : p) }));
  async function save() {
    const saved = await run({ action: "saveReview", reviewId: id, ...form }, "Review draft saved.");
    if (saved) setBaseline(JSON.stringify(form));
    return saved;
  }
  function movePost(index: number, delta: number) {
    setForm(previous => {
      const posts = [...previous.posts];
      [posts[index], posts[index + delta]] = [posts[index + delta], posts[index]];
      return { ...previous, posts };
    });
  }
  async function upload(index: number, files: FileList | null) {
    if (!files?.length) return;
    if (form.posts[index].assets.length + files.length > 4) { setError("Attach up to four media items per post."); return; }
    setUploading(true); setError("");
    const assets: Asset[] = [];
    try {
      for (const file of Array.from(files)) {
        const body = new FormData(); body.append("file", file);
        const response = await fetch("/api/admin/upload", { method: "POST", body });
        const asset = await response.json(); if (!response.ok) throw new Error(asset.error);
        assets.push(asset);
      }
    } catch (error) { setError(error instanceof Error ? error.message : "Upload failed."); }
    finally {
      if (assets.length) setForm(previous => ({ ...previous, posts: previous.posts.map((post, i) => i === index ? { ...post, assets: [...post.assets, ...assets] } : post) }));
      setUploading(false);
    }
  }
  return <>
    <Link className="desk-back" href={`/admin/weeks/${review.weekId}`}>← Back to week</Link>
    <div className="desk-heading"><div><p className="eyebrow">{review.kind === "deep" ? "DEEP REVIEW" : "QUICK TAKE"} · {reviewStatus(review).toUpperCase()}</p><h1>{product.name}</h1><p>{dirty ? "Unsaved changes" : "Draft saved"} · {form.posts.length} {form.posts.length === 1 ? "post" : "posts"}</p></div><div className="desk-form-actions"><button className="desk-button" onClick={() => setPreview(!preview)}>{preview ? "Edit posts" : "Preview thread"}</button><button className="desk-button primary" disabled={busy || uploading || !dirty} onClick={() => void save()}>Save draft</button></div></div>
    <div className="desk-editor-layout"><div>
      <section className="desk-panel"><label>Review title<input maxLength={180} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Shown in the review library" /></label><p className="desk-hint">The title appears in the library. The review page displays your posts in order.</p></section>
      {preview ? <section className="desk-panel"><h2>Thread preview</h2><ThreadPreview posts={form.posts} /></section> : <>
        {form.posts.map((post, index) => <section className="desk-panel" key={post.id}>
          <div className="desk-section-heading"><h2>{index === 0 ? "Opening post" : `Reply ${index}`}</h2><div className="desk-form-actions"><button disabled={index === 0 || uploading} onClick={() => movePost(index, -1)} aria-label={`Move post ${index + 1} up`}>↑</button><button disabled={index === form.posts.length - 1 || uploading} onClick={() => movePost(index, 1)} aria-label={`Move post ${index + 1} down`}>↓</button><button disabled={form.posts.length === 1 || uploading} onClick={() => { if (window.confirm("Remove this post from the draft?")) setForm({ ...form, posts: form.posts.filter(p => p.id !== post.id) }); }}>Remove</button></div></div>
          <label>Post text<textarea aria-label={`Post ${index + 1} text`} rows={7} value={post.text} onChange={e => updatePost(index, { text: e.target.value })} /></label>
          <div className="desk-section-heading"><small>{post.text.length} characters{post.text.length > 280 ? " · Check your X account's post limit" : ""}</small><button className="desk-link-button" onClick={() => void copyText(post.text, notify)}>Copy post</button></div>
          {post.assets.map((asset, assetIndex) => <div className="desk-asset" key={asset.id}>
            <AssetPreview asset={asset} />
            <label>{asset.type === "image" ? "Image description / alt text" : "Video description"}<input value={asset.alt} onChange={e => updatePost(index, { assets: post.assets.map(a => a.id === asset.id ? { ...a, alt: e.target.value } : a) })} /></label>
            <div className="desk-form-actions"><button disabled={uploading || assetIndex === 0} onClick={() => { const assets = [...post.assets]; [assets[assetIndex - 1], assets[assetIndex]] = [assets[assetIndex], assets[assetIndex - 1]]; updatePost(index, { assets }); }}>Move earlier</button><button disabled={uploading} onClick={() => updatePost(index, { assets: post.assets.filter(a => a.id !== asset.id) })}>Remove attachment</button></div>
          </div>)}
          <label>Attach screenshots or video<input type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm" disabled={uploading || post.assets.length >= 4} onChange={e => { void upload(index, e.target.files); e.target.value = ""; }} /></label>
          <p className="desk-hint">PNG, JPG, WebP, GIF, MP4, WebM · up to 50 MB per file. For larger videos, attach a hosted MP4 or WebM URL.</p>
          <MediaLink disabled={uploading || post.assets.length >= 4} add={asset => updatePost(index, { assets: [...post.assets, asset] })} />
        </section>)}
        <button className="desk-button" disabled={form.posts.length >= 30 || uploading} onClick={() => setForm({ ...form, posts: [...form.posts, { id: crypto.randomUUID(), text: "", assets: [] }] })}>＋ Add thread reply</button>
      </>}
      {error && <p className="desk-error" role="alert">{error}</p>}
    </div><aside>
      <section className="desk-panel"><h2>Publish on the site</h2><p>Save your draft, then publish or schedule it. Editing a draft leaves the live version unchanged.</p>
        {liveVersion(review) && <a className="desk-button" href={`/projects/${product.slug}`} target="_blank" rel="noreferrer">View published review ↗</a>}
        <button className="desk-button primary" disabled={busy || uploading} onClick={async () => { if (window.confirm("Publish this review on your website now?") && await save()) await run({ action: "publishReview", reviewId: id }, "Review published on the site."); }}>{liveVersion(review) ? "Update published review" : "Publish now"}</button>
        <label>Schedule on site<input type="datetime-local" value={publishAt} onChange={e => setPublishAt(e.target.value)} /></label><small>Time zone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</small>
        <button className="desk-button" disabled={busy || uploading || !publishAt} onClick={async () => {
          const date = new Date(publishAt);
          if (!Number.isFinite(date.getTime()) || date.getTime() <= Date.now()) { setError("Choose a future publication time."); return; }
          if (await save()) await run({ action: "scheduleReview", reviewId: id, publishAt: date.toISOString() }, "Saved version scheduled on the site.");
        }}>Schedule saved version</button>
        {reviewStatus(review) === "Scheduled" && <><p className="desk-hint">Scheduled for {new Date(review.scheduled!.publishedAt).toLocaleString()}. Later draft edits do not change this snapshot; schedule again to replace it.</p><button className="desk-link-button" disabled={busy} onClick={() => void run({ action: "cancelSchedule", reviewId: id }, "Schedule cancelled.")}>Cancel schedule</button></>}
        {liveVersion(review) && <button className="desk-link-button danger" disabled={busy} onClick={() => { if (window.confirm("Unpublish this review and cancel any scheduled update?")) void run({ action: "unpublishReview", reviewId: id }, "Review unpublished."); }}>Unpublish review</button>}
      </section>
      <section className="desk-panel"><h2>Share on X</h2><div className="desk-stacked-actions"><button className="desk-button primary" disabled={busy || uploading} onClick={async () => { if (!await save()) return; const saved = await run({ action: "createXFromReview", reviewId: id }, "X draft opened."); if (saved) router.push(`/admin/schedule/${saved.result.id}`); }}>{data.xPosts.some(p => p.reviewId === id && p.status !== "cancelled") ? "Open X post →" : "Schedule thread on X →"}</button><button className="desk-button" onClick={() => void copyText(form.posts.map(p => p.text).join("\n\n———\n\n"), notify)}>Copy whole thread</button><a className="desk-button" href={`https://x.com/intent/tweet?text=${encodeURIComponent(form.posts[0]?.text || "")}`} target="_blank" rel="noreferrer">Open first post on X ↗</a></div><label>Published X post URL<input value={form.xPostUrl} onChange={e => setForm({ ...form, xPostUrl: e.target.value })} placeholder="https://x.com/.../status/..." /></label><button className="desk-button" disabled={busy || uploading} onClick={() => void save()}>Save X link</button></section>
      {!review.published && !review.scheduled && <section className="desk-panel"><button className="desk-link-button danger" disabled={busy} onClick={async () => { if (window.confirm("Permanently delete this review draft?") && await run({ action: "deleteReview", reviewId: id }, "Draft deleted.")) { setBaseline(JSON.stringify(form)); router.push("/admin/reviews"); } }}>Delete review draft</button></section>}
    </aside></div>
  </>;
}

export function AssetPreview({ asset }: { asset: Asset }) {
  return asset.type === "video" ? <video controls preload="metadata" src={asset.url} aria-label={asset.alt || "Review recording"} /> : (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={asset.url} alt={asset.alt || "Project screenshot"} />
  );
}
export function ThreadPreview({ posts }: { posts: Post[] }) {
  const { data } = useAdmin();
  return <div className="desk-thread-preview">{posts.map((post, index) => <article key={post.id}><div className="desk-preview-avatar">{data.settings.name.slice(0, 1)}</div><div><strong>{data.settings.name}</strong> <small>@{data.settings.handle}{index > 0 ? " · reply" : ""}</small><p>{post.text || "Empty post"}</p>{post.assets.map(asset => <AssetPreview key={asset.id} asset={asset} />)}</div></article>)}</div>;
}
function MediaLink({ add, disabled }: { add: (asset: Asset) => void; disabled: boolean }) {
  const [url, setUrl] = useState("");
  const [type, setType] = useState<"image" | "video">("image");
  const [error, setError] = useState("");
  return <details><summary>Add hosted media by URL</summary><div className="desk-inline"><label>Type<select value={type} onChange={e => setType(e.target.value as "image" | "video")}><option value="image">Image</option><option value="video">Direct video</option></select></label><label>Media URL<input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://…" /></label><button disabled={disabled || !url} className="desk-button" onClick={() => {
    try {
      const parsed = new URL(url);
      if (!["https:", "http:"].includes(parsed.protocol)) throw new Error();
      if (type === "video" && /(youtube\.com|youtu\.be|loom\.com|vimeo\.com)$/.test(parsed.hostname)) { setError("Use a direct MP4/WebM file URL, or upload the recording."); return; }
      add({ id: crypto.randomUUID(), url: parsed.toString(), type, alt: "" }); setUrl(""); setError("");
    } catch { setError("Enter a valid http(s) media URL."); }
  }}>Attach</button></div>{error && <p role="alert" className="desk-error">{error}</p>}</details>;
}
