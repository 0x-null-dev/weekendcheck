import { Project } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

export function ProjectCard({ project, showUpvotes = true }: { project: Project; showUpvotes?: boolean }) {
  const href = project.status === "checked" ? `/project/${project.slug}` : project.url;
  const isExternal = project.status !== "checked";

  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="group flex items-center gap-3 sketch-border-light bg-surface px-3.5 py-3 transition-all hover:shadow-sm"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={project.logo_url}
        alt={project.name}
        width={28}
        height={28}
        className="h-7 w-7 rounded object-contain"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-foreground truncate group-hover:text-accent transition-colors">
            {project.name}
          </h3>
          <StatusBadge status={project.status} />
        </div>
        <p className="text-xs text-muted">@{project.x_handle}</p>
      </div>
      {showUpvotes && (
        <div className="flex flex-col items-center px-2 py-0.5 text-center">
          <span className="text-[10px] text-muted">▲</span>
          <span className="text-xs font-medium text-foreground">{project.upvotes}</span>
        </div>
      )}
    </a>
  );
}
