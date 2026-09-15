/**
 * Versioned desktop persistence.
 *
 * Every namespace is read through a validator so corrupted or outdated
 * payloads fall back to defaults instead of breaking the desktop.
 */

export const STORAGE_VERSION = 1;

export const STORAGE_KEYS = {
  layout: "portfolio.desktop.layout",
  windows: "portfolio.windows",
  preferences: "portfolio.preferences",
  recent: "portfolio.recent",
} as const;

interface Envelope<T> {
  version: number;
  data: T;
}

const isBrowser = () => typeof window !== "undefined" && typeof localStorage !== "undefined";

export function readStore<T>(key: string, fallback: T, validate?: (value: unknown) => value is T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Envelope<T> | null;
    if (!parsed || typeof parsed !== "object") return fallback;
    if (parsed.version !== STORAGE_VERSION) {
      localStorage.removeItem(key);
      return fallback;
    }
    if (validate && !validate(parsed.data)) {
      localStorage.removeItem(key);
      return fallback;
    }
    return parsed.data;
  } catch {
    return fallback;
  }
}

export function writeStore<T>(key: string, data: T): void {
  if (!isBrowser()) return;
  try {
    const envelope: Envelope<T> = { version: STORAGE_VERSION, data };
    localStorage.setItem(key, JSON.stringify(envelope));
  } catch {
    /* Quota or private mode: persistence is best-effort only. */
  }
}

export function clearStore(key: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/* ── geometry ─────────────────────────────────────────────── */

export interface WindowGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type SnapZone =
  | "left"
  | "right"
  | "maximized"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | null;

export interface StoredWindowState {
  geometry: WindowGeometry;
  /** Floating geometry remembered while snapped or maximized. */
  restore?: WindowGeometry;
  snap?: SnapZone;
}

export type WindowStateMap = Record<string, StoredWindowState>;

const isGeometry = (value: unknown): value is WindowGeometry => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    Number.isFinite(candidate.x) &&
    Number.isFinite(candidate.y) &&
    Number.isFinite(candidate.width) &&
    Number.isFinite(candidate.height)
  );
};

const isWindowStateMap = (value: unknown): value is WindowStateMap => {
  if (!value || typeof value !== "object") return false;
  const validSnaps: SnapZone[] = [
    null,
    "left",
    "right",
    "maximized",
    "top-left",
    "top-right",
    "bottom-left",
    "bottom-right",
  ];
  return Object.values(value as Record<string, unknown>).every((entry) => {
    if (!entry || typeof entry !== "object") return false;
    const state = entry as Record<string, unknown>;
    if (!isGeometry(state.geometry)) return false;
    if (state.restore !== undefined && !isGeometry(state.restore)) return false;
    if (state.snap !== undefined && !validSnaps.includes(state.snap as SnapZone)) return false;
    return true;
  });
};

export const loadWindowStates = (): WindowStateMap =>
  readStore<WindowStateMap>(STORAGE_KEYS.windows, {}, isWindowStateMap);

export const saveWindowStates = (states: WindowStateMap) => writeStore(STORAGE_KEYS.windows, states);

/* ── desktop icon layout ──────────────────────────────────── */

export interface IconOffsetValue {
  dx: number;
  dy: number;
}

export type DesktopLayout = Record<string, IconOffsetValue>;

const isDesktopLayout = (value: unknown): value is DesktopLayout => {
  if (!value || typeof value !== "object") return false;
  return Object.values(value as Record<string, unknown>).every((entry) => {
    if (!entry || typeof entry !== "object") return false;
    const offset = entry as Record<string, unknown>;
    return Number.isFinite(offset.dx) && Number.isFinite(offset.dy);
  });
};

/**
 * User layout only. Designer defaults live in the desktop composition and are
 * never written here, so "reset layout" always returns to the original design.
 */
export const loadDesktopLayout = (): DesktopLayout =>
  readStore<DesktopLayout>(STORAGE_KEYS.layout, {}, isDesktopLayout);

export const saveDesktopLayout = (layout: DesktopLayout) => writeStore(STORAGE_KEYS.layout, layout);

/* ── preferences ──────────────────────────────────────────── */

export type IconSize = "small" | "medium" | "large";
export type DockMagnification = "off" | "low" | "medium";
export type MotionMode = "full" | "reduced";

export interface DesktopPreferences {
  wallpaperId: string | null;
  soundsOn: boolean;
  musicOn: boolean;
  volume: number;
  backgroundMotion: boolean;
  motionMode: MotionMode;
  weather: string;
  weatherEffects: boolean;
  iconSize: IconSize;
  dockMagnification: DockMagnification;
}

