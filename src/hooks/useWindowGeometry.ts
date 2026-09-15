import { useCallback, useEffect, useRef, useState } from "react";
import {
  loadWindowStates,
  saveWindowStates,
  type SnapZone,
  type WindowGeometry,
} from "@/utils/storage";

export type ResizeEdge =
  | "n"
  | "s"
  | "e"
  | "w"
  | "ne"
  | "nw"
  | "se"
  | "sw";

export const RESIZE_CURSORS: Record<ResizeEdge, string> = {
  n: "ns-resize",
  s: "ns-resize",
  e: "ew-resize",
  w: "ew-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
  nw: "nwse-resize",
  se: "nwse-resize",
};

/** Reserved chrome: identity bar on top, dock at the bottom. */
export const VIEWPORT_INSETS = { top: 76, bottom: 96, side: 12 };
/** How much of the title bar must always remain grabbable. */
const MIN_VISIBLE_TITLE = 120;
const TITLE_BAR_HEIGHT = 52;
const SNAP_THRESHOLD = 26;
const CORNER_THRESHOLD = 120;

export interface SizeLimits {
  minWidth: number;
  minHeight: number;
}

export const DEFAULT_LIMITS: SizeLimits = { minWidth: 520, minHeight: 360 };
/** Utility apps are allowed to be smaller than case-study windows. */
export const COMPACT_LIMITS: SizeLimits = { minWidth: 360, minHeight: 280 };

