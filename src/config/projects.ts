import echoroomIcon from "@/assets/projects/echoroom.jpg";
import hactionIcon from "@/assets/projects/haction.jpg";
import siddhavanamIcon from "@/assets/projects/siddhavanam.jpg";
import voxelIcon from "@/assets/projects/voxel.jpg";
import monoshiftIcon from "@/assets/projects/monoshift.jpg";
import bizeraxIcon from "@/assets/projects/bizerax.jpg";
import { MEDIA } from "@/data/media";

/* ── types ─────────────────────────────────────────────────── */

export type Breakpoint = "mobile" | "tablet" | "desktop";
export type ProjectKind = "product" | "experiment";

export interface Metric {
  value: string;
  label: string;
}

export interface GalleryItem {
  src: string;
  caption?: string;
}

export interface ProjectConfig {
  id: string;
  title: string;
  category: string;
  kind: ProjectKind;
  year: string;
  /** Every narrative and meta field below is optional; sections render only
   *  when data exists, so a lean project entry stays clean and editorial. */
  role?: string;
  services?: string[];
  stack?: string[];
  summary?: string;
  overview?: string;
  challenge?: string;
  solution?: string;
  outcome?: string;
  /** Optional extended fields. */
  responsibilities?: string[];
  process?: string;
  mobileScreens?: GalleryItem[];
  icon: string;
  cover: string;
  metrics?: Metric[];
  gallery?: GalleryItem[];
  live?: string;
  repo?: string;
  /** parallax depth: 1 far · 2 mid · 3 near */
  depth?: 1 | 2 | 3;
  /** Keep drafts in this file without rendering them publicly. */
  published?: boolean;
}

export interface Project extends Omit<ProjectConfig, "depth" | "published" | "services" | "stack" | "metrics" | "gallery"> {
  /** Automatically generated from array order. */
  index: string;
  depth: 1 | 2 | 3;
  /** Normalised collections so consumers never need null checks. */
  services: string[];
  stack: string[];
  metrics: Metric[];
  gallery: GalleryItem[];
}

/*
COPY THIS TEMPLATE INSIDE PROJECT_CONFIG TO ADD NEW WORK:

{
  id: "unique-project-id",
  title: "Project Name",
  category: "Web Application",
  kind: "product", // product | experiment
  year: "2026",
  role: "Design + Development",
  services: ["UI / UX", "Development"],
  stack: ["React", "TypeScript"],
  summary: "One short sentence about the project.",
  overview: "What the project is and who it serves.",
  challenge: "The core problem you needed to solve.",
  solution: "How you designed and built the solution.",
  outcome: "The real result or impact.",
  icon: "/projects/unique-project-id/icon.webp",
  cover: "/projects/unique-project-id/cover.webp",
  metrics: [{ value: "40%", label: "Faster workflow" }],
  gallery: [
    { src: "/projects/unique-project-id/screen-01.webp", caption: "Dashboard" },
    { src: "/projects/unique-project-id/screen-02.webp", caption: "Mobile view" },
  ],
  live: "https://your-live-site.com",
  repo: "https://github.com/you/repository",
  depth: 2,
  published: true,
},
*/

/* ── data ──────────────────────────────────────────────────── */

/**
 * PROJECT CONTROL PANEL
 * ---------------------
 * Add, remove, reorder and customize projects only in this array.
 * `index` is automatic. Empty live/repo values hide their buttons.
 * New images can use public paths such as /projects/my-project/icon.webp.
 */
