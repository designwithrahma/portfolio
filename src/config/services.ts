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
  | "web-development"
  | "social-creatives";

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
        description:
          "Editorial poster layouts for launches, events and campaigns — composed around one strong idea, not decoration.",
        deliverables: ["Print + digital sizes", "Source file", "2 revision rounds"],
        turnaround: "2–4 days",
      },
      {
        id: "flyer-design",
        title: "Flyer Design",
        description:
          "Single or double-sided flyers with clear hierarchy, readable typography and print-ready bleed.",
        deliverables: ["A4 / A5 layouts", "CMYK print file", "Web export"],
        turnaround: "2–3 days",
      },
      {
        id: "banner-design",
        title: "Banner Design",
        description:
          "Web banners, hoardings and standee artwork that stay legible at every distance and crop.",
        deliverables: ["Multiple aspect ratios", "Retina exports"],
        turnaround: "1–3 days",
      },
      {
        id: "thumbnail-design",
        title: "Thumbnail Design",
        description:
          "High-contrast YouTube thumbnails engineered for small-screen clarity and click-through.",
        deliverables: ["1280×720 exports", "A/B variants"],
        turnaround: "24–48 hours",
      },
      {
        id: "brand-visuals",
        title: "Brand Visuals",
        description:
          "Logo systems, colour, type scales and usage rules packaged into a working identity kit.",
        deliverables: ["Logo suite", "Brand guide PDF", "Asset pack"],
        turnaround: "1–2 weeks",
        action: "estimate",
        actionLabel: "Estimate scope",
        featured: true,
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
        id: "reel-editing",
        title: "Reel Editing",
        description:
          "Vertical 9:16 edits with beat-matched cuts, motion text and clean sound design. Browse the reel showcase for recent work.",
        deliverables: ["9:16 master", "Caption burn-in", "Platform exports"],
        turnaround: "1–3 days",
        action: "showcase",
        actionLabel: "View reel showcase",
        featured: true,
      },
      {
        id: "youtube-editing",
        title: "YouTube Video Editing",
        description:
          "Long-form edits with narrative pacing, B-roll layering, colour and chapter-ready structure.",
        deliverables: ["16:9 master", "Colour + audio pass", "Chapter markers"],
        turnaround: "3–6 days",
      },
      {
        id: "promo-editing",
        title: "Promo Video Editing",
        description:
          "Product and service promos built to land one message inside thirty seconds.",
        deliverables: ["15s / 30s cuts", "Music licensing guidance"],
        turnaround: "3–5 days",
      },
      {
        id: "motion-poster",
        title: "Motion Poster Editing",
        description:
          "Static key art brought to life with restrained parallax, grain and typographic motion.",
        deliverables: ["Looping MP4", "Social crops"],
        turnaround: "2–4 days",
      },
      {
        id: "subtitle-editing",
        title: "Subtitle / Caption Editing",
        description:
          "Frame-accurate captions with readable styling, including bilingual Tamil and English tracks.",
        deliverables: ["SRT file", "Styled burn-in version"],
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
        title: "Portfolio Website",
        description:
          "Personal and studio portfolios with editorial layout, real motion craft and fast load behaviour.",
        deliverables: ["Responsive build", "CMS-ready content", "Deployment"],
        turnaround: "1–3 weeks",
        featured: true,
      },
      {
        id: "business-website",
        title: "Business Website",
        description:
          "Multi-page company sites with clear service architecture, SEO structure and analytics.",
        deliverables: ["Up to 8 pages", "SEO metadata", "Contact integration"],
        turnaround: "2–4 weeks",
        action: "estimate",
        actionLabel: "Estimate scope",
      },
      {
        id: "landing-page",
        title: "Landing Page Design",
        description:
          "Single-purpose conversion pages for launches, campaigns and paid traffic.",
        deliverables: ["Design + build", "Form or booking hookup"],
        turnaround: "5–10 days",
      },
      {
        id: "ui-ux-design",
        title: "UI/UX Design",
        description:
          "Product flows, wireframes and high-fidelity interfaces backed by a reusable design system.",
        deliverables: ["Figma system", "Prototype", "Handoff specs"],
        turnaround: "2–4 weeks",
      },
      {
        id: "dashboard-ui",
        title: "Dashboard UI",
        description:
          "Dense data interfaces that stay calm — tables, charts, filters and state handling included.",
        deliverables: ["Component library", "Responsive states"],
        turnaround: "2–5 weeks",
      },
    ],
  },
  {
    id: "social-creatives",
    title: "Social Media Creatives",
    tagline: "Consistent campaign systems rather than one-off posts.",
    icon: "megaphone",
    services: [
      {
        id: "instagram-carousel",
        title: "Instagram Carousel",
        description:
          "Multi-slide carousels with a deliberate narrative arc and a template you can reuse monthly.",
        deliverables: ["Up to 10 slides", "Editable template"],
        turnaround: "2–4 days",
      },
      {
        id: "ad-creatives",
        title: "Ad Creatives",
        description:
          "Paid-social creative sets with variant testing across every required placement size.",
        deliverables: ["Static + motion variants", "Placement crops"],
        turnaround: "3–5 days",
      },
      {
        id: "campaign-creatives",
        title: "Campaign Creatives",
        description:
          "End-to-end campaign visuals: key art, sequencing, copy pairing and rollout calendar.",
        deliverables: ["Campaign key art", "Rollout plan"],
        turnaround: "1–2 weeks",
        action: "estimate",
        actionLabel: "Estimate scope",
      },
      {
        id: "branding-packs",
        title: "Branding Packs",
        description:
          "Monthly social identity kits — templates, frames, motion stings and caption styling.",
        deliverables: ["Template pack", "Motion stings", "Usage guide"],
        turnaround: "1–2 weeks",
        featured: true,
      },
    ],
  },
];

export const getServiceCategory = (id: string) =>
  SERVICE_CATEGORIES.find((category) => category.id === id);
