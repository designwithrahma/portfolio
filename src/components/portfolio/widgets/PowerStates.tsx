import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Power, ArrowRight, UserCheck } from "lucide-react";
import { PORTFOLIO_CONFIG } from "@/config/portfolio";
import { uiSound } from "@/utils/sound";

interface LockScreenProps {
  isLocked: boolean;
  onUnlock: () => void;
}

export function LockScreen({ isLocked, onUnlock }: LockScreenProps) {
  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
      setDateStr(now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isLocked) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.code === "Space") {
        uiSound.play("open");
        onUnlock();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isLocked, onUnlock]);

  return (
    <AnimatePresence>
      {isLocked && (
        <motion.div
          key="lockscreen"
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(24px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[99] flex flex-col items-center justify-between bg-black/65 p-8 text-white select-none"
        >
          {/* Top Clock */}
          <div className="pt-12 text-center space-y-1">
            <p className="tabular text-6xl sm:text-7xl font-extralight tracking-tight drop-shadow-lg">
              {timeStr}
            </p>
            <p className="font-mono text-xs uppercase tracking-widest text-white/60">
              {dateStr}
            </p>
          </div>

          {/* User Profile Card */}
          <div className="flex flex-col items-center space-y-4 max-w-xs text-center">
            <div className="relative w-20 h-20 rounded-full border-2 border-white/20 bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-2xl">
              <span className="text-2xl font-bold font-mono">
                {PORTFOLIO_CONFIG.identity.name.slice(0, 2)}
              </span>
              <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center">
                <UserCheck size={12} className="text-black" />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold tracking-tight text-white">
                {PORTFOLIO_CONFIG.identity.name}
              </h2>
              <p className="text-xs text-white/50 font-mono">
                {PORTFOLIO_CONFIG.identity.role}
              </p>
            </div>

            <button
              onClick={() => {
                uiSound.play("open");
                onUnlock();
              }}
              className="group flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black text-xs font-semibold shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Unlock size={14} className="group-hover:text-emerald-700 transition-colors" />
              <span>Unlock Workspace</span>
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Footer hint */}
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/30 flex items-center gap-1.5">
            <Lock size={11} /> Press Enter or Space to resume
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface CRTShutDownProps {
  isShutDown: boolean;
  onPowerOn: () => void;
}

export function CRTShutDown({ isShutDown, onPowerOn }: CRTShutDownProps) {
  if (!isShutDown) return null;

  return (
    <motion.div
      key="crt-shutdown"
      initial={{ scaleY: 0.005, scaleX: 1, opacity: 1 }}
      animate={{ scaleY: 1, scaleX: 1, opacity: 1 }}
      exit={{ scaleY: 0.005, scaleX: 1, opacity: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[105] flex flex-col items-center justify-center bg-black text-white p-6 select-none"
    >
      <div className="text-center space-y-6 max-w-sm">
        <div className="w-16 h-16 rounded-full border border-white/20 bg-white/5 mx-auto flex items-center justify-center text-white/40">
          <Power size={28} />
        </div>

        <div className="space-y-1">
          <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-white/80">
            SYSTEM POWERED OFF
          </h2>
          <p className="font-mono text-xs text-white/40">
            Designwithrahma Operating Engine is resting.
          </p>
        </div>

        <button
          onClick={() => {
            uiSound.play("open");
            onPowerOn();
          }}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-all hover:scale-105 active:scale-95 shadow-lg mx-auto cursor-pointer"
        >
          <Power size={14} />
          <span>Turn On Workspace</span>
        </button>
      </div>

      <div className="absolute bottom-6 font-mono text-[10px] text-white/25 uppercase tracking-widest">
        CRT Display Standby Mode
      </div>
    </motion.div>
  );
}
