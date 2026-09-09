export type Track = "inbox" | "shortlisted" | "quick" | "deep" | "passed";
export type Kind = "quick" | "deep";
export const trackNames: Record<Track, string> = { inbox: "In consideration", shortlisted: "Shortlist", quick: "Quick take", deep: "Deep review", passed: "Not selected" };
export type Asset = { id: string; type: "image" | "video"; url: string; alt: string };
export type Post = { id: string; text: string; assets: Asset[] };
export type Product = {
  id: string; slug: string; name: string; url: string; logoUrl: string;
  handle: string; description: string; category: string; archived: boolean; createdAt: string;
  reviewedInWeek?: string;
};
export type Entry = {
  projectId: string; track: Track; source: string; note: string;
  fit: number; clarity: number; interest: number; ready: boolean;
};
export type Week = {
  id: string; startsOn: string; state: "collecting" | "curating" | "complete";
  quickSlots: number; deepSlots: number; callUrl: string; announcement: string; announcementUrl: string;
  entries: Entry[]; selection: { projectId: string; track: Track }[] | null;
};
export type ReviewVersion = { title: string; posts: Post[]; publishedAt: string };
export type Review = {
  id: string; weekId: string; projectId: string; kind: Kind;
  title: string; posts: Post[]; xPostUrl: string; updatedAt: string;
  published: ReviewVersion | null; scheduled: ReviewVersion | null;
};
export type Settings = { name: string; handle: string; avatarUrl: string; siteUrl: string; quickSlots: number; deepSlots: number };
export type XPost = {
  id: string; title: string; posts: Post[]; reviewId: string | null;
  status: "draft" | "scheduled" | "publishing" | "published" | "failed" | "attention" | "cancelled";
  scheduledAt: string | null; updatedAt: string; publishedIds: string[];
  xPostUrl: string; error: string;
};
export type EditorialState = {
  version: 1; revision: number; projects: Product[]; weeks: Week[]; reviews: Review[]; settings: Settings; xPosts: XPost[];
};
export const defaultSettings: Settings = { name: "0xAlex", handle: "0xAlex_dev", avatarUrl: "", siteUrl: "https://www.weekendcheck.com", quickSlots: 5, deepSlots: 2 };
export type Candidate = { name: string; url: string; handle: string; description: string; source: string };
export const isSelected = (track: Track): track is Kind => track === "quick" || track === "deep";
export function liveVersion(review: Review, now = Date.now()): ReviewVersion | null {
  return review.scheduled && Date.parse(review.scheduled.publishedAt) <= now ? review.scheduled : review.published;
}
export function reviewStatus(review: Review) {
  if (review.scheduled && Date.parse(review.scheduled.publishedAt) > Date.now()) return "Scheduled";
  return liveVersion(review) ? "Published" : "Draft";
}
export function monday(date = new Date()): string {
  const copy = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  copy.setUTCDate(copy.getUTCDate() - (copy.getUTCDay() + 6) % 7);
  return copy.toISOString().slice(0, 10);
}
export function canonicalUrl(input: string): string {
  const url = new URL(/^https?:\/\//i.test(input.trim()) ? input.trim() : `https://${input.trim()}`);
  if (!["http:", "https:"].includes(url.protocol) || !url.hostname.includes(".") || url.username || url.password) throw new Error("Enter a valid public http(s) URL.");
  url.hash = "";
  url.hostname = url.hostname.toLowerCase().replace(/^www\./, "");
  for (const key of [...url.searchParams.keys()]) if (/^utm_|^(ref|fbclid|gclid)$/i.test(key)) url.searchParams.delete(key);
  url.searchParams.sort();
  url.pathname = url.pathname.replace(/\/$/, "") || "/";
  return url.toString();
}
export const projectKey = (url: string) => canonicalUrl(url).replace(/^https?:\/\//, "");

// Paste one project per line: URL | Name | @handle | Description.
// Plain copied replies containing a URL also work and remain editable before import.
export function parseCandidates(text: string): Candidate[] {
  const candidates: Candidate[] = [];
  const seen = new Set<string>();
  for (const line of text.split(/\r?\n/).filter(line => line.trim())) {
    const parts = line.split("|").map(part => part.trim());
    const urls = line.match(/https?:\/\/[^\s|]+/g) || [];
    for (const raw of urls) {
      try {
        const url = canonicalUrl(raw.replace(/[),.;!?]+$/, ""));
        if (/(^|\.)(x\.com|twitter\.com|t\.co)$/.test(new URL(url).hostname)) continue;
        if (seen.has(projectKey(url))) continue;
        seen.add(projectKey(url));
        candidates.push({
          url, name: parts.length > 1 ? parts[1] || new URL(url).hostname : new URL(url).hostname,
          handle: (parts.length > 2 ? parts[2] : line.match(/@([a-zA-Z0-9_]+)/)?.[1] || "").replace(/^@/, ""),
          description: parts.length > 3 ? parts.slice(3).join(" | ") : line.replace(raw, "").replace(/@[a-zA-Z0-9_]+/g, "").trim(),
          source: "",
        });
      } catch { /* Invalid URLs are omitted from the preview. */ }
    }
  }
  return candidates;
}
