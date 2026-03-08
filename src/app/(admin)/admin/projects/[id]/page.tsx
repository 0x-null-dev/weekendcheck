"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Project {
  id: string;
  slug: string;
  name: string;
  logoUrl: string;
  xProfilePic: string | null;
  founderName: string | null;
  url: string;
  githubUrl: string | null;
  description: string;
  xHandle: string;
  xThreadUrl: string | null;
  tags: string[];
  status: string;
  upvotes: number;
  featured: boolean;
  toolsIUse: boolean;
  bestLastWeek: boolean;
  reviewedAt: string | null;
}

interface Review {
  id: string;
  projectId: string;
  reviewNumber: number;
  text: string;
  loomUrl: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [creatingReview, setCreatingReview] = useState(false);

  async function load() {
    const [projRes, revRes] = await Promise.all([
      fetch(`/api/admin/projects/${id}`),
      fetch(`/api/admin/reviews?projectId=${id}`),
    ]);
    setProject(await projRes.json());
    setReviews(await revRes.json());
  }

  useEffect(() => {
    load();
  }, [id]);

  const isQueue = project?.status === "in_queue";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const fd = new FormData(e.currentTarget);

    const body: Record<string, unknown> = {
      name: fd.get("name"),
      url: fd.get("url"),
      xHandle: fd.get("xHandle"),
      logoUrl: fd.get("logoUrl"),
    };

    // Full fields only for non-queue projects
    if (!isQueue) {
      body.description = fd.get("description");
      body.founderName = fd.get("founderName") || null;
      body.xProfilePic = fd.get("xProfilePic") || null;
      body.githubUrl = fd.get("githubUrl") || null;
      body.xThreadUrl = fd.get("xThreadUrl") || null;
      body.tags = (fd.get("tags") as string)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      body.featured = fd.get("featured") === "on";
      body.bestLastWeek = fd.get("bestLastWeek") === "on";
      body.toolsIUse = fd.get("toolsIUse") === "on";
    }

    await fetch(`/api/admin/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function deleteProject() {
    if (!confirm(`Delete "${project?.name}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    router.push("/admin");
  }

