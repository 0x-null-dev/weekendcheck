import { Project } from "@/lib/types";

export function InReviewHero({ project }: { project: Project }) {
  return (
    <section className="pt-16 pb-10">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-col items-center text-center">
          {/* Status line */}
          <div className="flex items-center gap-2 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            <span className="font-mono text-sm text-accent uppercase tracking-widest">
              currently reviewing
            </span>
          </div>

          {/* Logo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.logo_url}
            alt={project.name}
            width={56}
            height={56}
            className="mb-4 h-14 w-14 rounded-xl object-contain"
          />

          {/* Name */}
          <h2 className="mb-1.5 text-3xl font-bold text-foreground">
            {project.name}
          </h2>

          {/* Handle */}
          <a
            href={`https://x.com/${project.x_handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[15px] text-muted hover:text-accent"
          >
            @{project.x_handle}
          </a>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-2.5 py-0.5 text-[13px] text-muted"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Arrow */}
          <p className="mt-6 text-sm text-muted">↓ up next from the pile</p>
        </div>
      </div>
    </section>
  );
}
