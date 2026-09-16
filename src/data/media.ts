/**
 * Central media registry.
 * Replace these URLs / imports with your own assets at any time.
 */

const px = (id: number, w: number, h: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${w}&h=${h}`;

/* ── wallpapers — right-click the desktop to cycle ─────────── */

export interface Wallpaper {
  id: string;
  name: string;
  type?: "image" | "video";
  desktop: string;
  mobile: string;
  alt: string;
  poster?: string;
  fallback?: string;
}

export const WALLPAPERS: Wallpaper[] = [
  {
    id: "animated-bg",
    name: "Animated Desktop",
    type: "video",
    desktop: "/assets/portfolio-bg.webm",
    fallback: "/assets/portfolio-bg.mp4",
    poster: "/assets/portfolio-bg-poster.webp",
    mobile: "/assets/portfolio-bg.webm",
    alt: "Cinematic animated background",
  },
];

/* ── other media ───────────────────────────────────────────── */

export const MEDIA = {
  portrait: {
    src: px(8346029, 840, 1120),
    alt: "Studio portrait, black outfit against soft grey backdrop.",
    credit: "Ron Lach / Pexels",
  },

  /* Editorial gallery shots cycled through project case studies */
  shots: [
    { src: px(8534085, 1400, 940), caption: "Fig. — Product surfaces" },
    { src: px(8092461, 1400, 940), caption: "Fig. — Design process" },
    { src: px(6893379, 1400, 940), caption: "Fig. — Systems & specs" },
    { src: px(8532637, 1400, 940), caption: "Fig. — Interface studies" },
    { src: px(8092469, 1400, 940), caption: "Fig. — Working sessions" },
    { src: px(8167317, 1400, 940), caption: "Fig. — Device testing" },
    { src: px(8092459, 1400, 940), caption: "Fig. — Art direction" },
    { src: px(6893359, 1400, 940), caption: "Fig. — Material details" },
  ],
} as const;
