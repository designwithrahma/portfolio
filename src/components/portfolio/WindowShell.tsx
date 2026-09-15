import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { motion, useDragControls, useMotionValue, useReducedMotion, type PanInfo } from "framer-motion";
import { ArrowLeft, Copy, Minus, Square, X } from "lucide-react";
import {
  COMPACT_LIMITS,
  DEFAULT_LIMITS,
  RESIZE_CURSORS,
  clampGeometry,
  defaultGeometry,
  detectSnapZone,
  persistWindowState,
  readStoredGeometry,
  resizeGeometry,
  snapGeometry,
  useWorkArea,
  type ResizeEdge,
} from "@/hooks/useWindowGeometry";
import type { SnapZone, WindowGeometry } from "@/utils/storage";
import { SnapPreview } from "./SnapPreview";

const FOCUSABLE = 'button, a[href], input, textarea, select, [tabindex]:not([tabindex="-1"])';

/** Utility apps may shrink further than case-study windows. */
const COMPACT_WINDOWS = new Set([
  "win-terminal",
  "win-settings",
  "win-diagnostics",
  "win-playground",
  "win-estimator",
]);

const EDGES: { edge: ResizeEdge; className: string }[] = [
  { edge: "n", className: "left-3 right-3 top-0 h-1.5" },
  { edge: "s", className: "bottom-0 left-3 right-3 h-1.5" },
  { edge: "w", className: "bottom-3 left-0 top-3 w-1.5" },
  { edge: "e", className: "bottom-3 right-0 top-3 w-1.5" },
  { edge: "nw", className: "left-0 top-0 h-3.5 w-3.5" },
  { edge: "ne", className: "right-0 top-0 h-3.5 w-3.5" },
  { edge: "sw", className: "bottom-0 left-0 h-3.5 w-3.5" },
  { edge: "se", className: "bottom-0 right-0 h-3.5 w-3.5" },
];

interface WindowShellProps {
  title: string;
  kicker: string;
  isMobile: boolean;
  /** Stable id used for per-window geometry persistence. */
  windowId?: string;
  windowIndex?: number;
  /** Hidden windows remain mounted so app-local state survives minimize. */
  minimized?: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  onBack?: () => void;
  onFocus?: () => void;
  zIndex?: number;
  cascadeOffset?: { x: number; y: number };
  origin?: { x: number; y: number } | null;
  children: ReactNode;
}

