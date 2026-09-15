import { motion, AnimatePresence } from "framer-motion";
import { Keyboard, X, Sparkles } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUT_GROUPS = [
  {
    category: "Desktop & Navigation",
    items: [
      { key: "1 – 6", desc: "Launch Project Case Study 01 to 06 directly" },
      { key: "Space", desc: "Open instant Quick Look project preview" },
      { key: "← / →", desc: "Navigate previous / next project in Quick Look" },
      { key: "Enter", desc: "Open full project case study from Quick Look / Selection" },
      { key: "Esc", desc: "Close active window, Quick Look, or modals" },
    ],
  },
  {
    category: "System Apps & Windows",
    items: [
      { key: "⌘K / /", desc: "Open universal Command Search Palette" },
      { key: "A", desc: "Open Profile / About window" },
      { key: "W", desc: "Open Work explorer / Project Index" },
      { key: "C", desc: "Open Contact & Hire portal" },
      { key: "?", desc: "Open this Keyboard Cheat Sheet" },
    ],
  },
  {
    category: "Easter Eggs & Pro Tips",
    items: [
      { key: "Type 'mono'", desc: "Switch entire desktop into brutalist optical art mode" },
      { key: "Type 'reset'", desc: "Restore standard color palette and wallpaper" },
      { key: "Drag icons", desc: "Magnetic physics repel nearby desktop items automatically" },
    ],
  },
];

export function ShortcutsModal({ isOpen, onClose }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[96] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-[4px]"
            aria-hidden
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard Shortcuts"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 450, damping: 32 }}
            className="relative z-10 w-full max-w-[560px] overflow-hidden rounded-[18px] border border-white/15 bg-[#121215]/95 text-white shadow-window backdrop-blur-2xl"
          >
            <div className="flex h-12 items-center justify-between border-b border-white/10 px-5">
              <div className="flex items-center gap-2">
                <Keyboard size={15} className="text-emerald-400" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">
                  Keyboard Hotkeys &amp; Gestures
                </span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close shortcuts modal"
                className="grid h-7 w-7 place-items-center rounded-[6px] text-white/60 hover:bg-white/10 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto os-scroll">
              {SHORTCUT_GROUPS.map((group) => (
                <div key={group.category} className="space-y-2.5">
                  <h3 className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 font-semibold">
                    {group.category}
                  </h3>
                  <div className="space-y-1.5">
                    {group.items.map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/5 text-xs"
                      >
                        <span className="text-white/75">{item.desc}</span>
                        <kbd className="px-2 py-0.5 rounded-[5px] bg-white/10 border border-white/15 font-mono text-[10px] text-white font-semibold">
                          {item.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 bg-black/40 px-5 py-3 flex items-center justify-between text-[10px] font-mono text-white/40">
              <span className="flex items-center gap-1.5">
                <Sparkles size={11} className="text-emerald-400" /> RAHMA® OS Keyboard Engine
              </span>
              <span>Press Esc or ? to dismiss</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
