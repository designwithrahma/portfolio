import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Bell,
  CloudFog,
  Maximize,
  Minimize,
  Settings,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
  Waves,
} from "lucide-react";
import type { DesktopNotification } from "@/hooks/useNotifications";
import type { WeatherMode } from "./WeatherAtmosphere";

interface Props {
  isOpen: boolean;
  soundsOn: boolean;
  motionOn: boolean;
  weather: WeatherMode;
  isFullscreen: boolean;
  notifications: DesktopNotification[];
  onClose: () => void;
  onToggleSounds: () => void;
  onToggleMotion: () => void;
  onCycleWeather: () => void;
  onToggleFullscreen: () => void;
  onOpenSettings: () => void;
  onClearNotifications: () => void;
}

function Toggle({
  label,
  value,
  icon,
  onClick,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  const active = value !== "Off";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label}: ${value}`}
      className={`flex min-h-[64px] cursor-pointer flex-col justify-between rounded-[10px] border p-2.5 text-left transition-colors ${
        active
          ? "border-white/20 bg-white/[0.12] text-white"
          : "border-white/10 bg-white/[0.04] text-white/55 hover:bg-white/[0.08]"
      }`}
    >
      <span className="flex items-center gap-1.5">{icon}</span>
      <span>
        <span className="block text-[11px] font-medium leading-tight">{label}</span>
        <span className="block font-mono text-[9px] uppercase tracking-[0.12em] opacity-65">{value}</span>
      </span>
    </button>
  );
}

/** Quick controls only. The Settings app remains the full configuration surface. */
export function ControlCenter({
  isOpen,
  soundsOn,
  motionOn,
  weather,
  isFullscreen,
  notifications,
  onClose,
  onToggleSounds,
  onToggleMotion,
  onCycleWeather,
  onToggleFullscreen,
  onOpenSettings,
  onClearNotifications,
}: Props) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onPointer = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('[aria-controls="portfolio-control-center"]')) return;
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="portfolio-control-center"
          ref={ref}
          role="dialog"
          aria-label="Control Center"
          initial={{ opacity: 0, y: reduced ? 0 : -6, scale: reduced ? 1 : 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: reduced ? 0 : -4, scale: reduced ? 1 : 0.98 }}
          transition={{ duration: reduced ? 0.01 : 0.16, ease: [0.22, 1, 0.36, 1] }}
          className="fixed right-4 top-[64px] z-[93] w-[288px] rounded-[14px] border border-white/12 bg-[#101013]/95 p-2.5 text-white shadow-window backdrop-blur-2xl md:right-7"
        >
          <p className="px-1 pb-2 font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">
            Control Center
          </p>

          <div className="grid grid-cols-2 gap-2">
            <Toggle
              label="Sound"
              value={soundsOn ? "On" : "Off"}
              icon={soundsOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
              onClick={onToggleSounds}
            />
            <Toggle
              label="Background Motion"
              value={motionOn ? "On" : "Off"}
              icon={<Waves size={15} />}
              onClick={onToggleMotion}
            />
            <Toggle
              label="Atmosphere"
              value={weather === "clear" ? "Off" : weather}
              icon={<CloudFog size={15} />}
              onClick={onCycleWeather}
            />
            <Toggle
              label="Fullscreen"
              value={isFullscreen ? "On" : "Off"}
              icon={isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
              onClick={onToggleFullscreen}
            />
          </div>

          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={onOpenSettings}
              className="flex min-h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[9px] border border-white/10 bg-white/[0.05] text-[11px] text-white/75 transition-colors hover:bg-white/[0.1] hover:text-white"
            >
              <Settings size={13} /> Settings
            </button>
          </div>

          <div className="mt-2.5 border-t border-white/10 pt-2">
            <div className="flex items-center justify-between px-1 pb-1.5">
              <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-white/35">
                <Bell size={11} /> Notifications
              </span>
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={onClearNotifications}
                  className="flex cursor-pointer items-center gap-1 font-mono text-[9px] uppercase tracking-[0.12em] text-white/40 transition-colors hover:text-white"
                >
                  <Trash2 size={10} /> Clear
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <p className="px-1 pb-1 text-[11px] text-white/35">No recent activity.</p>
            ) : (
              <div className="os-scroll max-h-[132px] space-y-1 overflow-y-auto pr-0.5">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-2 rounded-[8px] bg-white/[0.04] px-2 py-1.5"
                  >
                    <Sparkles size={11} className="mt-0.5 shrink-0 text-white/35" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11px] text-white/80">{item.title}</span>
                      {item.detail && (
                        <span className="block truncate text-[10px] text-white/40">{item.detail}</span>
                      )}
                    </span>
                    <span className="shrink-0 font-mono text-[9px] text-white/28">
                      {new Date(item.timestamp).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
