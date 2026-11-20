import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  forbidOnly: !!process.env.CI,
  use: { baseURL: "http://127.0.0.1:4173", viewport: { width: 1440, height: 960 } },
  webServer: {
    command: "npm run preview -- --host 127.0.0.1 --port 4173 --strictPort",
    url: "http://127.0.0.1:4173",
  },
});
