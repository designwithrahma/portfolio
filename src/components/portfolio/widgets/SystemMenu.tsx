import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, Clock, ExternalLink, LayoutGrid, Lock, Moon, Power, RotateCcw, Settings, Sparkles, Terminal, Trash2 } from "lucide-react";
import { PORTFOLIO_CONFIG } from "@/config/portfolio";
import type { RecentItem } from "@/utils/storage";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenWindow: (type: "diagnostics" | "settings" | "work" | "terminal" | "about") => void;
  onSleep: () => void;
  onLock: () => void;
  onRestart: () => void;
  onShutDown: () => void;
  recentItems?: RecentItem[];
  onOpenRecent?: (item: RecentItem) => void;
  onClearRecent?: () => void;
}

export function SystemMenu({
  isOpen,
  onClose,
  onOpenWindow,
  onSleep,
  onLock,
  onRestart,
  onShutDown,
  recentItems = [],
  onOpenRecent,
  onClearRecent,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onPointer = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('[aria-expanded="true"]')) return;
      if (!ref.current?.contains(target)) onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  const item = "flex h-8 w-full cursor-pointer items-center gap-2.5 rounded-[7px] px-2.5 text-left text-[12px] font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white";
  const open = (type: "diagnostics" | "settings" | "work" | "terminal" | "about") => {
    onOpenWindow(type);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={ref}
          role="menu"
          initial={{ opacity: 0, scale: 0.95, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -4 }}
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
          className="fixed left-5 top-16 z-[95] w-[230px] rounded-[14px] border border-white/15 bg-[#101013]/95 p-1.5 text-white shadow-2xl backdrop-blur-2xl md:left-8"
        >
          <div className="border-b border-white/10 px-2.5 py-2">
            <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-400">{PORTFOLIO_CONFIG.identity.mark} OS</p>
            <p className="truncate text-xs font-semibold">{PORTFOLIO_CONFIG.identity.name} - 2026</p>
          </div>
          <div className="py-1">
            <button type="button" onClick={() => open("about")} className={item}><Sparkles size={14} className="text-emerald-400" />About This Workspace</button>
            <button type="button" onClick={() => open("diagnostics")} className={item}><Activity size={14} />System Diagnostics</button>
            <button type="button" onClick={() => open("settings")} className={item}><Settings size={14} />System Preferences</button>
            <button type="button" onClick={() => open("work")} className={item}><LayoutGrid size={14} />Software Index</button>
            <button type="button" onClick={() => open("terminal")} className={item}><Terminal size={14} className="text-emerald-400" />Terminal Shell</button>
          </div>

          {/* Recent — surfaces the tracking added in Part 1. */}
          {recentItems.length > 0 && onOpenRecent && (
            <>
              <div className="my-1 h-px bg-white/10" />
              <div className="flex items-center justify-between px-2.5 pb-1 pt-1">
                <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-white/35">
                  <Clock size={10} /> Recent
                </span>
                {onClearRecent && (
                  <button
                    type="button"
                    onClick={onClearRecent}
                    aria-label="Clear recent items"
                    className="flex cursor-pointer items-center gap-1 font-mono text-[9px] uppercase tracking-[0.12em] text-white/35 transition-colors hover:text-white"
                  >
                    <Trash2 size={10} /> Clear
                  </button>
                )}
              </div>
              {recentItems.slice(0, 6).map((entry) => (
                <button
                  key={`${entry.type}-${entry.id}`}
                  type="button"
                  onClick={() => { onOpenRecent(entry); onClose(); }}
                  className={item}
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/25" />
                  <span className="flex-1 truncate capitalize">{entry.title}</span>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-white/28">
                    {entry.type}
                  </span>
                </button>
              ))}
            </>
          )}

          <div className="my-1 h-px bg-white/10" />
          <div className="py-1">
            <button type="button" onClick={() => { onSleep(); onClose(); }} className={item}><Moon size={14} />Sleep Display</button>
            <button type="button" onClick={() => { onLock(); onClose(); }} className={item}><Lock size={14} />Lock Workspace</button>
            <button type="button" onClick={() => { onRestart(); onClose(); }} className={item}><RotateCcw size={14} />Restart Desktop</button>
            <button type="button" onClick={() => { onShutDown(); onClose(); }} className="flex h-8 w-full cursor-pointer items-center gap-2.5 rounded-[7px] px-2.5 text-left text-[12px] text-rose-300 hover:bg-rose-500/20"><Power size={14} />Shut Down...</button>
          </div>
          <div className="flex items-center justify-between border-t border-white/10 px-2.5 py-1.5 font-mono text-[9.5px] text-white/35">
            <span>v2.6.4</span>
            <a href={PORTFOLIO_CONFIG.links.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white">rahma.studio <ExternalLink size={9} /></a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}