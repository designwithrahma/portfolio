import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { IDENTITY } from "@/data/socials";

function BigClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const time = now.toLocaleTimeString("en-GB", { hour12: false, hour: "2-digit", minute: "2-digit" });
  const date = now
    .toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })
    .toUpperCase();
  return (
    <>
      <p className="tabular text-[clamp(56px,13vw,132px)] font-extralight leading-none tracking-[-0.03em] text-white/90 [text-shadow:0_2px_30px_rgba(0,0,0,0.4)]">
        {time}
      </p>
      <motion.p
        animate={{ opacity: [0.45, 0.85, 0.45] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="mt-4 font-mono text-[10px] uppercase tracking-[0.4em] text-white/60"
      >
        {date}
      </motion.p>
    </>
  );
}

/**
 * Ambient idle state: after 60s of stillness (no window open), the
 * desktop sinks into a cinematic clock. Any activity wakes it.
 */
export function Screensaver({ active, trackTitle }: { active: boolean; trackTitle?: string | null }) {
  const reduced = useReducedMotion();

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="screensaver"
          role="status"
          aria-label="Screensaver — interact anywhere to wake"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.01 : 1.2, ease: "easeOut" }}
          className="fixed inset-0 z-[85] flex flex-col items-center justify-center bg-black/50 backdrop-blur-[3px]"
        >
          <BigClock />

          <p className="mt-10 text-[11px] font-semibold tracking-[0.35em] text-white/45">
            {IDENTITY.mark}
          </p>

          {/* Only shown when the tape deck is actually playing. */}
          {trackTitle && (
            <p className="mt-3 flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.22em] text-white/40">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/70" />
              {trackTitle}
            </p>
          )}

          <p className="absolute bottom-8 font-mono text-[9px] uppercase tracking-[0.28em] text-white/30">
            Move · click · any key to wake
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
