import { useCallback, useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
  type PanInfo,
} from "framer-motion";
import { LayoutList } from "lucide-react";
import { PROJECTS, type Breakpoint, type Project } from "@/data/projects";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { FloatingProject, type IconOffset } from "./FloatingProject";

export const CELL: Record<Breakpoint, { w: number; h: number }> = {
  mobile: { w: 84, h: 98 },
  tablet: { w: 94, h: 106 },
  desktop: { w: 100, h: 110 },
};

interface Props {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  parallax: boolean;
  offsets: Record<string, IconOffset>;
  selectedIds: Set<string>;
  onDragEndStore: (bp: Breakpoint, id: string, offset: IconOffset) => void;
  onHoverProject?: (id: string | null) => void;
  onSelectProject?: (id: string, multi?: boolean) => void;
  onSelectMultiple?: (ids: string[]) => void;
  onProjectContextMenu?: (id: string, x: number, y: number) => void;
  onOpenProject: (project: Project, rect?: DOMRect) => void;
  /** Icon size preference multiplier from Settings. */
  iconScale?: number;
  /** Opens the Services app from its desktop icon. */
  onOpenServices?: () => void;
  onServicesContextMenu?: (x: number, y: number, mobile: boolean) => void;
}

interface Point {
  x: number;
  y: number;
}

