import assert from "node:assert/strict";
import { after, test } from "node:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { applyAction } from "../src/lib/editorial-actions";
import { seedState } from "../src/lib/editorial-seed";
import { selectionBlock } from "../src/lib/editorial-selection";
import { parseCandidates, projectKey, type EditorialState, type Week } from "../src/lib/editorial";
import { publicData } from "../src/lib/public-data";
import { changeState, readState } from "../src/lib/editorial-store";
import { closeDatabase } from "../src/lib/database";
import { resetTestWorkspace } from "./database-fixture";
after(closeDatabase);

function fixture() {
  const state = seedState();
  const result = applyAction(state, { action: "createWeek", startsOn: "2026-09-21" });
  const week = state.weeks.find(w => w.id === result.id)!;
  return { state, week };
}
function add(state: EditorialState, week: Week, name = "Test app") {
  const result = applyAction(state, { action: "createProject", weekId: week.id, name, url: "https://test-app.example", handle: "builder", category: "Tools", description: "A test product", logoUrl: "" });
  const entry = week.entries.find(e => e.projectId === result.id)!;
  return entry;
}
function pick(state: EditorialState, week: Week) {
  const entry = add(state, week);
  applyAction(state, { action: "saveEntry", weekId: week.id, ...entry, ready: true, fit: 5, clarity: 5, interest: 5, track: "quick" });
  applyAction(state, { action: "publishSelection", weekId: week.id });
  const result = applyAction(state, { action: "prepareReview", weekId: week.id, projectId: entry.projectId });
  applyAction(state, { action: "saveReview", reviewId: result.id, title: "Honest review", posts: [{ id: "p1", text: "Review text", assets: [] }], xPostUrl: "" });
  return state.reviews.find(r => r.id === result.id)!;
}
test("normalizes URL duplicates and previews paste imports", () => {
  assert.equal(projectKey("https://www.myapp.com/?utm_source=x#part"), projectKey("http://myapp.com"));
  const parsed = parseCandidates("https://myapp.com | My App | @alice | Helps people\nhttps://myapp.com/?ref=x\nhttps://x.com/alice/status/123");
  assert.equal(parsed.length, 1); assert.equal(parsed[0].handle, "alice");
  assert.throws(() => projectKey("javascript:alert(1)"));
});
test("new weeks stay private; publication snapshots exclude later selections and notes", () => {
  const { state, week } = fixture();
  const entry = add(state, week);
  assert.equal(publicData(state).weeks.some(w => w.slug === week.id), false);
  entry.note = "PRIVATE NOTE";
  applyAction(state, { action: "publishSelection", weekId: week.id });
  applyAction(state, { action: "saveEntry", weekId: week.id, ...entry, ready: true, track: "deep" });
  const visible = publicData(state).weeks.find(w => w.slug === week.id)!;
  assert.equal(visible.entries[0].track, "inbox");
  assert.ok(!JSON.stringify(publicData(state)).includes("PRIVATE NOTE"));
});
test("blocks overlaps and duplicates; manual selection has no quotas or scoring requirements", () => {
  const { state, week } = fixture();
  assert.throws(() => applyAction(state, { action: "createWeek", startsOn: "2026-09-23" }), /overlaps/);
  const entry = add(state, week);
  assert.throws(() => add(state, week), /already/);
  week.deepSlots = 0;
  applyAction(state, { action: "saveEntry", weekId: week.id, ...entry, track: "deep" });
  assert.equal(entry.track, "deep");
  assert.equal(entry.ready, false);
  assert.equal(entry.fit, 0);
  assert.equal(applyAction(state, { action: "openWeek", startsOn: week.startsOn }).id, week.id);
});
test("manual selection skips reviewed and already-reserved projects", () => {
  const { state, week } = fixture();
  for (const projectId of ["signal-stack", "pgvitals", "minuteform"]) applyAction(state, { action: "addExisting", weekId: week.id, projectId });
  week.entries.forEach(e => Object.assign(e, { ready: true, fit: 5, clarity: 5, interest: 5 }));
  for (const entry of week.entries) assert.ok(selectionBlock(state, week, entry));
  const entry = add(state, week);
  assert.equal(selectionBlock(state, week, entry), null);
});
test("imports reuse canonical project history and skip duplicates", () => {
  const { state, week } = fixture();
  const initial = state.projects.length;
  const result = applyAction(state, { action: "importProjects", weekId: week.id, candidates: [{ name: "Renamed", url: "https://pgvitals.kafal.studio/?utm_source=x", handle: "", description: "", source: "" }, { name: "Again", url: "https://pgvitals.kafal.studio", handle: "", description: "", source: "" }] });
  assert.deepEqual(result, { added: 1, skipped: 1 }); assert.equal(state.projects.length, initial);
});
test("draft saves do not alter live review; schedule is a frozen future snapshot", () => {
  const { state, week } = fixture();
  const review = pick(state, week);
  assert.ok(!publicData(state).reviewedProjects.some(p => p.name === "Test app"));
  applyAction(state, { action: "publishReview", reviewId: review.id });
  applyAction(state, { action: "saveReview", reviewId: review.id, title: "Draft rewrite", posts: [{ id: "p1", text: "New unpublished text", assets: [] }], xPostUrl: "" });
  assert.equal(publicData(state).reviewedProjects.find(p => p.name === "Test app")?.reviewTitle, "Honest review");
  applyAction(state, { action: "scheduleReview", reviewId: review.id, publishAt: new Date(Date.now() + 86400000).toISOString() });
  assert.equal(publicData(state).reviewedProjects.find(p => p.name === "Test app")?.reviewTitle, "Honest review");
  review.scheduled!.publishedAt = new Date(Date.now() - 1000).toISOString();
  assert.equal(publicData(state).reviewedProjects.find(p => p.name === "Test app")?.reviewTitle, "Draft rewrite");
  applyAction(state, { action: "unpublishReview", reviewId: review.id });
  assert.ok(!publicData(state).reviewedProjects.some(p => p.name === "Test app"));
});
test("scheduled review can't publish before the week's selection is public", () => {
  const { state, week } = fixture();
  const review = pick(state, week);
  week.selection = null;
  assert.throws(() => applyAction(state, { action: "scheduleReview", reviewId: review.id, publishAt: new Date(Date.now() + 86400000).toISOString() }), /selection/);
});
test("published reviews prevent accidental removal and empty reviews cannot publish", () => {
  const { state, week } = fixture();
  const review = pick(state, week);
  review.posts[0].text = "";
  assert.throws(() => applyAction(state, { action: "publishReview", reviewId: review.id }), /empty posts/);
  review.posts[0].text = "Ready";
  applyAction(state, { action: "publishReview", reviewId: review.id });
  assert.throws(() => applyAction(state, { action: "removeEntry", weekId: week.id, projectId: review.projectId }), /Unpublish/);
  applyAction(state, { action: "unpublishReview", reviewId: review.id });
  applyAction(state, { action: "removeEntry", weekId: week.id, projectId: review.projectId });
  const next = applyAction(state, { action: "createWeek", startsOn: "2026-10-12" });
  const nextWeek = state.weeks.find(w => w.id === next.id)!;
  applyAction(state, { action: "addExisting", weekId: nextWeek.id, projectId: review.projectId });
  assert.match(selectionBlock(state, nextWeek, { ...nextWeek.entries[0], ready: true }) || "", /Already reviewed/);
});
test("storage persists, rejects stale saves, and does not write partial failures", async () => {
  await resetTestWorkspace();
  const directory = await mkdtemp(path.join(tmpdir(), "weekendcheck-store-test-"));
  process.env.WEEKENDCHECK_DATA_DIR = directory;
  try {
    const before = await readState();
    await changeState(before.revision, state => applyAction(state, { action: "createWeek", startsOn: "2026-10-05" }));
    const saved = await readState();
    assert.equal(saved.weeks.length, before.weeks.length + 1);
    await assert.rejects(changeState(before.revision, () => ({})), /another tab/);
    await assert.rejects(changeState(saved.revision, state => { state.projects = []; throw new Error("deliberate failure"); }), /deliberate/);
    assert.equal((await readState()).projects.length, saved.projects.length);
  } finally { delete process.env.WEEKENDCHECK_DATA_DIR; await rm(directory, { recursive: true, force: true }); }
});
