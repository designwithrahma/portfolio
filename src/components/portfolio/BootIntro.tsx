import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { IDENTITY } from "@/data/socials";
import { hasReturningVisitor } from "@/utils/storage";

/* ── boot-once flag (per tab session) ──────────────────────── */
let cached: boolean | null = null;

/** true after the visitor has already seen this tab's boot dissolve */
export const hasBooted = (): boolean => {
  if (cached !== null) return cached;
  try {
    cached = sessionStorage.getItem("rahma-booted") === "1";
  } catch {
    cached = false;
  }
  return cached;
};

/**
 * ≤ 800ms boot: black screen, quiet monogram, dissolves into the desktop.
 * Shown once per tab session — repeat entries land on the desktop instantly.
 */
export function BootIntro() {
  const reduced = useReducedMotion();
  const [done, setDone] = useState(() => !!reduced || hasBooted());

  useEffect(() => {
    if (reduced || done) return;
    try {
      sessionStorage.setItem("rahma-booted", "1");
    } catch {
      /* private mode */
    }
    /* Same visuals; a returning visitor simply resumes faster. */
    const t = setTimeout(() => setDone(true), hasReturningVisitor() ? 420 : 720);
    return () => clearTimeout(t);
  }, [reduced, done]);

  /* impatient visitors deserve mercy — click or any key skips the boot */
  useEffect(() => {
    if (done) return;
    const skip = () => setDone(true);
    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);
    return () => {
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
    };
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="boot"
          className="fixed inset-0 z-[90] flex flex-col items-center justify-center gap-3 bg-os"
          exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeOut" } }}
          aria-hidden
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-[13px] font-semibold tracking-[0.35em] text-white/90"
          >
            {IDENTITY.mark}
          </motion.span>
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.55, ease: [0.65, 0, 0.35, 1], delay: 0.1 }}
            className="h-px w-14 origin-left bg-white/35"
          />
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.18 }}
            className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/40"
          >
            {hasReturningVisitor() ? "Welcome back" : "Desktop · Vol. 2026"}
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="absolute bottom-8 font-mono text-[9px] uppercase tracking-[0.28em] text-white/25"
          >
            click or any key to skip
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
