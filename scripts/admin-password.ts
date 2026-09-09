import { loadEnvConfig } from "@next/env";
import { setAdminPassword } from "../src/lib/admin-auth";
import { closeDatabase } from "../src/lib/database";
loadEnvConfig(process.cwd());
setAdminPassword(process.env.ADMIN_PASSWORD || "").then(() => console.log("Admin password updated. All existing sessions revoked.")).catch(error => { console.error(error instanceof Error ? error.message : "Password update failed."); process.exitCode = 1; }).finally(closeDatabase);
