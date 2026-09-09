import { randomUUID } from "node:crypto";
import { selectionBlock } from "./editorial-selection";
import { xPostErrors } from "./x-post-validation";
import {
  canonicalUrl, projectKey, isSelected, liveVersion,
  type EditorialState, type Entry, type Product, type Post, type Track, type Week,
} from "./editorial";

function fail(message: string): never { throw new Error(message); }
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail("Invalid request.");
  return value as Record<string, unknown>;
}
function text(value: unknown, label: string, required = false, max = 5000) {
  if (typeof value !== "string" || value.length > max) fail(`Invalid ${label}.`);
  const result = value.trim();
  if (required && !result) fail(`${label} is required.`);
  return result;
}
function number(value: unknown, min: number, max: number) {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) fail(`Enter a whole number between ${min} and ${max}.`);
  return value;
}
function bool(value: unknown) { if (typeof value !== "boolean") fail("Invalid checkbox value."); return value; }
export function httpUrl(value: unknown, required = false): string {
  const result = text(value, "URL", required, 2048);
  return result ? canonicalUrl(result) : "";
}
export function xUrl(value: unknown): string {
  const result = httpUrl(value);
  if (result && !/^https?:\/\/(x\.com|twitter\.com)\/(?:[a-zA-Z0-9_]+|i\/web)\/status\/\d+\/?(?:\?.*)?$/.test(result)) fail("Enter an X post URL, including /status/ and its ID.");
  return result;
}
function mediaUrl(value: unknown) {
  const result = text(value, "media URL", true, 2048);
  return /^\/api\/media\/[a-f0-9-]+\.(png|jpg|webp|gif|mp4|webm)$/.test(result) ? result : httpUrl(result, true);
}
function date(value: unknown) {
  const result = text(value, "start date", true, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result) || !Number.isFinite(Date.parse(result)) || new Date(result).toISOString().slice(0, 10) !== result) fail("Enter a valid start date.");
  return result;
}
function track(value: unknown): Track {
  if (!["inbox", "shortlisted", "quick", "deep", "passed"].includes(String(value))) fail("Invalid review track.");
  return value as Track;
}
function productFields(args: Record<string, unknown>) {
  const handle = text(args.handle, "X handle", false, 16).replace(/^@/, "");
  if (handle && !/^[a-zA-Z0-9_]{1,15}$/.test(handle)) fail("Enter an X handle without spaces.");
  const logoUrl = text(args.logoUrl ?? "", "logo URL", false, 2048);
  return {
    name: text(args.name, "Project name", true, 120), url: httpUrl(args.url, true),
    description: text(args.description, "description", false, 2000), handle,
    category: text(args.category ?? "", "category", false, 100),
    logoUrl: logoUrl ? mediaUrl(logoUrl) : "",
  };
}
function getWeek(state: EditorialState, id: unknown) {
  return state.weeks.find(week => week.id === id) || fail("Week not found.");
}
function getProduct(state: EditorialState, id: unknown) {
  return state.projects.find(project => project.id === id) || fail("Project not found.");
}
function editableWeek(week: Week) { if (week.state === "complete") fail("Reopen this week before changing its projects or selection."); }
function noDuplicateUrl(state: EditorialState, url: string, except?: string) {
  if (state.projects.some(project => project.id !== except && projectKey(project.url) === projectKey(url))) fail("That website is already in Projects. Add the existing project to this week instead.");
}
function addProduct(state: EditorialState, args: Record<string, unknown>): Product {
  const fields = productFields(args);
  noDuplicateUrl(state, fields.url);
  const id = randomUUID();
  const base = fields.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "project";
  const slug = state.projects.some(p => p.slug === base) ? `${base}-${id.slice(0, 8)}` : base;
  const project: Product = { ...fields, id, slug, archived: false, createdAt: new Date().toISOString() };
  state.projects.push(project);
  return project;
}
function attach(week: Week, project: Product, source: string) {
  if (week.entries.some(entry => entry.projectId === project.id)) return false;
  if (project.archived) fail("Restore this project before adding it to a week.");
  week.entries.push({ projectId: project.id, track: "inbox", source, note: "", fit: 0, clarity: 0, interest: 0, ready: false });
  return true;
}
function posts(value: unknown): Post[] {
  if (!Array.isArray(value) || !value.length || value.length > 30) fail("A review needs 1–30 posts.");
  return value.map(raw => {
    const post = object(raw);
    if (!Array.isArray(post.assets) || post.assets.length > 4) fail("Attach up to four media items per post.");
    return { id: text(post.id, "post ID", true, 100), text: text(post.text, "post text", false, 25000),
      assets: post.assets.map(rawAsset => {
        const asset = object(rawAsset);
        if (asset.type !== "image" && asset.type !== "video") fail("Unsupported media type.");
        return { id: text(asset.id, "asset ID", true, 100), type: asset.type as "image" | "video", url: mediaUrl(asset.url), alt: text(asset.alt, "media description", false, 1000) };
      }),
    };
  });
}

