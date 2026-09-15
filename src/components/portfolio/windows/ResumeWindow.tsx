import { useState } from "react";
import { Download, FileText, Briefcase, GraduationCap, Code2, Sparkles, Printer } from "lucide-react";
import { PORTFOLIO_CONFIG } from "@/config/portfolio";

export function ResumeWindow() {
  const [activeTab, setActiveTab] = useState<"experience" | "skills" | "education">("experience");
  const { resume, identity } = PORTFOLIO_CONFIG;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-full overflow-y-auto os-scroll bg-white text-ink p-5 sm:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Document Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink/10 pb-6">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] text-ink/40 uppercase tracking-widest">
              <FileText size={13} className="text-emerald-700" />
              <span>Curriculum Vitae</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-ink mt-1">
              {identity.name}
            </h1>
            <p className="text-sm font-mono text-ink/60 mt-0.5">
              {identity.role} · {identity.location}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              aria-label="Print resume"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ink/15 text-xs font-medium text-ink hover:bg-ink/5 transition-colors cursor-pointer"
            >
              <Printer size={13} />
              <span className="hidden sm:inline">Print</span>
            </button>
            {PORTFOLIO_CONFIG.links.resume && (
              <a
                href={PORTFOLIO_CONFIG.links.resume}
                download
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-ink text-white text-xs font-medium hover:bg-black transition-colors"
              >
                <Download size={13} />
                <span>Download PDF</span>
              </a>
            )}
          </div>
        </header>

        {/* Executive Summary */}
        <div className="p-4 rounded-xl bg-ink/[0.03] border border-ink/8">
          <h2 className="text-xs font-mono uppercase tracking-wider text-ink/40 mb-1.5">Executive Summary</h2>
          <p className="text-sm leading-relaxed text-ink/80">{resume.summary}</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-ink/10 gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab("experience")}
            className={[
              "pb-2.5 flex items-center gap-2 border-b-2 transition-colors cursor-pointer",
              activeTab === "experience"
                ? "border-ink text-ink font-semibold"
                : "border-transparent text-ink/50 hover:text-ink",
            ].join(" ")}
          >
            <Briefcase size={14} />
            <span>Experience ({resume.experiences.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("skills")}
            className={[
              "pb-2.5 flex items-center gap-2 border-b-2 transition-colors cursor-pointer",
              activeTab === "skills"
                ? "border-ink text-ink font-semibold"
                : "border-transparent text-ink/50 hover:text-ink",
            ].join(" ")}
          >
            <Code2 size={14} />
            <span>Skills &amp; Tech</span>
          </button>
          <button
            onClick={() => setActiveTab("education")}
            className={[
              "pb-2.5 flex items-center gap-2 border-b-2 transition-colors cursor-pointer",
              activeTab === "education"
                ? "border-ink text-ink font-semibold"
                : "border-transparent text-ink/50 hover:text-ink",
            ].join(" ")}
          >
            <GraduationCap size={14} />
            <span>Education</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "experience" && (
          <div className="space-y-6">
            {resume.experiences.map((exp, idx) => (
              <div key={idx} className="relative pl-6 border-l-2 border-ink/10 space-y-2">
                <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-ink" />
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <h3 className="text-base font-semibold text-ink">{exp.role}</h3>
                  <span className="text-xs font-mono text-ink/50">{exp.period}</span>
                </div>
                <div className="text-xs font-medium text-emerald-800">{exp.company} · {exp.location}</div>
                <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-ink/70 leading-relaxed pt-1">
                  {exp.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {activeTab === "skills" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3 p-4 rounded-xl border border-ink/10 bg-ink/[0.02]">
              <div className="flex items-center gap-1.5 text-xs font-mono font-semibold uppercase text-ink">
                <Sparkles size={13} className="text-amber-600" />
                <span>Design Craft</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {resume.skills.design.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-md bg-white border border-ink/10 text-xs text-ink/80">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-xl border border-ink/10 bg-ink/[0.02]">
              <div className="flex items-center gap-1.5 text-xs font-mono font-semibold uppercase text-ink">
                <Code2 size={13} className="text-blue-600" />
                <span>Development</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {resume.skills.development.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-md bg-white border border-ink/10 text-xs text-ink/80">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-xl border border-ink/10 bg-ink/[0.02]">
              <div className="flex items-center gap-1.5 text-xs font-mono font-semibold uppercase text-ink">
                <FileText size={13} className="text-purple-600" />
                <span>Tools &amp; Stack</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {resume.skills.tools.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-md bg-white border border-ink/10 text-xs text-ink/80">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "education" && (
          <div className="space-y-4">
            {resume.education.map((edu, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-ink/10 bg-white space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-ink">{edu.degree}</h3>
                  <span className="text-xs font-mono text-ink/50">{edu.year}</span>
                </div>
                <p className="text-xs text-ink/60">{edu.institution}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
