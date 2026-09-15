import { useState, useEffect } from "react";
import { Activity, Cpu, Zap, CheckCircle2, Shield } from "lucide-react";

export function DiagnosticsWindow() {
  const [fps, setFps] = useState(60);
  const [nodeCount, setNodeCount] = useState(0);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const measure = (now: number) => {
      frameCount++;
      if (now >= lastTime + 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
        setNodeCount(document.querySelectorAll("*").length);
      }
      animId = requestAnimationFrame(measure);
    };

    animId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(animId);
  }, []);

  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const isTouch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const isWebGL = typeof window !== "undefined" && !!document.createElement("canvas").getContext("webgl");

  return (
    <div className="h-full overflow-y-auto os-scroll bg-[#0a0a0e] text-white p-5 sm:p-8 font-mono text-xs space-y-6 select-none">
      {/* Header */}
      <div className="border-b border-white/10 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-widest text-[10px]">
            <Activity size={13} />
            <span>System Telemetry &amp; Diagnostics</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">
            Designwithrahma Operating Engine v2.6
          </h2>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
          <Zap size={11} /> OPTIMAL
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-1">
          <p className="text-[10px] text-white/40 uppercase">Render FPS</p>
          <p className={`text-2xl font-bold ${fps >= 55 ? "text-emerald-400" : "text-amber-400"}`}>{fps}</p>
          <p className="text-[9px] text-white/30">Hardware V-Sync</p>
        </div>

        <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-1">
          <p className="text-[10px] text-white/40 uppercase">Active DOM Nodes</p>
          <p className="text-2xl font-bold text-white">{nodeCount}</p>
          <p className="text-[9px] text-white/30">Lightweight tree</p>
        </div>

        <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-1">
          <p className="text-[10px] text-white/40 uppercase">Display Scaling</p>
          <p className="text-2xl font-bold text-white">{dpr.toFixed(1)}x</p>
          <p className="text-[9px] text-white/30">HiDPI Retina Mode</p>
        </div>

        <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-1">
          <p className="text-[10px] text-white/40 uppercase">WebGL Acceleration</p>
          <p className="text-2xl font-bold text-emerald-400">{isWebGL ? "ENABLED" : "N/A"}</p>
          <p className="text-[9px] text-white/30">GPU Pipeline</p>
        </div>
      </div>

      {/* System Specifications */}
      <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-3">
        <h3 className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
          <Cpu size={13} /> Architecture &amp; Stack
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-white/70 text-[11px]">
          <p><span className="text-white/40">Core Framework:</span> React 19 + TypeScript</p>
          <p><span className="text-white/40">Bundler:</span> Vite 7 + SingleFile Pipeline</p>
          <p><span className="text-white/40">Styling Engine:</span> Tailwind CSS v4</p>
          <p><span className="text-white/40">Physics:</span> Framer Motion Spring Engine</p>
          <p><span className="text-white/40">Audio Synthesis:</span> WebAudio Biquad Oscillators</p>
          <p><span className="text-white/40">Pointer Mode:</span> {isTouch ? "Coarse Touch Pointer" : "Fine Mouse Tracker"}</p>
        </div>
      </div>

      {/* Security & Accessibility Vitals */}
      <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-2">
        <h3 className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
          <Shield size={13} /> Core Vitals
        </h3>
        <div className="flex flex-wrap gap-2 text-[10.5px]">
          <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 size={11} /> Zero Third-Party Trackers
          </span>
          <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 size={11} /> 100% Client-Side Evaluation
          </span>
          <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 size={11} /> A11y Tab-Trap &amp; Focus Enforced
          </span>
          <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 size={11} /> Zero Audio Autoplay Violations
          </span>
        </div>
      </div>
    </div>
  );
}
