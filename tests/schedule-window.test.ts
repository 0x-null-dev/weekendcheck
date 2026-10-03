import assert from "node:assert/strict";
import { test } from "node:test";
import { scheduleTimeError, scheduleWeek } from "../src/lib/schedule-window";
import { applyAction } from "../src/lib/editorial-actions";
import { seedState } from "../src/lib/editorial-seed";

test("only future times before next Monday are schedulable", () => {
  const now = new Date("2026-10-04T20:00:00Z");
  assert.deepEqual(scheduleWeek(now, "Europe/Belgrade"), { start: "2026-09-28", end: "2026-10-04" });
  assert.match(scheduleTimeError("2026-10-04T20:00:00Z", "Europe/Belgrade", now)!, /future/);
  assert.equal(scheduleTimeError("2026-10-04T21:59:59Z", "Europe/Belgrade", now), null);
  assert.match(scheduleTimeError("2026-10-04T22:00:00Z", "Europe/Belgrade", now)!, /current week/);
  assert.match(scheduleTimeError("invalid", "Europe/Belgrade", now)!, /valid date/);
  assert.match(scheduleTimeError("2026-10-04T21:00:00Z", "Invalid/Zone", now)!, /time zone/);
});

test("weeks roll over on local Monday across year and daylight-saving boundaries", () => {
  assert.deepEqual(scheduleWeek(new Date("2026-10-04T22:00:00Z"), "Europe/Belgrade"), { start: "2026-10-05", end: "2026-10-11" });
  assert.deepEqual(scheduleWeek(new Date("2027-01-01T12:00:00Z"), "UTC"), { start: "2026-12-28", end: "2027-01-03" });
  assert.equal(scheduleTimeError("2026-10-25T22:59:00Z", "Europe/Belgrade", new Date("2026-10-24T12:00:00Z")), null);
  assert.match(scheduleTimeError("2026-10-25T23:00:00Z", "Europe/Belgrade", new Date("2026-10-24T12:00:00Z"))!, /current week/);
});

test("server enforces the week window for X posts and website reviews", t => {
  t.mock.timers.enable({ apis: ["Date"], now: new Date("2026-10-04T20:00:00Z") });
  const state = seedState();
  const post = { action: "saveXPost", title: "Test", posts: [{ id: "one", text: "Test post", assets: [] }], schedule: true, timeZone: "Europe/Belgrade" };
  assert.throws(() => applyAction(state, { ...post, scheduledAt: "2026-10-04T22:00:00Z" }), /current week/);
  assert.equal(state.xPosts.length, 0);
  applyAction(state, { ...post, scheduledAt: "2026-10-04T21:00:00Z" });
  const review = state.reviews.find(r => r.projectId === "minuteform")!;
  const command = { action: "scheduleReview", reviewId: review.id, timeZone: "Europe/Belgrade" };
  assert.throws(() => applyAction(state, { ...command, publishAt: "2026-10-04T22:00:00Z" }), /current week/);
  applyAction(state, { ...command, publishAt: "2026-10-04T21:00:00Z" });
  assert.equal(review.scheduled?.publishedAt, "2026-10-04T21:00:00.000Z");
  t.mock.timers.tick(2 * 3600000);
  applyAction(state, { ...post, scheduledAt: "2026-10-05T08:00:00Z" });
});
