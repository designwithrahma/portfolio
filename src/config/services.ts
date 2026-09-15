/**
 * SERVICES CONTROL PANEL
 * ----------------------
 * Everything the Services app renders lives here. Add, remove or reorder
 * categories and services freely — the window is fully data-driven.
 *
 * To add a service: copy one object inside `services` of any category.
 * To add a category: copy a whole category object.
 */

export type ServiceCategoryId =
  | "graphic-design"
  | "video-editing"
  | "web-development";

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  /** Short deliverable list shown as quiet meta under the description. */
  deliverables?: string[];
  /** Optional turnaround note, e.g. "3–5 days". */
  turnaround?: string;
  /** Label for the card action. Defaults to "Request this". */
  actionLabel?: string;
  /**
   * "contact"  → opens the Contact window (default)
   * "estimate" → opens the Scope & Budget Estimator
   * "showcase" → opens the reel/video showcase (used by Reel Editing)
   */
  action?: "contact" | "estimate" | "showcase";
  /** Set true to surface this service first inside its category. */
  featured?: boolean;
}

export interface ServiceCategory {
  id: ServiceCategoryId;
  title: string;
  /** One-line positioning statement for the category header. */
  tagline: string;
  /** Lucide icon name resolved in the Services window. */
  icon: "palette" | "clapperboard" | "code" | "megaphone";
  services: ServiceItem[];
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: "graphic-design",
    title: "Graphic Design",
    tagline: "Print and digital visuals built on a disciplined type and grid system.",
    icon: "palette",
    services: [
      {
        id: "poster-design",
        title: "Poster Design",
        description: "Editorial poster layouts for launches, events and campaigns.",
        deliverables: ["Print + digital sizes", "Source file", "2 revision rounds"],
        turnaround: "2–4 days",
      },
      {
        id: "brand-visuals",
        title: "Brand Visuals",
        description: "Logo systems, colour, type scales and usage rules packaged into a working identity kit.",
        deliverables: ["Logo suite", "Brand guide PDF", "Asset pack"],
        turnaround: "1–2 weeks",
        featured: true,
        action: "estimate",
        actionLabel: "Estimate scope",
      },
      {
        id: "social-media-creatives",
        title: "Social Media Creatives",
        description: "Multi-slide carousels and creatives with a deliberate narrative arc.",
        deliverables: ["Up to 10 slides", "Editable template"],
        turnaround: "2–4 days",
      },
      {
        id: "promotional-design",
        title: "Promotional Design",
        description: "Web banners, hoardings and standee artwork that stay legible.",
        deliverables: ["Multiple aspect ratios", "Retina exports"],
        turnaround: "1–3 days",
      },
      {
        id: "thumbnail-design",
        title: "Thumbnail Design",
        description: "High-contrast YouTube thumbnails engineered for small-screen clarity and click-through.",
        deliverables: ["1280×720 exports", "A/B variants"],
        turnaround: "24–48 hours",
      },
    ],
  },
  {
    id: "web-development",
    title: "Web Design & Development",
    tagline: "Design-engineered interfaces shipped as production React and TypeScript.",
    icon: "code",
    services: [
      {
        id: "portfolio-website",
        title: "Portfolio Websites",
        description: "Personal and studio portfolios with editorial layout, real motion craft and fast load behaviour.",
        deliverables: ["Responsive build", "CMS-ready content", "Deployment"],
        turnaround: "1–3 weeks",
        featured: true,
      },
      {
        id: "business-website",
        title: "Business Websites",
        description: "Multi-page company sites with clear service architecture, SEO structure and analytics.",
        deliverables: ["Up to 8 pages", "SEO metadata", "Contact integration"],
        turnaround: "2–4 weeks",
        action: "estimate",
        actionLabel: "Estimate scope",
      },
      {
        id: "landing-page",
        title: "Landing Pages",
        description: "Single-purpose conversion pages for launches, campaigns and paid traffic.",
        deliverables: ["Design + build", "Form or booking hookup"],
        turnaround: "5–10 days",
      },
      {
        id: "ui-ux-design",
        title: "UI/UX Design",
        description: "Product flows, wireframes and high-fidelity interfaces backed by a reusable design system.",
        deliverables: ["Figma system", "Prototype", "Handoff specs"],
        turnaround: "2–4 weeks",
      },
      {
        id: "frontend-development",
        title: "Responsive Front-end Development",
        description: "Pixel-perfect implementation of provided designs into robust React codebases.",
        deliverables: ["React components", "Responsive styling"],
        turnaround: "2–5 weeks",
      },
    ],
  },
  {
    id: "video-editing",
    title: "Video Editing",
    tagline: "Rhythm-first edits for short form, long form and campaign film.",
    icon: "clapperboard",
    services: [
      {
        id: "b-roll-editing",
        title: "B-Roll Editing",
        description: "Clean and engaging B-roll edits for social media, promotional content and visual storytelling, with focus on pacing, transitions, timing and overall visual flow.",
        deliverables: ["B-roll sequencing", "Clean cuts", "Transitions", "Music sync", "Text overlays", "Colour adjustment", "Pacing", "Social-media-ready export"],
        action: "showcase",
        actionLabel: "View reel showcase",
        featured: true,
      }
    ],
  }
];

export const getServiceCategory = (id: string) =>
  SERVICE_CATEGORIES.find((category) => category.id === id);
