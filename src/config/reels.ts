/**
 * REEL & VIDEO SHOWCASE
 * ---------------------
 * Data for the media gallery inside the Services app (Reel Editing).
 *
 * Embed URLs must be player URLs, not watch URLs:
 *   YouTube  → https://www.youtube.com/embed/VIDEO_ID
 *   Shorts   → https://www.youtube.com/embed/VIDEO_ID
 *   Vimeo    → https://player.vimeo.com/video/VIDEO_ID
 *   Instagram→ https://www.instagram.com/reel/REEL_ID/embed
 *
 * Thumbnails can be local (/reels/my-reel.webp) or remote URLs.
 * Set `placeholder: true` while a slot is still using sample media.
 */

export type ReelPlatform = "instagram" | "youtube" | "vimeo" | "client";

export type ReelCategoryId =
  | "instagram-reels"
  | "youtube-shorts"
  | "promo-edits"
  | "event-edits";

export interface ReelCategory {
  id: ReelCategoryId;
  title: string;
}

export interface ReelItem {
  id: string;
  title: string;
  description: string;
  category: ReelCategoryId;
  platform: ReelPlatform;
  /** Player embed URL. Empty string hides the play action. */
  embedUrl: string;
  thumbnail: string;
  /** "9:16" renders a vertical card, "16:9" a landscape card. */
  aspect: "9:16" | "16:9";
  duration?: string;
  client?: string;
  placeholder?: boolean;
}

export const REEL_CATEGORIES: ReelCategory[] = [
  { id: "instagram-reels", title: "Instagram Reels" },
  { id: "youtube-shorts", title: "YouTube Shorts" },
  { id: "promo-edits", title: "Promo Edits" },
  { id: "event-edits", title: "Event Edits" },
];

const shot = (id: number, w: number, h: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${w}&h=${h}`;

export const REELS: ReelItem[] = [
  {
    id: "reel-launch-teaser",
    title: "Product Launch Teaser",
    description: "Beat-matched vertical teaser with kinetic type and layered sound design.",
    category: "instagram-reels",
    platform: "youtube",
    embedUrl: "https://www.youtube.com/embed/ysz5S6PUM-U",
    thumbnail: shot(3062541, 720, 1280),
    aspect: "9:16",
    duration: "0:24",
    placeholder: true,
  },
  {
    id: "reel-studio-diary",
    title: "Studio Diary — Cut 04",
    description: "Documentary-style reel built from handheld B-roll and ambient audio.",
    category: "instagram-reels",
    platform: "youtube",
    embedUrl: "https://www.youtube.com/embed/ysz5S6PUM-U",
    thumbnail: shot(2510428, 720, 1280),
    aspect: "9:16",
    duration: "0:31",
    placeholder: true,
  },
  {
    id: "short-process-breakdown",
    title: "Design Process Breakdown",
    description: "Vertical short explaining a build in three beats with on-screen captions.",
    category: "youtube-shorts",
    platform: "youtube",
    embedUrl: "https://www.youtube.com/embed/ysz5S6PUM-U",
    thumbnail: shot(1181671, 720, 1280),
    aspect: "9:16",
    duration: "0:48",
    placeholder: true,
  },
  {
    id: "short-tool-tip",
    title: "60-Second Tool Tip",
    description: "Screen-capture short with zoom emphasis and clean subtitle styling.",
    category: "youtube-shorts",
    platform: "youtube",
    embedUrl: "https://www.youtube.com/embed/ysz5S6PUM-U",
    thumbnail: shot(374720, 720, 1280),
    aspect: "9:16",
    duration: "1:00",
    placeholder: true,
  },
  {
    id: "promo-clinic-system",
    title: "Clinic System Promo",
    description: "Thirty-second product promo cut for paid social and in-clinic screens.",
    category: "promo-edits",
    platform: "youtube",
    embedUrl: "https://www.youtube.com/embed/ysz5S6PUM-U",
    thumbnail: shot(3183150, 1280, 720),
    aspect: "16:9",
    duration: "0:30",
    client: "Healthcare client",
    placeholder: true,
  },
  {
    id: "promo-brand-film",
    title: "Brand Film — Short Cut",
    description: "Narrative promo with colour grade, motion titles and licensed score.",
    category: "promo-edits",
    platform: "vimeo",
    embedUrl: "https://player.vimeo.com/video/76979871",
    thumbnail: shot(3062545, 1280, 720),
    aspect: "16:9",
    duration: "1:12",
    placeholder: true,
  },
  {
    id: "event-aftermovie",
    title: "Conference Aftermovie",
    description: "Multi-camera event recap with speaker highlights and crowd energy.",
    category: "event-edits",
    platform: "youtube",
    embedUrl: "https://www.youtube.com/embed/ysz5S6PUM-U",
    thumbnail: shot(2774556, 1280, 720),
    aspect: "16:9",
    duration: "2:05",
    placeholder: true,
  },
  {
    id: "event-highlight-reel",
    title: "Launch Night Highlights",
    description: "Fast vertical recap delivered the morning after the event.",
    category: "event-edits",
    platform: "youtube",
    embedUrl: "https://www.youtube.com/embed/ysz5S6PUM-U",
    thumbnail: shot(1190297, 720, 1280),
    aspect: "9:16",
    duration: "0:38",
    placeholder: true,
  },
];

export const PLATFORM_LABEL: Record<ReelPlatform, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  vimeo: "Vimeo",
  client: "Client",
};