interface BaseIcon {
  center: Point;
  homeCenter: Point;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Services participates in every desktop interaction the projects have. */
const SERVICES_ICON_ID = "services";
const desktopItemIds = (): string[] => [
  ...PROJECTS.map((project) => project.id),
  SERVICES_ICON_ID,
];

/**
 * Desktop shortcut for a non-project app. Rendered inside the same grid cell
 * geometry as project icons so the composition stays consistent.
 */
function DesktopAppIcon({
  label,
  cell,
  offset,
  draggable,
  selected,
  constraintsRef,
  mouseX,
  mouseY,
  parallax,
  nudge,
  isDragged,
  onOpen,
  onSelect,
  onContextMenu,
  onDragBegin,
  onDragMove,
  onDrop,
}: {
  label: string;
  cell: { w: number; h: number };
  offset?: IconOffset;
  draggable: boolean;
  nudge?: IconOffset;
  isDragged?: boolean;
  selected: boolean;
  constraintsRef: React.RefObject<HTMLDivElement | null>;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  parallax: boolean;
  onOpen: () => void;
  onSelect?: () => void;
  onContextMenu?: (x: number, y: number, mobile: boolean) => void;
  onDragBegin?: (id: string) => void;
  onDragMove?: (id: string, info: PanInfo) => void;
  onDrop?: (id: string, info: PanInfo) => void;
}) {
  const reduced = useReducedMotion();
  const dragX = useMotionValue(offset?.dx ?? 0);
  const dragY = useMotionValue(offset?.dy ?? 0);
  /* Match the medium-depth ambient movement used by project icons. */
  const parallaxX = useTransform(mouseX, (value) => value * (parallax && !reduced ? 7 : 0));
  const parallaxY = useTransform(mouseY, (value) => value * (parallax && !reduced ? 7 : 0));
  const [dragging, setDragging] = useState(false);
  const pressRef = useRef<{ x: number; y: number } | null>(null);
  const draggedRef = useRef(false);
  const lastClickRef = useRef(0);
  const longPressRef = useRef<number | null>(null);

  useEffect(() => {
    if (dragging) return;
    const targetX = offset?.dx ?? 0;
    const targetY = offset?.dy ?? 0;
    if (reduced) {
      dragX.set(targetX);
      dragY.set(targetY);
      return;
    }
    const xControl = animate(dragX, targetX, { type: "spring", stiffness: 430, damping: 32 });
    const yControl = animate(dragY, targetY, { type: "spring", stiffness: 430, damping: 32 });
    return () => {
      xControl.stop();
      yControl.stop();
    };
  }, [dragX, dragY, dragging, offset?.dx, offset?.dy, reduced]);

  useEffect(() => () => {
    if (longPressRef.current !== null) window.clearTimeout(longPressRef.current);
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const press = pressRef.current;
    pressRef.current = null;
    if (press && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 6) return;
    if (dragging || draggedRef.current) {
      draggedRef.current = false;
      return;
    }
    onSelect?.();
    if (!draggable || event.detail === 0) {
      onOpen();
      return;
    }
    const now = Date.now();
    if (now - lastClickRef.current < 320) onOpen();
    lastClickRef.current = now;
  };

  return (
    <div data-icon-id="services" className="relative flex min-h-0 min-w-0 items-start justify-center">
      <motion.div
        drag={draggable && !reduced}
        dragConstraints={constraintsRef}
        dragMomentum={false}
        dragElastic={0.04}
        style={{ x: dragX, y: dragY, zIndex: dragging || isDragged ? 40 : selected ? 25 : 10 }}
        onDragStart={() => {
          setDragging(true);
          onDragBegin?.(SERVICES_ICON_ID);
        }}
        onDrag={(_: unknown, info: PanInfo) => onDragMove?.(SERVICES_ICON_ID, info)}
        onDragEnd={(_: unknown, info: PanInfo) => {
          setDragging(false);
          draggedRef.current = Math.hypot(info.offset.x, info.offset.y) > 6;
          onDrop?.(SERVICES_ICON_ID, info);
        }}
      >
        {/* Magnetic displacement from neighbouring icons, same as projects. */}
        <motion.div
          animate={{ x: nudge?.dx ?? 0, y: nudge?.dy ?? 0 }}
          transition={
            reduced
              ? { duration: 0.01 }
              : nudge
                ? { type: "spring", stiffness: 700, damping: 30, mass: 0.5 }
                : { type: "spring", stiffness: 260, damping: 24, mass: 0.7 }
          }
        >
        <motion.button
          type="button"
          onPointerDown={(event) => {
            pressRef.current = { x: event.clientX, y: event.clientY };
            draggedRef.current = false;
            if (event.pointerType === "touch" && onContextMenu) {
              const { clientX, clientY } = event;
              if (longPressRef.current !== null) window.clearTimeout(longPressRef.current);
              longPressRef.current = window.setTimeout(() => {
                draggedRef.current = true;
                onSelect?.();
                onContextMenu(clientX, clientY, true);
              }, 480);
            }
          }}
          onPointerMove={(event) => {
            const press = pressRef.current;
            if (press && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 8) {
              if (longPressRef.current !== null) window.clearTimeout(longPressRef.current);
              longPressRef.current = null;
            }
          }}
          onPointerUp={() => {
            if (longPressRef.current !== null) window.clearTimeout(longPressRef.current);
            longPressRef.current = null;
          }}
          onPointerCancel={() => {
            if (longPressRef.current !== null) window.clearTimeout(longPressRef.current);
            longPressRef.current = null;
          }}
          onContextMenu={(event) => {
            if (!onContextMenu) return;
            event.preventDefault();
            event.stopPropagation();
            onSelect?.();
            onContextMenu(event.clientX, event.clientY, false);
          }}
          onClick={handleClick}
          data-cursor="OPEN"
          aria-label={`Open ${label}`}
          aria-selected={selected}
          className={[
            "group flex w-[var(--cell-w)] cursor-pointer touch-none flex-col items-center rounded-[7px] border px-1 pb-1.5 pt-2 transition-all duration-100",
            selected
              ? "border-emerald-400/60 bg-emerald-500/20 shadow-sm ring-1 ring-emerald-400/40"
              : dragging
                ? "border-white/25 bg-white/15"
                : "border-transparent hover:border-white/20 hover:bg-white/10 focus-visible:border-white/35 focus-visible:bg-white/15",
          ].join(" ")}
          style={{
            ["--cell-w" as string]: `${cell.w - 8}px`,
            x: parallaxX,
            y: parallaxY,
          }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="grid aspect-square w-[clamp(44px,3.6vw,52px)] place-items-center rounded-[8px] bg-gradient-to-br from-[#2b2b31] to-[#131317] shadow-[0_6px_18px_rgba(0,0,0,0.45)] ring-1 ring-white/15">
            <LayoutList size={22} strokeWidth={1.5} className="text-white/85" />
          </span>
          <span className="balance mt-1.5 line-clamp-2 w-full text-center text-[11.5px] leading-[1.25] text-white/90 [text-shadow:0_1px_5px_rgba(0,0,0,0.85)]">
            {label}
          </span>
        </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}

/** Windows-style desktop grid, marquee selection and magnetic icon displacement. */
export function FloatingProjectLayer({
  mouseX,
  mouseY,
  parallax,
  offsets,
  selectedIds,
  onDragEndStore,
  onHoverProject,
  onSelectProject,
  onSelectMultiple,
  onProjectContextMenu,
  onOpenProject,
  iconScale = 1,
  onOpenServices,
  onServicesContextMenu,
}: Props) {
  const bp = useBreakpoint();
  const layerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);
  const isMobile = bp === "mobile";
  const baseCell = CELL[bp];
  const cell = {
    w: Math.round(baseCell.w * iconScale),
    h: Math.round(baseCell.h * iconScale),
  };
  const [dragId, setDragId] = useState<string | null>(null);
  const [nudges, setNudges] = useState<Record<string, IconOffset>>({});
  const nudgeRef = useRef<Record<string, IconOffset>>({});
  const baseRef = useRef<Map<string, BaseIcon> | null>(null);
  const [marquee, setMarquee] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  const clearNudges = useCallback(() => {
    nudgeRef.current = {};
    setNudges({});
  }, []);

  const captureBases = useCallback(() => {
    const layer = layerRef.current;
    if (!layer) return null;
    const ids = desktopItemIds();
    const map = new Map<string, BaseIcon>();
    ids.forEach((id) => {
      const element = layer.querySelector<HTMLElement>(`[data-icon-id="${id}"]`);
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const homeCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      const offset = offsets[`${bp}:${id}`] ?? { dx: 0, dy: 0 };
      map.set(id, {
        homeCenter,
        center: { x: homeCenter.x + offset.dx, y: homeCenter.y + offset.dy },
      });
    });
    return map.size === ids.length ? map : null;
  }, [bp, offsets]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !parallax) return;
    let selecting = false;
    let start = { x: 0, y: 0 };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.closest("[data-icon-id]") ||
        target.closest("[data-sticky-note]") ||
        target.closest("button, input, textarea, [contenteditable]") ||
        target.closest("[data-window]")
      ) return;
      selecting = true;
      start = { x: event.clientX, y: event.clientY };
      setMarquee({ startX: start.x, startY: start.y, currentX: start.x, currentY: start.y });
      if (!event.metaKey && !event.ctrlKey) onSelectMultiple?.([]);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!selecting) return;
      setMarquee({ startX: start.x, startY: start.y, currentX: event.clientX, currentY: event.clientY });
      const left = Math.min(start.x, event.clientX);
      const right = Math.max(start.x, event.clientX);
      const top = Math.min(start.y, event.clientY);
      const bottom = Math.max(start.y, event.clientY);
      const selected: string[] = [];
      desktopItemIds().forEach((id) => {
        const element = layerRef.current?.querySelector<HTMLElement>(`[data-icon-id="${id}"]`);
        if (!element) return;
        const rect = element.getBoundingClientRect();
        if (rect.right >= left && rect.left <= right && rect.bottom >= top && rect.top <= bottom) {
          selected.push(id);
        }
      });
      onSelectMultiple?.(selected);
    };

