"use client";
import { useState } from "react";
import type { Product } from "@/lib/editorial";
import { useAdmin, useUnsaved } from "./admin-context";

export function ProjectForm({ project, weekId, onSaved }: { project?: Product; weekId?: string; onSaved?: () => void }) {
  const { run, busy } = useAdmin();
  const [form, setForm] = useState({ name: project?.name || "", url: project?.url || "", handle: project?.handle || "", description: project?.description || "", category: project?.category || "", logoUrl: project?.logoUrl || "", source: "" });
  const [baseline, setBaseline] = useState(JSON.stringify(form));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  useUnsaved(JSON.stringify(form) !== baseline);
  return <form className="desk-panel" onSubmit={async event => {
    event.preventDefault();
    const saved = await run({ action: project ? "saveProject" : "createProject", ...form, projectId: project?.id, weekId }, project ? "Project saved." : "Project added.");
    if (saved) {
      const next = project ? form : { name: "", url: "", handle: "", description: "", category: "", logoUrl: "", source: "" };
      setForm(next); setBaseline(JSON.stringify(next)); onSaved?.();
    }
  }}>
    <h2>{project ? "Project details" : "Add a project"}</h2><div className="desk-form-grid">
      <label>Project name<input required maxLength={120} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
      <label>Website<input required placeholder="https://yourapp.com" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} /></label>
      <label>Founder X handle<input placeholder="@builder" value={form.handle} onChange={e => setForm({ ...form, handle: e.target.value })} /></label>
      <label>Category<input placeholder="Developer tools" maxLength={100} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></label>
      <label className="wide">Description<textarea aria-label="Description" rows={3} maxLength={2000} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
      <label>Logo URL (optional)<input value={form.logoUrl} onChange={e => setForm({ ...form, logoUrl: e.target.value })} /></label>
      <label>Or upload a logo<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={uploading} onChange={async e => {
        const file = e.target.files?.[0]; if (!file) return;
        setUploading(true); setError("");
        try {
          const body = new FormData(); body.append("file", file);
          const response = await fetch("/api/admin/upload", { method: "POST", body });
          const asset = await response.json(); if (!response.ok) throw new Error(asset.error);
          setForm(previous => ({ ...previous, logoUrl: asset.url }));
        } catch (error) { setError(error instanceof Error ? error.message : "Upload failed."); }
        finally { setUploading(false); }
      }} /></label>
      {weekId && <label className="wide">Source X reply URL (optional)<input placeholder="https://x.com/.../status/..." value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} /></label>}
    </div>{error && <p role="alert" className="desk-error">{error}</p>}<div className="desk-form-actions"><button className="desk-button primary" disabled={busy || uploading}>{uploading ? "Uploading…" : project ? "Save project" : "Add project"}</button><small>Matching website URLs are deduplicated. Leave the logo empty to use the website favicon.</small></div>
  </form>;
}
