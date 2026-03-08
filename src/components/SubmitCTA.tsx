import Link from "next/link";

export function SubmitCTA() {
  return (
    <section className="relative overflow-hidden bg-foreground py-14 px-6 text-center">
          {/* Hand-drawn sketch decorations */}
          <svg className="absolute top-3 left-4 w-16 h-16 opacity-10" viewBox="0 0 60 60" fill="none">
            <ellipse cx="30" cy="30" rx="26" ry="24" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="4 3" transform="rotate(-5 30 30)" />
          </svg>
          <svg className="absolute bottom-4 right-6 w-20 h-10 opacity-10" viewBox="0 0 80 30" fill="none">
            <path d="M2 15 Q 20 2, 40 14 T 78 12" stroke="#ff6b35" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <svg className="absolute top-4 right-16 opacity-10" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2 L14 9 L21 9 L15 14 L17 21 L12 17 L7 21 L9 14 L3 9 L10 9 Z" stroke="#ff6b35" strokeWidth="1" />
          </svg>

          <p className="relative text-xl font-bold text-background">
            want your project in the pile?
          </p>
          <p className="relative mt-2 text-[15px] text-background/60 max-w-md mx-auto">
            follow{" "}
            <a
              href="https://x.com/0x_null_dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent font-medium hover:underline"
            >
              @0x_null_dev
            </a>{" "}
            on X and DM your project link. no forms, no signups.
          </p>

          <div className="relative flex justify-center gap-3 mt-5">
            <Link
              href="/submit"
              className="rounded-full bg-accent px-5 py-2 text-[15px] font-medium text-background transition-colors hover:bg-accent-hover"
            >
              submit your project →
            </Link>
            <a
              href="https://x.com/0x_null_dev"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full border border-background/20 px-5 py-2 text-[15px] font-medium text-background transition-colors hover:bg-background/10"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              follow on X
            </a>
          </div>
    </section>
  );
}