    const onPointerUp = () => {
      if (!selecting) return;
      selecting = false;
      setMarquee(null);
    };

    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [onSelectMultiple, parallax]);

  const handleDragBegin = useCallback((id: string) => {
    setDragId(id);
    clearNudges();
    baseRef.current = captureBases();
    onSelectProject?.(id);
  }, [captureBases, clearNudges, onSelectProject]);

  const handleDragMove = useCallback((id: string, info: PanInfo) => {
    const base = baseRef.current;
    const layer = layerRef.current;
    const dragged = base?.get(id);
    if (!base || !layer || !dragged) return;
    const bounds = layer.getBoundingClientRect();
    const live = { x: dragged.center.x + info.offset.x, y: dragged.center.y + info.offset.y };
    const radius = Math.max(cell.w, cell.h) * 1.34;
    const hardGap = Math.max(cell.w, cell.h) * 0.9;
    const positions = new Map<string, Point>();
    base.forEach((item, itemId) => {
      if (itemId !== id) positions.set(itemId, { ...item.center });
    });

    const inside = (point: Point) => {
      point.x = clamp(point.x, bounds.left + cell.w * 0.46, bounds.right - cell.w * 0.46);
      point.y = clamp(point.y, bounds.top + cell.h * 0.46, bounds.bottom - cell.h * 0.46);
    };

    positions.forEach((point, itemId) => {
      let dx = point.x - live.x;
      let dy = point.y - live.y;
      let distance = Math.hypot(dx, dy);
      if (distance >= radius) return;
      if (distance < 0.01) {
          const angle =
            ((desktopItemIds().indexOf(itemId) + 1) * Math.PI * 2) / desktopItemIds().length;
        dx = Math.cos(angle);
        dy = Math.sin(angle);
        distance = 1;
      }
      const field = 1 - distance / radius;
      const push = Math.max(0, hardGap - distance) + (radius - hardGap) * field * field * 0.72;
      point.x += (dx / distance) * push;
      point.y += (dy / distance) * push;
      inside(point);
    });

    const ids = [...positions.keys()];
    for (let pass = 0; pass < 4; pass += 1) {
      for (let first = 0; first < ids.length; first += 1) {
        for (let second = first + 1; second < ids.length; second += 1) {
          const a = positions.get(ids[first]);
          const b = positions.get(ids[second]);
          if (!a || !b) continue;
          let dx = b.x - a.x;
          let dy = b.y - a.y;
          let distance = Math.hypot(dx, dy);
          if (distance >= hardGap) continue;
          if (distance < 0.01) { dx = 1; dy = 0; distance = 1; }
          const push = (hardGap - distance) / 2;
          a.x -= (dx / distance) * push;
          a.y -= (dy / distance) * push;
          b.x += (dx / distance) * push;
          b.y += (dy / distance) * push;
          inside(a);
          inside(b);
        }
      }
    }

    const next: Record<string, IconOffset> = {};
    positions.forEach((point, itemId) => {
      const item = base.get(itemId);
      if (!item) return;
      const dx = point.x - item.center.x;
      const dy = point.y - item.center.y;
      if (Math.hypot(dx, dy) > 0.5) next[itemId] = { dx, dy };
    });
    nudgeRef.current = next;
    setNudges(next);
  }, [cell]);

  const handleDrop = useCallback((id: string, info: PanInfo) => {
    const base = baseRef.current;
    const layer = layerRef.current;
    baseRef.current = null;
    if (!base || !layer) return;
    const bounds = layer.getBoundingClientRect();
    /* Grid origin comes from the grid itself, never from a movable icon. */
    const origin = {
      x: bounds.left + cell.w / 2,
      y: bounds.top + cell.h / 2,
    };
    const dragged = base.get(id);
    if (!dragged) return;
    const rows = Math.max(1, Math.floor(bounds.height / cell.h));
    const columns = Math.max(1, Math.floor(bounds.width / cell.w));
    const toSlot = (point: Point) => ({
      x: clamp(Math.round((point.x - origin.x) / cell.w), 0, columns - 1),
      y: clamp(Math.round((point.y - origin.y) / cell.h), 0, rows - 1),
    });
    const slots = new Map<string, Point>();
    const owners = new Map<string, string>();
    const ids = desktopItemIds();
    ids.forEach((id) => {
      const item = base.get(id);
      if (!item) return;
      const slot = toSlot(item.center);
      slots.set(id, slot);
      owners.set(`${slot.x}:${slot.y}`, id);
    });
    const source = slots.get(id) ?? toSlot(dragged.center);
    const target = toSlot({ x: dragged.center.x + info.offset.x, y: dragged.center.y + info.offset.y });
    const targetOwner = owners.get(`${target.x}:${target.y}`);
    slots.set(id, target);
    if (targetOwner && targetOwner !== id) slots.set(targetOwner, source);

    ids.forEach((id) => {
      const item = base.get(id);
      const slot = slots.get(id);
      if (!item || !slot) return;
      onDragEndStore(bp, id, {
        dx: Math.round(origin.x + slot.x * cell.w - item.homeCenter.x),
        dy: Math.round(origin.y + slot.y * cell.h - item.homeCenter.y),
      });
    });
    requestAnimationFrame(() => {
      setDragId(null);
      clearNudges();
    });
  }, [bp, cell, clearNudges, onDragEndStore]);

  /* Mobile home screen: a purpose-built grid, never scaled desktop
     coordinates. No dragging, no marquee, thumb-sized targets. */
  if (isMobile) {
    return (
      <nav
        className="absolute inset-x-0 bottom-[104px] top-[92px] z-10 overflow-y-auto os-scroll px-4"
        aria-label="Projects"
      >
        <div className="grid grid-cols-3 gap-x-2 gap-y-4 pb-4 pt-1 min-[420px]:grid-cols-4">
          {PROJECTS.map((project, order) => (
            <div key={project.id} className="flex justify-center">
              <FloatingProject
                project={project}
                bp={bp}
                order={order}
                cell={cell}
                mouseX={mouseX}
                mouseY={mouseY}
                parallax={false}
                isSelected={selectedIds.has(project.id)}
                constraintsRef={layerRef}
                onHoverProject={onHoverProject}
                onSelectProject={onSelectProject}
                onContextMenu={onProjectContextMenu}
                onOpen={onOpenProject}
              />
            </div>
          ))}

          {onOpenServices && (
            <div className="flex justify-center">
              <DesktopAppIcon
                label="Services"
                cell={cell}
                offset={offsets[`${bp}:services`]}
                draggable={false}
                selected={selectedIds.has(SERVICES_ICON_ID)}
                constraintsRef={layerRef}
                mouseX={mouseX}
                mouseY={mouseY}
                parallax={false}
                onOpen={onOpenServices}
                onSelect={() => onSelectProject?.(SERVICES_ICON_ID)}
                onContextMenu={onServicesContextMenu}
              />
            </div>
          )}
        </div>
      </nav>
    );
  }

  return (
    <nav
      ref={containerRef}
      className="absolute inset-x-0 bottom-[104px] top-[88px] z-10 px-3 sm:px-5 md:bottom-[112px] md:top-[104px] md:px-7"
      aria-label="Projects"
    >
      <div
        ref={layerRef}
        className="grid h-full w-full justify-start"
        style={{
          gridAutoFlow: "column",
          gridTemplateRows: `repeat(auto-fill, ${cell.h}px)`,
          gridAutoColumns: `${cell.w}px`,
        }}
      >
        {PROJECTS.map((project, order) => (
          <FloatingProject
            key={project.id}
            project={project}
            bp={bp}
            order={order}
            cell={cell}
            mouseX={mouseX}
            mouseY={mouseY}
            parallax={parallax}
            offset={offsets[`${bp}:${project.id}`]}
            nudge={dragId && dragId !== project.id ? nudges[project.id] : undefined}
            dragging={dragId === project.id}
            isSelected={selectedIds.has(project.id)}
            constraintsRef={layerRef}
            onDragBegin={handleDragBegin}
            onDragMove={handleDragMove}
            onDrop={handleDrop}
            onHoverProject={onHoverProject}
            onSelectProject={onSelectProject}
            onContextMenu={onProjectContextMenu}
            onOpen={onOpenProject}
          />
        ))}

        {/* Services app shortcut sits alongside the project icons. */}
        {onOpenServices && (
          <DesktopAppIcon
            label="Services"
            cell={cell}
            offset={offsets[`${bp}:${SERVICES_ICON_ID}`]}
            draggable={parallax}
            selected={selectedIds.has(SERVICES_ICON_ID)}
            constraintsRef={layerRef}
            mouseX={mouseX}
            mouseY={mouseY}
            parallax={parallax}
            nudge={dragId && dragId !== SERVICES_ICON_ID ? nudges[SERVICES_ICON_ID] : undefined}
            isDragged={dragId === SERVICES_ICON_ID}
            onOpen={onOpenServices}
            onSelect={() => onSelectProject?.(SERVICES_ICON_ID)}
            onContextMenu={onServicesContextMenu}
            onDragBegin={handleDragBegin}
            onDragMove={handleDragMove}
            onDrop={handleDrop}
          />
        )}
      </div>
      {marquee && (
        <div
          className="pointer-events-none fixed z-30 rounded-sm border border-emerald-400/80 bg-emerald-400/15 backdrop-blur-[1px]"
          style={{
            left: Math.min(marquee.startX, marquee.currentX),
            top: Math.min(marquee.startY, marquee.currentY),
            width: Math.abs(marquee.currentX - marquee.startX),
            height: Math.abs(marquee.currentY - marquee.startY),
          }}
        />
      )}
    </nav>
  );
}