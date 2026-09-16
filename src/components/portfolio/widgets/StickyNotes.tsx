import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useDragControls, useMotionValue, useReducedMotion, type PanInfo } from "framer-motion";
import { AlignRight, Pin, Plus, Trash2, X } from "lucide-react";

export interface StickyNote {
  id: string;
  text: string;
  color: "yellow" | "mint" | "pink" | "blue";
  x: number;
  y: number;
}

interface Props {
  /** Existing desktop notification channel from DesktopShell. */
  notify: (message: string, detail?: string, tone?: "info" | "success") => void;
}

const STORAGE_KEY = "rahma-sticky-notes-right-v2";
export const MAX_NOTES = 5;

const NOTE_WIDTH = 210;
const NOTE_HEIGHT = 164;
const NOTE_GAP = 14;
const TOP_OFFSET = 118;
const ALLOWED_COLORS: StickyNote["color"][] = ["yellow", "mint", "pink", "blue"];

const rightX = () => Math.max(12, window.innerWidth - NOTE_WIDTH - 24);

const availableRows = () =>
  Math.max(
    1,
    Math.floor((window.innerHeight - TOP_OFFSET - 104) / (NOTE_HEIGHT + NOTE_GAP)),
  );

const availableColumns = () =>
  Math.max(1, Math.floor((window.innerWidth - 24) / (NOTE_WIDTH + NOTE_GAP)));

/**
 * Compact mode is required when the viewport is narrow OR when its current
 * width/height cannot physically hold every card without overlap.
 */
const shouldUseCompactLayout = (noteCount: number) =>
  window.innerWidth < 520 || noteCount > availableRows() * availableColumns();

const safeBounds = () => ({
  minX: 8,
  maxX: Math.max(8, window.innerWidth - NOTE_WIDTH - 8),
  minY: 82,
  maxY: Math.max(82, window.innerHeight - NOTE_HEIGHT - 84),
});

const clampNote = (x: number, y: number) => {
  const bounds = safeBounds();
  return {
    x: Math.round(Math.min(bounds.maxX, Math.max(bounds.minX, x))),
    y: Math.round(Math.min(bounds.maxY, Math.max(bounds.minY, y))),
  };
};

function reorder(index: number): { x: number; y: number } {
  const bounds = safeBounds();
  const rows = availableRows();
  const column = Math.floor(index / rows);
  const row = index % rows;
  return {
    x: Math.max(
      bounds.minX,
      Math.min(rightX() - column * (NOTE_WIDTH + NOTE_GAP), bounds.maxX),
    ),
    y: TOP_OFFSET + row * (NOTE_HEIGHT + NOTE_GAP),
  };
}

