import Link from "next/link";
import Image from "next/image";
import styles from "./mark.module.css";
import { defaultSettings, type Settings } from "@/lib/editorial";

export function Mark() {
  return <Link href="/" className={styles.logo} aria-label="0xAlex Check home"><Image src="/0x-alex.png" width={32} height={32} alt="Pixel-art portrait of Alex" priority /><i><b>0xAlex</b><br />Check</i></Link>;
}

export function SiteHeader({ settings = defaultSettings }: { settings?: Settings }) {
  const handle = settings.handle || "0xAlex_dev";
  return <header className="site-header alex-header"><Mark /><nav><Link href="/#tries">Projects</Link><a className="header-x" href={`https://x.com/${handle}`} target="_blank" rel="noreferrer">X ↗</a></nav></header>;
}

export function SiteFooter({ settings = defaultSettings }: { settings?: Settings }) {
  const handle = settings.handle || "0xAlex_dev";
  return <footer className="alex-footer"><p>Built with <span role="img" aria-label="love">♥</span> by <a href={`https://x.com/${handle}`} target="_blank" rel="noreferrer">0xAlex</a> · <Link href="/research">Research</Link> · <Link href="/research/privacy">Research privacy</Link></p></footer>;
}
