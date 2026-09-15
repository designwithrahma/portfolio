/**
 * PORTFOLIO CONTROL PANEL
 * -----------------------
 * Edit this file to update your personal details, project links,
 * feature flags, notes, testimonials, and system apps.
 */

export type SocialId = "instagram" | "x" | "behance" | "github" | "linkedin";

export interface NoteItem {
  id: string;
  title: string;
  date: string;
  readTime: string;
  category: "Design Engineering" | "Architecture" | "Philosophy" | "3D & WebGL";
  summary: string;
  content: string[];
}

export interface TestimonialItem {
  id: string;
  author: string;
  role: string;
  company: string;
  avatar: string;
  date: string;
  subject: string;
  message: string;
  verified: boolean;
}

export interface ExperienceItem {
  period: string;
  role: string;
  company: string;
  location: string;
  highlights: string[];
}

export interface EducationItem {
  year: string;
  degree: string;
  institution: string;
}

export const PORTFOLIO_CONFIG = {
  identity: {
    name: "RAHMA",
    mark: "RAHMA®",
    role: "Creative Developer & Designer",
    status: "Available for selected projects",
    location: "Tamil Nadu · India",
    timezone: "IST · UTC +5:30",
    discipline: "Design × Code",
    established: "2021",
    availability: "Open · Q3 2026",
    bookingLabel: "Currently booking — Q3 2026",
    bio: "Independent creative developer from Tamil Nadu, India. I take products from a blank page to a shipped, living thing — identity, interface, motion and the code underneath. Small teams, founders and studios hire me when they want the website to feel like the product they actually dreamed about.",
  },

  contact: {
    email: "hello@rahma.studio",
    replyTime: "usually within 48 hours",
    /** Formspree / Web3Forms / your API endpoint. Empty = local demo success. */
    formEndpoint: "",
  },

  links: {
    website: "https://rahma.studio",
    /** Primary social/profile hub used by the dock. */
    socialHub: "https://linktr.ee/rahma",
    /** Example: "/rahma-resume.pdf" or a public Google Drive URL. */
    resume: "",
    /** Example: Calendly / Cal.com. Hidden when empty. */
    booking: "https://cal.com/rahma",
  },

  features: {
    enableTerminal: true,
    enableNotes: true,
    enableResume: true,
    enableMailTestimonials: true,
    enableSettings: true,
    enableQuickLook: true,
    enableMarqueeSelection: true,
    enableDoubleTapToOpen: true,
    enableMultiWindow: true,
    enableSoundEffects: true,
    enableScreensaver: true,
  },

  socials: [
    {
      id: "instagram",
      label: "Instagram",
      handle: "@rahma.builds",
      href: "https://instagram.com/rahma.builds",
    },
    {
      id: "x",
      label: "X / Twitter",
      handle: "@rahma_builds",
      href: "https://x.com/rahma_builds",
    },
    {
      id: "behance",
      label: "Behance",
      handle: "/rahma-archive",
      href: "https://behance.net/rahma-archive",
    },
    {
      id: "github",
      label: "GitHub",
      handle: "@rahma-dev",
      href: "https://github.com/rahma-dev",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      handle: "/in/rahma",
      href: "https://linkedin.com/in/rahma",
    },
  ] satisfies ReadonlyArray<{
    id: SocialId;
    label: string;
    handle: string;
    href: string;
  }>,

  notes: [
    {
      id: "spatial-interfaces",
      title: "Why web interfaces are returning to spatial desktops",
      date: "May 2026",
      readTime: "4 min read",
      category: "Design Engineering",
      summary: "Modern web design spent a decade flattening everything into 1-dimensional vertical feeds. Here is why spatial layouts feel more memorable and human.",
      content: [
        "A website does not need to feel like an endless conveyor belt. For over a decade, digital tools converged toward the same uniform pattern: centered hero banner, three feature cards, social proof logos, and a pricing table.",
        "When you navigate a spatial desktop interface, your brain forms a mental map of place. You remember that the chat app was in the center, the business suite was top-left, and your messages were bottom-right.",
        "Spatial layout unlocks tactile micro-interactions: physical magnetism, depth layers, spring resistance, and window dragging. The visitor transforms from a passive content scroller into an active computer operator.",
      ],
    },
    {
      id: "craft-at-60fps",
      title: "Building tactile 60fps physics in React & Tailwind",
      date: "March 2026",
      readTime: "6 min read",
      category: "Architecture",
      summary: "Balancing high-frequency mouse interactions, repulsion relaxation loops, and lightweight CSS transforms.",
      content: [
        "Achieving buttery 60fps when combining pointer tracking, magnetic field solvers, and layout animations requires avoiding React re-render churn during hot loops.",
        "By utilizing raw MotionValues, synchronous ref pointers for drag verification, and hardware-accelerated transforms (translate3d/scale), we keep main-thread layout thrashing near zero.",
        "The subtle physics—such as spring damping curves where magnets flick quickly and return gently—create a visceral tactile feeling that visitors instantly appreciate.",
      ],
    },
    {
      id: "ephemeral-realtime",
      title: "Designing for ephemerality in a permanent web",
      date: "January 2026",
      readTime: "3 min read",
      category: "Philosophy",
      summary: "Why building software that automatically dissolves can make real-time connections feel lighter and more honest.",
      content: [
        "In EchoRoom, nothing is saved to a permanent database. Rooms expire as soon as the last active participant disconnects.",
        "When people know their messages won't be archived for eternity, the tone of conversation shifts. It becomes more spontaneous, playful, and genuine.",
        "Ephemerality isn't a lack of features—it is a conscious design choice that prioritizes human presence over perpetual data hoarding.",
      ],
    },
  ] as NoteItem[],

  testimonials: [
    {
      id: "quote-1",
      author: "Arunachalam V.",
      role: "Founder & CEO",
      company: "Haction Platform",
      avatar: "AV",
      date: "Apr 2026",
      subject: "Exceptional product design + front-end engineering",
      message: "Rahma took our complex SaaS platform and redesigned it into a serene, lightning-fast operating surface. Our beta workspaces immediately reported a 42% decrease in admin confusion. Rare hybrid of top-tier visual taste and solid code.",
      verified: true,
    },
    {
      id: "quote-2",
      author: "Dr. K. Sundaram",
      role: "Managing Director",
      company: "Siddhavanam Healthcare",
      avatar: "KS",
      date: "Feb 2026",
      subject: "Prescription system transformation",
      message: "Our practitioners range from 24 to 74 years old. Rahma built an offline-first system that felt so natural to traditional ledger workflows that even our senior doctors abandoned paper pads within two days.",
      verified: true,
    },
    {
      id: "quote-3",
      author: "Elena Rostova",
      role: "Design Director",
      company: "Studio Nila",
      avatar: "ER",
      date: "Nov 2025",
      subject: "Creative direction & WebGL brilliance",
      message: "Working with Rahma is a breath of fresh air. He creates web experiences that break standard templates without sacrificing performance or accessibility. The Voxel World portfolio is still referenced in our studio.",
      verified: true,
    },
  ] as TestimonialItem[],

  resume: {
    summary: "Creative Developer & Product Designer with 5+ years of experience bridging the gap between high-end visual craft and production-ready React/TypeScript systems. Specializing in spatial UI, WebGL, design systems, and rapid product prototyping.",
    experiences: [
      {
        period: "2024 — Present",
        role: "Independent Creative Developer & Designer",
        company: "Studio of One",
        location: "Tamil Nadu, India",
        highlights: [
          "Designing and developing bespoke web platforms, realtime applications, and interactive 3D portfolios for global clients.",
          "Shipped EchoRoom, Haction, and Siddhavanam clinic operating system reaching thousands of active users.",
          "Building reusable UI toolkits, design systems, and performance-optimized microinteractions.",
        ],
      },
      {
        period: "2023 — 2024",
        role: "Product Design Lead",
        company: "Studio Nila",
        location: "Remote",
        highlights: [
          "Led design engineering for SMB SaaS products, increasing customer engagement by 35%.",
          "Engineered interactive canvas experiences and WebGL promotional sites holding 60fps on mobile devices.",
          "Mentored junior engineers in motion design, Framer Motion, and Tailwind CSS architectures.",
        ],
      },
      {
        period: "2021 — 2023",
        role: "Design Engineer",
        company: "Freelance",
        location: "India",
        highlights: [
          "Delivered 18+ client websites, brand identities, and responsive web applications.",
          "Achieved 95+ Lighthouse performance, SEO, and accessibility scores across all shipped client sites.",
        ],
      },
    ] as ExperienceItem[],
    education: [
      {
        year: "2018 — 2022",
        degree: "Bachelor of Technology in Computer Science & Engineering",
        institution: "Anna University, Tamil Nadu",
      },
    ] as EducationItem[],
    skills: {
      design: ["Product Design", "Brand Identity", "Design Systems", "UI / UX Prototyping", "Art Direction", "Motion Design"],
      development: ["TypeScript", "React", "Next.js", "Tailwind CSS", "Framer Motion", "WebGL / Three.js", "Node.js", "Supabase", "Redis", "WebSockets"],
      tools: ["Figma", "Blender", "VS Code", "Git", "Photoshop", "Illustrator", "Vercel"],
    },
  },

  seo: {
    title: "RAHMA® — Creative Developer & Designer",
    description:
      "Rahma is a creative developer and designer crafting digital products, brands and interactive web experiences.",
  },
} as const;