/** Deterministic ids; no dependency, no Date.now collisions on rapid adds. */
const newNoteId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? `note-${crypto.randomUUID()}`
    : `note-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeNote = (value: unknown): StickyNote | null => {
  if (!value || typeof value !== "object") return null;
  const entry = value as Record<string, unknown>;
  if (
    typeof entry.id !== "string" ||
    typeof entry.text !== "string" ||
    !ALLOWED_COLORS.includes(entry.color as StickyNote["color"]) ||
    !Number.isFinite(entry.x) ||
    !Number.isFinite(entry.y)
  ) {
    return null;
  }
  return {
    id: entry.id,
    text: entry.text,
    color: entry.color as StickyNote["color"],
    /* Do not clamp during parsing. Compact startup uses document-flow cards,
       and clamping here used to overwrite every saved desktop position. */
    x: Number(entry.x),
    y: Number(entry.y),
  };
};

const getDefaultNotes = (): StickyNote[] => [
  {
    id: "note-default-tabula",
    text: "Currently building: Tabula\nA local-first infinite whiteboard for visual thinking.",
    color: "yellow",
    ...reorder(0),
  },
  {
    id: "note-default-droproom",
    text: "Latest release: DropRoom\nTemporary peer-to-peer file sharing with WebRTC.",
    color: "mint",
    ...reorder(1),
  },
  {
    id: "note-default-services",
    text: "Available for Projects\nGraphic Design · Web Development · UI/UX · B-Roll Editing",
    color: "pink",
    ...reorder(2),
  },
  {
    id: "note-default-explore",
    text: "Explore my work\nDouble-click project icons to open full case studies.",
    color: "blue",
    ...reorder(3),
  },
];

/**
 * Storage semantics:
 * - missing key            → seed the two default notes
 * - parsed array (empty)   → respected as "user cleared everything"
 * - malformed content      → ignore invalid entries, never crash
 * - valid entries          → keep at most MAX_NOTES
 */
const loadNotes = (): StickyNote[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return getDefaultNotes();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    const valid = parsed
      .map(normalizeNote)
      .filter((note): note is StickyNote => {
        if (!note || seen.has(note.id)) return false;
        seen.add(note.id);
        return true;
      })
      .slice(0, MAX_NOTES);

    /* Preserve coordinates in compact mode. On a real desktop, normalize
       them into the reachable work area before the first paint. */
    return shouldUseCompactLayout(valid.length)
      ? valid
      : valid.map((note) => ({ ...note, ...clampNote(note.x, note.y) }));
  } catch {
    /* Corrupt payload: empty workspace, cards remain usable. */
    return [];
  }
};

const COLOR_MAP = {
  yellow: "bg-[#fef9c3] text-[#713f12] border-[#fde047]",
  mint: "bg-[#d1fae5] text-[#065f46] border-[#6ee7b7]",
  pink: "bg-[#fce7f3] text-[#831843] border-[#f9a8d4]",
  blue: "bg-[#e0f2fe] text-[#075985] border-[#7dd3fc]",
};

interface StickyCardProps {
  note: StickyNote;
  /** Compact layout renders in document flow inside a scrollable column. */
  compact: boolean;
  onMove: (id: string, x: number, y: number) => void;
  onTextChange: (id: string, text: string) => void;
  onColorChange: (id: string, color: StickyNote["color"]) => void;
  onDelete: (id: string) => void;
}

function StickyCard({ note, compact, onMove, onTextChange, onColorChange, onDelete }: StickyCardProps) {
  /* Compact mode keeps its own geometry; desktop drags the stored position. */
  const position = compact ? undefined : { left: note.x, top: note.y };
  const controls = useDragControls();
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const position = clampNote(note.x + info.offset.x, note.y + info.offset.y);
    dragX.set(0);
    dragY.set(0);
    onMove(note.id, position.x, position.y);
  };

  return (
    <motion.div
      data-sticky-note
      drag={!compact}
      dragListener={false}
      dragControls={controls}
      dragMomentum={false}
      dragElastic={0.04}
      onDragEnd={handleDragEnd}
      style={{ ...position, x: dragX, y: dragY }}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{ duration: 0.18 }}
      className={
        compact
          ? `relative h-[164px] w-full shrink-0 rounded-[10px] border p-3 shadow-[0_12px_32px_rgba(0,0,0,0.22)] ${COLOR_MAP[note.color]}`
          : `fixed z-20 h-[164px] w-[min(210px,calc(100vw-24px))] rounded-[10px] border p-3 shadow-[0_12px_32px_rgba(0,0,0,0.22)] ${COLOR_MAP[note.color]}`
      }
    >
      <div
        onPointerDown={(event) => {
          if (!compact) controls.start(event);
        }}
        className="mb-2 flex cursor-grab select-none items-center justify-between border-b border-black/10 pb-1.5 active:cursor-grabbing"
      >
        <div className="flex items-center gap-1.5">
          <Pin size={11} className="opacity-60" />
          <span className="font-mono text-[9px] font-bold uppercase tracking-wider opacity-60">
            Sticky note
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="mr-1 flex gap-1">
            {ALLOWED_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => onColorChange(note.id, color)}
                aria-label={`Change note color to ${color}`}
                className={`h-2.5 w-2.5 cursor-pointer rounded-full ${
                  color === "yellow"
                    ? "bg-[#eab308]"
                    : color === "mint"
                      ? "bg-[#10b981]"
                      : color === "pink"
                        ? "bg-[#ec4899]"
                        : "bg-[#0284c7]"
                } ${note.color === color ? "ring-1 ring-black" : "opacity-50"}`}
              />
            ))}
          </div>
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => onDelete(note.id)}
            aria-label="Delete note"
            className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-black/10"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      <textarea
        value={note.text}
        onChange={(event) => onTextChange(note.id, event.target.value)}
        aria-label="Sticky note content"
        className="h-[108px] w-full resize-none bg-transparent font-sans text-xs leading-relaxed outline-none"
      />
    </motion.div>
  );
}

export function StickyNotes({ notify }: Props) {
  const reduced = useReducedMotion();
  /* Read storage once so notes and initial compact mode agree on frame one. */
  const initialNotesRef = useRef<StickyNote[] | null>(null);
  if (initialNotesRef.current === null) initialNotesRef.current = loadNotes();
  const [notes, setNotes] = useState<StickyNote[]>(initialNotesRef.current);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [isCompact, setIsCompact] = useState(() =>
    shouldUseCompactLayout(initialNotesRef.current?.length ?? 0),
  );
  const toolbarRef = useRef<HTMLDivElement>(null);

  /*
    Narrow screens switch to a scrollable column. Only desktop widths clamp and
    persist coordinates, so a compact session never overwrites the user's
    saved desktop arrangement.
  */
  useEffect(() => {
    const onResize = () => {
      const nextCompact = shouldUseCompactLayout(notes.length);
      setIsCompact(nextCompact);
      if (!nextCompact) {
        setNotes((current) =>
          current.map((note) => ({ ...note, ...clampNote(note.x, note.y) })),
        );
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [notes.length]);

  /* Adding/removing notes can change whether the current viewport has enough
     physical card slots, even when no resize event occurs. */
  useEffect(() => {
    setIsCompact(shouldUseCompactLayout(notes.length));
  }, [notes.length]);

  /* Persist immediately after every intentional state change. */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {
      /* Private mode: notes remain in-memory for this session. */
    }
  }, [notes]);

  /* Outside interaction and Escape dismiss the confirmation sheet. */
  useEffect(() => {
    if (!confirmingClear) return;
    const onPointer = (event: PointerEvent) => {
      if (!toolbarRef.current?.contains(event.target as Node)) setConfirmingClear(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      /*
        Capture phase plus stopImmediatePropagation so this Escape closes only
        the confirmation. stopPropagation would leave the window manager's
        bubble-phase listener running and close the app window underneath too.
      */
      event.stopImmediatePropagation();
      setConfirmingClear(false);
    };
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [confirmingClear]);

  const atLimit = notes.length >= MAX_NOTES;

  const addNote = () => {
    if (atLimit) {
      notify(`Maximum ${MAX_NOTES} sticky notes allowed.`);
      return;
    }
    setNotes((current) => {
      if (current.length >= MAX_NOTES) return current;
      return [
        ...current,
        {
          id: newNoteId(),
          text: "New note...",
          color: "yellow",
          ...nextPosition(current.length),
        },
      ];
    });
  };

  const nextPosition = (index: number) => reorder(index);

  const arrangeRight = () => {
    setNotes((current) => current.map((note, index) => ({ ...note, ...reorder(index) })));
  };

  const confirmClearAll = () => {
    const clearedCount = notes.length;
    setConfirmingClear(false);
    setNotes([]);
    /* Keep side effects out of React state updaters (StrictMode may replay
       them, which previously produced duplicate clear notifications). */
    if (clearedCount > 0) notify("All sticky notes cleared.", undefined, "success");
  };

  const lastPositionNote = useMemo(
    () => notes[notes.length - 1] ?? null,
    [notes],
  );

  const cardList = notes.map((note) => (
    <StickyCard
      key={note.id}
      note={note}
      compact={isCompact}
      onMove={(id, x, y) =>
        setNotes((current) => current.map((item) => (item.id === id ? { ...item, x, y } : item)))
      }
      onTextChange={(id, text) =>
        setNotes((current) => current.map((item) => (item.id === id ? { ...item, text } : item)))
      }
      onColorChange={(id, color) =>
        setNotes((current) => current.map((item) => (item.id === id ? { ...item, color } : item)))
      }
      onDelete={(id) => setNotes((current) => current.filter((item) => item.id !== id))}
    />
  ));

  return (
    <>
      {isCompact ? (
        /*
          Compact layout: a scrollable column instead of clamped absolute
          coordinates. Clamping five desktop positions into a narrow viewport
          stacked them on top of each other, and dragging is disabled here, so
          without this the buried notes became unreachable.
        */
        <div className="os-scroll fixed right-3 top-[84px] bottom-[152px] z-20 flex w-[min(210px,calc(100vw-24px))] flex-col gap-3 overflow-y-auto pb-1 pr-0.5">
          <AnimatePresence>{cardList}</AnimatePresence>
        </div>
      ) : (
        <AnimatePresence>{cardList}</AnimatePresence>
      )}

      {/* Toolbar + confirmation stays near the note rail, not the dock. */}
      <div
        ref={toolbarRef}
        className={`fixed right-5 z-30 flex flex-col items-end gap-2 ${
          isCompact ? "bottom-[148px]" : "bottom-[92px]"
        }`}
      >
        <AnimatePresence>
          {confirmingClear && (
            <motion.div
              role="dialog"
              aria-label="Clear all sticky notes"
              initial={{ opacity: 0, y: reduced ? 0 : 6, scale: reduced ? 1 : 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: reduced ? 0 : 4, scale: reduced ? 1 : 0.98 }}
              transition={{ duration: reduced ? 0.01 : 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="w-[224px] rounded-[12px] border border-white/12 bg-[#101013]/95 p-3 text-white shadow-window backdrop-blur-xl"
            >
              <p className="text-[12px] font-semibold">Clear all sticky notes?</p>
              <p className="mt-1 text-[11px] leading-snug text-white/55">
                This will remove {notes.length} {notes.length === 1 ? "note" : "notes"} from this desktop.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmingClear(false)}
                  className="min-h-9 flex-1 cursor-pointer rounded-[8px] border border-white/15 text-[11px] font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmClearAll}
                  className="min-h-9 flex-1 cursor-pointer rounded-[8px] bg-white text-[11px] font-semibold text-black transition-colors hover:bg-white/90"
                >
                  Clear all
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-1.5">
          {notes.length > 0 && (
            <>
              <button
                type="button"
                onClick={arrangeRight}
                aria-label="Arrange sticky notes on the right"
                className="grid h-8 w-8 cursor-pointer place-items-center rounded-[9px] border border-white/10 bg-[#121216]/80 text-white/60 shadow-lg backdrop-blur transition-colors hover:border-white/25 hover:text-white"
              >
                <AlignRight size={13} />
              </button>
              <button
                type="button"
                onClick={() => setConfirmingClear(true)}
                aria-label={`Clear all ${notes.length} sticky notes`}
                className="grid h-8 w-8 cursor-pointer place-items-center rounded-[9px] border border-white/10 bg-[#121216]/80 text-white/60 shadow-lg backdrop-blur transition-colors hover:border-white/25 hover:text-white"
              >
                <Trash2 size={13} />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={addNote}
            aria-label={atLimit ? "Maximum sticky notes reached" : "Add sticky note"}
            aria-disabled={atLimit}
            className={`flex h-8 items-center gap-1.5 rounded-[9px] border px-2.5 font-mono text-[9px] uppercase tracking-widest shadow-lg backdrop-blur transition-colors ${
              atLimit
                ? "cursor-default border-white/10 bg-[#121216]/60 text-white/35"
                : "cursor-pointer border-white/10 bg-[#121216]/80 text-white/70 hover:border-white/25 hover:text-white"
            }`}
          >
            <Plus size={11} />
            <span>
              Add note <span className="text-white/45">{notes.length}/{MAX_NOTES}</span>
            </span>
          </button>
        </div>
      </div>

      {/* Quiet screen-reader status without visual noise. */}
      <span aria-live="polite" className="sr-only">
        {notes.length} of {MAX_NOTES} sticky notes used.
        {lastPositionNote ? ` Latest note: ${lastPositionNote.text.slice(0, 40)}` : ""}
      </span>
    </>
  );
}
