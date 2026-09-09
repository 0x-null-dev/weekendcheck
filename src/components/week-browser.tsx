"use client";

import { useEffect, useRef, useState } from "react";
import { formatWeekRange, type ReviewWeek } from "@/lib/demo-data";
import { ProjectRow } from "./project-row";

export function WeekBrowser({ weeks, initialWeek }: { weeks: ReviewWeek[]; initialWeek?: string }) {
  const chronologicalWeeks = [...weeks].sort((a, b) => a.startsOn.localeCompare(b.startsOn));
  const initialIndex = chronologicalWeeks.findIndex(w => w.slug === initialWeek);
  const [activeIndex, setActiveIndex] = useState(initialIndex >= 0 ? initialIndex : Math.max(0, weeks.length - 1));
  const [visibleCount, setVisibleCount] = useState(20);
  const tabs = useRef<HTMLDivElement>(null);
  const week = chronologicalWeeks[activeIndex];
  useEffect(() => {
    const container = tabs.current;
    const active = container?.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
    if (container && active) container.scrollTo({ left: active.offsetLeft - container.offsetLeft - container.clientWidth / 2 + active.clientWidth / 2 });
  }, [activeIndex]);
  function choose(index: number) {
    setActiveIndex(index); setVisibleCount(20);
    const url = new URL(window.location.href);
    url.searchParams.set("week", chronologicalWeeks[index].slug);
    url.hash = "weeks";
    window.history.replaceState(null, "", url);
  }
  const orderedEntries = [...(week?.entries || [])].sort((a, b) => {
    const order = { deep: 0, quick: 1, shortlisted: 2, inbox: 3, passed: 4 };
    return order[a.track] - order[b.track] || Number(Boolean(b.reviewed)) - Number(Boolean(a.reviewed));
  });
  return <section id="weeks" className="week-browser section">
    <div className="week-browser-top">
      <div><p className="eyebrow">BROWSE BY WEEK</p><h2>What&apos;s on the desk</h2></div>
      <div className="week-controls"><button onClick={() => choose(activeIndex - 1)} disabled={!week || activeIndex === 0} aria-label="Older week">←</button><button onClick={() => choose(activeIndex + 1)} disabled={!week || activeIndex === chronologicalWeeks.length - 1} aria-label="Newer week">→</button></div>
    </div>
    <div ref={tabs} className="week-tabs" aria-label="Choose a review week">
      {chronologicalWeeks.map((item, index) => <button aria-pressed={index === activeIndex} onClick={() => choose(index)} className={index === activeIndex ? "active" : ""} key={item.slug}><span>{index === chronologicalWeeks.length - 1 ? "Latest week" : "Week of"}</span><small>{formatWeekRange(item.startsOn)}</small></button>)}
    </div>
    <div className="project-table homepage-projects">{orderedEntries.slice(0, visibleCount).map((project, index) => <ProjectRow project={project} number={index + 1} key={project.slug} />)}</div>
    {!week && <p>No weeks published yet. The next call for projects will be on X.</p>}
    {orderedEntries.length > visibleCount && <button className="button outline" style={{ marginTop: 24 }} onClick={() => setVisibleCount(count => count + 20)}>Show more projects ({orderedEntries.length - visibleCount} remaining)</button>}
  </section>;
}