/** Desktop window: draggable, resizable, snappable and focus-contained. */
export function WindowShell({
  title,
  kicker,
  isMobile,
  windowId,
  windowIndex = 0,
  minimized = false,
  onClose,
  onMinimize,
  onBack,
  onFocus,
  zIndex = 60,
  origin,
  children,
}: WindowShellProps) {
  const reduced = useReducedMotion();
  const controls = useDragControls();
  const rootRef = useRef<HTMLElement>(null);
  const workArea = useWorkArea();

  const limits = useMemo(
    () => (windowId && COMPACT_WINDOWS.has(windowId) ? COMPACT_LIMITS : DEFAULT_LIMITS),
    [windowId],
  );

  const stored = windowId ? readStoredGeometry(windowId) : undefined;
  const [geometry, setGeometry] = useState<WindowGeometry>(() =>
    clampGeometry(stored?.geometry ?? defaultGeometry(windowIndex, limits), limits),
  );
  /** Floating geometry remembered while snapped or maximized. */
  const [restoreGeometry, setRestoreGeometry] = useState<WindowGeometry | null>(
    stored?.restore ?? null,
  );
  const [snapState, setSnapState] = useState<SnapZone>(stored?.snap ?? null);
  const [snapPreview, setSnapPreview] = useState<SnapZone>(null);
  const [interacting, setInteracting] = useState(false);

  const geometryRef = useRef(geometry);
  geometryRef.current = geometry;

  /* Drag runs on transforms; committed position lives in left/top. Keeping
     them separate avoids Framer and React fighting over the same values. */
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  const commit = useCallback(
    (next: WindowGeometry, restore: WindowGeometry | null, snap: SnapZone) => {
      setGeometry(next);
      setRestoreGeometry(restore);
      setSnapState(snap);
      if (windowId) persistWindowState(windowId, next, restore ?? undefined, snap);
    },
    [windowId],
  );

  /* Keep windows valid when the viewport or orientation changes. */
  useEffect(() => {
    if (isMobile) return;
    const current = geometryRef.current;
    const next = snapState ? snapGeometry(snapState) : clampGeometry(current, limits);
    const unchanged =
      next.x === current.x &&
      next.y === current.y &&
      next.width === current.width &&
      next.height === current.height;
    if (unchanged) return;

    setGeometry(next);
    if (windowId) {
      persistWindowState(windowId, next, restoreGeometry ?? undefined, snapState);
    }
  }, [isMobile, limits, restoreGeometry, snapState, windowId, workArea.width, workArea.height]);

  useEffect(() => {
    rootRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus({ preventScroll: true });
  }, []);

  const trapTab = (event: ReactKeyboardEvent) => {
    if (event.key !== "Tab") return;
    const root = rootRef.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (element) => !element.hasAttribute("disabled"),
    );
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === root)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  /* ── maximize / restore ── */
  const toggleMaximize = useCallback(() => {
    if (snapState) {
      const target = restoreGeometry ?? defaultGeometry(windowIndex, limits);
      commit(clampGeometry(target, limits), null, null);
    } else {
      commit(snapGeometry("maximized"), geometryRef.current, "maximized");
    }
  }, [commit, limits, restoreGeometry, snapState, windowIndex]);

  /* ── dragging with snap detection ── */
  const handleDragStart = () => {
    setInteracting(true);
    /* Dragging a snapped window restores its floating size under the pointer. */
    if (snapState) {
      const target = clampGeometry(restoreGeometry ?? defaultGeometry(windowIndex, limits), limits);
      setGeometry((current) => ({ ...target, x: current.x, y: current.y }));
      setSnapState(null);
    }
  };

  const handleDrag = (_: unknown, info: PanInfo) => {
    setSnapPreview(detectSnapZone(info.point.x, info.point.y));
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const zone = snapPreview;
    setSnapPreview(null);

    if (zone) {
      commit(snapGeometry(zone), restoreGeometry ?? geometryRef.current, zone);
    } else {
      const moved = {
        ...geometryRef.current,
        x: geometryRef.current.x + info.offset.x,
        y: geometryRef.current.y + info.offset.y,
      };
      commit(clampGeometry(moved, limits), null, null);
    }

    /* Reset the transform in the same commit as the new left/top. */
    dragX.set(0);
    dragY.set(0);
    requestAnimationFrame(() => setInteracting(false));
  };

  /* ── pointer-driven resizing ── */
  const startResize = (edge: ResizeEdge) => (event: ReactPointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onFocus?.();
    setInteracting(true);

    const startGeometry = snapState ? { ...geometryRef.current } : geometryRef.current;
    const startX = event.clientX;
    const startY = event.clientY;
    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture?.(event.pointerId);

    let frame: number | null = null;
    let latest = startGeometry;

    const onMove = (moveEvent: PointerEvent) => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        latest = resizeGeometry(
          startGeometry,
          edge,
          moveEvent.clientX - startX,
          moveEvent.clientY - startY,
          limits,
        );
        setGeometry(latest);
      });
    };

    const onUp = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      target.releasePointerCapture?.(event.pointerId);
      setInteracting(false);
      commit(clampGeometry(latest, limits), null, null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  const header = (
    <div
      onPointerDown={(event) => {
        onFocus?.();
        /* Desktop starts window drag; mobile starts the existing sheet drag. */
        controls.start(event);
      }}
      onDoubleClick={(event) => {
        if (isMobile) return;
        /* Ignore double clicks that land on the window buttons. */
        if ((event.target as HTMLElement).closest("button")) return;
        toggleMaximize();
      }}
      className="flex h-[52px] shrink-0 cursor-grab select-none items-center justify-between gap-3 border-b border-ink/[0.07] bg-paper/85 pl-4 pr-3 backdrop-blur active:cursor-grabbing md:pl-5"
      style={isMobile ? { paddingTop: "env(safe-area-inset-top)" } : undefined}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to all work"
            onPointerDown={(event) => event.stopPropagation()}
            className="-ml-1 grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-[9px] text-ink/55 transition-colors hover:bg-ink/[0.06] hover:text-ink"
          >
            <ArrowLeft size={15} strokeWidth={1.8} />
          </button>
        )}
        <p className="truncate text-[13px] font-semibold tracking-[-0.01em] text-ink">{title}</p>
        <span className="hidden shrink-0 font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink/35 sm:block">
          {kicker}
        </span>
      </div>

      <div className="flex items-center gap-1">
        {isMobile && <span aria-hidden className="mr-1 h-1 w-8 rounded-full bg-ink/15" />}
        {onMinimize && !isMobile && (
          <button
            type="button"
            onClick={onMinimize}
            aria-label={`Minimize ${title} to dock`}
            onPointerDown={(event) => event.stopPropagation()}
            className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-[9px] text-ink/60 transition-colors hover:bg-ink/[0.07] hover:text-ink"
          >
            <Minus size={15} strokeWidth={1.9} />
          </button>
        )}
        {!isMobile && (
          <button
            type="button"
            onClick={toggleMaximize}
            aria-label={snapState ? "Restore window size" : "Maximize window"}
            onPointerDown={(event) => event.stopPropagation()}
            className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-[9px] text-ink/60 transition-colors hover:bg-ink/[0.07] hover:text-ink"
          >
            {snapState ? <Copy size={12} strokeWidth={1.9} /> : <Square size={13} strokeWidth={1.9} />}
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${title}`}
          onPointerDown={(event) => event.stopPropagation()}
          className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-[9px] text-ink/60 transition-colors hover:bg-ink/[0.07] hover:text-ink"
        >
          <X size={15} strokeWidth={1.9} />
        </button>
      </div>
    </div>
  );

  /* Mobile keeps the existing full-screen sheet behaviour. */
  if (isMobile) {
    return (
      <motion.div
        ref={rootRef as never}
        onKeyDown={trapTab}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-window
        drag="y"
        dragListener={false}
        dragControls={controls}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.45 }}
        dragMomentum={false}
        onDragEnd={(_: never, info: PanInfo) => {
          if (info.offset.y > 110 || info.velocity.y > 550) onClose();
        }}
        initial={{ y: reduced ? 0 : "100%", opacity: reduced ? 0 : 1 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: reduced ? 0 : "100%", opacity: reduced ? 0 : 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 36 }}
        style={{ zIndex }}
        aria-hidden={minimized}
        inert={minimized ? true : undefined}
        className={`fixed inset-0 flex flex-col bg-paper text-ink ${minimized ? "hidden" : ""}`}
      >
        {header}
        <div className="min-h-0 flex-1">{children}</div>
      </motion.div>
    );
  }

  const morph = Boolean(origin) && !reduced && !snapState;
  const originX = origin ? origin.x - (geometry.x + geometry.width / 2) : 0;
  const originY = origin ? origin.y - (geometry.y + geometry.height / 2) : 0;

  return (
    <>
      <SnapPreview zone={snapPreview} />
      <motion.section
        ref={rootRef as never}
        onKeyDown={trapTab}
        onPointerDown={onFocus}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-window
        drag
        dragListener={false}
        dragControls={controls}
        dragMomentum={false}
        dragElastic={0}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        initial={
          morph
            ? { opacity: 0, scale: 0.05, translateX: originX, translateY: originY }
            : { opacity: 0, scale: reduced ? 1 : 0.92, translateY: reduced ? 0 : 22 }
        }
        animate={{
          opacity: 1,
          scale: 1,
          translateX: 0,
          translateY: 0,
          left: geometry.x,
          top: geometry.y,
          width: geometry.width,
          height: geometry.height,
        }}
        exit={
          morph
            ? { opacity: 0, scale: 0.06, translateX: originX, translateY: originY }
            : { opacity: 0, scale: reduced ? 1 : 0.95, translateY: reduced ? 0 : 14 }
        }
        transition={
          interacting
            ? { duration: 0 }
            : { type: "spring", stiffness: 320, damping: 32 }
        }
        style={{ position: "fixed", zIndex, x: dragX, y: dragY }}
        aria-hidden={minimized}
        inert={minimized ? true : undefined}
        className={`shadow-window pointer-events-auto flex flex-col overflow-hidden rounded-[18px] bg-paper text-ink ring-1 ring-black/10 ${minimized ? "hidden" : ""}`}
      >
        {header}
        <div className="min-h-0 flex-1">{children}</div>

        {/* Invisible resize affordances with correct native cursors. */}
        {EDGES.map(({ edge, className }) => (
          <div
            key={edge}
            role="presentation"
            data-native-cursor
            onPointerDown={startResize(edge)}
            style={{
              cursor: RESIZE_CURSORS[edge],
              ["--native-cursor" as string]: RESIZE_CURSORS[edge],
            }}
            className={`absolute z-10 ${className}`}
          />
        ))}
      </motion.section>
    </>
  );
}
