import Link from "next/link";
import { defaultSettings, type Settings } from "@/lib/editorial";

export function Mark() {
  return <Link href="/" className="mark" aria-label="WeekendCheck home"><span>W</span><i>Weekend<br />Check</i></Link>;
}

export function SiteHeader({ settings = defaultSettings }: { settings?: Settings }) {
  return <header className="site-header"><Mark /><nav><Link href="/#weeks">Weeks</Link><Link href="/reviews">Reviews</Link><a href={`https://x.com/${settings.handle}`} target="_blank" rel="noreferrer">Follow on X ↗</a></nav></header>;
}

export function SiteFooter({ settings = defaultSettings }: { settings?: Settings }) {
  return <footer style={{ display: "flex", justifyContent: "center", alignItems: "center", textAlign: "center" }}><p>Built with <span role="img" aria-label="love" style={{ color: "#dc2626" }}>♥</span> by <a href={`https://x.com/${settings.handle}`} target="_blank" rel="noreferrer">{settings.name}</a></p></footer>;
}
