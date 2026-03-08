"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

function getBreadcrumbs(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];
  let path = "";

  for (const part of parts) {
    path += `/${part}`;
    if (part === "admin" && crumbs.length === 0) {
      crumbs.push({ label: "dashboard", href: "/admin" });
    } else if (part === "projects") {
      crumbs.push({ label: "projects", href: "/admin/projects" });
    } else if (part === "reviews") {
      crumbs.push({ label: "reviews", href: path });
    } else if (part === "new") {
      crumbs.push({ label: "new", href: path });
    } else if (part === "api-docs") {
      crumbs.push({ label: "api docs", href: path });
    } else if (part !== "admin") {
      crumbs.push({ label: part.slice(0, 8) + "...", href: path });
    }
  }

  return crumbs;
}

function getPageTitle(pathname: string): string {
  if (pathname === "/admin") return "dashboard";
  if (pathname === "/admin/projects") return "projects";
  if (pathname === "/admin/projects/new") return "add project";
  if (pathname === "/admin/api-docs") return "api docs";
  if (pathname.match(/\/admin\/projects\/[^/]+\/reviews$/)) return "reviews";
  if (pathname.match(/\/admin\/projects\/[^/]+$/)) return "edit project";
  return "admin";
}

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const crumbs = getBreadcrumbs(pathname);
  const title = getPageTitle(pathname);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 backdrop-blur-sm px-6">
      {/* Left: breadcrumbs */}
      <div>
        <nav className="flex items-center gap-1.5 text-[11px] font-mono text-muted">
          {crumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1.5">
              {i > 0 && <span>/</span>}
              {i === crumbs.length - 1 ? (
                <span className="text-foreground font-medium">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="hover:text-foreground transition-colors">
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Right: profile */}
      <div className="flex items-center gap-4">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-mono text-muted hover:text-foreground transition-colors"
        >
          view site ↗
        </a>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-full bg-accent/20 flex items-center justify-center">
            <span className="text-[10px] font-bold text-accent">0x</span>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-foreground leading-none">0xNull</p>
            <button
              onClick={handleLogout}
              className="text-[10px] font-mono text-muted hover:text-red-400 transition-colors"
            >
              logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
