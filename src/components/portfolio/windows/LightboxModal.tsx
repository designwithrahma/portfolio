import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, ArrowRight } from "lucide-react";

interface GalleryImage {
  src: string;
  caption?: string;
}

interface Props {
  images: GalleryImage[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onIndexChange: (idx: number) => void;
}

export function LightboxModal({ images, initialIndex, isOpen, onClose, onIndexChange }: Props) {
  const current = images[initialIndex];

  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopImmediatePropagation();
        onClose();
      } else if (e.key === "ArrowRight") {
        onIndexChange((initialIndex + 1) % images.length);
      } else if (e.key === "ArrowLeft") {
        onIndexChange((initialIndex - 1 + images.length) % images.length);
      }
    };

    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [isOpen, initialIndex, images.length, onClose, onIndexChange]);

  if (!isOpen || !current) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[98] flex items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
          aria-hidden
        />

        <div className="relative z-10 max-w-5xl w-full flex flex-col items-center">
          {/* Top Bar */}
          <div className="w-full flex items-center justify-between text-white/80 mb-3 px-2">
            <span className="font-mono text-xs text-white/50">
              Figure {initialIndex + 1} of {images.length} {current.caption ? `— ${current.caption}` : ""}
            </span>
            <button
              onClick={onClose}
              aria-label="Close Lightbox"
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Main Image */}
          <div className="relative w-full max-h-[75vh] flex items-center justify-center rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black">
            <img
              key={current.src}
              src={current.src}
              alt={current.caption || "Gallery Preview"}
              className="max-h-[75vh] w-auto max-w-full object-contain select-none"
            />

            {/* Prev / Next navigation overlays */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => onIndexChange((initialIndex - 1 + images.length) % images.length)}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white/80 hover:bg-black/90 hover:text-white transition-all cursor-pointer"
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  onClick={() => onIndexChange((initialIndex + 1) % images.length)}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white/80 hover:bg-black/90 hover:text-white transition-all cursor-pointer"
                >
                  <ArrowRight size={18} />
                </button>
              </>
            )}
          </div>

          {/* Hint */}
          <p className="mt-3 font-mono text-[10px] text-white/40 uppercase tracking-widest">
            Use ← → arrows to cycle · Esc to dismiss
          </p>
        </div>
      </div>
    </AnimatePresence>
  );
}
