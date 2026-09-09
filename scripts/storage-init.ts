import { loadEnvConfig } from "@next/env";
import { initializeMediaStorage } from "../src/lib/media-store";
loadEnvConfig(process.cwd());
initializeMediaStorage().then(() => console.log("Media storage is ready.")).catch(error => { console.error(error instanceof Error ? error.message : "Storage initialization failed."); process.exitCode = 1; });
