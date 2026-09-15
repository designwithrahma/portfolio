import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Compass, LayoutGrid, LayoutList, X } from "lucide-react";
import { hasBooted } from "./BootIntro";

interface WelcomePanelProps {
  isMobile: boolean;
  onOpenWindow: (type: "work" | "services") => void;
  onOpenApps: () => void;
}

export function WelcomePanel({ isMobile, onOpenWindow, onOpenApps }: WelcomePanelProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show if boot is complete and we haven't seen it before
    const checkVisibility = () => {
      try {
        const hasSeen = localStorage.getItem("rahma-welcome-seen") === "1";
        if (!hasSeen && hasBooted()) {
          setIsVisible(true);
        }
      } catch {
        // Fallback for private mode
      }
    };

    // Delay slightly so it doesn't appear instantly as boot finishes
    const timer = setTimeout(checkVisibility, 2000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem("rahma-welcome-seen", "1");
    } catch {
      // Fallback
    }
  };

  const handleAction = (action: () => void) => {
    action();
    dismiss();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={`fixed z-[80] flex flex-col overflow-hidden rounded-[16px] border border-white/15 bg-[#101013]/95 shadow-2xl backdrop-blur-2xl ${
            isMobile
              ? "bottom-[110px] left-4 right-4"
              : "bottom-[90px] right-6 w-[320px]"
          }`}
        >
          <div className="relative p-4 pb-3">
            <button
              type="button"
              onClick={dismiss}
              className="absolute right-3 top-3 rounded-full p-1 text-white/40 hover:bg-white/10 hover:text-white"
              aria-label="Dismiss welcome panel"
            >
              <X size={14} />
            </button>
            <h2 className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              Welcome to my workspace
            </h2>
            <p className="text-[13px] leading-relaxed text-white/80">
              Explore selected projects, creative services and experiments.
            </p>
          </div>

          <div className="flex flex-col gap-1.5 px-3 pb-3">
            <button
              onClick={() => handleAction(() => onOpenWindow("work"))}
              className="flex items-center gap-3 rounded-[10px] bg-white/5 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              <LayoutGrid size={16} className="text-white/60" />
              View Work
            </button>
            <button
              onClick={() => handleAction(() => onOpenWindow("services"))}
              className="flex items-center gap-3 rounded-[10px] bg-white/5 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              <LayoutList size={16} className="text-white/60" />
              Services
            </button>
            <button
              onClick={() => handleAction(onOpenApps)}
              className="flex items-center gap-3 rounded-[10px] bg-emerald-500/20 px-3 py-2.5 text-sm font-medium text-emerald-100 transition-colors hover:bg-emerald-500/30"
            >
              <Compass size={16} className="text-emerald-400" />
              Explore Apps
            </button>
          </div>

          <div className="border-t border-white/10 bg-white/[0.02] px-4 py-2.5">
            <p className="font-mono text-[9px] uppercase tracking-wider text-white/40">
              Tip: {isMobile ? "Long-press an item for more actions." : "Right-click the desktop for more controls."}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
