import { useEffect, useRef, useState, type RefObject } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
  type PanInfo,
} from "framer-motion";
import type { Breakpoint, Project } from "@/data/projects";
import { hasBooted } from "./BootIntro";

const DEPTH_PX: Record<number, number> = { 1: 1.5, 2: 3.5, 3: 6.5 };

export interface IconOffset {
  dx: number;
  dy: number;
}

interface Props {
  project: Project;
  bp: Breakpoint;
  order: number;
  cell: { w: number; h: number };
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  parallax: boolean;
  offset?: IconOffset;
  nudge?: IconOffset;
  dragging?: boolean;
  isSelected?: boolean;
  constraintsRef: RefObject<HTMLDivElement | null>;
  onDragBegin?: (id: string) => void;
  onDragMove?: (id: string, info: PanInfo) => void;
  onDrop?: (id: string, info: PanInfo) => void;
  onHoverProject?: (id: string | null) => void;
  onSelectProject?: (id: string, multi?: boolean) => void;
  onContextMenu?: (id: string, x: number, y: number) => void;
  onOpen: (project: Project, rect?: DOMRect) => void;
}

export function FloatingProject({
  project,
  bp,
  order,
  cell,
  mouseX,
  mouseY,
  parallax,
  offset,
  nudge,
  dragging: isDragged,
  isSelected = false,
  constraintsRef,
  onDragBegin,
  onDragMove,
  onDrop,
  onHoverProject,
  onSelectProject,
  onContextMenu,
  onOpen,
}: Props) {
  const reduced = useReducedMotion();
  const [dragging, setDragging] = useState(false);
  const draggedRef = useRef(false);
  const pressRef = useRef<{ x: number; y: number } | null>(null);
  const lastClickTimeRef = useRef(0);
  const amp = parallax && !reduced ? DEPTH_PX[project.depth] : 0;
  const parallaxX = useTransform(mouseX, (value) => value * 2 * amp);
  const parallaxY = useTransform(mouseY, (value) => value * 2 * amp);
  const dragEnabled = bp === "desktop";
  const dragX = useMotionValue(offset?.dx ?? 0);
  const dragY = useMotionValue(offset?.dy ?? 0);
  const targetX = offset?.dx ?? 0;
  const targetY = offset?.dy ?? 0;
  const booted = hasBooted();
  const delay = reduced ? 0 : (booted ? 0.05 : 0.72) + order * (booted ? 0.045 : 0.075);

  useEffect(() => {
    if (dragging) return;
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
  }, [dragX, dragY, dragging, reduced, targetX, targetY]);

  /* Touch long-press replaces right-click on mobile. */
  const longPressRef = useRef<number | null>(null);
  const longPressFiredRef = useRef(false);

  const cancelLongPress = () => {
    if (longPressRef.current !== null) {
      window.clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  };

  useEffect(() => cancelLongPress, []);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const press = pressRef.current;
    pressRef.current = null;
    if (longPressFiredRef.current) {
      longPressFiredRef.current = false;
      return;
    }
    if (event.detail === 0) {
      onOpen(project, event.currentTarget.getBoundingClientRect());
      return;
    }
    if (press && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 6) return;
    if (dragging || draggedRef.current) {
      draggedRef.current = false;
      return;
    }
    const now = Date.now();
    const doubleClick = now - lastClickTimeRef.current < 320;
    lastClickTimeRef.current = now;
    onSelectProject?.(project.id, event.metaKey || event.ctrlKey);
    const requiresDoubleClick = bp === "desktop";
    if (!requiresDoubleClick || doubleClick) onOpen(project, event.currentTarget.getBoundingClientRect());
  };

  return (
    <div data-icon-id={project.id} className="relative flex min-h-0 min-w-0 items-start justify-center">
      <motion.div
        className="relative"
        style={{ x: dragX, y: dragY, zIndex: dragging || isDragged ? 40 : isSelected ? 25 : 10 }}
        drag={dragEnabled}
        dragConstraints={constraintsRef}
        dragMomentum={false}
        dragElastic={0.04}
        dragTransition={{ bounceStiffness: 620, bounceDamping: 42 }}
        onDragStart={() => {
          setDragging(true);
          onDragBegin?.(project.id);
        }}
        onDrag={(_: unknown, info: PanInfo) => onDragMove?.(project.id, info)}
        onDragEnd={(_: unknown, info: PanInfo) => {
          setDragging(false);
          draggedRef.current = Math.hypot(info.offset.x, info.offset.y) > 6;
          onDrop?.(project.id, info);
        }}
      >
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
          <motion.div style={{ x: parallaxX, y: parallaxY }}>
            <motion.button
              type="button"
              onPointerDown={(event) => {
                pressRef.current = { x: event.clientX, y: event.clientY };
                draggedRef.current = false;
                longPressFiredRef.current = false;
                if (event.pointerType === "touch" && onContextMenu) {
                  const { clientX, clientY } = event;
                  cancelLongPress();
                  longPressRef.current = window.setTimeout(() => {
                    longPressFiredRef.current = true;
                    onSelectProject?.(project.id);
                    onContextMenu(project.id, clientX, clientY);
                  }, 480);
                }
              }}
              onPointerUp={cancelLongPress}
              onPointerCancel={cancelLongPress}
              onPointerMove={(event) => {
                const press = pressRef.current;
                if (!press) return;
                if (Math.hypot(event.clientX - press.x, event.clientY - press.y) > 8) cancelLongPress();
              }}
              onClick={handleClick}
              onContextMenu={(event) => {
                if (!onContextMenu) return;
                event.preventDefault();
                event.stopPropagation();
                onSelectProject?.(project.id);
                onContextMenu(project.id, event.clientX, event.clientY);
              }}
              onMouseEnter={() => onHoverProject?.(project.id)}
              onMouseLeave={() => onHoverProject?.(null)}
              onFocus={() => {
                onHoverProject?.(project.id);
                onSelectProject?.(project.id);
              }}
              onBlur={() => onHoverProject?.(null)}
              aria-label={`Open ${project.title} - ${project.category}`}
              aria-selected={isSelected}
              data-cursor="OPEN"
              className={[
                "group flex w-[var(--cell-w)] cursor-pointer touch-none flex-col items-center rounded-[7px] border px-1 pb-1.5 pt-2 transition-all duration-100",
                isSelected
                  ? "border-emerald-400/60 bg-emerald-500/20 shadow-sm ring-1 ring-emerald-400/40"
                  : dragging
                    ? "border-white/25 bg-white/15"
                    : "border-transparent hover:border-white/20 hover:bg-white/10 focus-visible:border-white/35 focus-visible:bg-white/15",
              ].join(" ")}
              style={{ ["--cell-w" as string]: `${cell.w - 8}px` }}
              initial={{ opacity: 0, y: 12, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay, type: "spring", stiffness: 240, damping: 23 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src={project.icon}
                alt=""
                draggable={false}
                className="aspect-square w-[clamp(44px,3.6vw,52px)] select-none rounded-[8px] object-cover shadow-[0_6px_18px_rgba(0,0,0,0.45)] ring-1 ring-white/15"
              />
              <span className="balance mt-1.5 line-clamp-2 w-full text-center text-[11.5px] font-normal leading-[1.25] tracking-[0.005em] text-white/90 [text-shadow:0_1px_5px_rgba(0,0,0,0.85)]">
                {project.title}
              </span>
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}