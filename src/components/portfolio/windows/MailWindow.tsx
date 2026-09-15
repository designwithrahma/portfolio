import { useState } from "react";
import { Mail, CheckCircle2, Star, User, Calendar, ShieldCheck } from "lucide-react";
import { PORTFOLIO_CONFIG, type TestimonialItem } from "@/config/portfolio";

export function MailWindow() {
  const [selectedMail, setSelectedMail] = useState<TestimonialItem | undefined>(PORTFOLIO_CONFIG.testimonials[0]);

  if (!selectedMail) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#fbfbfa] text-ink p-8 text-center">
        <Mail size={32} className="text-ink/20 mb-3 mx-auto" />
        <h2 className="text-sm font-semibold text-ink/60">Inbox Empty</h2>
        <p className="text-xs text-ink/40 mt-1 max-w-[200px]">Client testimonials and project reviews will appear here.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col md:flex-row bg-[#fbfbfa] text-ink overflow-hidden">
      {/* Sidebar List */}
      <div className="w-full md:w-[280px] shrink-0 border-b md:border-b-0 md:border-r border-ink/10 flex flex-col bg-white">
        <div className="p-3.5 border-b border-ink/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail size={14} className="text-emerald-700" />
            <span className="text-xs font-semibold uppercase tracking-wider text-ink">
              Testimonials Inbox
            </span>
          </div>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
            {PORTFOLIO_CONFIG.testimonials.length}
          </span>
        </div>

        <div className="overflow-y-auto flex-1 os-scroll">
          {PORTFOLIO_CONFIG.testimonials.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedMail(item)}
              className={[
                "w-full text-left p-3.5 border-b border-ink/5 transition-colors cursor-pointer space-y-1",
                selectedMail.id === item.id
                  ? "bg-ink/5 border-l-2 border-l-ink"
                  : "hover:bg-ink/[0.02]",
              ].join(" ")}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink truncate">{item.author}</span>
                <span className="text-[10px] font-mono text-ink/40">{item.date}</span>
              </div>
              <p className="text-xs font-medium text-ink/75 truncate">{item.subject}</p>
              <p className="text-[11px] text-ink/50 line-clamp-1">{item.message}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Mail View */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-8 os-scroll flex flex-col justify-between space-y-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-3 border-b border-ink/10 pb-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-700 font-semibold flex items-center gap-1.5">
                <CheckCircle2 size={13} /> Verified Client Reference
              </span>
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} fill="currentColor" />
                ))}
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-ink">
              {selectedMail.subject}
            </h2>

            <div className="flex items-center gap-3 pt-1">
              <div className="w-10 h-10 rounded-full bg-ink text-white font-mono font-bold flex items-center justify-center text-xs">
                {selectedMail.avatar}
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                  <span>{selectedMail.author}</span>
                  <span className="text-ink/40 font-normal">·</span>
                  <span className="text-ink/60 font-normal">{selectedMail.role}, {selectedMail.company}</span>
                </div>
                <div className="flex items-center gap-2 text-[10.5px] font-mono text-ink/40">
                  <span className="flex items-center gap-1"><Calendar size={10} /> {selectedMail.date}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><ShieldCheck size={10} className="text-emerald-600" /> Authenticated</span>
                </div>
              </div>
            </div>
          </div>

          {/* Letter Body */}
          <div className="space-y-4 text-[14.5px] leading-[1.8] text-ink/80 font-sans">
            <p className="font-editorial text-lg italic text-ink/90 border-l-2 border-emerald-600/30 pl-4 py-1">
              "{selectedMail.message}"
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="p-3.5 rounded-xl bg-ink/[0.02] border border-ink/8 text-xs text-ink/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User size={13} className="text-ink/40" />
            <span>Direct feedback from client projects delivered by {PORTFOLIO_CONFIG.identity.name}.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
