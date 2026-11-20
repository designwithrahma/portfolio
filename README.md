# Designwithrahma portfolio

An interactive desktop portfolio built with React, TypeScript, Tailwind CSS, and Vite. Open **Work** to browse projects, **Services** to explore offerings, or **Contact** to send an enquiry. `Ctrl/Cmd + K` opens the command palette. Project links such as `/#/work/echoroom` open directly.

## Run locally

Use Node.js 22 LTS (22.12 or newer) and npm. From the repository root:

```sh
npm ci
npm run dev
```

Open the URL Vite prints. Install dependencies from `package-lock.json` on each machine; do not copy `node_modules/` between platforms.

## Check a change

```sh
npm run typecheck                    # TypeScript only; no generated files
npm run build                        # type-check, then create dist/
npx playwright install chromium      # first time, or after a Playwright upgrade
npm test                             # starts a preview of dist/ and runs browser regressions
```

Rebuild before rerunning the tests after source changes. On Linux, `npx playwright install --with-deps chromium` also installs system libraries. The tests use port 4173; stop any manual preview on that port first. GitHub Actions runs these checks on pushes and pull requests.

## Edit the content

| File | What to edit |
| --- | --- |
| `src/config/portfolio.ts` | Identity, email, contact endpoint, socials, résumé, notes, testimonials, and runtime page metadata |
| `src/config/projects.ts` | Project IDs, case studies, images, and live URLs. Keep published IDs stable for shared links. |
| `src/config/folders.ts` | Folder titles and the project IDs they contain |
| `src/config/services.ts`, `src/config/reels.ts` | Services and reel categories, thumbnails, and embeds |
| `src/data/media.ts`, `public/assets/` | Wallpaper video sources, static poster, and other media |
| `index.html` | Initial page metadata, social previews, and structured data for crawlers |

**Contact delivery:** An empty `contact.formEndpoint` opens the visitor’s email client with a prefilled draft; it does not deliver a message on its own. To accept submissions directly, configure a public endpoint that accepts a `FormData` POST with `name`, `email`, and `message`, allows requests from the deployed origin, and returns a successful HTTP status only when accepted. Never put a private API key in client config.

## Deploy

On a static host, set the install command to `npm ci`, the build command to `npm run build`, and the publish directory to `dist/`. Publish the **entire directory**: JavaScript and CSS are inlined in `dist/index.html`, but the wallpaper videos and poster are separate files under `dist/assets/`. Current media URLs expect the site at the origin root. Hash routes do not require server-side routing.

Run `npm run preview` to check the production build locally. Dependencies, generated output, browser test artifacts, and the old source ZIP are not tracked.
