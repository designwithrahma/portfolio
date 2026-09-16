import { useState } from "react";
import { Image, Volume2, VolumeX, RotateCcw, Monitor, SlidersHorizontal, Waves } from "lucide-react";

import type { DockMagnification, IconSize, MotionMode } from "@/utils/storage";

interface Props {
  soundsOn: boolean;
  onToggleSounds: () => void;
  onResetLayout: () => void;
  onOpenShortcuts: () => void;
  /** Appearance + motion preferences (persisted through the Part 1 store). */
  iconSize?: IconSize;
  dockMagnification?: DockMagnification;
  motionMode?: MotionMode;
  backgroundMotion?: boolean;
  weatherEffects?: boolean;
  musicOn?: boolean;
  volume?: number;
  systemReducedMotion?: boolean;
  onChangeIconSize?: (size: IconSize) => void;
  onChangeDockMagnification?: (value: DockMagnification) => void;
  onChangeMotionMode?: (mode: MotionMode) => void;
  onToggleBackgroundMotion?: () => void;
  onToggleWeatherEffects?: () => void;
  onToggleMusic?: () => void;
  onChangeVolume?: (value: number) => void;
}

const TAB_CLASS = (active: boolean) =>
  [
    "w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer",
    active ? "bg-ink text-white" : "hover:bg-ink/5 text-ink/70",
  ].join(" ");

