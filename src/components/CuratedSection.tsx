import { Project } from "@/lib/types";

interface CuratedSectionProps {
  title: string;
  subtitle?: string;
  projects: Project[];
  variant?: "default" | "picks" | "tools";
}

export function CuratedSection({ title, subtitle, projects, variant = "default" }: CuratedSectionProps) {
  if (projects.length === 0) return null;

  return (
    <section className="py-8">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          {subtitle && (
            <p className="text-sm text-muted">{subtitle}</p>
          )}
        </div>

        {variant === "tools" ? (
          <ToolsGrid projects={projects} />
        ) : variant === "picks" ? (
          <PicksRow projects={projects} />
        ) : (
          <BestOfRow projects={projects} />
        )}
      </div>
    </section>
  );
}

function BestOfRow({ projects }: { projects: Project[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {projects.map((project, i) => (
        <a
          key={project.id}
          href={`/project/${project.slug}`}
          className="group relative bg-surface p-4 transition-all hover:shadow-md"
          style={{
            border: "1.5px solid #1a1a1a",
            borderRadius: "2px",
            boxShadow: "3px 3px 0 #e5e5e5",
            transform: `rotate(${(i % 2 === 0 ? -1 : 1) * (0.5 + i * 0.3)}deg)`,
          }}
        >
          {/* Trophy/medal for rank */}
          <span className="absolute -top-2 -right-2 text-[15px]">
            {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "⭐"}
          </span>

          <div className="flex flex-col items-center text-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.logo_url}
              alt={project.name}
              width={36}
              height={36}
              className="h-9 w-9 rounded-lg object-contain"
            />
            <div>
              <h3 className="text-[15px] font-bold text-foreground group-hover:text-accent transition-colors">
                {project.name}
              </h3>
              <p className="font-mono text-[13px] text-muted">@{project.x_handle}</p>
            </div>
            <div className="flex items-center gap-1 text-accent">
              <span className="text-sm">▲</span>
              <span className="font-mono text-[15px] font-bold">{project.upvotes}</span>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

function PicksRow({ projects }: { projects: Project[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {projects.map((project) => (
        <a
          key={project.id}
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group sketch-border-light bg-surface p-3.5 transition-all hover:shadow-sm"
        >
          <div className="flex items-start gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.logo_url}
              alt={project.name}
              width={28}
              height={28}
              className="h-7 w-7 rounded object-contain mt-0.5"
            />
            <div className="min-w-0">
              <h3 className="text-[15px] font-medium text-foreground group-hover:text-accent transition-colors truncate">
                {project.name}
              </h3>
              <p className="font-mono text-[13px] text-muted">@{project.x_handle}</p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {project.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="rounded-sm bg-accent/8 px-1.5 py-0.5 text-[11px] text-accent font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

function ToolsGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {projects.map((project) => (
        <a
          key={project.id}
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2.5 bg-surface px-4 py-2.5 transition-all hover:shadow-sm"
          style={{
            border: "1.5px solid #e5e5e5",
            borderRadius: "2px",
            boxShadow: "2px 2px 0 #e5e5e5",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.logo_url}
            alt={project.name}
            width={24}
            height={24}
            className="h-6 w-6 rounded object-contain"
          />
          <span className="text-[15px] font-medium text-foreground group-hover:text-accent transition-colors">
            {project.name}
          </span>
          <span className="text-[12px] text-muted">↗</span>
        </a>
      ))}
    </div>
  );
}
