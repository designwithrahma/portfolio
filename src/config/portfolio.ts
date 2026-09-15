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
  category: "Design Engineering" | "Architecture" | "Philosophy" | "3D & WebGL" | "Journal";
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
    name: "Designwithrahma",
    mark: "Designwithrahma",
    role: "Creative Developer / Designer",
    status: "Available for Projects",
    location: "Kattankudy, Batticaloa, Sri Lanka",
    timezone: "IST · UTC +5:30",
    discipline: "Design × Code × Visual Storytelling",
    established: "2021",
    availability: "Available for Projects",
    bookingLabel: "Currently booking",
    bio: "I'm Designwithrahma, a creative developer and designer based in Kattankudy, Batticaloa. I work across visual design, web development and digital content, turning ideas into clear, engaging experiences. From posters and brand creatives to websites, interfaces and video content, I enjoy combining design and technology to create work that looks good, works well and has a purpose.",
  },

  contact: {
    email: "rahmathullah5975@gmail.com",
    replyTime: "usually within 48 hours",
    /** Formspree / Web3Forms / your API endpoint. Empty = local demo success. */
    formEndpoint: "",
  },

  links: {
    website: "",
    /** Primary social/profile hub used by the dock. */
    socialHub: "https://linktr.ee/designwithrahma",
    /** Example: "/rahma-resume.pdf" or a public Google Drive URL. */
    resume: "",
    /** Example: Calendly / Cal.com. Hidden when empty. */
    booking: "",
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
      id: "github",
      label: "GitHub",
      handle: "@designwithrahma",
      href: "https://github.com/designwithrahma",
    },
    {
      id: "instagram",
      label: "Instagram",
      handle: "",
      href: "",
    },
    {
      id: "x",
      label: "X / Twitter",
      handle: "",
      href: "",
    },
    {
      id: "behance",
      label: "Behance",
      handle: "",
      href: "",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      handle: "",
      href: "",
    },
  ] satisfies ReadonlyArray<{
    id: SocialId;
    label: string;
    handle: string;
    href: string;
  }>,

  notes: [] as NoteItem[],

  testimonials: [] as TestimonialItem[],

  resume: {
    summary: "Creative developer and designer creating visual identities, websites, interfaces and digital content through a mix of design, code and storytelling.",
    experiences: [
      {
        period: "2024 — Present",
        role: "Senior Graphic Designer / Designer & Editor",
        company: "Haction Lanka",
        location: "Kattankudy, Sri Lanka",
        highlights: [
          "Creating social media visuals, video content and brand communication for Haction Lanka. My role includes graphic design, video editing, videography and social media management, with a focus on producing consistent and engaging content for digital platforms.",
          "Responsibilities: Social Media Design, Graphic Design, Video Editing, Videography, Social Media Management, Brand Content Creation.",
          "Progressed into a Senior Graphic Designer role through continued design and content work.",
        ],
      },
      {
        period: "2023",
        role: "Graphic Designer - Freelance",
        company: "Vaasi Rate",
        location: "Sri Lanka",
        highlights: [
          "Worked as a freelance Graphic Designer for Vaasi Rate, creating promotional visuals and digital content for online use.",
          "Responsibilities: Graphic Design, Social Media Creatives, Promotional Design, Brand Visual Support.",
        ],
      },
    ] as ExperienceItem[],
    education: [
      {
        year: "2025 — Present",
        degree: "National Diploma in Information & Communication Technology (NVQ Level 5)",
        institution: "VTA - Vantharamoolai, Batticaloa",
      },
    ] as EducationItem[],
    skills: {
      design: ["Poster Design", "Brand Visuals", "Social Media Creatives", "Promotional Design", "Thumbnail Design", "UI/UX", "Interface Design", "Layout & Typography"],
      development: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Supabase", "HTML", "CSS", "JavaScript", "Responsive Web Development", "Vercel"],
      tools: ["Adobe Photoshop", "Adobe Illustrator", "Canva", "Figma", "VS Code", "GitHub", "CapCut", "B-Roll Editing"],
    },
  },

  seo: {
    title: "Designwithrahma — Creative Developer / Designer",
    description: "Portfolio of Designwithrahma, a creative developer and designer from Kattankudy, Batticaloa, Sri Lanka, working across graphic design, web development, UI/UX and B-roll editing.",
  },
} as const;
