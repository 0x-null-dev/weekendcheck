"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

interface Project {
  id: string;
  slug: string;
  name: string;
  logoUrl: string;
  xHandle: string;
  url: string;
  description: string;
  status: string;
  upvotes: number;
  queueOrder: number;
  featured: boolean;
  bestLastWeek: boolean;
  toolsIUse: boolean;
  tags: string[];
  createdAt: string;
  reviewedAt: string | null;
}

type Tab = "all" | "in_queue" | "in_review" | "checked" | "archived";
type SortKey = "order" | "upvotes" | "name";
type SortDir = "asc" | "desc";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [allQueueIds, setAllQueueIds] = useState<string[]>([]);
  const [tab, setTab] = useState<Tab>("in_queue");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [orderValue, setOrderValue] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("order");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  async function load() {
    setLoading(true);
    const url = tab === "all" ? "/api/admin/projects" : `/api/admin/projects?status=${tab}`;
    const res = await fetch(url);
    if (res.ok) setProjects(await res.json());

    // Always load queue IDs for reordering
    const queueRes = await fetch("/api/admin/projects?status=in_queue");
    if (queueRes.ok) {
      const queueData = await queueRes.json();
      setAllQueueIds(queueData.map((p: Project) => p.id));
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
    // Default sort: queue tab → order asc, others → name asc
    if (tab === "in_queue") {
      setSortKey("order");
      setSortDir("asc");
    } else {
      setSortKey("name");
      setSortDir("asc");
    }
  }, [tab]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "upvotes" ? "desc" : "asc");
    }
  }

  const filtered = useMemo(() => {
    let list = search
      ? projects.filter(
          (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.xHandle.toLowerCase().includes(search.toLowerCase())
        )
      : [...projects];

    // Sort
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "order") {
        cmp = a.queueOrder - b.queueOrder;
      } else if (sortKey === "upvotes") {
        cmp = a.upvotes - b.upvotes;
      } else if (sortKey === "name") {
        cmp = a.name.localeCompare(b.name);
      }
      return sortDir === "desc" ? -cmp : cmp;
    });

    return list;
  }, [projects, search, sortKey, sortDir]);

  async function deleteProject(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    load();
  }

  async function handleOrderSubmit(projectId: string) {
    const newPos = parseInt(orderValue);
    if (isNaN(newPos) || newPos < 1) {
      setEditingOrder(null);
      return;
    }

    const currentIndex = allQueueIds.indexOf(projectId);
    if (currentIndex === -1) {
      setEditingOrder(null);
      return;
    }

    const targetIndex = Math.max(0, Math.min(newPos - 1, allQueueIds.length - 1));
    if (targetIndex === currentIndex) {
      setEditingOrder(null);
      return;
    }

    const newOrder = [...allQueueIds];
    newOrder.splice(currentIndex, 1);
    newOrder.splice(targetIndex, 0, projectId);

    await fetch("/api/admin/projects/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: newOrder }),
    });

    setEditingOrder(null);
    load();
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "all" },
    { key: "in_queue", label: "queue" },
    { key: "in_review", label: "reviewing" },
    { key: "checked", label: "checked" },
    { key: "archived", label: "archived" },
  ];

  const showOrderCol = tab === "in_queue" || tab === "all";

  function SortHeader({ label, sortBy, align = "left" }: { label: string; sortBy: SortKey; align?: "left" | "center" }) {
    const active = sortKey === sortBy;
    const arrow = active ? (sortDir === "asc" ? " ↑" : " ↓") : "";
    return (
      <th
        className={`text-${align} text-[11px] font-mono uppercase tracking-wider px-4 py-2.5 cursor-pointer select-none transition-colors ${
          active ? "text-accent" : "text-muted hover:text-foreground"
        }`}
        onClick={() => toggleSort(sortBy)}
      >
        {label}{arrow}
      </th>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-foreground">projects</h1>
        <Link
          href="/admin/projects/new"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/80"
        >
          + add project
        </Link>
      </div>

      {/* Tabs + Search */}
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="flex gap-1 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-2 text-xs font-mono transition-colors border-b-2 -mb-px ${
                tab === t.key
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="search projects..."
          className="w-56 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
        />
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-sm text-muted font-mono py-8 text-center">loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted font-mono py-8 text-center">no projects found</p>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface/50">
                {showOrderCol && (
                  <SortHeader label="#" sortBy="order" align="center" />
                )}
                <SortHeader label="project" sortBy="name" />
                <th className="text-left text-[11px] font-mono text-muted uppercase tracking-wider px-4 py-2.5">
                  status
                </th>
                <th className="text-left text-[11px] font-mono text-muted uppercase tracking-wider px-4 py-2.5">
                  tags
                </th>
                <SortHeader label="▲" sortBy="upvotes" align="center" />
                <th className="text-right text-[11px] font-mono text-muted uppercase tracking-wider px-4 py-2.5">
                  actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const queuePos = p.status === "in_queue" ? allQueueIds.indexOf(p.id) + 1 : null;

                return (
                  <tr
                    key={p.id}
                    className="border-b border-border last:border-b-0 hover:bg-surface/30 transition-colors"
                  >
                    {showOrderCol && (
                      <td className="px-3 py-3 text-center">
                        {queuePos ? (
                          editingOrder === p.id ? (
                            <input
                              autoFocus
                              type="number"
                              min={1}
                              max={allQueueIds.length}
                              value={orderValue}
                              onChange={(e) => setOrderValue(e.target.value)}
                              onBlur={() => handleOrderSubmit(p.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleOrderSubmit(p.id);
                                if (e.key === "Escape") setEditingOrder(null);
                              }}
                              className="w-10 text-center text-xs font-mono bg-surface border border-accent rounded px-1 py-0.5 text-foreground focus:outline-none"
                            />
                          ) : (
                            <button
                              onClick={() => {
                                setEditingOrder(p.id);
                                setOrderValue(String(queuePos));
                              }}
                              className="text-xs font-mono text-muted hover:text-accent hover:underline transition-colors"
                              title="Click to set queue position"
                            >
                              {queuePos}
                            </button>
                          )
                        ) : (
                          <span className="text-xs font-mono text-muted/30">—</span>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.logoUrl}
                          alt={p.name}
                          width={24}
                          height={24}
                          className="h-6 w-6 rounded object-contain shrink-0"
                        />
                        <div className="min-w-0">
                          <Link
                            href={`/admin/projects/${p.id}`}
                            className="text-sm font-medium text-foreground hover:text-accent transition-colors truncate block"
                          >
                            {p.name}
                          </Link>
                          <span className="text-[11px] font-mono text-muted">
                            @{p.xHandle}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-mono text-muted bg-surface px-1.5 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-xs font-mono text-muted">
                      {p.upvotes}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/projects/${p.id}`}
                          className="text-[11px] font-mono text-accent hover:underline"
                        >
                          edit
                        </Link>
                        <button
                          onClick={() => deleteProject(p.id, p.name)}
                          className="text-[11px] font-mono text-red-500/60 hover:text-red-500 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
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
    checked: "checked",
    archived: "archived",
  };
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-mono font-medium ${styles[status] || ""}`}>
      {labels[status] || status}
    </span>
  );
}
