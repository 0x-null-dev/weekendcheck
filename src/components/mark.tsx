import Link from "next/link";
import Image from "next/image";
import { defaultSettings, type Settings } from "@/lib/editorial";

export function Mark() {
  return <Link href="/" className="mark alex-mark" aria-label="0xAlex Check home"><Image src="/0x-alex.png" width={42} height={42} alt="Pixel-art portrait of Alex" priority /><i><b>0xAlex</b><br />Check</i></Link>;
}

export function SiteHeader({ settings = defaultSettings }: { settings?: Settings }) {
  const handle = settings.handle === "0xAlex_dev" ? "0xAlex" : settings.handle || "0xAlex";
  return <header className="site-header alex-header"><Mark /><nav><Link href="/#tries">Projects</Link><a className="header-x" href={`https://x.com/${handle}`} target="_blank" rel="noreferrer">X ↗</a></nav></header>;
}

export function SiteFooter({ settings = defaultSettings }: { settings?: Settings }) {
  const handle = settings.handle === "0xAlex_dev" ? "0xAlex" : settings.handle || "0xAlex";
  return <footer className="alex-footer"><p><b>0xAlex Check</b> — free, practical feedback for indie builders.</p><a href={`https://x.com/${handle}`} target="_blank" rel="noreferrer">@0xAlex on X ↗</a></footer>;
}
