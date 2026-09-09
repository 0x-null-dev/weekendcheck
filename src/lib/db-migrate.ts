import { readFile } from "node:fs/promises";
import path from "node:path";
import { transaction } from "./database";
import { defaultSettings, type EditorialState } from "./editorial";
export const emptyState = (): EditorialState => ({ version: 1, revision: 0, projects: [], weeks: [], reviews: [], xPosts: [], settings: { ...defaultSettings } });
export async function migrateDatabase() {
  const sql = await readFile(path.join(process.cwd(), "migrations", "001_server.sql"), "utf8");
  await transaction(async client => {
    await client.query("SELECT pg_advisory_xact_lock(724916023)");
    await client.query(sql);
    await client.query("INSERT INTO weekendcheck.workspace(id, revision, document) VALUES (1, 0, $1::jsonb) ON CONFLICT DO NOTHING", [JSON.stringify(emptyState())]);
  });
}
