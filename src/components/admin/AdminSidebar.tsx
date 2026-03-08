"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS: { href: string; label: string; icon: string }[] = [
  { href: "/admin", label: "dashboard", icon: "◆" },
  { href: "/admin/projects", label: "projects", icon: "▦" },
  { href: "/admin/api-docs", label: "api docs", icon: "{ }" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-56 flex-col bg-[#141414] border-r border-white/5">
      {/* Logo */}
      <div className="px-5 py-5">
        <Link href="/admin" className="block">
          <span className="text-base font-bold text-white tracking-tight">
            weekend<span className="text-accent">check</span>
          </span>
          <span className="block text-[10px] font-mono text-white/30 mt-0.5 uppercase tracking-widest">
            admin
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors mb-0.5 ${
                active
                  ? "bg-accent/10 text-accent font-medium"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              <span className="text-xs w-4 text-center font-mono">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
