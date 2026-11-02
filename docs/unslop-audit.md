# Portfolio refinement audit

This pass follows [Unslop by Damir Sokolovsky](https://github.com/heydamir/unslop) (CC BY 4.0). The direction is a calm, precise, warm creative workspace: existing desktop artwork and real project imagery carry the visual character, while window chrome stays quiet.

## Existing implementation

- React 19, Vite, TypeScript, Tailwind CSS 4 and Framer Motion. Hash routes open managed windows; window geometry, desktop layout and preferences use local storage. The boot state also uses session storage.
- Entry points include the dock, desktop project icons, apps launcher, system and context menus, command palette, keyboard shortcuts and direct hash links. Work opens project case studies; Services links to Contact and the estimator. The terminal can open portfolio apps and projects.
- The desktop has draggable, resizable, snappable and minimizable windows; the mobile breakpoint uses full-screen sheets. Other apps include Notes, Resume, Reviews, Settings, Paint, Arcade, Estimator, Diagnostics and Physics Lab. Existing animation, sound, desktop widgets and personalization were retained.
- Content is centralized in `src/config`: identity, contact details, experience, skills, projects, services and reels. Existing project imagery is in `src/assets/projects`; the animated wallpaper and poster are in `public/assets`.

## Audit and changes

- The About image was an external stock photo presented as a profile portrait. The profile now uses the existing illustrated desktop artwork and identifies Mohammed Rahmathullah, as supplied by the owner. Biography, location, experience, skills, tools and contact links remain.
- A crowded dock gave secondary apps the same weight as primary navigation. It now shows the primary destinations and running secondary apps; all others remain in the launcher. Narrow mobile docks use fewer entries and narrower targets at 320px.
- Work relied on a desktop-only hover preview. Project rows now show existing thumbnails at all sizes, keep search and filters, and explain empty results. Filter state is exposed to assistive technology.
- Contact now states when a message will open an email client, uses the shared clipboard fallback, and accepts the estimator's generated scope. Small-screen email wrapping and input sizing were improved. The original contact address and links remain.
- Services no longer attempts to load or play an empty reel placeholder. Settings tabs are horizontally scrollable on mobile and expose their selected state. Terminal input has an accessible name. Case-study image expansion is keyboard reachable, and project navigation no longer competes with an open lightbox.
- Desktop windows are non-modal to assist multi-window navigation; the dock remains above desktop windows. Motion feedback was reduced on dock items while retaining magnification. The original reduced-motion preference remains in effect.

## Remaining limitations

- The repository currently supplies only one wallpaper, not a wallpaper library; there is no complete persistent light/dark theme selector. Neither was fabricated in this pass.
- Two projects use generated placeholder graphics and the reel showcase has no playable media. The existing data and links need owner-provided assets where appropriate. Some existing portfolio claims, experience and links have not been independently verified.
- This is a targeted refinement, not a comprehensive rewrite of every secondary app or every small text style. Full physical-device, assistive-technology, external-link and regression testing is still recommended.
