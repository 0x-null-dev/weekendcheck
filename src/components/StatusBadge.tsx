import { ProjectStatus } from "@/lib/types";

const STATUS_CONFIG: Record<ProjectStatus, { label: string; dotClass: string }> = {
  in_review: { label: "reviewing", dotClass: "bg-yellow" },
  in_queue: { label: "queued", dotClass: "bg-muted/40" },
  checked: { label: "checked", dotClass: "bg-green" },
  archived: { label: "archived", dotClass: "bg-red" },
  watching: { label: "watching", dotClass: "bg-accent" },
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
      {config.label}
    </span>
  );
}
