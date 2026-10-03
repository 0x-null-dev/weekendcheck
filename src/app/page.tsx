import { formatWeekRange } from "@/lib/demo-data";
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
  const shareUrl = currentWeek?.callUrl || `https://x.com/intent/tweet?text=${encodeURIComponent("@0xAlex I built something you might want to try:")}`;
  return <><SiteHeader settings={settings} /><main className="alex-home">
    <section className="alex-hero">
      <div className="alex-hero-copy">
        <p className="alex-kicker"><span /> FREE FOR INDIE BUILDERS</p>
        <h1>I&apos;ll try<br />your app.<strong>For real.</strong></h1>
        <p className="alex-lede">I&apos;m Alex — a software engineer from Belgrade. Send me what you&apos;re building and I&apos;ll use it, think about it, and share practical feedback.</p>
        <div className="alex-actions"><a className="alex-button" href={shareUrl} target="_blank" rel="noreferrer">Share your app on X <span>↗</span></a><a className="alex-text-link" href="#how-it-works">What happens next <span>↓</span></a></div>
        <p className="alex-reassurance">No subscription. No pitch. No catch.</p>
      </div>
      <div className="alex-portrait-wrap">
        <div className="alex-sun" />
        <div className="alex-palm">I USE THE<br />ACTUAL APP</div>
        <Image className="alex-portrait" src="/0x-alex.png" width={1024} height={1536} priority alt="Pixel-art portrait of Alex working by the sea" />
        <div className="alex-sticker"><b>0x</b><span>ALEX<br />TRIES</span></div>
      </div>
    </section>

    <section id="how-it-works" className="alex-steps">
      <p className="alex-section-label">HOW IT WORKS</p>
      <div><article><span>01</span><h2>Send it.</h2><p>Share your app in the current X call. A link and a sentence is enough.</p></article><article><span>02</span><h2>I try it.</h2><p>I use it as a real person would — not as a box-ticking exercise.</p></article><article><span>03</span><h2>You get a take.</h2><p>Clear, useful feedback. If your app needs a paid plan, I may pay to try it properly.</p></article></div>
    </section>

    <section className="alex-about">
      <div className="alex-about-photo"><Image src="/0x-alex.png" width={1024} height={1536} alt="Pixel-art portrait of Alex" /><span>BASED IN<br />BELGRADE</span></div>
      <div className="alex-about-copy"><p className="alex-section-label">WHO IS ALEX?</p><h2>Not a platform.<br /><em>Just me, looking closely.</em></h2><p>I&apos;ve spent 8+ years building software. I started in full-stack, found my niche in blockchain, and now spend my free time learning about AI.</p><p>I like early products, sharp ideas, and builders who care about the details. This is my way of seeing what people are making and helping when I can.</p><ul><li>Full-stack engineer</li><li>Blockchain focused</li><li>Currently exploring AI</li></ul></div>
    </section>

    <div id="tries" className="alex-week-heading"><p className="alex-section-label">APPS I&apos;VE TRIED</p><h2>{currentWeek ? `The week of ${formatWeekRange(currentWeek.startsOn)}` : "What I&apos;m trying"}</h2><p>{picked.length ? `${reviewedCount} of ${picked.length} selected apps reviewed so far.` : "The next apps I try will be shared on X."}</p></div>
    <WeekBrowser weeks={weeks} initialWeek={requestedWeek || currentWeek?.slug} />

    <section className="alex-final"><p className="alex-section-label">GOT SOMETHING?</p><h2>Let me try it.</h2><p>It&apos;s free. You have nothing to lose — and your app might get a useful second pair of eyes.</p><a className="alex-button alex-button-light" href={shareUrl} target="_blank" rel="noreferrer">Share your app on X <span>↗</span></a></section>
  </main><SiteFooter settings={settings} /></>;
}
