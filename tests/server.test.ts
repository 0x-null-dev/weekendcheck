import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createHash } from "node:crypto";
import { database, closeDatabase } from "../src/lib/database";
import { migrateDatabase } from "../src/lib/db-migrate";
import { changeState, readState } from "../src/lib/editorial-store";
import { hashPassword, login, LoginRateLimited, revokeSession, setAdminPassword, validSession, verifyPassword } from "../src/lib/admin-auth";
import { publiclyVisibleMedia } from "../src/lib/media-store";
import { readJson } from "../src/lib/request-body";
import { resetTestWorkspace } from "./database-fixture";
import { seedState } from "../src/lib/editorial-seed";
after(closeDatabase);
const password = "test-password-at-least-twelve";
const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

test("migration is repeatable and does not replace saved data", async () => {
  await resetTestWorkspace();
  await changeState(null, state => { state.settings.name = "Keep this name"; });
  await migrateDatabase(); assert.equal((await readState()).settings.name, "Keep this name");
});
test("concurrent saves preserve one winner and reject the stale revision", async () => {
  await resetTestWorkspace(); const before = await readState();
  const results = await Promise.allSettled([changeState(before.revision, s => { s.settings.name = "First"; }), changeState(before.revision, s => { s.settings.name = "Second"; })]);
  assert.equal(results.filter(r => r.status === "fulfilled").length, 1);
  assert.equal((await readState()).revision, before.revision + 1);
});
test("password hashes are salted and invalid credentials cannot create sessions", async () => {
  const hash = await hashPassword(password);
  assert.notEqual(hash, await hashPassword(password));
  assert.equal(await verifyPassword(password, hash), true);
  assert.equal(await verifyPassword("wrong", hash), false);
  await assert.rejects(hashPassword("short"), /12/);
  await setAdminPassword(password);
  await database().query("DELETE FROM weekendcheck.login_limits");
  assert.equal(await login("wrong"), null);
  assert.equal((await database().query("SELECT * FROM weekendcheck.admin_sessions")).rowCount, 0);
});
test("opaque sessions expire, revoke and rotate with the admin password", async () => {
  await database().query("DELETE FROM weekendcheck.login_limits");
  const token = (await login(password))!; assert.ok(token);
  assert.equal(await validSession(token), true);
  assert.equal(await validSession("invalid"), false);
  const stored = await database().query("SELECT token_hash FROM weekendcheck.admin_sessions");
  assert.ok(!JSON.stringify(stored.rows).includes(token));
  await revokeSession(token); assert.equal(await validSession(token), false);
  const expired = (await login(password))!;
  await database().query("UPDATE weekendcheck.admin_sessions SET expires_at=now()-interval '1 second' WHERE token_hash=$1", [tokenHash(expired)]);
  assert.equal(await validSession(expired), false);
  const rotated = (await login(password))!;
  await setAdminPassword(password + "-new"); assert.equal(await validSession(rotated), false);
});
test("login throttling is persisted in Postgres", async () => {
  await database().query("INSERT INTO weekendcheck.login_limits(id,attempts,resets_at) VALUES('admin',10,now()+interval '15 minutes') ON CONFLICT(id) DO UPDATE SET attempts=10,resets_at=EXCLUDED.resets_at");
  await assert.rejects(login(password), LoginRateLimited);
  await database().query("DELETE FROM weekendcheck.login_limits");
});
test("draft media is private and only published snapshots allow anonymous reads", () => {
  const state = seedState(); const review = state.reviews[0];
  const url = "/api/media/12345678-1234-1234-1234-123456789012.png";
  review.posts = [{ id: "new", text: "Private draft", assets: [{ id: "a", url, type: "image", alt: "" }] }];
  assert.equal(publiclyVisibleMedia(state, url), false);
  review.published = { title: "Public review", posts: review.posts, publishedAt: new Date().toISOString() };
  assert.equal(publiclyVisibleMedia(state, url), true);
  state.weeks.find(w => w.id === review.weekId)!.selection = null;
  assert.equal(publiclyVisibleMedia(state, url), false);
});
test("JSON request limits are enforced even without Content-Length", async () => {
  await assert.rejects(readJson(new Request("http://localhost", { method: "POST", body: JSON.stringify({ text: "a".repeat(200) }) }), 64), /too large/);
  assert.deepEqual(await readJson(new Request("http://localhost", { method: "POST", body: '{"ok":true}' }), 100), { ok: true });
});
