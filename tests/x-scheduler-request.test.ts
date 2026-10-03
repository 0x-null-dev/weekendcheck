import assert from "node:assert/strict";
import { after, test } from "node:test";
import { schedulerAuthorized, runSchedulerRequest } from "../src/lib/x-scheduler-request";
import { database, closeDatabase } from "../src/lib/database";
import { resetTestWorkspace } from "./database-fixture";
import { schedulerStatus } from "../src/lib/x-scheduler-status";
after(closeDatabase);

function env(values: Record<string, string | undefined>) {
  const before = Object.fromEntries(Object.keys(values).map(key => [key, process.env[key]]));
  for (const [key, value] of Object.entries(values)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
  return () => { for (const [key, value] of Object.entries(before)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; } };
}
const secret = "test-only-cron-secret-at-least-32-characters";
const request = (token?: string) => new Request("http://localhost/api/cron/x", { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {} });

test("cron authorization fails closed and requires the exact bearer secret", async () => {
  const restore = env({ CRON_SECRET: undefined });
  try {
    assert.equal(schedulerAuthorized(request(secret)), false);
    assert.equal((await runSchedulerRequest(request())).status, 401);
    process.env.CRON_SECRET = "short";
    assert.equal(schedulerAuthorized(request("short")), false);
    process.env.CRON_SECRET = secret;
    assert.equal(schedulerAuthorized(request()), false);
    assert.equal(schedulerAuthorized(request("wrong")), false);
    assert.equal(schedulerAuthorized(request(secret + "extra")), false);
    assert.equal(schedulerAuthorized(request(secret)), true);
  } finally { restore(); }
});

test("cron cannot post from preview deployments or while paused", async () => {
  const restore = env({ CRON_SECRET: secret, VERCEL_ENV: "preview", X_POSTING_ENABLED: "false" });
  try {
    assert.equal((await runSchedulerRequest(request(secret))).status, 403);
    delete process.env.VERCEL_ENV;
    const response = await runSchedulerRequest(request(secret));
    assert.equal(response.status, 503);
    assert.match(response.headers.get("cache-control")!, /no-store/);
  } finally { restore(); }
});

test("an authenticated empty tick records a heartbeat without calling X", async () => {
  await resetTestWorkspace();
  await database().query("DELETE FROM weekendcheck.worker_status WHERE id='x-scheduler'");
  const restore = env({ CRON_SECRET: secret, VERCEL_ENV: "production", X_POSTING_ENABLED: "true", X_API_KEY: "fake", X_API_SECRET: "fake", X_ACCESS_TOKEN: "fake", X_ACCESS_TOKEN_SECRET: "fake" });
  try {
    assert.equal((await schedulerStatus()).running, false);
    const response = await runSchedulerRequest(request(secret));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true, processed: 0 });
    assert.equal((await schedulerStatus()).running, true);
    await database().query("UPDATE weekendcheck.worker_status SET last_seen=now()-interval '2 minutes' WHERE id='x-scheduler'");
    assert.equal((await schedulerStatus()).running, true);
    await database().query("UPDATE weekendcheck.worker_status SET last_seen=now()-interval '4 minutes' WHERE id='x-scheduler'");
    assert.equal((await schedulerStatus()).running, false);
  } finally { restore(); }
});