export interface WorkArea {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export function getWorkArea(): WorkArea {
  const left = VIEWPORT_INSETS.side;
  const top = VIEWPORT_INSETS.top;
  const right = Math.max(left + 320, window.innerWidth - VIEWPORT_INSETS.side);
  const bottom = Math.max(top + 240, window.innerHeight - VIEWPORT_INSETS.bottom);
  return { left, top, right, bottom, width: right - left, height: bottom - top };
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/** Geometry for each snap zone, computed against the usable work area. */
export function snapGeometry(zone: Exclude<SnapZone, null>, area = getWorkArea()): WindowGeometry {
  const halfWidth = Math.round(area.width / 2);
  const halfHeight = Math.round(area.height / 2);

  switch (zone) {
    case "maximized":
      return { x: area.left, y: area.top, width: area.width, height: area.height };
    case "left":
      return { x: area.left, y: area.top, width: halfWidth, height: area.height };
    case "right":
      return { x: area.left + halfWidth, y: area.top, width: area.width - halfWidth, height: area.height };
    case "top-left":
      return { x: area.left, y: area.top, width: halfWidth, height: halfHeight };
    case "top-right":
      return { x: area.left + halfWidth, y: area.top, width: area.width - halfWidth, height: halfHeight };
    case "bottom-left":
      return { x: area.left, y: area.top + halfHeight, width: halfWidth, height: area.height - halfHeight };
    case "bottom-right":
      return {
        x: area.left + halfWidth,
        y: area.top + halfHeight,
        width: area.width - halfWidth,
        height: area.height - halfHeight,
      };
  }
}

/** Detect the snap zone for a pointer position during a drag. */
export function detectSnapZone(pointerX: number, pointerY: number): SnapZone {
  const nearLeft = pointerX <= SNAP_THRESHOLD;
  const nearRight = pointerX >= window.innerWidth - SNAP_THRESHOLD;
  const nearTop = pointerY <= SNAP_THRESHOLD;
  const nearBottom = pointerY >= window.innerHeight - SNAP_THRESHOLD;
  const inTopBand = pointerY <= CORNER_THRESHOLD;
  const inBottomBand = pointerY >= window.innerHeight - CORNER_THRESHOLD;

  if (nearLeft && inTopBand) return "top-left";
  if (nearRight && inTopBand) return "top-right";
  if (nearLeft && inBottomBand) return "bottom-left";
  if (nearRight && inBottomBand) return "bottom-right";
  if (nearTop) return "maximized";
  if (nearLeft) return "left";
  if (nearRight) return "right";
  if (nearBottom) return null;
  return null;
}

/** Keep a window inside the viewport with its title bar always reachable. */
export function clampGeometry(geometry: WindowGeometry, limits: SizeLimits): WindowGeometry {
  const area = getWorkArea();
  const width = clamp(geometry.width, limits.minWidth, Math.max(limits.minWidth, area.width));
  const height = clamp(geometry.height, limits.minHeight, Math.max(limits.minHeight, area.height));
  const minX = area.left - width + MIN_VISIBLE_TITLE;
  const maxX = area.right - MIN_VISIBLE_TITLE;
  const minY = area.top;
  const maxY = area.bottom - TITLE_BAR_HEIGHT;

  return {
    width,
    height,
    x: Math.round(clamp(geometry.x, minX, Math.max(minX, maxX))),
    y: Math.round(clamp(geometry.y, minY, Math.max(minY, maxY))),
  };
}

/** Centered default geometry used when a window has no stored position. */
export function defaultGeometry(index: number, limits: SizeLimits): WindowGeometry {
  const area = getWorkArea();
  const width = Math.min(920, Math.max(limits.minWidth, area.width - 40));
  const height = Math.min(690, Math.max(limits.minHeight, area.height - 20));
  const cascade = (index % 4) * 26;

  return clampGeometry(
    {
      width,
      height,
      x: area.left + (area.width - width) / 2 + cascade,
      y: area.top + (area.height - height) / 2 + cascade,
    },
    limits,
  );
}

/** Apply a resize delta for one edge while honouring the minimum size. */
export function resizeGeometry(
  start: WindowGeometry,
  edge: ResizeEdge,
  deltaX: number,
  deltaY: number,
  limits: SizeLimits,
): WindowGeometry {
  const area = getWorkArea();
  let { x, y, width, height } = start;

  if (edge.includes("e")) {
    width = clamp(start.width + deltaX, limits.minWidth, area.right - start.x);
  }
  if (edge.includes("s")) {
    height = clamp(start.height + deltaY, limits.minHeight, area.bottom - start.y);
  }
  if (edge.includes("w")) {
    const right = start.x + start.width;
    const nextWidth = clamp(start.width - deltaX, limits.minWidth, right - area.left);
    x = right - nextWidth;
    width = nextWidth;
  }
  if (edge.includes("n")) {
    const bottom = start.y + start.height;
    const nextHeight = clamp(start.height - deltaY, limits.minHeight, bottom - area.top);
    y = bottom - nextHeight;
    height = nextHeight;
  }

  return { x: Math.round(x), y: Math.round(y), width: Math.round(width), height: Math.round(height) };
}

/* ── shared persistence (throttled, interaction-complete writes) ─ */

let cachedStates = loadWindowStates();
export function readStoredGeometry(id: string) {
  return cachedStates[id];
}

export function persistWindowState(
  id: string,
  geometry: WindowGeometry,
  restore?: WindowGeometry,
  snap?: SnapZone,
) {
  cachedStates = { ...cachedStates, [id]: { geometry, restore, snap } };
  /* Called only after drag/resize/maximize completes, never per pointer pixel.
     Save synchronously so an immediate refresh cannot lose final geometry. */
  saveWindowStates(cachedStates);
}

export function forgetWindowState(id: string) {
  if (!cachedStates[id]) return;
  const next = { ...cachedStates };
  delete next[id];
  cachedStates = next;
  saveWindowStates(cachedStates);
}

export function clearAllWindowStates() {
  cachedStates = {};
  saveWindowStates({});
}

/** Live work-area tracking so resize/orientation changes stay valid. */
export function useWorkArea(): WorkArea {
  const [area, setArea] = useState<WorkArea>(() =>
    typeof window === "undefined"
      ? { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 }
      : getWorkArea(),
  );
  const frame = useRef<number | null>(null);

  const update = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => setArea(getWorkArea()));
  }, []);

  useEffect(() => {
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [update]);

  return area;
}