/** Small segmented control used across the appearance section. */
function Segmented<T extends string>({
  label,
  description,
  value,
  options,
  onChange,
}: {
  label: string;
  description: string;
  value: T;
  options: { id: T; label: string }[];
  onChange?: (value: T) => void;
}) {
  return (
    <div className="p-4 rounded-xl border border-ink/10 bg-white flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 className="text-sm font-medium text-ink">{label}</h3>
        <p className="text-xs text-ink/50">{description}</p>
      </div>
      <div className="flex gap-1 rounded-lg border border-ink/10 p-0.5" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange?.(option.id)}
            aria-pressed={value === option.id}
            className={[
              "min-h-8 cursor-pointer rounded-md px-2.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors",
              value === option.id ? "bg-ink text-white" : "text-ink/55 hover:text-ink",
            ].join(" ")}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Simple on/off row reused for boolean preferences. */
function ToggleRow({
  label,
  description,
  enabled,
  onToggle,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onToggle?: () => void;
}) {
  return (
    <div className="p-4 rounded-xl border border-ink/10 bg-white flex items-center justify-between gap-3">
      <div>
        <h3 className="text-sm font-medium text-ink">{label}</h3>
        <p className="text-xs text-ink/50">{description}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        role="switch"
        aria-checked={enabled}
        aria-label={label}
        className={`h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors ${
          enabled ? "bg-emerald-600" : "bg-ink/20"
        }`}
      >
        <span
          className={`block h-5 w-5 rounded-full bg-white transition-transform ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

export function SettingsWindow({
  soundsOn,
  onToggleSounds,
  onResetLayout,
  onOpenShortcuts,
  iconSize = "medium",
  dockMagnification = "medium",
  motionMode = "full",
  backgroundMotion = true,
  weatherEffects = true,
  musicOn = false,
  volume = 0.6,
  systemReducedMotion = false,
  onChangeIconSize,
  onChangeDockMagnification,
  onChangeMotionMode,
  onToggleBackgroundMotion,
  onToggleWeatherEffects,
  onToggleMusic,
  onChangeVolume,
}: Props) {
  const [activeTab, setActiveTab] = useState<"appearance" | "audio" | "system">("appearance");

  return (
    <div className="h-full flex flex-col md:flex-row bg-[#f8f7f4] text-ink overflow-hidden">
      {/* Sidebar Tabs */}
      <div className="w-full md:w-[200px] shrink-0 border-b md:border-b-0 md:border-r border-ink/10 p-3 bg-white space-y-1">

        <button onClick={() => setActiveTab("appearance")} className={TAB_CLASS(activeTab === "appearance")}>
          <SlidersHorizontal size={14} />
          <span>Appearance</span>
        </button>
        <button onClick={() => setActiveTab("audio")} className={TAB_CLASS(activeTab === "audio")}>
          <Volume2 size={14} />
          <span>Sound &amp; Audio</span>
        </button>
        <button onClick={() => setActiveTab("system")} className={TAB_CLASS(activeTab === "system")}>
          <Monitor size={14} />
          <span>Desktop Controls</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-8 os-scroll space-y-6">

        {activeTab === "appearance" && (
          <div className="space-y-5 max-w-xl">
            <div>
              <h2 className="text-lg font-semibold text-ink">Appearance &amp; Motion</h2>
              <p className="text-xs text-ink/60 mt-0.5">
                Tune icon scale, dock behaviour and how much the desktop moves.
              </p>
            </div>

            <Segmented<IconSize>
              label="Icon Size"
              description="Scale of the desktop project icons."
              value={iconSize}
              onChange={onChangeIconSize}
              options={[
                { id: "small", label: "Small" },
                { id: "medium", label: "Medium" },
                { id: "large", label: "Large" },
              ]}
            />

            <Segmented<DockMagnification>
              label="Dock Magnification"
              description="How strongly dock icons grow under the pointer."
              value={dockMagnification}
              onChange={onChangeDockMagnification}
              options={[
                { id: "off", label: "Off" },
                { id: "low", label: "Low" },
                { id: "medium", label: "Medium" },
              ]}
            />

            <Segmented<MotionMode>
              label="Motion"
              description={
                systemReducedMotion
                  ? "Your browser requests reduced motion; that setting always wins."
                  : "Reduced motion disables parallax and heavy transitions."
              }
              value={systemReducedMotion ? "reduced" : motionMode}
              onChange={onChangeMotionMode}
              options={[
                { id: "full", label: "Full" },
                { id: "reduced", label: "Reduced" },
              ]}
            />

            <ToggleRow
              label="Background Motion"
              description="Slow wallpaper drift and pointer parallax."
              enabled={backgroundMotion}
              onToggle={onToggleBackgroundMotion}
            />

            <ToggleRow
              label="Weather Effects"
              description="Rain, mist and atmosphere particles over the desktop."
              enabled={weatherEffects}
              onToggle={onToggleWeatherEffects}
            />
          </div>
        )}

        {activeTab === "audio" && (
          <div className="space-y-5 max-w-lg">
            <div>
              <h2 className="text-lg font-semibold text-ink">Interface Sound System</h2>
              <p className="text-xs text-ink/60 mt-0.5">
                Tactile synthesized WebAudio oscillators. Nothing plays until you enable it.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-ink/10 bg-white space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {soundsOn ? (
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Volume2 size={16} />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-ink/5 text-ink/40 flex items-center justify-center">
                      <VolumeX size={16} />
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-ink">Sound Effects</h3>
                    <p className="text-xs text-ink/50">Zero audio files, pure browser oscillator synthesis.</p>
                  </div>
                </div>

                <button
                  onClick={onToggleSounds}
                  aria-pressed={soundsOn}
                  className={[
                    "px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer",
                    soundsOn ? "bg-emerald-600 text-white" : "bg-ink/10 text-ink hover:bg-ink/15",
                  ].join(" ")}
                >
                  {soundsOn ? "ENABLED" : "MUTED"}
                </button>
              </div>
            </div>

            <ToggleRow
              label="Ambient Music"
              description="Opens the tape deck. Playback still requires a manual press."
              enabled={musicOn}
              onToggle={onToggleMusic}
            />

            <div className="p-4 rounded-xl border border-ink/10 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-ink">Volume</h3>
                <span className="font-mono text-[11px] text-ink/50">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(event) => onChangeVolume?.(Number(event.target.value))}
                aria-label="Ambient music volume"
                className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-ink/15 accent-ink"
              />
            </div>
          </div>
        )}

        {activeTab === "system" && (
          <div className="space-y-6 max-w-lg">
            <div>
              <h2 className="text-lg font-semibold text-ink">Desktop Controls &amp; Layout</h2>
              <p className="text-xs text-ink/60 mt-0.5">
                Manage your grid coordinates, shortcuts, and physical layout state.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-ink/10 bg-white flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-medium text-ink">Reset Grid Arrangement</h3>
                  <p className="text-xs text-ink/50">Restore the original designer-defined icon positions.</p>
                </div>
                <button
                  onClick={onResetLayout}
                  className="px-3 py-1.5 rounded-lg border border-ink/15 text-xs font-medium text-ink hover:bg-ink/5 flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Reset</span>
                </button>
              </div>

              <div className="p-4 rounded-xl border border-ink/10 bg-white flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-medium text-ink">Keyboard Cheat Sheet</h3>
                  <p className="text-xs text-ink/50">View all hotkeys for rapid spatial navigation.</p>
                </div>
                <button
                  onClick={onOpenShortcuts}
                  className="px-3 py-1.5 rounded-lg bg-ink text-white text-xs font-medium hover:bg-black cursor-pointer"
                >
                  View Hotkeys (?)
                </button>
              </div>

              <div className="p-4 rounded-xl border border-ink/10 bg-white flex items-start gap-3">
                <Waves size={15} className="mt-0.5 shrink-0 text-ink/40" />
                <p className="text-xs text-ink/55">
                  Preferences save automatically and survive refreshes. Resetting the layout also clears
                  stored window positions.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
