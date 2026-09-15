import { useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion, useSpring, useTransform, type MotionValue } from "framer-motion";
import type { Wallpaper } from "@/data/media";
import { hasBooted } from "./BootIntro";

interface Props {
  wallpaper: Wallpaper;
  mouseX: MotionValue<number>; // -0.5 … 0.5
  mouseY: MotionValue<number>;
  parallax: boolean;
}

/** the desktop quietly matches the visitor's local time of day */
function useDayTint(): string {
  return useMemo(() => {
    const h = new Date().getHours();
    if (h >= 5 && h < 11) return "rgba(213, 226, 255, 0.06)"; // morning — cool lift
    if (h >= 11 && h < 17) return "rgba(0, 0, 0, 0)"; // day — untouched
    if (h >= 17 && h < 20) return "rgba(255, 144, 64, 0.08)"; // evening — warm cast
    return "rgba(5, 9, 22, 0.30)"; // night — deep submersion
  }, []);
}

/**
 * Layer 1 — cinematic photograph + atmosphere.
 * Barely-noticeable drift (max ~13px), slow breathing scale, crossfade
 * between wallpapers, time-of-day tint.
 */
export function BackgroundScene({ wallpaper, mouseX, mouseY, parallax }: Props) {
  const reduced = useReducedMotion();
  const drift = parallax && !reduced;
  const tint = useDayTint();

  const x = useSpring(useTransform(mouseX, (v) => v * (drift ? 26 : 0)), {
    stiffness: 48,
    damping: 20,
    mass: 0.9,
  });
  const y = useSpring(useTransform(mouseY, (v) => v * (drift ? 18 : 0)), {
    stiffness: 48,
    damping: 20,
    mass: 0.9,
  });

  return (
    <motion.div
      className="fixed inset-0 z-0 overflow-hidden bg-os"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduced ? 0.01 : 1.1, delay: reduced || hasBooted() ? 0 : 0.4, ease: "easeOut" }}
      aria-hidden
    >
      <motion.div style={{ x, y }} className="absolute -inset-[2.5%]">
        {/* perpetual breathing — independent of wallpaper swaps */}
        <motion.div
          className="absolute inset-0"
          animate={reduced ? undefined : { scale: [1, 1.015, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        >
          <AnimatePresence initial={false}>
            <motion.picture
              key={wallpaper.id}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, zIndex: 1 }}
              exit={{ opacity: 0, zIndex: 0 }}
              transition={{ duration: reduced ? 0.01 : 0.9, ease: "easeInOut" }}
            >
              <source media="(max-width: 767px)" srcSet={wallpaper.mobile} />
              <img
                src={wallpaper.desktop}
                alt={wallpaper.alt}
                fetchPriority="high"
                className="h-full w-full scale-[1.04] object-cover"
                draggable={false}
              />
            </motion.picture>
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* atmospheric treatment — keeps the image dominant, adds readability */}
      <div className="absolute inset-0 bg-black/[0.08]" />
      <div className="absolute inset-0 transition-colors duration-1000" style={{ background: tint }} />
      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/35 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/45 to-transparent" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(125% 95% at 50% 42%, transparent 52%, rgba(0,0,0,0.30) 100%)",
        }}
      />
    </motion.div>
  );
}

/** Layer — 3% film grain, kills the overly-clean digital feel */
export function FilmGrain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30 opacity-[0.05] mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "160px 160px",
      }}
    />
  );
}
