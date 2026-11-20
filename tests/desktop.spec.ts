import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("rahma-booted", "1"));
});

test("blocked local storage does not prevent desktop startup", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, "localStorage", {
    get() { throw new DOMException("Storage blocked", "SecurityError"); },
  }));
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/#/contact");
  await expect(page.getByRole("textbox", { name: "Message", exact: true })).toBeEditable();
  expect(errors).toEqual([]);
});

test("requesting a quote carries services and tier into an existing contact draft", async ({ page }) => {
  await page.goto("/#/contact");
  const message = page.getByRole("textbox", { name: "Message", exact: true });
  await message.fill("We launch in April.");
  await page.evaluate(() => { location.hash = "/estimator"; });
  await page.getByRole("button", { name: "Brand Identity & Art Direction" }).click();
  await page.getByRole("button", { name: /Flagship/ }).click();
  await page.getByRole("button", { name: "Request a Quote" }).click();
  await expect(page).toHaveURL(/#\/contact$/);
  await expect(message).toHaveValue(/We launch in April\.[\s\S]*Brand Identity & Art Direction[\s\S]*Tier: Flagship/);
});

test("wallpaper switches to a still for either motion preference", async ({ page }) => {
  await page.goto("/#/settings");
  const video = page.locator("video");
  const toggle = page.getByRole("switch", { name: "Background Motion" });
  await expect(video).toHaveCount(1);
  await toggle.click();
  await expect(video).toHaveCount(0);
  await page.reload();
  await expect(toggle).not.toBeChecked();
  await expect(video).toHaveCount(0);
  await toggle.click();
  await expect(video).toHaveCount(1);
  await page.getByRole("button", { name: "Reduced", exact: true }).click();
  await expect(video).toHaveCount(0);
});

test("closing the last visible window returns home; relaunch restores a minimized folder", async ({ page }) => {
  await page.goto("/#/folder/archive");
  await page.getByRole("button", { name: "Minimize Archive to dock" }).click();
  await expect(page).toHaveURL(/#\/$/);
  await page.keyboard.press("c");
  await page.getByRole("button", { name: "Close Contact" }).click();
  await expect(page).toHaveURL(/#\/$/);
  await page.getByRole("button", { name: "Apps", exact: true }).click();
  await page.getByRole("dialog", { name: "Apps Launcher" }).getByRole("button", { name: "Archive", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Archive" })).toBeVisible();
  await expect(page).toHaveURL(/#\/folder\/archive$/);
});

test("an inactive running arcade does not consume contact keyboard input", async ({ page }) => {
  await page.goto("/#/arcade");
  await page.getByRole("button", { name: "Start Game" }).click();
  await page.evaluate(() => { location.hash = "/contact"; });
  const message = page.getByRole("textbox", { name: "Message", exact: true });
  await message.pressSequentially("x x");
  await expect(message).toHaveValue("x x");
  await page.getByRole("button", { name: "Close Contact" }).click();
  await expect(page).toHaveURL(/#\/arcade$/);
});
