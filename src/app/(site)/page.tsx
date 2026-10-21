import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getPublicData } from "@/lib/public-data";
import { WeekBrowser } from "@/components/week-browser";
import { BudgetMeter } from "@/components/site/budget-meter";
import { ReviewCard } from "@/components/site/review-card";
import { xHandle } from "@/lib/site";

export const metadata: Metadata = { alternates: { canonical: "/" } };
export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  const { currentWeek, weeks, reviewedProjects, budget } = await getPublicData();
  const requestedWeek = (await searchParams).week;
  const latest = [...reviewedProjects].sort((a, b) => (b.weekStartsOn || "").localeCompare(a.weekStartsOn || "")).slice(0, 3);
  return <>
    <section className="hero">
      <div className="hero-copy">
        <p className="label sea">Software engineer · Europe · 8+ years building</p>
        <h1>I try what you&apos;re <em>building.</em></h1>
        <p className="lede">I&apos;m Alex. I&apos;ve built software from full-stack apps to blockchain, and now I spend a lot of my free time trying what people make, especially with AI.</p>
        <p>Every week I pick projects, use them for real, and sometimes pay for access. When I have something useful to say, I write a review. It&apos;s free for you.</p>
        <div className="actions"><Link className="btn" href="/contact">Send me your project</Link><Link className="btn btn-ghost" href="/reviews">Read reviews</Link></div>
      </div>
      <div className="portrait"><Image src="/0x-alex.png" width={1024} height={1536} sizes="(max-width: 760px) 220px, 300px" priority alt="Pixel-art portrait of Alex working on a laptop by the sea" /></div>
    </section>

    <div className="wrap"><BudgetMeter budget={budget} /></div>

    <section id="weeks" className="wrap section">
      <div className="section-head"><div><p className="label">Weekly checks</p><h2>What I checked, week by week.</h2></div><p>{currentWeek ? "Every project I looked at this week. Only some become reviews." : "The first weekly list is coming soon."}</p></div>
      {weeks.length ? <WeekBrowser weeks={weeks} initialWeek={requestedWeek || currentWeek?.slug} /> : <p className="empty">No weekly checks have been published yet. Follow <a href={`https://x.com/${xHandle}`} target="_blank" rel="noreferrer">@{xHandle}</a> for the first call for projects.</p>}
    </section>

    {latest.length > 0 && <section className="wrap section">
      <div className="section-head"><div><p className="label">Latest reviews</p><h2>Worth a closer look.</h2></div><Link className="text-link" href="/reviews">All reviews →</Link></div>
      <div className="review-grid">{latest.map(project => <ReviewCard project={project} key={project.slug} />)}</div>
    </section>}

    <section className="wrap section">
      <div className="section-head"><div><p className="label">How it works</p><h2>From your link to a review.</h2></div></div>
      <ol className="steps">
        <li><span className="label coin">01</span><h3>You send it</h3><p>Reply to my weekly call on X, or send it through the contact page.</p></li>
        <li><span className="label coin">02</span><h3>I try it</h3><p>I use it like a real customer. If it needs a paid plan, I pay from the budget.</p></li>
        <li><span className="label coin">03</span><h3>I write it up</h3><p>A quick take or a deep review, published here and shared on X.</p></li>
      </ol>
    </section>

    <section className="wrap section">
      <div className="cta-panel"><div><h2>Built something? I want to try it.</h2><p>Send me the link and tell me what you want feedback on.</p></div><Link className="btn" href="/contact">Send me your project</Link></div>
    </section>
  </>;
}
