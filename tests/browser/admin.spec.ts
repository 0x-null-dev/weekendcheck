import { expect, test } from "@playwright/test";

test("create week, add project, select, write, preview, publish and verify persistence", async ({ page }) => {
  page.on("dialog", dialog => dialog.accept());
  await page.goto("/admin/weeks");
  await page.getByLabel("Week starting").fill("2026-10-12");
  await page.getByRole("button", { name: "Create week", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Oct 12 — 18, 2026" })).toBeVisible();
  await page.getByRole("button", { name: "Add / import", exact: true }).click();
  await page.getByLabel("Project name", { exact: true }).fill("Browser Test App");
  await page.getByLabel("Website", { exact: true }).fill("https://browser-test.example");
  await page.getByLabel("Founder X handle").fill("browser_builder");
  await page.getByLabel("Description", { exact: true }).fill("A project created through the real admin.");
  await page.getByRole("button", { name: "Add project", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Project added");
  await page.getByRole("button", { name: "Projects", exact: true }).click();
  await page.getByLabel("Review choice for Browser Test App").selectOption("quick");
  await expect(page.getByRole("status")).toContainText("Review choice saved");
  await page.getByLabel("Access for Browser Test App", { exact: true }).selectOption("paid");
  await expect(page.getByRole("status")).toContainText("Access saved");
  await page.reload();
  await expect(page.getByLabel("Access for Browser Test App", { exact: true })).toHaveValue("paid");
  await expect(page.locator(".desk-project-row").filter({ hasText: "Browser Test App" })).toContainText("Quick Take · Paid");
  await page.getByRole("button", { name: "Publish selection", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("published");
  await page.getByRole("button", { name: "Write review →", exact: true }).click();
  await page.getByLabel("Review title").fill("Browser review");
  await page.getByLabel("Post 1 text", { exact: true }).fill("The opening review post.");
  await page.getByRole("button", { name: "Add thread reply" }).click();
  await page.getByLabel("Post 2 text", { exact: true }).fill("A useful follow-up.");
  await page.getByLabel("Attach screenshots or video").first().setInputFiles({
    name: "screenshot.png", mimeType: "image/png",
    buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jR1kAAAAASUVORK5CYII=", "base64"),
  });
  await expect(page.locator(".desk-asset img")).toBeVisible();
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("saved");
  await page.reload();
  await expect(page.getByLabel("Post 2 text")).toHaveValue("A useful follow-up.");
  await page.screenshot({ path: "/private/tmp/weekendcheck-admin-editor.png", fullPage: true });
  await page.getByRole("button", { name: "Preview thread", exact: true }).click();
  await expect(page.locator(".desk-thread-preview")).toContainText("The opening review post.");
  await page.getByRole("button", { name: "Publish now", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Review published");
  await page.goto("/projects/browser-test-app");
  await expect(page.locator(".review-thread")).toContainText("The opening review post.");
  await expect(page.locator(".review-thread")).toContainText("A useful follow-up.");
  const media = page.getByRole("img", { name: "Project screenshot", exact: true });
  await expect(media).toBeVisible();
  const mediaUrl = await media.getAttribute("src");
  expect((await page.request.get(mediaUrl!)).status()).toBe(200);
  await expect(page.locator("main")).not.toContainText("Quick Take · Paid");
  await page.goto("/admin/projects");
  const project = page.locator(".desk-list-row").filter({ hasText: "Browser Test App" });
  await expect(project).toContainText("Quick Take · Paid");
  await expect(project).not.toContainText("Reviewed");
  await project.click();
  await page.getByLabel("Access for Browser Test App", { exact: true }).selectOption("trial");
  await expect(page.getByRole("status")).toContainText("Access saved");
  await page.reload();
  await expect(page.getByLabel("Access for Browser Test App", { exact: true })).toHaveValue("trial");
  await expect(page.locator(".desk-list-row").filter({ hasText: "Oct 12" })).toContainText("Quick Take · Trial");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("review types and access stay simple and persist through selection edits", async ({ page }) => {
  await page.goto("/admin/weeks/september-8-2026");
  const choice = page.getByLabel("Review choice for NovelHive", { exact: true });
  await expect(choice.locator("option")).toHaveText(["In consideration", "Quick Take", "Deep Review"]);
  await expect(page.getByLabel("Access for NovelHive", { exact: true })).toHaveCount(0);
  await choice.selectOption("deep");
  await expect(page.getByRole("status")).toContainText("Review choice saved");
  const access = page.getByLabel("Access for NovelHive", { exact: true });
  await expect(access).toHaveValue("");
  for (const value of ["free", "trial", "paid"]) {
    await access.selectOption(value);
    await expect(page.getByRole("status")).toContainText("Access saved");
  }
  const row = page.locator(".desk-project-row").filter({ hasText: "NovelHive" });
  await row.getByRole("button", { name: "Edit selection", exact: true }).click();
  await page.getByLabel("Access", { exact: true }).selectOption("");
  await page.getByRole("button", { name: "Save selection", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Selection saved");
  await expect(access).toHaveValue("");
  await choice.selectOption("quick");
  await expect(page.getByRole("status")).toContainText("Review choice saved");
  await access.selectOption("free");
  await expect(page.getByRole("status")).toContainText("Access saved");
  await page.reload();
  await expect(row).toContainText("Quick Take · Free");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: "/private/tmp/weekendcheck-review-tracking-mobile.png", fullPage: true });
});

test("admin navigation and mobile layout have no dead routes or overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  for (const route of ["/admin", "/admin/weeks", "/admin/projects", "/admin/reviews", "/admin/settings", "/admin/weeks/september-8-2026", "/admin/schedule", "/admin/schedule/new"]) {
    await page.goto(route);
    await expect(page.locator(".desk-main h1")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
  await page.screenshot({ path: "/private/tmp/weekendcheck-admin-mobile.png", fullPage: true });
});

test("paste import is editable, deduplicated, and private until published", async ({ page }) => {
  page.on("dialog", dialog => dialog.accept());
  await page.goto("/admin/weeks/september-8-2026");
  await page.getByRole("button", { name: "Add / import", exact: true }).click();
  await page.getByRole("button", { name: "Import from X / paste", exact: true }).click();
  await page.getByLabel("Paste projects").fill("https://paste-test.example | Paste Test | @builder | Original description\nhttps://paste-test.example/?utm_source=x");
  await page.getByRole("button", { name: "Preview pasted projects", exact: true }).click();
  await expect(page.getByRole("heading", { name: "1 project candidates" })).toBeVisible();
  await page.getByLabel("Description", { exact: true }).fill("Edited before import");
  await page.getByRole("button", { name: "Import 1 projects", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Added 1 projects");
  await page.goto("/?week=september-8-2026#weeks");
  await expect(page.locator(".homepage-projects")).not.toContainText("Paste Test");
  await page.goto("/admin/projects");
  await page.getByLabel("Search projects").fill("Paste Test");
  await page.locator(".desk-list-row").filter({ hasText: "Paste Test" }).click();
  await expect(page.getByLabel("Description", { exact: true })).toHaveValue("Edited before import");
  await page.getByRole("button", { name: "Archive", exact: true }).click();
  await expect(page.getByRole("button", { name: "Restore", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Restore", exact: true }).click();
  await expect(page.getByRole("button", { name: "Archive", exact: true })).toBeVisible();
});

test("settings save publicly, export downloads state, and review scheduling cancels", async ({ page }) => {
  await page.goto("/admin/settings");
  await page.getByLabel("Display name").fill("Alex Test");
  await page.getByRole("button", { name: "Save settings", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Saved");
  const exported = await page.request.get("/api/admin/export");
  expect(exported.status()).toBe(200);
  expect((await exported.json()).settings.name).toBe("Alex Test");
  await page.goto("/");
  await expect(page.locator("footer a")).toHaveAttribute("href", /x\.com\/0xAlex_dev$/);
  await page.goto("/admin/reviews/september-1-2026--minuteform");
  const reviewTime = await page.evaluate(() => {
    const date = new Date(Date.now() + 120000);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  await page.getByLabel("Schedule on site", { exact: true }).fill(reviewTime);
  await page.getByRole("button", { name: "Schedule saved version", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("scheduled");
  await page.reload();
  await expect(page.getByRole("button", { name: "Cancel schedule", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Cancel schedule", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("cancelled");
  await page.goto("/projects/minuteform");
  await expect(page.locator(".review-thread")).toContainText("Quick take on Minuteform");
});

test("X composer saves, schedules, edits and cancels a thread without sending it", async ({ page }) => {
  page.on("dialog", dialog => dialog.accept());
  await page.goto("/admin/schedule/new");
  await expect(page.getByText("X posting is not connected.", { exact: false })).toBeVisible();
  await page.getByLabel("Post label (only for you)").fill("Weekend call");
  await page.getByLabel("X post 1 text").fill("Indie builders: share what you are building this weekend.");
  await page.getByRole("button", { name: "Add thread reply", exact: true }).click();
  await page.getByLabel("X post 2 text").fill("I will pick a few projects for next week's reviews.");
  const postTime = await page.evaluate(() => {
    const date = new Date(Date.now() + 120000);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  await page.getByLabel("Post date and time").fill(postTime);
  await page.getByRole("button", { name: "Schedule on X", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/schedule\/(?!new)[^/]+$/);
  await page.reload();
  await expect(page.getByLabel("X post 2 text")).toHaveValue("I will pick a few projects for next week's reviews.");
  await page.getByLabel("X post 1 text").fill("Updated call for indie projects.");
  await page.getByRole("button", { name: "Update schedule", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("X post scheduled");
  await page.getByRole("link", { name: "← Schedule", exact: true }).click();
  const day = postTime.slice(0, 10);
  const slotTime = `${postTime.slice(11, 13)}:${Number(postTime.slice(14)) < 30 ? "00" : "30"}`;
  await expect(page.locator(`.desk-calendar-slot[data-day="${day}"][data-time="${slotTime}"]`)).toContainText("Weekend call");
  await page.getByRole("button", { name: "Dismiss notification" }).click();
  await page.getByRole("link").filter({ hasText: "Weekend call" }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: "/private/tmp/weekendcheck-schedule.png", fullPage: true });
  await page.getByRole("link").filter({ hasText: "Weekend call" }).click();
  await expect(page.getByLabel("X post 1 text")).toHaveValue("Updated call for indie projects.");
  await page.getByRole("button", { name: "Cancel X schedule", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("cancelled");
  await expect(page.getByRole("button", { name: "Schedule on X", exact: true })).toBeVisible();
});

test("projects expose reviews and review threads can be copied to X drafts", async ({ page }) => {
  await page.goto("/admin/projects/minuteform");
  await page.getByRole("link", { name: "Open review →", exact: true }).click();
  const text = await page.getByLabel("Post 1 text", { exact: true }).inputValue();
  await page.getByRole("button", { name: "Schedule thread on X →", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/schedule\//);
  await expect(page.getByLabel("X post 1 text")).toHaveValue(text);
  await expect(page.getByRole("link", { name: "Open website review →" })).toBeVisible();
});

test("X import follows available pages and deduplicates an editable preview", async ({ page }) => {
  let requests = 0;
  await page.route("**/api/admin/x-import", route => {
    requests++;
    const next = route.request().postDataJSON().nextToken;
    return route.fulfill({ json: { candidates: next ? [
      { name: "First duplicate", url: "https://x-import-one.example", description: "Same", handle: "builder", source: "https://x.com/builder/status/100" },
      { name: "Second app", url: "https://x-import-two.example", description: "Second description", handle: "builder", source: "https://x.com/builder/status/101" },
    ] : [{ name: "First app", url: "https://x-import-one.example", description: "First description", handle: "builder", source: "https://x.com/builder/status/100" }], nextToken: next ? null : "page-two", replyCount: next ? 2 : 100 } });
  });
  await page.goto("/admin/projects");
  await page.getByRole("button", { name: "Import from X", exact: true }).click();
  await page.getByRole("combobox", { name: "Add to week", exact: true }).selectOption("september-8-2026");
  await page.getByLabel("X call post URL (optional for paste import)").fill("https://x.com/alex/status/123");
  await page.getByRole("button", { name: "Fetch replies from X", exact: true }).click();
  await expect(page.getByRole("heading", { name: "2 project candidates", exact: true })).toBeVisible();
  expect(requests).toBe(2);
  await page.getByLabel("Description", { exact: true }).first().fill("Corrected description");
  await page.getByRole("button", { name: "Import 2 projects", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Added 2 projects");
});

test("calendar locks to this week, marks now, and only offers future slots", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-01T10:15:00") });
  await page.goto("/admin/schedule?week=2030-10-21");
  await expect(page.locator(".desk-calendar-day")).toHaveCount(7);
  await expect(page.locator(".desk-calendar-slot")).toHaveCount(336);
  await expect(page).toHaveURL(/\/admin\/schedule$/);
  await expect(page.getByLabel("Calendar week", { exact: true })).toHaveCount(0);
  const current = page.locator('.desk-calendar-slot[aria-current="time"]');
  await expect(current).toHaveAttribute("data-day", "2026-10-01");
  await expect(current).toHaveAttribute("data-time", "10:00");
  await expect(current).toContainText("Now 10:15");
  await expect(page.locator(".desk-calendar-slot.is-past .desk-calendar-add")).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Now", exact: true }).click();
  expect(await page.locator(".desk-calendar-now").evaluate(marker => {
    const bounds = marker.getBoundingClientRect();
    const viewport = marker.closest(".desk-calendar-scroll")!.getBoundingClientRect();
    return bounds.left >= viewport.left && bounds.right <= viewport.right && bounds.top >= viewport.top && bounds.top <= viewport.bottom;
  })).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: "/private/tmp/weekendcheck-calendar-mobile.png", fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const time of ["14:00", "14:30", "23:30", "00:00"]) {
    await page.getByRole("link", { name: `Add X post on 2026-10-02 at ${time}`, exact: true }).click();
    await expect(page.getByLabel("Post date and time")).toHaveValue(`2026-10-02T${time}`);
    await expect(page.getByLabel("Post date and time")).toHaveAttribute("max", "2026-10-04T23:59");
    await page.getByRole("link", { name: "← Schedule", exact: true }).click();
    await expect(page.locator(".desk-calendar-day").first()).toContainText("28");
  }
  await page.screenshot({ path: "/private/tmp/weekendcheck-calendar-grid.png", fullPage: true });
});

test("an open calendar rolls into the new week on Monday", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-04T23:59:50") });
  await page.goto("/admin/schedule");
  await expect(page.locator(".desk-calendar-day").first()).toContainText("28");
  await page.clock.runFor(11000);
  await expect(page.locator(".desk-calendar-day").first()).toContainText("5");
  await expect(page.locator('.desk-calendar-slot[aria-current="time"]')).toHaveAttribute("data-day", "2026-10-05");
  await expect(page.locator('.desk-calendar-slot[aria-current="time"]')).toContainText("Now 00:00");
});

test("composer rejects past and later-week times while keeping drafts editable", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-01T10:15:00") });
  await page.goto("/admin/schedule/new");
  await page.getByLabel("X post 1 text").fill("Scheduling limits test");
  const input = page.getByLabel("Post date and time");
  await expect(input).toHaveAttribute("min", "2026-10-01T10:16");
  await input.fill("2026-10-01T10:00");
  await page.getByRole("button", { name: "Schedule on X", exact: true }).click();
  await expect(page.locator(".desk-error[role=alert]")).toContainText("future publication time");
  await input.fill("2026-10-05T10:00");
  await page.getByRole("button", { name: "Schedule on X", exact: true }).click();
  await expect(page.locator(".desk-error[role=alert]")).toContainText("current week");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("X draft saved");
});
