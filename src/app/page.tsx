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
        <p className="alex-kicker">0xALEX TRIES WHAT PEOPLE BUILD</p>
        <h1>I want to try what you&apos;re building.</h1>
        <p className="alex-lede">I&apos;m Alex, a software engineer from Belgrade, Serbia. I&apos;ve spent 8+ years building software, from full-stack work to blockchain. Now I spend a lot of my free time exploring AI.</p>
        <p className="alex-detail">I want to see what people are actually making, especially with AI. I&apos;ll try some projects, test others more seriously, leave reviews when I have something useful to say, and sometimes pay for access so I can experience the real product. It&apos;s free for you.</p>
        <a className="alex-text-link" href={profile} target="_blank" rel="noreferrer">Find me on X <span>↗</span></a>
      </div>
      <div className="alex-portrait-wrap">
        <Image className="alex-portrait" src="/0x-alex.png" width={1024} height={1536} priority alt="Pixel-art portrait of Alex working by the sea" />
        <p>Alex / 0xAlex</p>
      </div>
    </section>

    <section id="tries" className="alex-apps"><div className="alex-apps-heading"><p className="alex-kicker">WHAT I&apos;VE ACTUALLY TRIED</p><h2>Projects I&apos;ve spent time with.</h2><p>{picked.length ? `${reviewedCount} of ${picked.length} selected projects have a published review.` : "Nothing published yet. When I have something useful to say, it will show up here."}</p></div><WeekBrowser weeks={weeks} initialWeek={requestedWeek || currentWeek?.slug} /></section>
  </main><SiteFooter settings={settings} /></>;
}
