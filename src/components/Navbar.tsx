"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-foreground">
            weekend<span className="text-accent">check</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/queue"
            className="font-mono text-[15px] text-muted transition-colors hover:text-foreground"
          >
            /queue
          </Link>
          <Link
            href="/checked"
            className="font-mono text-[15px] text-muted transition-colors hover:text-foreground"
          >
            /checked
          </Link>
          <Link
            href="/submit"
            className="rounded-full border border-foreground bg-foreground px-4 py-1.5 text-[15px] font-medium text-background transition-colors hover:bg-transparent hover:text-foreground"
          >
            submit your project
          </Link>
        </div>

        {/* Hamburger button */}
        <button
          onClick={() => setOpen(!open)}
          className="relative z-50 flex h-8 w-8 flex-col items-center justify-center gap-1.5 md:hidden"
          aria-label="Toggle menu"
        >
          <span
            className={`h-0.5 w-5 transition-all duration-300 ${
              open ? "translate-y-2 rotate-45 bg-gray-900" : "bg-foreground"
            }`}
          />
          <span
            className={`h-0.5 w-5 transition-all duration-300 ${
              open ? "bg-gray-900 opacity-0" : "bg-foreground"
            }`}
          />
          <span
            className={`h-0.5 w-5 transition-all duration-300 ${
              open ? "-translate-y-2 -rotate-45 bg-gray-900" : "bg-foreground"
            }`}
          />
        </button>
      </div>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 flex h-dvh w-full flex-col bg-white transition-transform duration-300 md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mt-16 flex flex-col gap-2 px-6">
          <Link
            href="/queue"
            className={`rounded-lg px-4 py-3 font-mono text-base transition-colors ${
              pathname === "/queue"
                ? "bg-orange-50 text-accent"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            /queue
          </Link>
          <Link
            href="/checked"
            className={`rounded-lg px-4 py-3 font-mono text-base transition-colors ${
              pathname === "/checked"
                ? "bg-orange-50 text-accent"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            /checked
          </Link>
          <div className="my-2 border-t border-gray-200" />
          <Link
            href="/submit"
            className="rounded-full bg-gray-900 px-4 py-3 text-center text-base font-medium text-white transition-colors hover:bg-gray-700"
          >
            submit your project
          </Link>
        </div>
      </div>
    </nav>
  );
}
