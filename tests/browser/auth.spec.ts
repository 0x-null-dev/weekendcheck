import { expect, test } from "@playwright/test";
test.use({ storageState: { cookies: [], origins: [] } });

test("anonymous users cannot access admin pages or APIs", async ({ page, request }) => {
  await page.goto("/admin/schedule"); await expect(page).toHaveURL(/\/login$/);
  for (const route of ["/api/admin", "/api/admin/export", "/api/admin/scheduler-status"]) expect((await request.get(route)).status()).toBe(401);
  for (const route of ["/api/admin", "/api/admin/upload", "/api/admin/x-import"]) expect((await request.post(route, { data: {}, headers: { Origin: "http://localhost:3108" } })).status()).toBe(401);
  expect((await request.get("/")).status()).toBe(200);
});
test("login validates credentials and logout revokes access", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Password", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "Sign in →" }).click();
  await expect(page.locator("form [role=alert]")).toContainText("Incorrect password");
  await page.getByLabel("Password", { exact: true }).fill("browser-admin-test-password");
  await page.getByRole("button", { name: "Sign in →" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  const cookies = await page.context().cookies();
  const session = cookies.find(c => c.name === "wc_admin_session");
  expect(session?.httpOnly).toBe(true); expect(session?.sameSite).toBe("Strict");
  const csrf = await page.request.post("/api/admin", { data: { revision: 0 }, headers: { Origin: "https://evil.example" } });
  expect(csrf.status()).toBe(403);
  const missingOrigin = await page.request.post("/api/admin", { data: { revision: 0 } });
  expect(missingOrigin.status()).toBe(403);
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect((await page.request.get("/api/admin")).status()).toBe(401);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "/private/tmp/weekendcheck-login.png", fullPage: true });
});
test("cross-origin sign-in is rejected", async ({ request }) => {
  expect((await request.post("/api/admin/login", { headers: { Origin: "https://evil.example" }, data: { password: "browser-admin-test-password" } })).status()).toBe(403);
});

test("uploaded media stays private until published and supports byte ranges", async ({ browser }) => {
  const admin = await browser.newContext({ storageState: process.env.WEEKENDCHECK_TEST_AUTH });
  const anonymous = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const origin = "http://localhost:3108";
  try {
    const upload = await admin.request.post(`${origin}/api/admin/upload`, { headers: { Origin: origin }, multipart: { file: { name: "private.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jR1kAAAAASUVORK5CYII=", "base64") } } });
    expect(upload.status()).toBe(200); const asset = await upload.json();
    expect((await admin.request.get(origin + asset.url)).status()).toBe(200);
    expect((await anonymous.request.get(origin + asset.url)).status()).toBe(404);
    const state = await (await admin.request.get(`${origin}/api/admin`)).json();
    const published = await admin.request.post(`${origin}/api/admin`, { headers: { Origin: origin }, data: { action: "saveSettings", revision: state.revision, ...state.settings, avatarUrl: asset.url } });
    expect(published.status()).toBe(200);
    const media = await anonymous.request.get(origin + asset.url, { headers: { Range: "bytes=0-7" } });
    expect(media.status()).toBe(206); expect((await media.body()).length).toBe(8);
    expect(media.headers()["cache-control"]).toContain("no-store");
    expect((await anonymous.request.get(origin + asset.url, { headers: { Range: "bytes=999999-" } })).status()).toBe(416);
    const saved = await published.json();
    expect((await admin.request.post(`${origin}/api/admin`, { headers: { Origin: origin }, data: { action: "saveSettings", revision: saved.state.revision, ...state.settings } })).status()).toBe(200);
    expect((await anonymous.request.get(origin + asset.url)).status()).toBe(404);
  } finally { await admin.close(); await anonymous.close(); }
});
