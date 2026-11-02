// Run against a running Vite server: npm run test:browser
// Optional: PORTFOLIO_TEST_URL and PLAYWRIGHT_CHROMIUM_EXECUTABLE.
import assert from "node:assert/strict";
import { chromium } from "playwright";

const base = process.env.PORTFOLIO_TEST_URL || "http://127.0.0.1:5173/";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
const browser = await chromium.launch({
  headless: true,
  ...(executablePath ? { executablePath, args: ["--no-sandbox", "--single-process", "--no-zygote"] } : {}),
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
page.setDefaultTimeout(15000);
const errors = [];
const consoleErrors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
await page.addInitScript(() => {
  localStorage.setItem("rahma-welcome-seen", "1");
  sessionStorage.setItem("rahma-booted", "1");
});
let sequence = 0;
async function go(route, width = 1440) {
  await page.setViewportSize({ width, height: width < 768 ? 740 : 900 });
  const url = new URL(base);
  url.searchParams.set("regression", String(++sequence));
  url.hash = `/${route}`;
  await page.goto(url.toString(), { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(400);
}
async function run(name, test) {
  await test();
  console.log(`PASS ${name}`);
}
const dock = () => page.getByRole("navigation", { name: "Desktop dock" });

try {
  await run("About image and launcher over active window", async () => {
    await go("about");
    const about = page.getByRole("dialog", { name: "About" });
    assert.ok(await about.getByText("Mohammed Rahmathullah", { exact: false }).count());
    assert.ok(await about.locator("img").first().evaluate((img) => img.complete && img.naturalWidth > 0));
    await dock().getByLabel("Apps").click();
    const launcher = page.getByRole("dialog", { name: "Apps Launcher" });
    await launcher.getByPlaceholder("Search apps...").fill("archive");
    await launcher.getByRole("button", { name: "Archive" }).click();
    assert.ok(await page.getByRole("dialog", { name: "Archive" }).isVisible());
    await page.getByLabel("Minimize Archive to dock").click();
    await dock().getByLabel("Apps").click();
    await launcher.getByPlaceholder("Search apps...").fill("archive");
    await launcher.getByRole("button", { name: "Archive" }).click();
    assert.ok(await page.getByRole("dialog", { name: "Archive" }).isVisible());
    await page.getByLabel("List view").click();
    assert.equal(await page.getByLabel("List view").getAttribute("aria-pressed"), "true");
  });
  await run("Work search, empty state and image viewer", async () => {
    await go("work");
    await page.getByPlaceholder("Search projects").fill("not-a-project");
    assert.ok(await page.getByText("No projects match these filters.", { exact: false }).isVisible());
    await page.getByPlaceholder("Search projects").fill("EchoRoom");
    await page.getByRole("dialog", { name: "Selected Work" }).getByRole("button", { name: /EchoRoom/ }).click();
    const expand = page.getByRole("button", { name: "Expand EchoRoom image" });
    await expand.click();
    const viewer = page.getByRole("dialog", { name: "Project image viewer" });
    assert.ok(await viewer.isVisible());
    assert.equal(await page.evaluate(() => document.elementFromPoint(innerWidth / 2, innerHeight - 40)?.closest('[aria-label="Project image viewer"]') !== null), true);
    await page.keyboard.press("Tab");
    assert.ok(await viewer.evaluate((el) => el.contains(document.activeElement)));
    await page.keyboard.press("Escape");
    assert.ok(await expand.isVisible());
    assert.equal(await expand.evaluate((el) => document.activeElement === el), true);
  });
  await run("Services categories and contact action", async () => {
    await go("services");
    const services = page.getByRole("dialog", { name: "Services" });
    await services.getByRole("button", { name: "Video Editing", exact: true }).click();
    await services.getByRole("button", { name: "View reel showcase" }).click();
    assert.ok(await services.getByText("Work coming soon", { exact: true }).isVisible());
    await services.getByRole("button", { name: "Graphic Design", exact: true }).click();
    await services.getByRole("button", { name: "Start a conversation" }).click();
    assert.ok(await page.getByRole("dialog", { name: "Contact" }).isVisible());
  });
  await run("Reel player layering and keyboard close with test fixture", async () => {
    // A synthetic fixture exercises the player without adding invented portfolio content.
    await page.route("**/src/config/reels.ts*", (route) => route.fulfill({
      contentType: "text/javascript",
      body: `export const PLATFORM_LABEL = {youtube:'YouTube'};
        export const REEL_CATEGORIES = [{id:'promo-edits',title:'B-Roll Editing'}];
        export const REELS = [{id:'fixture',title:'Test reel',description:'Fixture',category:'promo-edits',platform:'youtube',embedUrl:'https://example.invalid/fixture',thumbnail:'',aspect:'16:9'}];`,
    }));
    await page.route("https://example.invalid/fixture", (route) => route.fulfill({ contentType: "text/html", body: "<title>Test fixture</title>" }));
    await go("services");
    const services = page.getByRole("dialog", { name: "Services" });
    await services.getByRole("button", { name: "Reel Showcase" }).click();
    const trigger = services.getByRole("button", { name: "Play Test reel" });
    await trigger.click();
    const player = page.getByRole("dialog", { name: "Test reel player" });
    assert.ok(await player.isVisible());
    assert.equal(await page.evaluate(() => document.elementFromPoint(innerWidth / 2, innerHeight - 40)?.closest('[class*="z-[110]"]') !== null), true);
    await page.keyboard.press("Escape");
    assert.ok(await services.isVisible());
    assert.equal(await trigger.evaluate((el) => document.activeElement === el), true);
    await page.unrouteAll({ behavior: "wait" });
  });
  await run("Terminal commands and mobile output", async () => {
    await go("terminal", 320);
    const terminal = page.getByRole("dialog", { name: "Terminal Shell" });
    const command = page.getByLabel("Terminal command");
    await command.fill("projects");
    await command.press("Enter");
    assert.ok(await terminal.getByText("Project Index:").isVisible());
    const dimensions = await terminal.locator(".os-scroll").first().evaluate((el) => [el.clientWidth, el.scrollWidth]);
    assert.ok(dimensions[1] <= dimensions[0] + 1, `terminal overflows: ${dimensions}`);
    await command.fill("open   echoroom");
    await command.press("Enter");
    assert.ok(await page.getByRole("dialog", { name: "EchoRoom" }).isVisible());
  });
  await run("Estimator handoff and mobile sheet focus", async () => {
    await go("estimator", 320);
    await page.getByRole("button", { name: "Request a Quote" }).click();
    const contact = page.getByRole("dialog", { name: "Contact" });
    assert.ok((await contact.locator('textarea[name="message"]').inputValue()).includes("Project Scope Estimator"));
    const behind = page.locator('[data-window][aria-label="Scope & Budget Calculator"]');
    assert.equal(await behind.getAttribute("aria-hidden"), "true");
    assert.equal(await behind.evaluate((el) => el.inert), true);
    await contact.getByLabel("Close Contact").click();
    assert.ok(await page.getByRole("dialog", { name: "Scope & Budget Calculator" }).isVisible());
  });
  await run("Desktop window minimize, restore, maximize and resize", async () => {
    await go("about");
    await page.getByLabel("Minimize About to dock").click();
    await dock().getByLabel("About").click();
    const about = page.getByRole("dialog", { name: "About" });
    assert.ok(await about.isVisible());
    await about.getByLabel("Maximize window").click();
    assert.ok(await about.getByLabel("Restore window size").isVisible());
    await about.getByLabel("Restore window size").click();
    await page.waitForTimeout(1000);
    const before = await about.boundingBox();
    await page.mouse.move(before.x + before.width - 3, before.y + before.height / 2);
    await page.mouse.down();
    await page.mouse.move(before.x + before.width - 83, before.y + before.height / 2, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(200);
    const after = await about.boundingBox();
    assert.ok(after.width < before.width - 30, `window did not resize: ${before.width} -> ${after.width}`);
    await dock().getByLabel("Work").click();
    const work = page.getByRole("dialog", { name: "Selected Work" });
    await about.getByLabel("Close About").focus();
    const aboutZ = await about.evaluate((el) => Number(getComputedStyle(el).zIndex));
    const workZ = await work.evaluate((el) => Number(getComputedStyle(el).zIndex));
    assert.ok(aboutZ > workZ, `keyboard focus did not raise About: ${aboutZ} <= ${workZ}`);
  });
  await run("Settings persistence and wallpaper motion", async () => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await go("settings");
    const toggle = page.getByRole("switch", { name: "Background Motion" });
    if (await toggle.getAttribute("aria-checked") !== "true") await toggle.click();
    assert.equal(await page.locator("video").count(), 1);
    const motion = page.getByRole("group", { name: "Motion", exact: true });
    await motion.getByRole("button", { name: "Reduced" }).click();
    assert.equal(await page.locator("video").count(), 0);
    await motion.getByRole("button", { name: "Full" }).click();
    assert.equal(await page.locator("video").count(), 1);
    await toggle.click();
    assert.equal(await page.locator("video").count(), 0);
    await page.reload({ waitUntil: "domcontentloaded" });
    assert.equal(await page.getByRole("switch", { name: "Background Motion" }).getAttribute("aria-checked"), "false");
    await page.emulateMedia({ reducedMotion: "reduce" });
  });
  await run("Dock widths and mobile Contact", async () => {
    await go("", 320);
    for (const width of [320, 375, 390, 430, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: width < 768 ? 740 : 900 });
      await page.waitForTimeout(100);
      const bounds = await dock().boundingBox();
      const size = await dock().locator("div").first().evaluate((el) => [el.clientWidth, el.scrollWidth]);
      assert.ok(bounds && bounds.x >= -1 && bounds.x + bounds.width <= width + 1, `dock out of bounds at ${width}`);
      assert.ok(size[1] <= size[0] + 1, `dock content overflows at ${width}: ${size}`);
    }
    await page.setViewportSize({ width: 320, height: 740 });
    await dock().getByLabel("Contact").click();
    const contact = page.getByRole("dialog", { name: "Contact" });
    assert.equal(await contact.evaluate((el) => el.scrollWidth <= el.clientWidth), true);
    assert.equal(await contact.locator('a[href^="mailto:"]').first().getAttribute("href"), "mailto:rahmathullah5975@gmail.com");
  });
  await run("Dock remains usable with many running apps", async () => {
    await go("", 768);
    for (const route of ["terminal", "notes", "resume", "mail", "estimator", "paint", "arcade", "diagnostics", "playground"]) {
      await page.evaluate((name) => { location.hash = `#/${name}`; }, route);
      await page.waitForTimeout(120);
    }
    const container = dock().locator("div").first();
    assert.equal(await container.evaluate((el) => getComputedStyle(el).overflowX), "auto");
    await dock().getByLabel("Contact").scrollIntoViewIfNeeded();
    const bounds = await dock().boundingBox();
    assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= 768);
  });
  await run("Keyboard palette and desktop context menu", async () => {
    await go("");
    await page.keyboard.press("Control+k");
    assert.ok(await page.getByRole("dialog", { name: "Command palette" }).isVisible());
    await page.getByLabel("Command palette search").fill("About");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Escape");
    await page.getByRole("dialog", { name: "Command palette" }).waitFor({ state: "hidden" });
    await page.locator("main").click({ button: "right", position: { x: 400, y: 700 } });
    assert.ok(await page.getByRole("menu", { name: "Desktop context menu" }).isVisible());
    await page.keyboard.press("Escape");
  });
  await run("Secondary app routes on mobile", async () => {
    for (const route of ["notes", "resume", "mail", "paint", "arcade", "estimator", "diagnostics", "playground"]) {
      await go(route, 320);
      const window = page.locator("[data-window]").last();
      assert.ok(await window.isVisible(), `${route} did not open`);
      const broken = await window.locator("img").evaluateAll((images) => images.filter((img) => img.currentSrc && img.complete && !img.naturalWidth).map((img) => img.currentSrc));
      assert.deepEqual(broken, [], `${route} has broken images`);
      assert.equal(await window.evaluate((el) => el.scrollWidth <= el.clientWidth), true, `${route} window overflows`);
    }
    await go("resume", 320);
    const tabs = page.getByRole("button", { name: "Skills & Tech" });
    await tabs.click();
    assert.equal(await tabs.getAttribute("aria-pressed"), "true");
  });
  assert.deepEqual(errors, [], "Uncaught browser errors");
  assert.deepEqual(consoleErrors, [], "Browser console errors");
  console.log("PASS no uncaught browser or console errors");
} finally {
  await browser.close();
}

// A separate browser avoids mixing mobile emulation with the desktop context.
const touchBrowser = await chromium.launch({
  headless: true,
  ...(executablePath ? { executablePath, args: ["--no-sandbox", "--single-process", "--no-zygote"] } : {}),
});
try {
  const context = await touchBrowser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const touchPage = await context.newPage();
  const touchErrors = [];
  touchPage.on("pageerror", (error) => touchErrors.push(error.message));
  await touchPage.addInitScript(() => { localStorage.setItem("rahma-welcome-seen", "1"); sessionStorage.setItem("rahma-booted", "1"); });
  await touchPage.goto(base, { waitUntil: "domcontentloaded", timeout: 30000 });
  await touchPage.getByRole("navigation", { name: "Desktop dock" }).getByLabel("Apps").tap();
  const launcher = touchPage.getByRole("dialog", { name: "Apps Launcher" });
  await launcher.getByRole("button", { name: "About Designwithrahma" }).tap();
  assert.ok(await touchPage.getByRole("dialog", { name: "About" }).isVisible());
  assert.deepEqual(touchErrors, []);
  console.log("PASS emulated touch navigation");
} finally {
  await touchBrowser.close();
}