export const DEFAULT_PREFERENCES: DesktopPreferences = {
  wallpaperId: null,
  soundsOn: false,
  musicOn: false,
  volume: 0.6,
  backgroundMotion: true,
  motionMode: "full",
  weather: "clear",
  weatherEffects: true,
  iconSize: "medium",
  dockMagnification: "medium",
};

/** Pixel metrics per icon-size preference, shared by the desktop grid. */
export const ICON_SIZE_SCALE: Record<IconSize, number> = {
  small: 0.86,
  medium: 1,
  large: 1.18,
};

/** Magnification strength used by the dock. */
export const DOCK_MAGNIFICATION_SCALE: Record<DockMagnification, number> = {
  off: 0,
  low: 0.16,
  medium: 0.3,
};

const isPreferences = (value: unknown): value is DesktopPreferences => {
  if (!value || typeof value !== "object") return false;
  const prefs = value as Record<string, unknown>;
  const optional = (key: string, test: (entry: unknown) => boolean) =>
    !(key in prefs) || test(prefs[key]);

  /* Fields are optional for forward/backward migrations, but values that are
     present must be valid. Defaults fill any missing fields below. */
  return (
    optional("wallpaperId", (entry) => entry === null || typeof entry === "string") &&
    optional("soundsOn", (entry) => typeof entry === "boolean") &&
    optional("musicOn", (entry) => typeof entry === "boolean") &&
    optional("volume", (entry) => typeof entry === "number" && entry >= 0 && entry <= 1) &&
    optional("backgroundMotion", (entry) => typeof entry === "boolean") &&
    optional("motionMode", (entry) => entry === "full" || entry === "reduced") &&
    optional("weather", (entry) => ["clear", "rain", "mist", "aurora"].includes(String(entry))) &&
    optional("weatherEffects", (entry) => typeof entry === "boolean") &&
    optional("iconSize", (entry) => ["small", "medium", "large"].includes(String(entry))) &&
    optional("dockMagnification", (entry) => ["off", "low", "medium"].includes(String(entry)))
  );
};

export const loadPreferences = (): DesktopPreferences => ({
  ...DEFAULT_PREFERENCES,
  ...readStore<DesktopPreferences>(STORAGE_KEYS.preferences, DEFAULT_PREFERENCES, isPreferences),
});

export const savePreferences = (preferences: DesktopPreferences) =>
  writeStore(STORAGE_KEYS.preferences, preferences);

/* ── recent items ─────────────────────────────────────────── */

export interface RecentItem {
  id: string;
  type: "project" | "app";
  title: string;
  timestamp: number;
}

export const RECENT_LIMIT = 10;

const isRecentList = (value: unknown): value is RecentItem[] =>
  Array.isArray(value) &&
  value.every((entry) => {
    if (!entry || typeof entry !== "object") return false;
    const item = entry as Record<string, unknown>;
    return (
      typeof item.id === "string" &&
      (item.type === "project" || item.type === "app") &&
      typeof item.title === "string" &&
      Number.isFinite(item.timestamp)
    );
  });

export const loadRecentItems = (): RecentItem[] =>
  readStore<RecentItem[]>(STORAGE_KEYS.recent, [], isRecentList);

/** Most recent first, de-duplicated by id, capped at RECENT_LIMIT. */
export function pushRecentItem(item: Omit<RecentItem, "timestamp">): RecentItem[] {
  const next: RecentItem[] = [
    { ...item, timestamp: Date.now() },
    ...loadRecentItems().filter((entry) => entry.id !== item.id),
  ].slice(0, RECENT_LIMIT);
  writeStore(STORAGE_KEYS.recent, next);
  return next;
}

export const clearRecentItems = () => writeStore<RecentItem[]>(STORAGE_KEYS.recent, []);

/* ── session ──────────────────────────────────────────────── */

const SESSION_KEY = "portfolio.session.active";

/** True when this tab already booted once (refresh should resume quickly). */
export function hasActiveSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function markSessionActive(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    /* ignore */
  }
}

/** True when the visitor has opened this portfolio in a previous visit. */
export function hasReturningVisitor(): boolean {
  try {
    return localStorage.getItem("portfolio.visited") === "1";
  } catch {
    return false;
  }
}

export function markVisited(): void {
  try {
    localStorage.setItem("portfolio.visited", "1");
  } catch {
    /* ignore */
  }
}
