import echoroomIcon from "@/assets/projects/echoroom.jpg";
import monoshiftIcon from "@/assets/projects/monoshift.jpg";

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
  role?: string;
  services?: string[];
  stack?: string[];
  summary?: string;
  overview?: string;
  challenge?: string;
  solution?: string;
  outcome?: string;
  responsibilities?: string[];
  process?: string;
  mobileScreens?: GalleryItem[];
  icon: string;
  cover: string;
  metrics?: Metric[];
  gallery?: GalleryItem[];
  live?: string;
  repo?: string;
  showSource?: boolean;
  depth?: 1 | 2 | 3;
  published?: boolean;
}

export interface Project extends Omit<ProjectConfig, "depth" | "published" | "services" | "stack" | "metrics" | "gallery"> {
  index: string;
  depth: 1 | 2 | 3;
  services: string[];
  stack: string[];
  metrics: Metric[];
  gallery: GalleryItem[];
}

const placeholderImage = (title: string) => `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%23101013'/%3E%3Crect width='800' height='600' fill='none' stroke='%23ffffff' stroke-opacity='0.1' stroke-width='4'/%3E%3Ctext x='400' y='300' font-family='monospace' font-size='32' fill='%23ffffff' fill-opacity='0.5' text-anchor='middle' dominant-baseline='middle'%3E${encodeURIComponent(title)}%3C/text%3E%3C/svg%3E`;

/* ── data ──────────────────────────────────────────────────── */

