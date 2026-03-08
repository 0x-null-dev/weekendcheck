"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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

interface Project {
  id: string;
  name: string;
  slug: string;
}

export default function ManageReviews() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

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

  async function createReview() {
    setCreating(true);
    const res = await fetch("/api/admin/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: id, text: "", published: false }),
    });
    if (res.ok) {
      const { id: newId } = await res.json();
      await load();
      setEditing(newId);
    }
    setCreating(false);
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-foreground">
          reviews: {project.name}
        </h1>
        <button
          onClick={createReview}
          disabled={creating}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/80 disabled:opacity-50"
        >
          {creating ? "..." : "+ new review"}
        </button>
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm font-mono text-muted">no reviews yet</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-lg border border-border p-5"
            >
              <div className="flex items-center justify-between mb-3">
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
                    onClick={() =>
                      setEditing(editing === review.id ? null : review.id)
                    }
                    className="text-xs font-mono text-accent hover:underline"
                  >
                    {editing === review.id ? "collapse" : "edit"}
                  </button>
                  <button
                    onClick={() => togglePublish(review)}
                    className="text-xs font-mono text-muted hover:text-foreground transition-colors"
                  >
                    {review.published ? "unpublish" : "publish"}
                  </button>
                  <button
                    onClick={() =>
                      deleteReview(review.id, review.reviewNumber)
                    }
                    className="text-xs font-mono text-red-500 hover:text-red-400 transition-colors"
                  >
                    delete
                  </button>
                </div>
              </div>

              {editing === review.id ? (
                <ReviewEditor
                  review={review}
                  onSave={(data) => saveReview(review.id, data)}
                />
              ) : (
                <p className="text-xs font-mono text-muted">
                  {review.text
                    ? `${review.text.slice(0, 150)}...`
                    : "(empty)"}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewEditor({
  review,
  onSave,
}: {
  review: Review;
  onSave: (data: Partial<Review>) => void;
}) {
  const [text, setText] = useState(review.text);
  const [loomUrl, setLoomUrl] = useState(review.loomUrl || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await onSave({
      text,
      loomUrl: loomUrl || null,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-3 mt-3">
      <div>
        <label className="block text-xs font-mono text-muted mb-1">
          loom embed url
        </label>
        <input
          value={loomUrl}
          onChange={(e) => setLoomUrl(e.target.value)}
          placeholder="https://www.loom.com/embed/..."
          className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="block text-xs font-mono text-muted mb-1">
          review text (markdown with ## headings)
        </label>
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
        {saved && (
          <span className="text-xs font-mono text-green">saved!</span>
        )}
      </div>
    </div>
  );
}
