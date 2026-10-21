import Image from "next/image";
import Link from "next/link";
import { xHandle } from "@/lib/site";

export function SiteFooter() {
  return <footer className="site-footer">
    <div className="footer-intro">
      <Link href="/" className="brand"><Image className="face" src="/0x-alex.png" width={34} height={34} alt="" /><span>0xAlex Check</span></Link>
      <p>I try indie apps and AI projects, sometimes pay for the real product, and write up what I find.</p>
    </div>
    <nav className="footer-links" aria-label="Footer">
      <div><span className="label">Site</span><Link href="/#weeks">Weekly checks</Link><Link href="/reviews">Reviews</Link><Link href="/budget">Budget</Link><Link href="/contact">Contact</Link></div>
      <div><span className="label">Elsewhere</span><a href={`https://x.com/${xHandle}`} target="_blank" rel="noreferrer">X · @{xHandle} ↗</a></div>
      <div><span className="label">Legal</span><Link href="/privacy">Privacy</Link><Link href="/research">Research tool</Link></div>
    </nav>
    <p className="footer-base label">© {new Date().getFullYear()} 0xAlex · Made in Europe</p>
  </footer>;
}
