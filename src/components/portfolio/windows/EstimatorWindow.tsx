import { useState } from "react";
import { Calculator, ArrowRight, Check, Sparkles } from "lucide-react";

interface Props {
  onOpenContactWithScope: (scopeSummary: string) => void;
}

const SERVICES = [
  { id: "brand", label: "Brand Identity & Art Direction" },
  { id: "product", label: "Product UI / UX Design & Systems" },
  { id: "web", label: "Full-Stack Web Engineering (Next.js)" },
  { id: "3d", label: "WebGL / Interactive 3D Physics" },
];

const SCOPE_TIERS = [
  { id: "mvp", label: "MVP / Sprint (Core Deliverables)" },
  { id: "scale", label: "Scale (Full Design System + CMS)" },
  { id: "flagship", label: "Flagship (Bespoke Animations & 3D)" },
];

export function EstimatorWindow({ onOpenContactWithScope }: Props) {
  const [selectedServices, setSelectedServices] = useState<string[]>(["product", "web"]);
  const [selectedTier, setSelectedTier] = useState<string>("scale");

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((s) => s !== id) : prev) : [...prev, id],
    );
  };

  const tier = SCOPE_TIERS.find((t) => t.id === selectedTier) || SCOPE_TIERS[0];

  const handleSendToContact = () => {
    const serviceNames = selectedServices
      .map((id) => SERVICES.find((s) => s.id === id)?.label)
      .filter(Boolean)
      .join(", ");
    const scopeMsg = `Hi Designwithrahma, I used your Project Scope Estimator:\n- Services: ${serviceNames}\n- Tier: ${tier.label}\n\nI would like to request a quote. Let's discuss further!`;
    onOpenContactWithScope(scopeMsg);
  };

  return (
    <div className="h-full overflow-y-auto os-scroll bg-white text-ink p-5 sm:p-8 select-none">
      <div className="max-w-2xl mx-auto space-y-7">
        {/* Header */}
        <div className="border-b border-ink/10 pb-5">
          <div className="flex items-center gap-2 text-xs font-mono text-ink/40 uppercase tracking-widest">
            <Calculator size={13} className="text-emerald-700" />
            <span>Project Scope &amp; Budget Calculator</span>
          </div>
          <h2 className="text-2xl font-medium tracking-tight text-ink mt-1">
            Estimate Your Project Scope
          </h2>
          <p className="text-xs text-ink/60 mt-1">
            Build your project scope to request a custom quote.
          </p>
        </div>

        {/* 1. Services */}
        <div className="space-y-3">
          <label className="block text-xs font-mono uppercase tracking-wider text-ink/50 font-semibold">
            1. Select Required Services
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {SERVICES.map((s) => {
              const active = selectedServices.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggleService(s.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    active
                      ? "border-emerald-600 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500/30"
                      : "border-ink/10 bg-white hover:border-ink/20"
                  }`}
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-ink">{s.label}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                      active ? "bg-emerald-600 border-emerald-600 text-white" : "border-ink/20"
                    }`}
                  >
                    {active && <Check size={12} strokeWidth={3} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Scale Tier */}
        <div className="space-y-3">
          <label className="block text-xs font-mono uppercase tracking-wider text-ink/50 font-semibold">
            2. Project Depth &amp; Complexity
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {SCOPE_TIERS.map((t) => {
              const active = selectedTier === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTier(t.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer space-y-1 ${
                    active
                      ? "border-ink bg-ink/5 shadow-sm font-semibold"
                      : "border-ink/10 bg-white hover:border-ink/20"
                  }`}
                >
                  <p className="text-xs font-medium text-ink">{t.label.split(" (")[0]}</p>
                  <p className="text-[10px] text-ink/50 font-mono">
                    {t.id === "mvp" ? "Lean & Fast" : t.id === "scale" ? "Comprehensive" : "High-End Craft"}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Estimate Result Box */}
        <div className="p-6 rounded-2xl bg-ink text-white space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-white/10 pb-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400 font-semibold">
                Project Pricing
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-sm font-medium tracking-tight text-white max-w-sm">
                  Project pricing depends on scope, complexity and timeline.
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-white/60 font-sans">
              Contact: rahmathullah5975@gmail.com
            </span>
            <button
              onClick={handleSendToContact}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Sparkles size={13} />
              <span>Request a Quote</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
