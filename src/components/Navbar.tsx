import Link from "next/link";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-foreground">
            weekend<span className="text-accent">check</span>
          </span>
        </Link>

        <div className="flex items-center gap-6">
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
      </div>
    </nav>
  );
}