export const PROJECT_CONFIG: ProjectConfig[] = [
  {
    id: "echoroom",
    title: "EchoRoom",
    category: "Realtime Web App",
    kind: "product",
    year: "2026",
    role: "Product Design + Development",
    services: ["Product Strategy", "UI / UX", "Design System", "Realtime Engineering"],
    stack: ["Next.js", "TypeScript", "WebSockets", "Redis", "Tailwind"],
    summary: "Anonymous realtime rooms that evaporate when the last person leaves.",
    overview:
      "EchoRoom is an ephemeral communication space. You open a link, pick a temporary name, and talk — no accounts, no history, no feed. Rooms exist only while someone is inside them; when the last heartbeat drops, the room and everything said in it dissolves.",
    challenge:
      "Realtime products usually trade privacy for convenience. The goal was zero-identity chat that still felt instant and alive — presence indicators, typing states and message sync across flaky mobile networks, all without storing a single byte of user data longer than a session.",
    solution:
      "A presence-first architecture: WebSocket channels scoped to in-memory Redis keys with TTLs shorter than a coffee break, optimistic UI for every action, and a design language of ripples and dissolves that makes ephemerality feel like a feature, not a limitation.",
    outcome:
      "Launched quietly on a Friday; passed 18k messages in the first weekend. Median message latency holds under 180ms, and the zero-account flow converts 3× more first-time visitors into active talkers than the sign-up prototype ever did.",
    icon: echoroomIcon,
    cover: echoroomIcon,
    metrics: [
      { value: "<180ms", label: "Median latency" },
      { value: "0", label: "Accounts required" },
      { value: "18k", label: "Weekend messages" },
    ],
    gallery: [
      { src: MEDIA.shots[0].src, caption: "Fig. 01 — Room surface, dark mode" },
      { src: MEDIA.shots[1].src, caption: "Fig. 02 — Presence prototyping" },
      { src: MEDIA.shots[2].src, caption: "Fig. 03 — System & TTL map" },
    ],
    live: "https://example.com/echoroom",
    repo: "https://github.com/example/echoroom",
    depth: 3,
  },
  {
    id: "haction",
    title: "Haction",
    category: "Business Operating Platform",
    kind: "product",
    year: "2026",
    role: "Lead Product Designer + Front-End",
    services: ["Brand Identity", "Product Design", "Design Engineering", "Motion"],
    stack: ["Next.js", "TypeScript", "Supabase", "PostgreSQL", "Stripe"],
    summary: "A calm operating system for small teams — sales, projects and payouts in one surface.",
    overview:
      "Haction replaces the nine-tab chaos of running a small company. Leads become projects, projects become invoices, invoices become payouts — one continuous surface instead of a stack of disconnected SaaS subscriptions.",
    challenge:
      "SMB software tends to look like an airport departures board. The brief was the opposite: a tool a five-person studio would actually enjoy opening at 9am. Dense data, zero noise, and a flow that respects how tiny teams actually hand work to each other.",
    solution:
      "A pipeline model where everything is a card moving left to right, a command bar that indexes the whole company, and a strict 4-color editorial palette. Every screen was designed on paper first — if it didn't work as a sketch, it didn't get built.",
    outcome:
      "Adopted by 3.2k workspaces in beta. Teams report ~42% less time on admin, and the single-surface model replaced an average of nine paid tools per workspace.",
    icon: hactionIcon,
    cover: hactionIcon,
    metrics: [
      { value: "3.2k", label: "Beta workspaces" },
      { value: "-42%", label: "Admin time" },
      { value: "9 → 1", label: "Tools replaced" },
    ],
    gallery: [
      { src: MEDIA.shots[3].src, caption: "Fig. 01 — Pipeline surface" },
      { src: MEDIA.shots[4].src, caption: "Fig. 02 — Command bar studies" },
      { src: MEDIA.shots[5].src, caption: "Fig. 03 — Mobile hand-off" },
    ],
    live: "https://example.com/haction",
    repo: "https://github.com/example/haction",
    depth: 2,
  },
  {
    id: "siddhavanam",
    title: "Siddhavanam",
    category: "Clinic Management System",
    kind: "product",
    year: "2025",
    role: "Design + Full-Stack Development",
    services: ["UX Research", "UI Design", "Full-Stack", "Offline-First"],
    stack: ["React", "TypeScript", "Node.js", "Supabase", "PWA"],
    summary: "Appointments, prescriptions and patient history for a growing Siddha & Ayurveda clinic chain.",
    overview:
      "Siddhavanam digitises a traditional medicine practice without flattening it. Practitioners write prescriptions the way they always have — herbs, dosages, kurippu notes — while the system quietly handles scheduling, records and follow-ups behind them.",
    challenge:
      "The clinics run on patchy connectivity and practitioners aged 24 to 74. The interface had to work offline, survive a shared front-desk tablet, and feel familiar to someone who has used a paper ledger for forty years.",
    solution:
      "An offline-first PWA with a ledger-inspired layout: big rows, generous type, Tamil + English bilingual labels, and a prescription pad that mimics the paper pad it replaced — down to the order the fields are filled in.",
    outcome:
      "Rolled out across 4 branches and 12k+ patient records. Front-desk phone calls dropped 38%, and the eldest practitioner on staff now prefers the tablet to paper. That was the real launch metric.",
    icon: siddhavanamIcon,
    cover: siddhavanamIcon,
    metrics: [
      { value: "12k+", label: "Patient records" },
      { value: "4", label: "Clinic branches" },
      { value: "-38%", label: "Front-desk calls" },
    ],
    gallery: [
      { src: MEDIA.shots[6].src, caption: "Fig. 01 — Prescription pad" },
      { src: MEDIA.shots[7].src, caption: "Fig. 02 — Field research, clinic desk" },
      { src: MEDIA.shots[0].src, caption: "Fig. 03 — Bilingual type system" },
    ],
    live: "https://example.com/siddhavanam",
    repo: "",
    depth: 2,
  },
  {
    id: "voxel-world",
    title: "Voxel Portfolio World",
    category: "Interactive 3D Experience",
    kind: "experiment",
    year: "2025",
    role: "Creative Development + 3D",
    services: ["WebGL", "3D Art Direction", "Interaction Design", "Performance"],
    stack: ["React Three Fiber", "TypeScript", "Blender", "Vite", "GSAP"],
    summary: "A tiny isometric world you wander through — every building is a project.",
    overview:
      "Instead of another case-study grid, this experiment turned a portfolio into a place. A small voxel town where the hospital is a healthcare project, the arcade is a game, and the town hall holds the about page. Visitors walk, they don't scroll.",
    challenge:
      "3D on the web usually means choosing between beauty and frame rate. The world needed chunky personality, soft lighting and day-night ambience while holding 60fps on a mid-range phone — and loading before the visitor got bored.",
    solution:
      "Instanced geometry, one atlas texture, baked lighting and aggressive LOD. The whole island is a single draw call per chunk. Interactions are raycast-only-near-the-camera, and everything heavier than 60kb loads after the first paint.",
    outcome:
      "Average session time: 3 minutes — on a portfolio. It got shared in three design communities, picked up 40k visits in a month, and remains the structural idea behind this desktop you're using now.",
    icon: voxelIcon,
    cover: voxelIcon,
    metrics: [
      { value: "60fps", label: "On mid-range mobile" },
      { value: "3min", label: "Average session" },
      { value: "40k", label: "First-month visits" },
    ],
    gallery: [
      { src: MEDIA.shots[1].src, caption: "Fig. 01 — Island blockout" },
      { src: MEDIA.shots[2].src, caption: "Fig. 02 — Lighting bakes" },
      { src: MEDIA.shots[3].src, caption: "Fig. 03 — Interaction map" },
    ],
    live: "https://example.com/voxel",
    repo: "https://github.com/example/voxel-world",
    depth: 2,
  },
  {
    id: "monoshift",
    title: "MONO//SHIFT",
    category: "Browser Game",
    kind: "experiment",
    year: "2024",
    role: "Design + Development",
    services: ["Game Design", "Canvas Engineering", "Sound Design", "Poster Art"],
    stack: ["TypeScript", "Canvas 2D", "Vite", "Howler", "CSS Houdini"],
    summary: "A one-bit puzzle runner where the world shifts between light and dark.",
    overview:
      "MONO//SHIFT is a weekend-sprint game that grew teeth. You run through a two-tone world; pressing SHIFT inverts which half of the level is solid floor and which half is a hole. Simple rule, mean level design.",
    challenge:
      "One-bit visuals leave nowhere to hide — every pixel of feedback has to carry weight. The game needed to teach its core rule with zero tutorial text, and invert the entire world state in a single frame without a stutter.",
    solution:
      "Levels are stored as bitmap pairs (light floor / dark floor); shifting is a bitwise swap. All feedback is shape and sound — screenshake, a 90hz thump, particles that invert with the world. The first three levels teach everything without a single word.",
    outcome:
      "24 levels, 60fps, 180k plays after a single forum post. Speedrunners found a shift-skip I never patched, because honestly it plays better than the intended route.",
    icon: monoshiftIcon,
    cover: monoshiftIcon,
    metrics: [
      { value: "24", label: "Hand-built levels" },
      { value: "180k", label: "Plays, zero marketing" },
      { value: "8ms", label: "Frame budget" },
    ],
    gallery: [
      { src: MEDIA.shots[4].src, caption: "Fig. 01 — Level drafts" },
      { src: MEDIA.shots[5].src, caption: "Fig. 02 — Bitmap pipelines" },
      { src: MEDIA.shots[6].src, caption: "Fig. 03 — Poster series" },
    ],
    live: "https://example.com/monoshift",
    repo: "https://github.com/example/monoshift",
    depth: 1,
  },
  {
    id: "bizerax",
    title: "Bizerax",
    category: "Software Solutions Studio",
    kind: "product",
    year: "2026",
    role: "Brand + Web Design & Build",
    services: ["Brand Identity", "Web Design", "CMS Build", "SEO"],
    stack: ["Next.js", "TypeScript", "Sanity", "Vercel", "Framer Motion"],
    summary: "Identity, site and client portal for a boutique engineering studio.",
    overview:
      "Bizerax builds unglamorous, mission-critical software — logistics, billing, internal tools. They needed a presence that felt as precise as their engineering: confident typography, no stock-photo handshakes, and a client portal that made project status boringly transparent.",
    challenge:
      "Studio sites all say the same five adjectives. The real brief was trust: show rigour without a single bullet list of technologies, and give existing clients a reason to log in instead of sending another 'any update?' email.",
    solution:
      "An editorial site built around three long-form case studies, a monospace-driven identity with a chrome ribbon motif, and a read-only client portal showing live milestones pulled straight from their issue tracker.",
    outcome:
      "Designed, built and shipped in 3 weeks. Inbound leads doubled in the first quarter, and the 'any update?' emails dropped to almost none — the dashboard says it before clients have to ask.",
    icon: bizeraxIcon,
    cover: bizeraxIcon,
    metrics: [
      { value: "98", label: "Lighthouse performance" },
      { value: "3wk", label: "Design → production" },
      { value: "2×", label: "Inbound leads" },
    ],
    gallery: [
      { src: MEDIA.shots[7].src, caption: "Fig. 01 — Identity system" },
      { src: MEDIA.shots[0].src, caption: "Fig. 02 — Case study layouts" },
      { src: MEDIA.shots[1].src, caption: "Fig. 03 — Client portal" },
    ],
    live: "https://example.com/bizerax",
    repo: "",
    depth: 1,
  },
];

/** Indexes and defaults are derived, so one config object is enough. */
export const PROJECTS: Project[] = PROJECT_CONFIG.filter(
  (project) => project.published !== false,
).map((project, order) => {
  const { published: _published, ...data } = project;
  return {
    ...data,
    index: String(order + 1).padStart(2, "0"),
    depth: project.depth ?? 2,
    services: project.services ?? [],
    stack: project.stack ?? [],
    metrics: project.metrics ?? [],
    gallery: project.gallery ?? [],
  };
});

export const getProject = (id: string) => PROJECTS.find((project) => project.id === id);

export const getNextProject = (id: string) => {
  const index = PROJECTS.findIndex((project) => project.id === id);
  return PROJECTS[(index + 1) % PROJECTS.length];
};
