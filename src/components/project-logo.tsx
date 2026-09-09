"use client";

import { useState } from "react";
import type { Project } from "@/lib/demo-data";

export function ProjectLogo({ project }: { project: Pick<Project, "name" | "url" | "logoUrl"> }) {
  const [failedSource, setFailedSource] = useState<string>();
  let hostname = "";
  try { hostname = new URL(project.url).hostname; } catch { /* Use initials without a valid URL. */ }
  const source = project.logoUrl || (hostname && hostname !== "example.com"
    ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=128`
    : undefined);
  const initials = project.name.split(/\s+/).slice(0, 2).map(word => word[0]).join("");

  return <span className="project-logo">
    {source && failedSource !== source ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={source} alt={`${project.name} logo`} width={48} height={48} onError={() => setFailedSource(source)} />
    ) : <span aria-label={project.name}>{initials}</span>}
  </span>;
}
