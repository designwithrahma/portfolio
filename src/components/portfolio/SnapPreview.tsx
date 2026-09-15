import { AnimatePresence, motion } from "framer-motion";
import { snapGeometry } from "@/hooks/useWindowGeometry";
import type { SnapZone } from "@/utils/storage";

interface SnapPreviewProps {
  zone: SnapZone;
}

/**
 * Subtle neutral snap hint. Deliberately monochrome so it matches the
 * cinematic desktop instead of an OS-blue system overlay.
 */
export function SnapPreview({ zone }: SnapPreviewProps) {
  const geometry = zone ? snapGeometry(zone) : null;

  return (
    <AnimatePresence>
      {zone && geometry && (
        <motion.div
          key={zone}
          aria-hidden
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.995 }}
          transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed z-[58] rounded-[16px] border border-white/25 bg-white/[0.07] backdrop-blur-[2px]"
          style={{
            left: geometry.x,
            top: geometry.y,
            width: geometry.width,
            height: geometry.height,
            position: "fixed",
          }}
        />
      )}
    </AnimatePresence>
  );
}
