import { loadEnvConfig } from "@next/env";
import { closeDatabase } from "../src/lib/database";
import { schedulerHeartbeat } from "../src/lib/x-scheduler-status";
import { createXPublisher } from "../src/lib/x-publisher";
import { dispatchDue } from "../src/lib/x-scheduler";

loadEnvConfig(process.cwd());
async function main() {
  const publisher = createXPublisher(); // Explicit opt-in and user write credentials required.
  await schedulerHeartbeat();
  const pulse = setInterval(() => void schedulerHeartbeat().catch(() => {}), 30000);
  console.log("X scheduler running. Due posts will be sent to the account matching Settings.");
  try {
    do {
      await dispatchDue(publisher).catch(() => console.error("Scheduler could not finish a save. Check the queue; uncertain posts are not retried."));
      if (process.argv.includes("--once")) break;
      await new Promise(resolve => setTimeout(resolve, 15000));
    } while (true);
  } finally { clearInterval(pulse); }
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Scheduler could not start."); process.exitCode = 1; }).finally(closeDatabase);
