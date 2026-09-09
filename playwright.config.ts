import { defineConfig } from "@playwright/test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
export default defineConfig({
  testDir: "./tests/browser",
  workers: 1,
  use: { baseURL: "http://localhost:3108", browserName: "chromium", trace: "retain-on-failure", storageState: process.env.WEEKENDCHECK_TEST_AUTH },
  webServer: {
    command: "npm run start -- --port 3108",
    port: 3108,
    reuseExistingServer: false,
    env: { DATABASE_URL: process.env.WEEKENDCHECK_TEST_DATABASE === "true" ? process.env.DATABASE_URL! : "", APP_URL: "http://localhost:3108", MEDIA_STORAGE: "local", WEEKENDCHECK_DATA_DIR: mkdtempSync(path.join(tmpdir(), "weekendcheck-browser-")), X_BEARER_TOKEN: "test-import-token", X_POSTING_ENABLED: "false", X_API_KEY: "", X_API_SECRET: "", X_ACCESS_TOKEN: "", X_ACCESS_TOKEN_SECRET: "" },
  },
});
