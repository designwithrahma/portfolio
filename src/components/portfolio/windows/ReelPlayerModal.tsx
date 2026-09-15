import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { PLATFORM_LABEL, type ReelItem } from "@/config/reels";

interface Props {
  reel: ReelItem | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

/** Blocks malformed and non-HTTPS embed URLs from reaching an iframe. */
const isValidEmbedUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
};

/**
 * Embedded video player. Vertical reels keep their 9:16 frame; landscape
 * edits use 16:9. Arrow keys move through the current gallery selection.
 */
export function ReelPlayerModal({ reel, onClose, onPrev, onNext }: Props) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!reel) return;
    const onKey = (event: KeyboardEvent) => {
      /* Never hijack typing in a field behind the player. */
      const target = event.target as HTMLElement | null;
      const editing =
        !!target && (target.matches("input, textarea, select") || target.isContentEditable);
      if (editing) return;

      if (event.key === "Escape") {
        /*
          This listener runs in the capture phase on window, so it fires before
          WindowManager's bubble-phase Escape handler. stopImmediatePropagation
          is required — stopPropagation alone leaves same-element listeners
          running, which would close the underlying Services window too.
        */
        event.stopImmediatePropagation();
        event.preventDefault();
        onClose();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        onNext?.();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        onPrev?.();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [reel, onClose, onNext, onPrev]);

  const isVertical = reel?.aspect === "9:16";
  const validEmbed = reel ? isValidEmbedUrl(reel.embedUrl) : false;

  return (
    <AnimatePresence>
      {reel && (
        <div className="fixed inset-0 z-[97] flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="Close video"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.01 : 0.18 }}
            className="absolute inset-0 cursor-default bg-black/80 backdrop-blur-[5px]"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${reel.title} player`}
            initial={{ opacity: 0, scale: reduced ? 1 : 0.97, y: reduced ? 0 : 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: reduced ? 1 : 0.98, y: reduced ? 0 : 6 }}
            transition={{ duration: reduced ? 0.01 : 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={`relative z-10 w-full overflow-hidden rounded-[16px] border border-white/12 bg-[#101013]/96 text-white shadow-window backdrop-blur-2xl ${
              isVertical ? "max-w-[420px]" : "max-w-[900px]"
            }`}
          >
            <div className="flex h-11 items-center justify-between border-b border-white/10 px-3.5">
              <span className="flex min-w-0 items-center gap-2">
                <span className="truncate text-[12.5px] font-semibold">{reel.title}</span>
                <span className="shrink-0 rounded-[5px] border border-white/15 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-white/55">
                  {PLATFORM_LABEL[reel.platform]}
                </span>
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close video"
                className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-[7px] text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X size={15} />
              </button>
            </div>

            {/*
              Sizing from the viewport height keeps the true aspect ratio.
              `aspect-*` plus a max-height distorts the iframe because the width
              stays full, so the width is derived from the available height:
                vertical   → width ≤ 72dvh × 9 / 16
                landscape  → width ≤ 62dvh × 16 / 9
              Both remain clamped by the modal's own max width.
            */}
            <div
              className={`mx-auto bg-black ${isVertical ? "aspect-[9/16]" : "aspect-video"}`}
              style={{
                width: isVertical
                  ? "min(100%, calc(72dvh * 9 / 16))"
                  : "min(100%, calc(62dvh * 16 / 9))",
              }}
            >
              {validEmbed ? (
                <iframe
                  key={reel.id}
                  src={reel.embedUrl}
                  title={reel.title}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="h-full w-full border-0"
                />
              ) : (
                <div className="grid h-full place-items-center px-6 text-center">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
                    No embed URL set for this item yet.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-white/10 px-3.5 py-2.5">
              <p className="min-w-0 flex-1 truncate text-[11.5px] text-white/55">{reel.description}</p>
              {(onPrev || onNext) && (
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={onPrev}
                    aria-label="Previous video"
                    className="grid h-8 w-8 cursor-pointer place-items-center rounded-[7px] border border-white/10 text-white/65 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <ArrowLeft size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={onNext}
                    aria-label="Next video"
                    className="grid h-8 w-8 cursor-pointer place-items-center rounded-[7px] border border-white/10 text-white/65 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <ArrowRight size={13} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
