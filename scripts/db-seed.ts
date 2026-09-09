import { loadEnvConfig } from "@next/env";
import { changeState } from "../src/lib/editorial-store";
import { seedState } from "../src/lib/editorial-seed";
import { closeDatabase } from "../src/lib/database";
loadEnvConfig(process.cwd());
changeState(null, state => {
  if (state.projects.length || state.weeks.length || state.reviews.length || state.xPosts.length || state.revision) throw new Error("Demo seeding only works on a new, empty workspace.");
  Object.assign(state, seedState());
}).then(() => console.log("Demo data added. No existing data was replaced.")).catch(error => { console.error(error instanceof Error ? error.message : "Seed failed."); process.exitCode = 1; }).finally(closeDatabase);
