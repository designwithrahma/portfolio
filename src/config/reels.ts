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
  { id: "promo-edits", title: "B-Roll Editing" },
];

export const REELS: ReelItem[] = [
  {
    id: "coming-soon",
    title: "B-Roll Editing Work",
    description: "B-Roll editing work coming soon.",
    category: "promo-edits",
    platform: "client",
    embedUrl: "",
    thumbnail: "",
    aspect: "16:9",
    duration: "",
    placeholder: true,
  }
];

export const PLATFORM_LABEL: Record<ReelPlatform, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  vimeo: "Vimeo",
  client: "Client",
};
