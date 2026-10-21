"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/#weeks", label: "Checks", active: (path: string) => path === "/", optional: true },
  { href: "/reviews", label: "Reviews", active: (path: string) => path === "/reviews" || path.startsWith("/projects/") },
  { href: "/budget", label: "Budget", active: (path: string) => path === "/budget" },
];

export function SiteHeader() {
  const pathname = usePathname();
  return <header className="site-bar">
    <Link href="/" className="brand" aria-label="0xAlex Check home"><Image className="face" src="/0x-alex.png" width={34} height={34} alt="" priority /><span>0xAlex Check</span></Link>
    <nav aria-label="Main">
      {links.map(link => <Link key={link.href} href={link.href} className={link.optional ? "optional" : undefined} aria-current={link.active(pathname) ? "page" : undefined}>{link.label}</Link>)}
      <Link href="/contact" className="btn btn-small" aria-current={pathname === "/contact" ? "page" : undefined}>Contact</Link>
    </nav>
  </header>;
}
