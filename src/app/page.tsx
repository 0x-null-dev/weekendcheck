import { formatWeekRange } from "@/lib/demo-data";
import { getPublicData } from "@/lib/public-data";
import { SiteFooter, SiteHeader } from "@/components/mark";
import { WeekBrowser } from "@/components/week-browser";

export const dynamic = "force-dynamic";
export default async function Home({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  const { currentWeek, weeks, settings } = await getPublicData();
  const requestedWeek = (await searchParams).week;
  const picked = currentWeek?.entries.filter(p => p.track === "quick" || p.track === "deep") || [];
  const reviewedCount = picked.filter(p => p.reviewed).length;
  const profile = `https://x.com/${settings.handle}`;
  return <><SiteHeader settings={settings} /><main>
    <section className="hero hero-v2"><div className="hero-main">
      <p className="eyebrow">{currentWeek ? formatWeekRange(currentWeek.startsOn) : "WEEKLY PROJECT REVIEWS"}</p>
      <h1>Projects by indie builders.<br /><em>Real attention.</em></h1>
      <p className="hero-copy">I find early products on X each week, select the ones worth a closer look, and share honest reviews.</p>
      <div className="hero-actions"><a className="button dark" href={currentWeek?.callUrl || `https://x.com/intent/tweet?text=${encodeURIComponent(`@${settings.handle} I'm building ...`)}`} target="_blank" rel="noreferrer">Share your project <span>→</span></a><a className="text-link" href={profile} target="_blank" rel="noreferrer">Follow on X ↗</a></div>
      <div className="hero-note"><span className="pulse" />{picked.length ? `${reviewedCount} of ${picked.length} selected projects reviewed` : "Follow on X for the next project call"}</div>
    </div><aside className="how-it-works"><p className="eyebrow">HOW IT WORKS</p><ol><li><span>01</span><div><b>Share</b><p>Reply to the weekly X call with your app.</p></div></li><li><span>02</span><div><b>Curate</b><p>I collect the projects and choose a few.</p></div></li><li><span>03</span><div><b>Review</b><p>Quick takes or deeper video reviews go live.</p></div></li></ol></aside></section>
    <WeekBrowser weeks={weeks} initialWeek={requestedWeek || currentWeek?.slug} />
    <section className="review-callout">
      <h2>Find your next favourite project.<br /><em>Or get yours reviewed.</em></h2>
      <p>Follow @{settings.handle} on X for weekly project calls, honest reviews, and new things worth trying.</p>
      <a className="button light" href={profile} target="_blank" rel="noreferrer">Follow on X <span aria-hidden="true">↗</span></a>
    </section>
  </main><SiteFooter settings={settings} /></>;
}
