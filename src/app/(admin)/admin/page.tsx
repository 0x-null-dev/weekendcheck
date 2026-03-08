"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Project {
  id: string;
  slug: string;
  name: string;
  logoUrl: string;
  xHandle: string;
  url: string;
  status: string;
  upvotes: number;
  queueOrder: number;
  createdAt: string;
  reviewedAt: string | null;
}

interface Stats {
  total: number;
  inQueue: number;
  inReview: number;
  checked: number;
}

export default function AdminDashboard() {
  const [inReview, setInReview] = useState<Project | null>(null);
  const [queue, setQueue] = useState<Project[]>([]);
  const [reviewed, setReviewed] = useState<Project[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const [showAllQueue, setShowAllQueue] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [reviewRes, queueRes, checkedRes] = await Promise.all([
      fetch("/api/admin/projects?status=in_review"),
      fetch("/api/admin/projects?status=in_queue"),
      fetch("/api/admin/projects?status=checked"),
    ]);
    const reviewData = await reviewRes.json();
    const queueData = await queueRes.json();
    const checkedData = await checkedRes.json();

    setInReview(reviewData[0] || null);
    setQueue(queueData);
    setReviewed(checkedData);
    setStats({
      total: reviewData.length + queueData.length + checkedData.length,
      inQueue: queueData.length,
      inReview: reviewData.length,
      checked: checkedData.length,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  async function startReviewing(id: string, name: string) {
    if (!confirm(`Start reviewing "${name}"?`)) return;
    await fetch(`/api/admin/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "in_review" }),
    });
    await load();
  }

  async function finishReview() {
    if (!confirm("Finish current review and promote next in queue?")) return;
    setFinishing(true);
    await fetch("/api/admin/projects/finish-review", { method: "POST" });
    await load();
    setFinishing(false);
  }

  async function saveQueueOrder(newQueue: Project[]) {
    setQueue(newQueue);
    await fetch("/api/admin/projects/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: newQueue.map((p) => p.id) }),
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = queue.findIndex((p) => p.id === active.id);
    const newIndex = queue.findIndex((p) => p.id === over.id);
    const newQueue = arrayMove(queue, oldIndex, newIndex);
    saveQueueOrder(newQueue);
  }

  async function handlePositionChange(projectId: string, newPos: number) {
    const currentIndex = queue.findIndex((p) => p.id === projectId);
    if (currentIndex === -1) return;
    const targetIndex = Math.max(0, Math.min(newPos - 1, queue.length - 1));
    if (targetIndex === currentIndex) return;

    const newQueue = arrayMove(queue, currentIndex, targetIndex);
    saveQueueOrder(newQueue);
  }

  async function deleteProject(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    load();
  }

  if (loading) {
    return (
      <div className="max-w-5xl py-8 text-center">
        <p className="text-sm font-mono text-muted">loading...</p>
      </div>
    );
  }

  const visibleQueue = showAllQueue ? queue : queue.slice(0, 10);

  return (
    <div className="max-w-5xl">
      {/* ===== STATS ===== */}
      {stats && (
        <div className="grid grid-cols-4 gap-3 mb-8">
          <StatCard label="total" value={stats.total} />
          <StatCard label="in queue" value={stats.inQueue} color="accent" />
          <StatCard label="reviewing" value={stats.inReview} color="yellow" />
          <StatCard label="reviewed" value={stats.checked} color="green" />
        </div>
      )}

      {/* ===== CURRENTLY REVIEWING ===== */}
      <section className="mb-10">
        <h2 className="text-sm font-mono text-muted uppercase tracking-wider mb-3">
          currently reviewing
        </h2>
        {inReview ? (
          <div className="rounded-xl border-2 border-yellow-500/30 bg-yellow-500/5 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={inReview.logoUrl}
                  alt={inReview.name}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-xl object-contain border border-border"
                />
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {inReview.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs font-mono text-muted">
                      @{inReview.xHandle}
                    </span>
                    <span className="text-xs font-mono text-muted">
                      ▲ {inReview.upvotes}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/projects/${inReview.id}`}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-mono text-foreground hover:border-accent hover:text-accent transition-colors"
                >
                  open
                </Link>
                <button
                  onClick={finishReview}
                  disabled={finishing}
                  className="rounded-lg bg-green px-4 py-1.5 text-xs font-bold text-background transition-colors hover:bg-green/80 disabled:opacity-50"
                >
                  {finishing ? "..." : "finish review"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-6 text-center">
            <p className="text-sm text-muted mb-1">nothing being reviewed right now</p>
            {queue.length > 0 ? (
              <button
                onClick={() => startReviewing(queue[0].id, queue[0].name)}
                className="mt-2 rounded-lg bg-accent px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-accent/80"
              >
                start reviewing {queue[0].name} →
              </button>
            ) : (
              <p className="text-xs font-mono text-muted/60">
                add projects to the queue to get started
              </p>
            )}
          </div>
        )}
      </section>

      {/* ===== QUEUE ===== */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-mono text-muted uppercase tracking-wider">
            queue
            {queue.length > 0 && (
              <span className="ml-2 text-accent">{queue.length}</span>
            )}
          </h2>
          <Link
            href="/admin/projects/new"
            className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent/80"
          >
            + add project
          </Link>
        </div>

        {queue.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center">
            <p className="text-sm text-muted">queue is empty</p>
          </div>
        ) : (
          <>
            <p className="text-[11px] font-mono text-muted/50 mb-2">
              drag to reorder or click position number to set
            </p>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={visibleQueue.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1">
                  {visibleQueue.map((p, i) => (
                    <SortableQueueItem
                      key={p.id}
                      project={p}
                      index={i}
                      total={queue.length}
                      onPositionChange={handlePositionChange}
                      onDelete={deleteProject}
                      isFirst={i === 0 && !inReview}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {queue.length > 10 && (
              <button
                onClick={() => setShowAllQueue(!showAllQueue)}
                className="mt-3 w-full rounded-lg border border-border py-2 text-xs font-mono text-muted hover:text-foreground hover:border-accent/30 transition-colors"
              >
                {showAllQueue
                  ? "show less"
                  : `show all ${queue.length} projects`}
              </button>
            )}
          </>
        )}
      </section>

      {/* ===== ALREADY REVIEWED ===== */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-mono text-muted uppercase tracking-wider">
            already reviewed
            {reviewed.length > 0 && (
              <span className="ml-2 text-green">{reviewed.length}</span>
            )}
          </h2>
          {reviewed.length > 6 && (
            <Link
              href="/admin/projects"
              className="text-xs font-mono text-accent hover:underline"
            >
              view all →
            </Link>
          )}
        </div>

        {reviewed.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center">
            <p className="text-sm text-muted">no reviewed projects yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {reviewed.slice(0, 6).map((p) => (
              <Link
                key={p.id}
                href={`/admin/projects/${p.id}`}
                className="group rounded-lg border border-border p-4 hover:border-accent/30 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.logoUrl}
                    alt={p.name}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-lg object-contain"
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-foreground truncate group-hover:text-accent transition-colors">
                      {p.name}
                    </h3>
                    <span className="text-[11px] font-mono text-muted">
                      @{p.xHandle}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-mono text-muted">
                  <span>▲ {p.upvotes}</span>
                  {p.reviewedAt && (
                    <span>
                      reviewed{" "}
                      {new Date(p.reviewedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ===== Sortable Queue Item =====
function SortableQueueItem({
  project,
  index,
  total,
  onPositionChange,
  onDelete,
  isFirst,
}: {
  project: Project;
  index: number;
  total: number;
  onPositionChange: (id: string, newPos: number) => void;
  onDelete: (id: string, name: string) => void;
  isFirst: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: project.id });

  const [editingPos, setEditingPos] = useState(false);
  const [posValue, setPosValue] = useState("");

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  function handlePosSubmit() {
    const num = parseInt(posValue);
    if (!isNaN(num) && num >= 1 && num <= total) {
      onPositionChange(project.id, num);
    }
    setEditingPos(false);
    setPosValue("");
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
        isFirst
          ? "border-accent/30 bg-accent/5"
          : "border-border bg-surface/30 hover:border-accent/20"
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted hover:text-foreground transition-colors shrink-0 touch-none"
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="5" cy="3" r="1.5" />
          <circle cx="11" cy="3" r="1.5" />
          <circle cx="5" cy="8" r="1.5" />
          <circle cx="11" cy="8" r="1.5" />
          <circle cx="5" cy="13" r="1.5" />
          <circle cx="11" cy="13" r="1.5" />
        </svg>
      </button>

      {/* Position number (clickable) */}
      {editingPos ? (
        <input
          autoFocus
          type="number"
          min={1}
          max={total}
          value={posValue}
          onChange={(e) => setPosValue(e.target.value)}
          onBlur={handlePosSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") handlePosSubmit();
            if (e.key === "Escape") { setEditingPos(false); setPosValue(""); }
          }}
          className="w-8 text-center text-xs font-mono bg-surface border border-accent rounded px-1 py-0.5 text-foreground focus:outline-none"
        />
      ) : (
        <button
          onClick={() => { setEditingPos(true); setPosValue(String(index + 1)); }}
          className="w-5 text-center text-xs font-mono text-muted hover:text-accent hover:underline transition-colors shrink-0"
          title="Click to set position"
        >
          {index + 1}
        </button>
      )}

      {/* Project info */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={project.logoUrl}
        alt={project.name}
        width={28}
        height={28}
        className="h-7 w-7 rounded-lg object-contain shrink-0"
      />
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-foreground truncate block">
          {project.name}
        </span>
        <span className="text-[11px] font-mono text-muted">@{project.xHandle}</span>
      </div>

      {/* Next up badge */}
      {isFirst && (
        <span className="text-[9px] font-mono bg-accent/15 text-accent px-2 py-0.5 rounded shrink-0">
          next up
        </span>
      )}

      {/* Upvotes */}
      <span className="text-xs font-mono text-muted shrink-0">▲ {project.upvotes}</span>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link
          href={`/admin/projects/${project.id}`}
          className="text-[11px] font-mono text-accent hover:underline"
        >
          edit
        </Link>
        <button
          onClick={() => onDelete(project.id, project.name)}
          className="text-[11px] font-mono text-red-500/60 hover:text-red-500 transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: "accent" | "green" | "yellow";
}) {
  const valueColor =
    color === "accent"
      ? "text-accent"
      : color === "green"
        ? "text-green"
        : color === "yellow"
          ? "text-yellow-500"
          : "text-foreground";

  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-[10px] font-mono text-muted uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
    </div>
  );
}
