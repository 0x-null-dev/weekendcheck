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
  const reviewed = orderedEntries.filter(entry => entry.reviewed).length;
  return <div className="week-browser">
    <div className="week-tabs-row">
      <div ref={tabs} className="week-tabs" role="group" aria-label="Choose a week">
        {chronologicalWeeks.map((item, index) => <button aria-pressed={index === activeIndex} onClick={() => choose(index)} key={item.slug}><span className="label">Week {index + 1}</span><small>{formatWeekRange(item.startsOn)}</small></button>)}
      </div>
      {chronologicalWeeks.length > 1 && <div className="week-arrows"><button onClick={() => choose(activeIndex - 1)} disabled={activeIndex === 0} aria-label="Older week">←</button><button onClick={() => choose(activeIndex + 1)} disabled={activeIndex === chronologicalWeeks.length - 1} aria-label="Newer week">→</button></div>}
    </div>
    {week && <p className="week-summary label">{orderedEntries.length} {orderedEntries.length === 1 ? "project" : "projects"} · {reviewed} reviewed</p>}
    <div className="project-list">{orderedEntries.slice(0, visibleCount).map(project => <ProjectRow project={project} key={project.slug} />)}</div>
    {orderedEntries.length > visibleCount && <button className="btn btn-ghost" onClick={() => setVisibleCount(count => count + 20)}>Show {Math.min(20, orderedEntries.length - visibleCount)} more</button>}
  </div>;
}
