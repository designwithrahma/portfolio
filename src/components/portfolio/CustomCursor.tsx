import { useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

/** classic macOS arrow, drawn lean */
const ARROW_PATH = "M4.5 2.5 L19 11.6 L13.1 12.4 L16.6 19.6 L13.1 20.8 L9.6 13.9 L4.5 17.5 Z";

/**
 * macOS system cursor — native pointer is hidden, a crisp arrow tracks
 * 1:1 with zero lag, compresses on press. The OPEN/action pill trails
 * softly at the arrow's side over [data-cursor] targets.
 * Fine pointers only; reduced-motion keeps the stock cursor.
 */
export function CustomCursor() {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [pressed, setPressed] = useState(false);
  const [nativeCursor, setNativeCursor] = useState(false);

  /* arrow: raw motion values = 1:1 tracking, no spring lag */
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  /* pill: soft trail */
  const px = useSpring(x, { stiffness: 480, damping: 40, mass: 0.55 });
  const py = useSpring(y, { stiffness: 480, damping: 40, mass: 0.55 });

  useEffect(() => {
    if (reduced || !window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    document.body.classList.add("rahma-cursor");

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const onOver = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t || typeof t.closest !== "function") return;
      setNativeCursor(
        Boolean(t.closest("[data-native-cursor], input, textarea, select, [contenteditable]")),
      );
      const tagged = t.closest<HTMLElement>("[data-cursor]");
      setLabel(tagged ? tagged.dataset.cursor || "OPEN" : null);
    };
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onLeave = () => {
      x.set(-200);
      y.set(-200);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      document.body.classList.remove("rahma-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced, x, y]);

  if (!enabled) return null;

  return (
    <>
      {/* native cursor retired while the OS arrow is on duty */}
      <style>{`
        .rahma-cursor, .rahma-cursor * { cursor: none !important; }
        .rahma-cursor [data-native-cursor] { cursor: var(--native-cursor) !important; }
        .rahma-cursor input, .rahma-cursor textarea, .rahma-cursor [contenteditable] { cursor: text !important; }
        .rahma-cursor select { cursor: default !important; }
      `}</style>

      {/* trailing action pill — sits at the arrow's own corner */}
      <motion.div
        style={{ x: px, y: py, opacity: nativeCursor ? 0 : 1 }}
        className="pointer-events-none fixed left-0 top-0 z-[100] mix-blend-difference"
        aria-hidden
      >
        <motion.div
          animate={{ scale: label ? 1 : 0.4, opacity: label ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 26 }}
          className="grid h-[46px] w-[46px] translate-x-[16px] translate-y-[14px] place-items-center rounded-full bg-white"
        >
          <span className="font-mono text-[8.5px] font-medium uppercase tracking-[0.26em] text-black">
            {label ?? ""}
          </span>
        </motion.div>
      </motion.div>

      {/* the arrow itself */}
      <motion.div
        style={{ x, y, opacity: nativeCursor ? 0 : 1 }}
        className="pointer-events-none fixed left-0 top-0 z-[101]"
        aria-hidden
      >
        <motion.svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          style={{ x: -4.5, y: -2.5 }}
          animate={{ scale: pressed ? 0.86 : 1 }}
          transition={{ type: "spring", stiffness: 640, damping: 28 }}
          className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]"
        >
          <path d={ARROW_PATH} fill="#101013" stroke="#ffffff" strokeWidth={1.4} strokeLinejoin="round" />
        </motion.svg>
      </motion.div>
    </>
  );
}