export const PROJECT_CONFIG: ProjectConfig[] = [
  {
    id: "echoroom",
    title: "EchoRoom",
    category: "Realtime Web App",
    kind: "product",
    year: "2026",
    role: "Product Design + Development",
    services: [],
    stack: ["Next.js 16 App Router", "React 19", "TypeScript", "Tailwind CSS v4", "Lucide Icons", "Server-Sent Events", "Authenticated JSON commands", "In-memory TTL room store", "Playwright"],
    summary: "EchoRoom is a temporary real-time text chat app where users can create or join private rooms with a nickname. It has no accounts, no permanent chat history, and no media sharing — just focused text communication with privacy-first room controls.",
    overview: "EchoRoom was built around a simple idea: create a private room in seconds, share the invite link, choose a room-local nickname and start chatting. The system intentionally avoids accounts, profiles, public rooms and permanent history. When a room ends or expires, its messages, members and bans are removed from application memory.\n\nProduct Rules:\nEchoRoom is deliberately text-only. It does not include accounts, profiles, public rooms, room discovery, permanent history, images, audio, video, files, GIFs, stickers, calls or screen sharing. These limits are enforced by the data model and API, not just hidden in the interface.\n\nArchitecture:\nThe browser sends authenticated JSON commands to a Next.js Node process and receives realtime updates through a long-lived Server-Sent Events stream. Room state is kept in memory and managed through TTL cleanup.\n\nSecurity / Privacy:\nRoom IDs and 256-bit invite secrets are separated. Invite secrets are carried in the URL fragment, then scrubbed into tab-scoped storage, while the server stores only a SHA-256 hash. Session tokens are random, hashed and sent through Secure, HttpOnly, room-scoped cookies. Authorization is enforced server-side for every send, moderation action and reconnect.\n\nHistory Model:\nMessages exist only in a bounded in-memory buffer while the room is active. They are not written to SQL, disk, logs or backups. Late joiners only receive messages sent after they joined, and destroying the room clears messages, members and bans.\n\nDeployment Limitation:\nThe current architecture supports one realtime server instance because room state and fan-out are process-local. Horizontal scaling would require a future shared TTL/session store and Pub/Sub layer.",
    challenge: "The main challenge was building a realtime chat system that feels simple for the user while keeping privacy, authorization and temporary state handling strict behind the scenes.",
    solution: "EchoRoom uses a server-authoritative architecture with in-memory room state, expiring sessions and privacy-focused invite handling. The interface stays intentionally minimal, while moderation and authorization logic is enforced on the server rather than trusting the client.",
    outcome: "EchoRoom became a complete privacy-focused realtime chat product and a strong exercise in realtime architecture, server-side authorization, ephemeral state and minimal product design.",
    icon: echoroomIcon,
    cover: echoroomIcon,
    metrics: [],
    gallery: [],
    live: "https://echoroom-designwithrahma.vercel.app/",
    repo: "",
    showSource: false,
    depth: 3,
  },
  {
    id: "droproom",
    title: "DropRoom",
    category: "Peer-to-Peer File Sharing",
    kind: "product",
    year: "2026",
    role: "Product Design + Development",
    services: [],
    stack: ["React 19", "TypeScript", "Vite", "Tailwind CSS v4", "WebRTC / RTCPeerConnection", "Reliable ordered RTCDataChannel", "WebSocket signaling", "Node.js", "ws", "Zod", "Vitest"],
    summary: "DropRoom is a temporary browser-to-browser file and text sharing app. It works without accounts, a database or permanent DropRoom file storage, with content transferred directly between connected browsers.",
    overview: "DropRoom was designed around a simple idea: create a temporary room, invite another device and send files or text directly between browsers. WebRTC handles the actual content transfer, while a lightweight signaling server only helps connected devices discover each other and exchange the information required to establish the peer-to-peer connection.\n\nArchitecture Summary:\nFile bytes and text messages travel through a reliable WebRTC RTCDataChannel between browsers. The signaling server handles only room presence and SDP/ICE negotiation, so DropRoom does not permanently store transferred files.\n\nTransfer Engine:\nDropRoom transfers files in 64 KiB chunks through a reliable ordered RTCDataChannel. It uses buffered-amount backpressure, per-file queues, rolling transfer speed and gated ETA calculations to manage transfers without overwhelming the browser connection.\n\nSignaling:\nA lightweight Node.js signaling server manages temporary rooms, connected-device presence and WebRTC SDP/ICE exchange. Room state remains in memory, supports up to four devices and expires after 45 minutes of inactivity.\n\nLocal Demo:\nFor local same-origin testing, DropRoom can use BroadcastChannel signaling between browser tabs while keeping the same WebRTC transfer engine.\n\nPrivacy:\nDropRoom's signaling layer does not carry file contents. Rooms exist only in server memory and expire automatically. Received files remain in browser memory until the user downloads them or leaves the room, after which associated object URLs are cleaned up. Files are not stored on DropRoom servers.\n\nValidation:\nRemote signaling events, transfer metadata, control frames and text payloads are validated with Zod on both sides of the connection.\n\nV1 Limits:\n- Maximum 4 devices per room\n- One-to-one sequential file queues\n- Text messages up to 20,000 characters\n- Metadata cap of 256 GiB per file\n- Received files are reconstructed in browser memory\n- Very large transfers depend on available device RAM\n- Interrupted transfers do not resume from the middle in V1\n- Lost connections report failure honestly",
    challenge: "The main challenge was transferring files directly between browsers while keeping the product simple, temporary and honest about connection state, memory limits and transfer failures.",
    solution: "DropRoom separates signaling from content transfer. A small signaling layer establishes peer connections, while the actual file and text data travels through WebRTC. Transfer queues, backpressure handling, validation and explicit failure states help keep the experience predictable.",
    outcome: "DropRoom became a working experiment in peer-to-peer browser communication, combining WebRTC networking, realtime signaling, transfer-state management and privacy-focused product design in a lightweight web application.",
    icon: placeholderImage("DropRoom"),
    cover: placeholderImage("DropRoom"),
    metrics: [],
    gallery: [],
    live: "https://droproom.designwithrahma.vercel.app/",
    repo: "",
    showSource: false,
    depth: 2,
  },
  {
    id: "monoshift",
    title: "MONO//SHIFT",
    category: "Browser Game / Web Game",
    kind: "experiment",
    year: "2026",
    role: "Designer & Developer",
    services: ["Game Concept", "UI / Visual Design", "Front-end Development", "Gameplay Logic", "Testing & Debugging", "Responsive Web Implementation"],
    stack: [],
    summary: "MONO//SHIFT is my first web game — a monochrome browser-based experience focused on simple controls, responsive interaction and clean visual design.",
    overview: "MONO//SHIFT is the first browser game I designed and developed under Designwithrahma. The project started as an experiment to explore game mechanics, collision handling, movement and responsive browser-based gameplay while keeping the visual direction minimal and monochrome. It also gave me practical experience in testing, debugging and refining a playable interactive experience from start to finish.",
    challenge: "The main challenge was making the game feel responsive and consistent while handling movement, collisions, level behaviour and different screen conditions inside a browser.",
    solution: "I refined the gameplay through multiple testing passes, fixed movement and collision issues, adjusted level boundaries and improved the interface until the experience felt more stable and playable.",
    outcome: "MONO//SHIFT became my first completed and published web game, giving me a strong foundation in interactive browser experiences and game-focused front-end development.",
    icon: monoshiftIcon,
    cover: monoshiftIcon,
    metrics: [],
    gallery: [],
    live: "https://monoshift-designwithrahma.vercel.app/",
    repo: "",
    showSource: false,
    depth: 1,
  },
  {
    id: "tabula",
    title: "Tabula",
    category: "Productivity / Visual Thinking Tool",
    kind: "product",
    year: "2026",
    role: "Designer & Developer",
    services: ["Product Concept", "UI/UX Design", "Front-end Development", "Canvas Interaction Design", "Product Identity", "Testing & Refinement"],
    stack: [],
    summary: "Tabula is a local-first infinite whiteboard for notes, diagrams, flowcharts and visual thinking, designed to keep ideas flexible, spatial and easy to organize.",
    overview: "Tabula is a visual workspace built for thinking freely on an infinite canvas. It combines notes, diagrams, flowcharts and spatial organization in a lightweight environment where users can place, move and connect ideas naturally without being limited by a traditional document layout.\n\nProduct Idea:\nOpen the board. Think visually. Build ideas freely.\n\nFocus:\n- Infinite canvas interaction\n- Notes and visual thinking\n- Diagrams and flowcharts\n- Spatial idea organization\n- Local-first usage\n- Fast, distraction-free interaction\n- Clean desktop-style experience\n\nCurrent Direction:\nThe project is being developed as a polished local-first creative tool, with strong attention to canvas interaction, usability and professional product identity.\n\nDesign Direction:\nTabula uses a clean, minimal interface that keeps the canvas as the main focus. Controls are intentionally lightweight so users can spend more time creating and less time navigating the UI.",
    challenge: "The main challenge is making an infinite canvas powerful enough for flexible visual thinking while keeping interactions simple, predictable and easy to learn.",
    solution: "Tabula is being designed around direct manipulation: users work directly on the canvas through movable visual elements, lightweight tools and clear interaction patterns instead of complex menus or document structures.",
    outcome: "Tabula is currently under active development and is evolving into a complete visual thinking workspace for notes, diagrams, flowcharts and idea mapping.",
    icon: placeholderImage("Tabula"),
    cover: placeholderImage("Tabula"),
    metrics: [],
    gallery: [],
    live: "",
    repo: "",
    showSource: false,
    depth: 2,
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
