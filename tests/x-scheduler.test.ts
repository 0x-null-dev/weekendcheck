import assert from "node:assert/strict";
import { after, test } from "node:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { seedState } from "../src/lib/editorial-seed";
import { applyAction } from "../src/lib/editorial-actions";
import { changeState, readState } from "../src/lib/editorial-store";
import { dispatchDue } from "../src/lib/x-scheduler";
import { XSendError, type XPublisher } from "../src/lib/x-publisher";
import { xPostErrors, xTextLength } from "../src/lib/x-post-validation";
import { publicData } from "../src/lib/public-data";
import { closeDatabase } from "../src/lib/database";
import { resetTestWorkspace } from "./database-fixture";
after(closeDatabase);

const content = [{ id: "one", text: "Opening post", assets: [] }, { id: "two", text: "Thread reply", assets: [] }];
const future = () => new Date(Date.now() + 3600000).toISOString();
const command = () => ({ action: "saveXPost", title: "PRIVATE X DRAFT", posts: content, scheduledAt: future(), schedule: true });
async function stored(run: () => Promise<void>) {
  await resetTestWorkspace();
  const directory = await mkdtemp(path.join(tmpdir(), "weekendcheck-x-test-"));
  process.env.WEEKENDCHECK_DATA_DIR = directory;
  try { await run(); } finally { delete process.env.WEEKENDCHECK_DATA_DIR; await rm(directory, { recursive: true, force: true }); }
}
const fakePublisher = (): XPublisher => ({ verify: async () => {}, upload: async () => "123", send: async () => "1234" });
async function queue() {
  const { result } = await changeState(null, state => {
    const result = applyAction(state, command());
    state.xPosts[0].scheduledAt = new Date(Date.now() - 1000).toISOString();
    return result;
  });
  return result.id;
}

test("X scheduling validates dates, weighted text, media and keeps drafts private", () => {
  const state = seedState();
  assert.throws(() => applyAction(state, { ...command(), scheduledAt: "2000-01-01T00:00:00Z" }), /future/);
  assert.throws(() => applyAction(state, { ...command(), posts: [{ ...content[0], text: "x".repeat(281) }] }), /280/);
  assert.equal(xTextLength("https://example.com/" + "x".repeat(100)), 23);
  assert.ok(xPostErrors([{ ...content[0], assets: [{ id: "a", type: "image", alt: "", url: "https://example.com/image.png" }] }]).length);
  applyAction(state, command());
  assert.ok(!JSON.stringify(publicData(state)).includes("PRIVATE X DRAFT"));
});
test("review handoff copies thread, reuses queue item and does not modify website schedule", () => {
  const state = seedState(); const review = state.reviews[0];
  const result = applyAction(state, { action: "createXFromReview", reviewId: review.id });
  assert.equal(applyAction(state, { action: "createXFromReview", reviewId: review.id }).id, result.id);
  const snapshot = state.xPosts[0].posts[0].text;
  review.posts[0].text = "Changed later";
  assert.equal(state.xPosts[0].posts[0].text, snapshot);
  assert.equal(review.scheduled, null);
});
test("dispatcher sends ordered replies once and stores receipts", async () => stored(async () => {
  await queue();
  const calls: (string | undefined)[] = [];
  const publisher = fakePublisher();
  publisher.send = async (_, __, parent) => { calls.push(parent); return String(100 + calls.length); };
  await dispatchDue(publisher); await dispatchDue(publisher);
  assert.deepEqual(calls, [undefined, "101"]);
  const post = (await readState()).xPosts[0];
  assert.equal(post.status, "published"); assert.deepEqual(post.publishedIds, ["101", "102"]);
  assert.throws(() => applyAction(awaitedState(post), { ...command(), postId: post.id }), /cannot be edited/);
}));
function awaitedState(post: ReturnType<typeof seedState>["xPosts"][number]) { return { ...seedState(), xPosts: [post] }; }
test("uncertain sends and partial threads never auto-retry", async () => stored(async () => {
  await queue(); let calls = 0;
  const publisher = fakePublisher(); publisher.send = async () => { calls++; if (calls === 1) return "100"; throw new XSendError("Network timeout", true); };
  await dispatchDue(publisher); await dispatchDue(publisher);
  const state = await readState();
  assert.equal(calls, 2); assert.equal(state.xPosts[0].status, "attention");
  assert.deepEqual(state.xPosts[0].publishedIds, ["100"]);
  assert.throws(() => applyAction(state, { ...command(), postId: state.xPosts[0].id }), /cannot be edited/);
}));
test("missed schedules are held instead of sent late", async () => stored(async () => {
  await queue();
  await changeState(null, state => { state.xPosts[0].scheduledAt = new Date(Date.now() - 3600000).toISOString(); });
  const publisher = fakePublisher(); publisher.send = async () => { throw new Error("Must not send"); };
  await dispatchDue(publisher);
  const post = (await readState()).xPosts[0];
  assert.equal(post.status, "failed"); assert.match(post.error, /Missed/);
}));
test("cancelled queue item cannot be dispatched and project data is preserved", async () => stored(async () => {
  const state = seedState();
  assert.deepEqual((await readState()).xPosts, []);
  const id = await queue();
  await changeState(null, saved => applyAction(saved, { action: "cancelXPost", postId: id }));
  let calls = 0; const publisher = fakePublisher(); publisher.send = async () => { calls++; return "1"; };
  await dispatchDue(publisher); assert.equal(calls, 0);
  assert.equal((await readState()).projects.length, state.projects.length);
}));
test("account mismatch stops before media upload or posting", async () => stored(async () => {
  await queue(); let calls = 0;
  const publisher = fakePublisher(); publisher.verify = async () => { throw new Error("Wrong account"); }; publisher.send = async () => { calls++; return "1"; };
  await dispatchDue(publisher); assert.equal(calls, 0);
  assert.equal((await readState()).xPosts[0].status, "failed");
}));

test("concurrent workers cannot send the same scheduled thread twice", async () => stored(async () => {
  await queue(); let calls = 0;
  const publisher = fakePublisher(); publisher.send = async () => String(++calls);
  await Promise.all([dispatchDue(publisher), dispatchDue(publisher)]);
  assert.equal(calls, 2);
  assert.equal((await readState()).xPosts[0].status, "published");
}));
