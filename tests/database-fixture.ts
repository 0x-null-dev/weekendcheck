import { database } from "../src/lib/database";
import { seedState } from "../src/lib/editorial-seed";
export async function resetTestWorkspace() {
  const url = new URL(process.env.DATABASE_URL || "http://invalid");
  if (process.env.WEEKENDCHECK_TEST_DATABASE !== "true" || url.hostname !== "127.0.0.1" || url.pathname !== "/wc_test") throw new Error("Tests require an isolated Postgres database. Use npm test.");
  await database().query("UPDATE weekendcheck.workspace SET document=$1::jsonb,revision=0 WHERE id=1", [JSON.stringify(seedState())]);
}
