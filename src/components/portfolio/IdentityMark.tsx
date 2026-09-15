import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CloudFog, CloudRain, Disc, Pause, Play, RotateCcw, SlidersHorizontal, Sun, Timer, Volume2, VolumeX } from "lucide-react";
import { IDENTITY } from "@/data/socials";
import { hasBooted } from "./BootIntro";
import type { WeatherMode } from "./widgets/WeatherAtmosphere";

function LiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return <span className="tabular font-mono text-[11px] tracking-[0.08em] text-white/80">{now.toLocaleTimeString("en-GB", { hour12: false })}</span>;
}

interface Props {
  hasCustomLayout?: boolean;
  weather: WeatherMode;
  isMusicPlaying: boolean;
  isSystemMenuOpen?: boolean;
  onResetLayout?: () => void;
  onCycleWeather?: () => void;
  onToggleMusicPlayer?: () => void;
  onToggleSystemMenu?: () => void;
  isControlCenterOpen?: boolean;
  onToggleControlCenter?: () => void;
}

export function IdentityMark({
  hasCustomLayout = false,
  weather,
  isMusicPlaying,
  isSystemMenuOpen = false,
  onResetLayout,
  onCycleWeather,
  onToggleMusicPlayer,
  onToggleSystemMenu,
  isControlCenterOpen = false,
  onToggleControlCenter,
}: Props) {
  const reduced = useReducedMotion();
  const delay = (value: number) => (reduced ? 0 : hasBooted() ? 0.12 : value);
  const [pomodoroOpen, setPomodoroOpen] = useState(false);
  const [seconds, setSeconds] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    if (!timerActive || seconds <= 0) return;
    const timer = window.setInterval(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearInterval(timer);
  }, [seconds, timerActive]);

  const formatted = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const intro = { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 } };

  return (
    <>
      <motion.header
        {...intro}
        transition={{ duration: 0.6, delay: delay(0.95), ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none fixed left-5 top-5 z-20 select-none md:left-8 md:top-7"
      >
        <button type="button" onClick={onToggleSystemMenu} aria-expanded={isSystemMenuOpen} className="group pointer-events-auto flex cursor-pointer items-center gap-1.5 text-left">
          <span className="text-[13px] font-semibold tracking-[0.22em] text-white transition-colors group-hover:text-emerald-300 [text-shadow:0_1px_10px_rgba(0,0,0,0.4)]">{IDENTITY.mark}</span>
          <span className={`text-[10px] text-white/50 transition-transform ${isSystemMenuOpen ? "rotate-180" : ""}`}>▾</span>
        </button>
        <p className="mt-1 text-[11px] text-white/70 [text-shadow:0_1px_8px_rgba(0,0,0,0.4)]">{IDENTITY.role}</p>
        <p className="mt-2.5 hidden items-center gap-1.5 sm:flex">
          <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-60" /><span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" /></span>
          <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/60">{IDENTITY.status}</span>
        </p>
      </motion.header>

      <motion.div
        {...intro}
        transition={{ duration: 0.6, delay: delay(1.05), ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none fixed right-5 top-5 z-20 flex flex-col items-end gap-1.5 md:right-8 md:top-7"
      >
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            {onToggleMusicPlayer && (
              <button type="button" onClick={onToggleMusicPlayer} className={`pointer-events-auto flex cursor-pointer items-center gap-1.5 rounded-[8px] border px-2 py-1 font-mono text-[10px] uppercase tracking-wider backdrop-blur-sm ${isMusicPlaying ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-300" : "border-white/15 bg-black/25 text-white/70 hover:bg-white/10"}`}>
                <Disc size={13} className={isMusicPlaying ? "animate-spin" : ""} style={{ animationDuration: "3s" }} /><span className="hidden sm:inline">Lofi Tape</span>
              </button>
            )}
            {onCycleWeather && (
              <button type="button" onClick={onCycleWeather} className="pointer-events-auto flex cursor-pointer items-center gap-1.5 rounded-[8px] border border-white/15 bg-black/25 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-white/75 backdrop-blur-sm hover:bg-white/10">
                {weather === "clear" && <Sun size={12} className="text-amber-300" />}
                {weather === "rain" && <CloudRain size={12} className="text-blue-300" />}
                {weather === "mist" && <CloudFog size={12} />}
                {weather === "aurora" && <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />}
                <span className="capitalize">{weather}</span>
              </button>
            )}
            <div className="pointer-events-auto relative">
              <button type="button" onClick={() => setPomodoroOpen((open) => !open)} className={`flex cursor-pointer items-center gap-1.5 rounded-[8px] border px-2 py-1 font-mono text-[10px] uppercase tracking-wider backdrop-blur-sm ${timerActive ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-300" : "border-white/15 bg-black/25 text-white/75"}`}>
                <Timer size={12} /><span>{formatted}</span>
              </button>
              {pomodoroOpen && (
                <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-48 space-y-2.5 rounded-xl border border-white/15 bg-[#121216]/95 p-3 text-white shadow-2xl backdrop-blur-xl">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-400">Focus Timer</p>
                  <div className="flex gap-1.5">
                    <button type="button" onClick={() => setTimerActive((active) => !active)} className="flex flex-1 items-center justify-center gap-1 rounded bg-white py-1 text-[11px] font-semibold text-black">{timerActive ? <Pause size={11} /> : <Play size={11} />} {timerActive ? "Pause" : "Start"}</button>
                    <button type="button" onClick={() => { setTimerActive(false); setSeconds(25 * 60); }} className="rounded bg-white/10 px-2 text-[10px]">Reset</button>
                  </div>
                </div>
              )}
            </div>
            <button type="button" onClick={onResetLayout} disabled={!hasCustomLayout} className={`pointer-events-auto grid h-7 w-7 place-items-center rounded-[8px] border backdrop-blur-sm ${hasCustomLayout ? "cursor-pointer border-white/20 bg-black/25 text-white/70" : "border-white/10 bg-black/15 text-white/30"}`} aria-label="Reset icon layout"><RotateCcw size={13} /></button>
          </div>
          {/* System tray — compact status that opens the Control Center. */}
          {onToggleControlCenter && (
            <button
              type="button"
              onClick={onToggleControlCenter}
              aria-expanded={isControlCenterOpen}
              aria-controls="portfolio-control-center"
              aria-label="Open Control Center"
              className={`pointer-events-auto flex h-7 cursor-pointer items-center gap-1.5 rounded-[8px] border px-2 backdrop-blur-sm transition-colors ${
                isControlCenterOpen
                  ? "border-white/30 bg-white/15 text-white"
                  : "border-white/15 bg-black/25 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {isMusicPlaying ? <Volume2 size={12} /> : <VolumeX size={12} />}
              {weather === "clear" ? <Sun size={12} className="text-amber-300/80" /> : <CloudFog size={12} />}
              <SlidersHorizontal size={12} />
            </button>
          )}

          <LiveClock />
        </div>
        <span className="hidden font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/55 sm:block">{IDENTITY.location}</span>
      </motion.div>
    </>
  );
}