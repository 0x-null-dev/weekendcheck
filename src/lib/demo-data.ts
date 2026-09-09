export type ReviewKind = "quick" | "deep";
export type EntryTrack = "inbox" | "shortlisted" | ReviewKind | "passed";

export type Project = {
  slug: string;
  name: string;
  url: string;
  logoUrl?: string;
  handle: string;
  description: string;
  category: string;
  reviewed?: ReviewKind;
  reviewTitle?: string;
  reviewExcerpt?: string;
  review?: {
    publishedAt: string;
    xPostUrl?: string;
    posts: Array<{
      text: string;
      media?: "video" | "screenshots";
      assets?: import("./editorial").Asset[];
    }>;
  };
};

export type WeekEntry = Project & {
  score: number;
  track: EntryTrack;
  source: string;
  note?: string;
};

export type ReviewWeek = {
  slug: string;
  number: number;
  startsOn: string;
  state: "collecting" | "curating" | "published";
  quickSlots: number;
  deepSlots: number;
  callUrl?: string;
  entries: WeekEntry[];
};

export const weeks: ReviewWeek[] = [
  {
    slug: "september-8-2026",
    number: 18,
    startsOn: "2026-09-08",
    state: "curating",
    quickSlots: 5,
    deepSlots: 2,
    entries: [
      { slug: "pgvitals", name: "PGVitals", url: "https://pgvitals.kafal.studio", handle: "taboverspace", description: "Postgres monitoring for small teams.", category: "Developer tools", score: 91, track: "deep", source: "Reply thread · Sep 7", note: "A focused pain point, clear product and strong founder context." },
      { slug: "narrafit", name: "Narrafit", url: "https://narrafit.app", handle: "_stanleon", description: "A simple way to make fitness consistency visible.", category: "Consumer", score: 86, track: "quick", source: "Reply thread · Sep 7", note: "The before/after moment is immediately understandable." },
      { slug: "affiliate-watch", name: "Affiliate Watch", url: "https://affiliate.watch", handle: "ChrisLaBonty", description: "Monitor affiliate links before they quietly stop earning.", category: "Business tools", score: 84, track: "quick", source: "Reply thread · Sep 7" },
      { slug: "scribblepad", name: "ScribblePad", url: "https://scribblepad.org", handle: "aryanloves2chil", description: "A calm, tiny writing space for daily notes.", category: "Productivity", score: 82, track: "deep", source: "Reply thread · Sep 7", note: "Interesting product restraint. I want to test whether it earns a daily habit." },
      { slug: "kronex", name: "Kronex", url: "https://kronex.app", handle: "rouas_nour", description: "Time tracking that rewards deep work with bitcoin.", category: "Productivity", score: 80, track: "quick", source: "Reply thread · Sep 7" },
      { slug: "beviral", name: "BeViral", url: "https://beviralai.app", handle: "swarecito", description: "An AI content assistant for creators.", category: "AI", score: 78, track: "quick", source: "Reply thread · Sep 7" },
      { slug: "goask", name: "GoAsk", url: "https://goask.chat", handle: "GoAskChat", description: "Chat search with answers grounded in sources.", category: "AI", score: 76, track: "quick", source: "Reply thread · Sep 7" },
      { slug: "archway", name: "Archway", url: "https://archway.devsethi.site", handle: "imsethidev", description: "A lightweight home for independent work.", category: "Portfolio", score: 72, track: "shortlisted", source: "Reply thread · Sep 7" },
      { slug: "novelhive", name: "NovelHive", url: "https://novelhive.ai", handle: "NOVELHIVE_AI", description: "Turn an idea into a serial story.", category: "AI", score: 68, track: "inbox", source: "Reply thread · Sep 7" },
      { slug: "inboxapp", name: "InboxApp", url: "https://inboxapp.com", handle: "Em_Nomadic", description: "A cleaner inbox for people who live in email.", category: "Productivity", score: 65, track: "inbox", source: "Reply thread · Sep 7" }
    ]
  },
  {
    slug: "september-1-2026",
    number: 17,
    startsOn: "2026-09-01",
    state: "published",
    quickSlots: 4,
    deepSlots: 1,
    entries: [
      { slug: "signal-stack", name: "Signal Stack", url: "https://example.com", handle: "signalstack", description: "A calm research inbox for product teams.", category: "Research", score: 93, track: "deep", source: "Reply thread · Aug 31", reviewed: "deep", reviewTitle: "A research tool that respects your attention", reviewExcerpt: "The product earns its place by being much narrower than the competition.", review: { publishedAt: "Sep 6, 2026", posts: [{ text: "I spent a few days with Signal Stack, a research inbox for product teams.\n\nThe short version: it understands that the hardest part of research is not collecting links. It’s returning to the right thing at the right moment.", media: "video" }, { text: "What works\n\n• The inbox is intentionally quiet\n• Capturing a thought takes almost no effort\n• The product has a very clear point of view" }, { text: "What I’d push next\n\nThe moment after capture needs to feel more magical. I want the product to make connections for me, not just hold the material.\n\nFull walkthrough and screenshots below.", media: "screenshots" }] } },
      { slug: "minuteform", name: "Minuteform", url: "https://example.com", handle: "minuteform", description: "Forms for one-question decisions.", category: "Business tools", score: 88, track: "quick", source: "Reply thread · Aug 31", reviewed: "quick", reviewTitle: "The form builder with a useful constraint", reviewExcerpt: "It feels unusually quick because it refuses to become a survey platform.", review: { publishedAt: "Sep 4, 2026", posts: [{ text: "Quick take on Minuteform:\n\nA form builder that wins by refusing to become a survey platform. One question, one decision, done.\n\nThe constraint is the product — and it makes the whole thing feel much faster." }] } },
      { slug: "pocket-page", name: "Pocket Page", url: "https://example.com", handle: "pocketpage", description: "A one-page home for the things you are making.", category: "Creator tools", score: 81, track: "quick", source: "Reply thread · Aug 31", reviewed: "quick", reviewTitle: "A portfolio that gets out of the way", reviewExcerpt: "Good taste is doing most of the work here.", review: { publishedAt: "Sep 3, 2026", posts: [{ text: "Pocket Page is a simple one-page home for your work.\n\nNo dashboard energy. No unnecessary choices. Just a clean place to point people when they ask what you’re making.\n\nGood taste is doing most of the work here." }] } }
    ]
  }
];

export const currentWeek = weeks[0];
export const publishedWeeks = weeks.filter((week) => week.state === "published");
export const reviewedProjects = weeks.flatMap((week) => week.entries).filter((project) => project.reviewed);

export function formatWeekRange(startsOn: string) {
  const [year, month, day] = startsOn.split("-").map(Number);
  const start = new Date(year, month - 1, day);
  const end = new Date(year, month - 1, day + 6);
  const startMonth = new Intl.DateTimeFormat("en-US", { month: "short" }).format(start);
  const endMonth = new Intl.DateTimeFormat("en-US", { month: "short" }).format(end);
  const startDay = start.getDate();
  const endDay = end.getDate();
  return startMonth === endMonth
    ? `${startMonth} ${startDay} — ${endDay}, ${end.getFullYear()}`
    : `${startMonth} ${startDay} — ${endMonth} ${endDay}, ${end.getFullYear()}`;
}

export function getProject(slug: string) {
  return weeks.flatMap((week) => week.entries).find((project) => project.slug === slug);
}
