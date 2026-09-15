import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Sliders, Play, RotateCcw } from "lucide-react";
import { uiSound } from "@/utils/sound";

export function PlaygroundWindow() {
  const [stiffness, setStiffness] = useState(400);
  const [damping, setDamping] = useState(24);
  const [mass, setMass] = useState(0.8);
  const [borderRadius, setBorderRadius] = useState(14);
  const [triggerKey, setTriggerKey] = useState(0);

  const resetDefaults = () => {
    setStiffness(400);
    setDamping(24);
    setMass(0.8);
    setBorderRadius(14);
    setTriggerKey((k) => k + 1);
  };

  const handleTestTrigger = () => {
    uiSound.play("switch");
    setTriggerKey((k) => k + 1);
  };

  return (
    <div className="h-full overflow-y-auto os-scroll bg-[#f8f7f4] text-ink p-5 sm:p-8 select-none">
      <div className="max-w-2xl mx-auto space-y-7">
        {/* Header */}
        <div className="border-b border-ink/10 pb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-ink/40 uppercase tracking-widest">
            <Sliders size={13} className="text-emerald-700" />
            <span>Design Engineering Lab</span>
          </div>
          <h2 className="text-2xl font-medium tracking-tight text-ink mt-1">
            Motion &amp; Physics Playground
          </h2>
          <p className="text-xs text-ink/60 mt-1">
            Live-tune the Framer Motion spring physics curves used throughout the desktop operating system.
          </p>
        </div>

        {/* Live Canvas Area */}
        <div className="p-8 rounded-2xl bg-white border border-ink/10 shadow-sm flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden">
          <motion.div
            key={triggerKey}
            initial={{ scale: 0.2, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness, damping, mass }}
            whileHover={{ scale: 1.08, y: -4 }}
            whileTap={{ scale: 0.94 }}
            style={{ borderRadius: `${borderRadius}px` }}
            className="w-36 h-36 bg-ink text-white shadow-2xl flex flex-col items-center justify-center p-4 cursor-pointer text-center space-y-1"
          >
            <Sparkles size={24} className="text-emerald-400" />
            <span className="font-semibold text-xs tracking-tight">Interactive Entity</span>
            <span className="font-mono text-[9px] text-white/50">Click / Drag me</span>
          </motion.div>

          <button
            onClick={handleTestTrigger}
            className="mt-6 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-ink/5 hover:bg-ink/10 text-xs font-mono text-ink transition-colors cursor-pointer"
          >
            <Play size={12} fill="currentColor" />
            <span>Retrigger Entry Spring</span>
          </button>
        </div>

        {/* Controls Grid */}
        <div className="p-5 rounded-2xl bg-white border border-ink/10 space-y-5">
          <div className="flex items-center justify-between border-b border-ink/10 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink">
              Spring Parameters
            </span>
            <button
              onClick={resetDefaults}
              className="flex items-center gap-1 text-xs font-mono text-ink/50 hover:text-ink cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Reset Defaults</span>
            </button>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Stiffness */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-ink/60">Stiffness (Spring Tension)</span>
                <span className="font-bold text-ink">{stiffness}</span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="10"
                value={stiffness}
                onChange={(e) => setStiffness(parseInt(e.target.value))}
                className="w-full h-1 bg-ink/15 rounded-lg appearance-none cursor-pointer accent-ink"
              />
            </div>

            {/* Damping */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-ink/60">Damping (Frictional Resistance)</span>
                <span className="font-bold text-ink">{damping}</span>
              </div>
              <input
                type="range"
                min="5"
                max="80"
                step="1"
                value={damping}
                onChange={(e) => setDamping(parseInt(e.target.value))}
                className="w-full h-1 bg-ink/15 rounded-lg appearance-none cursor-pointer accent-ink"
              />
            </div>

            {/* Mass */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-ink/60">Mass (Inertial Weight)</span>
                <span className="font-bold text-ink">{mass.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.1"
                value={mass}
                onChange={(e) => setMass(parseFloat(e.target.value))}
                className="w-full h-1 bg-ink/15 rounded-lg appearance-none cursor-pointer accent-ink"
              />
            </div>

            {/* Corner Radius */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-ink/60">Corner Curvature (Radius)</span>
                <span className="font-bold text-ink">{borderRadius}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={borderRadius}
                onChange={(e) => setBorderRadius(parseInt(e.target.value))}
                className="w-full h-1 bg-ink/15 rounded-lg appearance-none cursor-pointer accent-ink"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
