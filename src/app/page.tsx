import { getPublicData } from "@/lib/public-data";
import { SiteFooter, SiteHeader } from "@/components/mark";
import { WeekBrowser } from "@/components/week-browser";
import Image from "next/image";

export const dynamic = "force-dynamic";
export default async function Home({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  const { currentWeek, weeks, settings } = await getPublicData();
  const requestedWeek = (await searchParams).week;
  const picked = currentWeek?.entries.filter(p => p.track === "quick" || p.track === "deep") || [];
  const reviewedCount = picked.filter(p => p.reviewed).length;
  const profile = `https://x.com/${settings.handle === "0xAlex_dev" ? "0xAlex" : settings.handle || "0xAlex"}`;
  return <><SiteHeader settings={settings} /><main className="alex-home">
    <section className="alex-hero">
      <div className="alex-hero-copy">
        <p className="alex-kicker">0xALEX TRIES INDIE APPS</p>
        <h1>I try indie apps.<strong>Then I say what I think.</strong></h1>
        <p className="alex-lede">I&apos;m Alex, a software engineer from Belgrade with 8+ years of experience. I started in full-stack, found my niche in blockchain, and now spend my free time exploring AI.</p>
        <p className="alex-detail">I use the app, not just the landing page, and share practical feedback for free. If a paid plan is needed to try it properly, I may pay for it myself.</p>
        <a className="alex-text-link" href={profile} target="_blank" rel="noreferrer">Find me on X <span>↗</span></a>
      </div>
      <div className="alex-portrait-wrap">
        <Image className="alex-portrait" src="/0x-alex.png" width={1024} height={1536} priority alt="Pixel-art portrait of Alex working by the sea" />
        <p>Alex / 0xAlex</p>
      </div>
    </section>

    <section id="tries" className="alex-apps"><div className="alex-apps-heading"><p className="alex-kicker">APPS I&apos;VE TRIED</p><h2>Reviews, not promises.</h2><p>{picked.length ? `${reviewedCount} of ${picked.length} selected apps have a published review.` : "New reviews will appear here when they are published."}</p></div><WeekBrowser weeks={weeks} initialWeek={requestedWeek || currentWeek?.slug} /></section>
  </main><SiteFooter settings={settings} /></>;
}
