import EmbeddedPostgres from "embedded-postgres";
import { mkdtemp, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createServer } from "node:net";
import { randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { migrateDatabase } from "../src/lib/db-migrate";
import { closeDatabase, database } from "../src/lib/database";
import { login, SESSION_COOKIE, setAdminPassword } from "../src/lib/admin-auth";
import { seedState } from "../src/lib/editorial-seed";

async function freePort() {
  const server = createServer();
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  const port = (server.address() as { port: number }).port;
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  return port;
}
async function main() {
  const directory = await mkdtemp(path.join(tmpdir(), "weekendcheck-postgres-test-"));
  const port = await freePort(); const password = randomBytes(24).toString("hex");
  const postgres = new EmbeddedPostgres({ databaseDir: path.join(directory, "pgdata"), port, user: "postgres", password, authMethod: "scram-sha-256", persistent: true, initdbFlags: ["--locale=C", "--encoding=UTF8"], postgresFlags: ["-h", "127.0.0.1"], onLog: () => {}, onError: () => {} });
  let child: ReturnType<typeof spawn> | undefined;
  try {
    await postgres.initialise(); await postgres.start(); await postgres.createDatabase("wc_test");
    process.env.DATABASE_URL = `postgresql://postgres:${password}@127.0.0.1:${port}/wc_test`;
    process.env.WEEKENDCHECK_TEST_DATABASE = "true";
    process.env.MEDIA_STORAGE = "local";
    process.env.WEEKENDCHECK_DATA_DIR = path.join(directory, "media");
    process.env.APP_URL = "http://localhost:3108";
    process.env.X_POSTING_ENABLED = "false";
    await migrateDatabase();
    const seed = seedState();
    await database().query("UPDATE weekendcheck.workspace SET document=$1::jsonb,revision=0 WHERE id=1", [JSON.stringify(seed)]);
    await setAdminPassword("browser-admin-test-password");
    const token = await login("browser-admin-test-password");
    const authFile = path.join(directory, "auth.json");
    await writeFile(authFile, JSON.stringify({ cookies: [{ name: SESSION_COOKIE, value: token, domain: "localhost", path: "/", expires: Math.floor(Date.now()/1000) + 3600, httpOnly: true, secure: false, sameSite: "Strict" }], origins: [] }), { mode: 0o600 });
    process.env.WEEKENDCHECK_TEST_AUTH = authFile;
    await closeDatabase();
    const browser = process.argv[2] === "browser";
    const args = browser ? ["node_modules/@playwright/test/cli.js", "test"] : ["--import", "tsx", "--test", "--test-concurrency=1", ...(await readdir("tests")).filter(name => name.endsWith(".test.ts")).map(name => `tests/${name}`)];
    child = spawn(process.execPath, args, { env: process.env, stdio: "inherit" });
    return await new Promise<number>((resolve, reject) => { child!.on("error", reject); child!.on("exit", code => resolve(code ?? 1)); });
  } finally { child?.kill(); await closeDatabase(); await postgres.stop(); }
}
// embedded-postgres installs a beforeExit hook that otherwise replaces failure
// codes with zero. Exit explicitly only after main's awaited cleanup has run.
main().then(code => process.exit(code), error => { console.error(error instanceof Error ? error.message : "Test database failed to start."); process.exit(1); });