export function applyAction(state: EditorialState, command: unknown): Record<string, unknown> {
  const args = object(command);
  const action = args.action;
  if (action === "createXFromReview") {
    const review = state.reviews.find(r => r.id === args.reviewId) || fail("Review not found.");
    const existing = state.xPosts.find(p => p.reviewId === review.id && p.status !== "cancelled");
    if (existing) return { id: existing.id };
    const id = randomUUID();
    state.xPosts.push({ id, reviewId: review.id, title: review.title || getProduct(state, review.projectId).name, posts: structuredClone(review.posts), status: "draft", scheduledAt: review.scheduled?.publishedAt || null, updatedAt: new Date().toISOString(), publishedIds: [], xPostUrl: "", error: "" });
    return { id };
  }
  if (action === "saveXPost") {
    const existing = args.postId ? state.xPosts.find(p => p.id === args.postId) || fail("X post not found.") : null;
    if (existing && (!["draft", "scheduled", "failed"].includes(existing.status) || existing.publishedIds.length)) fail("This post has started publishing and cannot be edited. Check X before taking further action.");
    const content = posts(args.posts);
    const title = text(args.title, "post label", false, 180);
    const schedule = bool(args.schedule);
    let scheduledAt: string | null = null;
    if (args.scheduledAt) {
      const at = text(args.scheduledAt, "scheduled time", true, 50);
      if (!Number.isFinite(Date.parse(at))) fail("Choose a valid date and time.");
      scheduledAt = new Date(at).toISOString();
    }
    if (schedule) {
      if (!scheduledAt || Date.parse(scheduledAt) <= Date.now()) fail("Choose a future publication time.");
      const errors = xPostErrors(content); if (errors.length) fail(errors.join(" "));
    }
    const id = existing?.id || randomUUID();
    const record = { id, reviewId: existing?.reviewId || null, title, posts: content, scheduledAt, updatedAt: new Date().toISOString(), status: schedule ? "scheduled" as const : "draft" as const, publishedIds: [], xPostUrl: "", error: "" };
    if (existing) Object.assign(existing, record); else state.xPosts.push(record);
    return { id };
  }
  if (["cancelXPost", "deleteXPost", "resolveXPost"].includes(String(action))) {
    const post = state.xPosts.find(p => p.id === args.postId) || fail("X post not found.");
    if (post.status === "publishing") fail("This thread is currently publishing. Wait for it to finish.");
    if (action === "resolveXPost") {
      if (!["attention", "failed"].includes(post.status)) fail("Only failed or uncertain posts can be resolved manually.");
      const url = xUrl(args.url); if (!url) fail("Paste the published thread URL after checking X.");
      post.status = "published"; post.xPostUrl = url; post.error = "";
      const review = state.reviews.find(r => r.id === post.reviewId); if (review) review.xPostUrl = url;
    } else if (action === "deleteXPost") {
      if (post.status !== "draft" || post.publishedIds.length) fail("Only unsent drafts can be deleted.");
      state.xPosts = state.xPosts.filter(p => p.id !== post.id);
    } else {
      if (post.status === "published") fail("Published X posts cannot be cancelled here.");
      post.status = post.publishedIds.length || post.status === "attention" ? "cancelled" : "draft";
      post.scheduledAt = null;
    }
    post.updatedAt = new Date().toISOString();
    return {};
  }
  if (action === "openWeek") {
    const startsOn = date(args.startsOn);
    const existing = state.weeks.find(w => Math.abs(Date.parse(w.startsOn) - Date.parse(startsOn)) < 7 * 86400000);
    return existing ? { id: existing.id } : applyAction(state, { action: "createWeek", startsOn });
  }
  if (action === "createWeek") {
    const startsOn = date(args.startsOn);
    if (state.weeks.some(w => Math.abs(Date.parse(w.startsOn) - Date.parse(startsOn)) < 7 * 86400000)) fail("That week overlaps an existing week.");
    const week: Week = { id: randomUUID(), startsOn, state: "collecting", quickSlots: state.settings.quickSlots, deepSlots: state.settings.deepSlots, entries: [], selection: null, callUrl: "", announcement: "", announcementUrl: "" };
    state.weeks.push(week);
    return { id: week.id };
  }
  if (action === "saveSettings") {
    const handle = text(args.handle, "X handle", true, 15).replace(/^@/, "");
    if (!/^[a-zA-Z0-9_]{1,15}$/.test(handle)) fail("Enter a valid X handle.");
    state.settings = { ...state.settings, name: text(args.name, "display name", true, 80), handle, avatarUrl: args.avatarUrl ? mediaUrl(args.avatarUrl) : "", siteUrl: httpUrl(args.siteUrl, true) };
    return {};
  }
  if (action === "saveProject") {
    const project = getProduct(state, args.projectId);
    const fields = productFields(args);
    noDuplicateUrl(state, fields.url, project.id);
    Object.assign(project, fields);
    return {};
  }
  if (action === "archiveProject") {
    const project = getProduct(state, args.projectId);
    const archived = bool(args.archived);
    if (archived && state.weeks.some(w => w.state !== "complete" && w.entries.some(e => e.projectId === project.id && isSelected(e.track)))) fail("Remove this project from the active selection before archiving it.");
    project.archived = archived; return {};
  }
  if (action === "createProject") {
    const week = args.weekId ? getWeek(state, args.weekId) : null;
    if (week) editableWeek(week);
    const project = addProduct(state, args);
    if (week) attach(week, project, args.source ? xUrl(args.source) : "");
    return { id: project.id };
  }
  if (["saveWeek", "deleteWeek", "addExisting", "importProjects", "saveEntry", "removeEntry", "publishSelection", "hideWeek", "prepareReview"].includes(String(action))) {
    const week = getWeek(state, args.weekId);
    if (action === "saveWeek") {
      if (!["collecting", "curating", "complete"].includes(String(args.state))) fail("Invalid week state.");
      if (args.state === "complete" && week.entries.some(e => isSelected(e.track) && !state.reviews.some(r => r.weekId === week.id && r.projectId === e.projectId && liveVersion(r)))) fail("Publish all selected reviews before completing this week.");
      week.state = args.state as Week["state"];
      week.callUrl = xUrl(args.callUrl);
      week.announcementUrl = xUrl(args.announcementUrl);
      week.announcement = text(args.announcement, "announcement", false, 25000);
      return {};
    }
    if (action === "hideWeek") {
      if (state.reviews.some(r => r.weekId === week.id && r.scheduled && Date.parse(r.scheduled.publishedAt) > Date.now())) fail("Cancel scheduled reviews before hiding their week.");
      week.selection = null; return {};
    }
    if (action === "deleteWeek") {
      if (week.selection || state.reviews.some(r => r.weekId === week.id && (r.published || r.scheduled))) fail("Hide this week and unpublish/cancel its reviews before deleting it.");
      state.weeks = state.weeks.filter(w => w.id !== week.id);
      state.reviews = state.reviews.filter(r => r.weekId !== week.id);
      return {};
    }
    if (action === "prepareReview") {
      const entry = week.entries.find(e => e.projectId === args.projectId) || fail("Project not in this week.");
      if (!isSelected(entry.track)) fail("Choose Quick take or Deep review first.");
      const existing = state.reviews.find(r => r.weekId === week.id && r.projectId === entry.projectId);
      if (existing) return { id: existing.id };
      const id = randomUUID();
      state.reviews.push({ id, weekId: week.id, projectId: entry.projectId, kind: entry.track, title: "", posts: [{ id: randomUUID(), text: "", assets: [] }], xPostUrl: "", updatedAt: new Date().toISOString(), published: null, scheduled: null });
      return { id };
    }
    editableWeek(week);
    if (action === "addExisting") {
      const added = attach(week, getProduct(state, args.projectId), args.source ? xUrl(args.source) : "");
      if (!added) fail("This project is already in the week.");
      return {};
    }
    if (action === "importProjects") {
      if (!Array.isArray(args.candidates) || !args.candidates.length || args.candidates.length > 200) fail("Import 1–200 projects at a time.");
      let added = 0; let skipped = 0;
      for (const raw of args.candidates) {
        const candidate = object(raw);
        const url = httpUrl(candidate.url, true);
        const existing = state.projects.find(p => projectKey(p.url) === projectKey(url));
        if (existing?.archived) { skipped++; continue; }
        const project = existing || addProduct(state, { ...candidate, category: "", logoUrl: "" });
        if (attach(week, project, candidate.source ? xUrl(candidate.source) : "")) added++; else skipped++;
      }
      return { added, skipped };
    }
    if (action === "saveEntry") {
      const entry = week.entries.find(e => e.projectId === args.projectId) || fail("Project not in this week.");
      const nextTrack = track(args.track);
      const review = state.reviews.find(r => r.weekId === week.id && r.projectId === entry.projectId);
      if (review && (review.published || review.scheduled) && nextTrack !== entry.track) fail("Unpublish or cancel this review before changing its track.");
      Object.assign(entry, { ready: bool(args.ready), fit: number(args.fit, 0, 5), clarity: number(args.clarity, 0, 5), interest: number(args.interest, 0, 5), source: xUrl(args.source), note: text(args.note, "private note", false, 5000) });
      if (isSelected(nextTrack)) {
        const reason = selectionBlock(state, week, entry);
        if (reason) fail(reason);
      }
      entry.track = nextTrack;
      if (review && isSelected(nextTrack)) review.kind = nextTrack;
      return {};
    }
    if (action === "removeEntry") {
      const review = state.reviews.find(r => r.weekId === week.id && r.projectId === args.projectId);
      if (review?.published || review?.scheduled) fail("Unpublish the review before removing this project.");
      week.entries = week.entries.filter(e => e.projectId !== args.projectId);
      state.reviews = state.reviews.filter(r => r.id !== review?.id);
      return {};
    }
    if (action === "publishSelection") {
      for (const entry of week.entries.filter(e => isSelected(e.track))) {
        const reason = selectionBlock(state, week, entry);
        if (reason) fail(`${getProduct(state, entry.projectId).name}: ${reason}`);
      }
      if (!week.entries.length) fail("Add at least one project first.");
      week.selection = week.entries.map(e => ({ projectId: e.projectId, track: e.track }));
      week.state = "curating";
      return {};
    }
  }
  if (["saveReview", "publishReview", "scheduleReview", "cancelSchedule", "unpublishReview", "deleteReview"].includes(String(action))) {
    const review = state.reviews.find(r => r.id === args.reviewId) || fail("Review not found.");
    if (review.published) getProduct(state, review.projectId).reviewedInWeek = review.weekId;
    if (review.scheduled && Date.parse(review.scheduled.publishedAt) <= Date.now()) {
      getProduct(state, review.projectId).reviewedInWeek = review.weekId;
      review.published = review.scheduled; review.scheduled = null;
    }
    if (action === "saveReview") {
      review.title = text(args.title, "review title", false, 180);
      review.posts = posts(args.posts);
      review.xPostUrl = xUrl(args.xPostUrl);
      review.updatedAt = new Date().toISOString();
      return {};
    }
    if (action === "deleteReview") {
      if (review.published || review.scheduled) fail("Unpublish or cancel the review before deleting its draft.");
      state.reviews = state.reviews.filter(r => r.id !== review.id); return {};
    }
    if (action === "unpublishReview") { review.published = null; review.scheduled = null; return {}; }
    if (action === "cancelSchedule") { review.scheduled = null; return {}; }
    const week = getWeek(state, review.weekId);
    if (!week.selection?.some(e => e.projectId === review.projectId && e.track === review.kind)) fail("Publish this project's selection in the week first.");
    if (!review.title || review.posts.some(p => !p.text.trim() && !p.assets.length)) fail("Give the review a title and remove empty posts before publishing.");
    const version = { title: review.title, posts: structuredClone(review.posts), publishedAt: new Date().toISOString() };
    if (action === "scheduleReview") {
      const at = text(args.publishAt, "publish time", true, 50);
      if (!Number.isFinite(Date.parse(at)) || Date.parse(at) <= Date.now()) fail("Choose a future publication time.");
      version.publishedAt = new Date(at).toISOString();
      review.scheduled = version;
    } else {
      getProduct(state, review.projectId).reviewedInWeek = review.weekId;
      review.published = version; review.scheduled = null;
    }
    return {};
  }
  return fail("Unknown action.");
}
