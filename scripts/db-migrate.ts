import { loadEnvConfig } from "@next/env";
import { migrateDatabase } from "../src/lib/db-migrate";
import { closeDatabase } from "../src/lib/database";
import { setAdminPassword } from "../src/lib/admin-auth";
loadEnvConfig(process.cwd());
async function main() {
  await migrateDatabase();
  console.log("Application database initialized. Existing tables were not deleted.");
  if (process.env.ADMIN_PASSWORD) { await setAdminPassword(process.env.ADMIN_PASSWORD, true); console.log("Admin account is configured. Existing passwords were not changed."); }
  else console.log("Set ADMIN_PASSWORD and run npm run admin:set-password to enable login.");
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Migration failed."); process.exitCode = 1; }).finally(closeDatabase);