  async function createReview() {
    setCreatingReview(true);
    const res = await fetch("/api/admin/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: id, text: "", published: false }),
    });
    if (res.ok) {
      const { id: newId } = await res.json();
      await load();
      setEditingReview(newId);
    }
    setCreatingReview(false);
  }

  async function saveReview(reviewId: string, data: Partial<Review>) {
    await fetch(`/api/admin/reviews/${reviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    load();
  }

  async function deleteReview(reviewId: string, num: number) {
    if (!confirm(`Delete review #${num}?`)) return;
    await fetch(`/api/admin/reviews/${reviewId}`, { method: "DELETE" });
    load();
  }

  async function togglePublish(review: Review) {
    await saveReview(review.id, { published: !review.published });
  }

  if (!project) {
    return (
      <div className="max-w-3xl">
        <p className="text-sm font-mono text-muted">loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Header with project preview */}
      <div className="flex items-center gap-4 mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.logoUrl}
          alt={project.name}
          width={48}
          height={48}
          className="h-12 w-12 rounded-xl object-contain border border-border"
        />
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-foreground">{project.name}</h1>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs font-mono text-muted">@{project.xHandle}</span>
            <StatusBadge status={project.status} />
            <span className="text-xs font-mono text-muted">▲ {project.upvotes}</span>
          </div>
        </div>
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-accent hover:underline shrink-0"
        >
          visit ↗
        </a>
      </div>

      {/* ===== PROJECT DETAILS FORM ===== */}
      <section className="rounded-lg border border-border p-5 mb-6">
        <h2 className="text-sm font-mono text-muted uppercase tracking-wider mb-4">
          {isQueue ? "project details" : "project details"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field name="name" label="project name" defaultValue={project.name} required />
            <Field name="xHandle" label="x handle" defaultValue={project.xHandle} required />
          </div>
          <Field name="url" label="project url" defaultValue={project.url} type="url" required />
          <Field name="logoUrl" label="logo url" defaultValue={project.logoUrl} required />

          {/* Extended fields for non-queue projects */}
          {!isQueue && (
            <>
              <Field name="description" label="description" defaultValue={project.description} multiline />
              <div className="grid grid-cols-2 gap-4">
                <Field name="founderName" label="founder name" defaultValue={project.founderName || ""} />
                <Field name="xProfilePic" label="founder x profile pic" defaultValue={project.xProfilePic || ""} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field name="githubUrl" label="github url" defaultValue={project.githubUrl || ""} />
                <Field name="xThreadUrl" label="x thread url" defaultValue={project.xThreadUrl || ""} />
              </div>
              <Field
                name="tags"
                label="tags (comma separated)"
                defaultValue={project.tags.join(", ")}
              />

              {/* Flags */}
              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input type="checkbox" name="featured" defaultChecked={project.featured} className="accent-accent" />
                  featured
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input type="checkbox" name="bestLastWeek" defaultChecked={project.bestLastWeek} className="accent-accent" />
                  best last week
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input type="checkbox" name="toolsIUse" defaultChecked={project.toolsIUse} className="accent-accent" />
                  tools i use
                </label>
              </div>
            </>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/80 disabled:opacity-50"
            >
              {saving ? "saving..." : "save changes"}
            </button>
            {saved && <span className="text-xs font-mono text-green">saved!</span>}
            <div className="flex-1" />
            <button
              type="button"
              onClick={deleteProject}
              className="text-xs font-mono text-red-500/60 hover:text-red-500 transition-colors"
            >
              delete project
            </button>
          </div>
        </form>
      </section>

      {/* ===== REVIEWS SECTION (only for non-queue) ===== */}
      {!isQueue && (
        <section className="rounded-lg border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-mono text-muted uppercase tracking-wider">
              reviews
              {reviews.length > 0 && (
                <span className="ml-2 text-foreground">{reviews.length}</span>
              )}
            </h2>
            <button
              onClick={createReview}
              disabled={creatingReview}
              className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent/80 disabled:opacity-50"
            >
              {creatingReview ? "..." : "+ new review"}
            </button>
          </div>

          {reviews.length === 0 ? (
            <p className="text-sm font-mono text-muted py-4 text-center">
              no reviews yet — create one to get started
            </p>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-lg border border-border p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-foreground">
                        review #{String(review.reviewNumber).padStart(3, "0")}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          review.published
                            ? "bg-green/10 text-green"
                            : "bg-yellow-500/10 text-yellow-600"
                        }`}
                      >
                        {review.published ? "published" : "draft"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingReview(editingReview === review.id ? null : review.id)}
                        className="text-xs font-mono text-accent hover:underline"
                      >
                        {editingReview === review.id ? "collapse" : "edit"}
                      </button>
                      <button
                        onClick={() => togglePublish(review)}
                        className="text-xs font-mono text-muted hover:text-foreground transition-colors"
                      >
                        {review.published ? "unpublish" : "publish"}
                      </button>
                      <button
                        onClick={() => deleteReview(review.id, review.reviewNumber)}
                        className="text-xs font-mono text-red-500/60 hover:text-red-500 transition-colors"
                      >
                        delete
                      </button>
                    </div>
                  </div>

                  {editingReview === review.id ? (
                    <ReviewEditor review={review} onSave={(data) => saveReview(review.id, data)} />
                  ) : (
                    <p className="text-xs font-mono text-muted">
                      {review.text ? `${review.text.slice(0, 200)}...` : "(empty)"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function ReviewEditor({ review, onSave }: { review: Review; onSave: (data: Partial<Review>) => void }) {
  const [text, setText] = useState(review.text);
  const [loomUrl, setLoomUrl] = useState(review.loomUrl || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await onSave({ text, loomUrl: loomUrl || null });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-3 mt-3">
      <div>
        <label className="block text-xs font-mono text-muted mb-1">loom embed url</label>
        <input
          value={loomUrl}
          onChange={(e) => setLoomUrl(e.target.value)}
          placeholder="https://www.loom.com/embed/..."
          className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="block text-xs font-mono text-muted mb-1">review text (markdown with ## headings)</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={16}
          className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground font-mono leading-relaxed placeholder:text-muted focus:outline-none focus:border-accent"
          placeholder={`## First Impression\nYour text here...\n\n## What Works\n...\n\n## What Doesn't\n...\n\n## What I'd Build Next\n- Feature 1\n- Feature 2`}
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/80 disabled:opacity-50"
        >
          {saving ? "saving..." : "save review"}
        </button>
        {saved && <span className="text-xs font-mono text-green">saved!</span>}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    in_queue: "bg-muted/10 text-muted",
    in_review: "bg-yellow-500/10 text-yellow-600",
    checked: "bg-green/10 text-green",
    archived: "bg-foreground/5 text-muted",
  };
  const labels: Record<string, string> = {
    in_queue: "queue",
    in_review: "reviewing",
    checked: "reviewed",
    archived: "archived",
  };
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-mono font-medium ${styles[status] || ""}`}>
      {labels[status] || status}
    </span>
  );
}

function Field({
  name,
  label,
  type = "text",
  required = false,
  placeholder,
  multiline = false,
  defaultValue = "",
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  multiline?: boolean;
  defaultValue?: string;
}) {
  const className =
    "w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent";

  return (
    <div>
      <label className="block text-xs font-mono text-muted mb-1">
        {label}
        {required && <span className="text-accent ml-0.5">*</span>}
      </label>
      {multiline ? (
        <textarea
          name={name}
          required={required}
          placeholder={placeholder}
          defaultValue={defaultValue}
          rows={4}
          className={className}
        />
      ) : (
        <input
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className={className}
        />
      )}
    </div>
  );
}
