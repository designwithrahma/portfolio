import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Eye, X } from "lucide-react";
import { PROJECTS, getProject } from "@/data/projects";

interface Props {
  projectId: string | null;
  onClose: () => void;
  onOpenProject: (id: string) => void;
  onNavigate: (id: string) => void;
}

/**
 * Quick Look — instant spacebar preview of any project.
 * Browse effortlessly with ← / → arrows, press Enter to open full case study.
 */
export function QuickLookModal({ projectId, onClose, onOpenProject, onNavigate }: Props) {
  const reduced = useReducedMotion();
  const project = projectId ? getProject(projectId) : null;

  const currentIndex = PROJECTS.findIndex((p) => p.id === projectId);
  const prevProject = currentIndex > 0 ? PROJECTS[currentIndex - 1] : PROJECTS[PROJECTS.length - 1];
  const nextProject = currentIndex < PROJECTS.length - 1 ? PROJECTS[currentIndex + 1] : PROJECTS[0];

  useEffect(() => {
    if (!projectId) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.code === "Space") {
        e.preventDefault();
        e.stopImmediatePropagation();
        onClose();
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        onNavigate(nextProject.id);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        onNavigate(prevProject.id);
      } else if (e.key === "Enter") {
        e.preventDefault();
        onClose();
        onOpenProject(projectId);
      }
    };

    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [projectId, nextProject.id, prevProject.id, onClose, onOpenProject, onNavigate]);

  return (
    <AnimatePresence>
      {project && (
        <div className="fixed inset-0 z-[94] flex items-center justify-center p-4">
          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.01 : 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/55 backdrop-blur-[4px]"
            aria-hidden
          />

          {/* quick look card */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Quick Look: ${project.title}`}
            initial={{ opacity: 0, scale: reduced ? 1 : 0.94, y: reduced ? 0 : 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: reduced ? 1 : 0.94, y: reduced ? 0 : 12 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="relative z-10 w-full max-w-[560px] overflow-hidden rounded-[18px] border border-white/15 bg-[#121215]/95 text-white shadow-window backdrop-blur-2xl"
          >
            {/* Header bar */}
            <div className="flex h-11 items-center justify-between border-b border-white/10 px-4">
              <div className="flex items-center gap-2">
                <Eye size={13} className="text-white/50" />
                <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-white/50">
                  Quick Look · {project.index} of {String(PROJECTS.length).padStart(2, "0")}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[9px] uppercase tracking-wider text-white/40">
                  Space / Esc to close
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close preview"
                  className="grid h-7 w-7 cursor-pointer place-items-center rounded-[6px] text-white/60 hover:bg-white/10 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Preview Cover Image */}
            <div className="relative aspect-[16/9.5] w-full overflow-hidden bg-black/40">
              <img
                key={project.cover}
                src={project.cover}
                alt={project.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-transparent to-black/30" />
              
              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/60">
                    {project.category} · {project.year}
                  </span>
                  <h3 className="text-[22px] font-medium tracking-tight text-white drop-shadow-md">
                    {project.title}
                  </h3>
                </div>
                <div className="flex gap-1.5">
                  {project.metrics[0] && (
                    <div className="rounded-[6px] border border-white/15 bg-black/40 px-2 py-1 text-right backdrop-blur-sm">
                      <span className="block text-[11px] font-medium leading-tight text-white">
                        {project.metrics[0].value}
                      </span>
                      <span className="block font-mono text-[7.5px] uppercase tracking-wider text-white/50">
                        {project.metrics[0].label}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Summary & Stack */}
            <div className="p-4 pt-3">
              <p className="font-editorial text-[16px] italic leading-[1.35] text-white/75">
                "{project.summary}"
              </p>

              {/* Short description only — the full case study stays unloaded. */}
              {project.overview && (
                <p className="mt-2 line-clamp-2 text-[12px] leading-[1.6] text-white/55">
                  {project.overview}
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.stack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-[5px] border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[9.5px] text-white/60"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Navigation & Action Footer */}
            <div className="flex items-center justify-between border-t border-white/10 bg-black/30 px-4 py-2.5">
              {/* Prev / Next controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onNavigate(prevProject.id)}
                  aria-label="Previous project (Arrow Left)"
                  className="flex h-7 items-center gap-1 rounded-[6px] border border-white/10 bg-white/5 px-2 font-mono text-[9.5px] uppercase tracking-wider text-white/70 hover:bg-white/10 hover:text-white"
                >
                  <ArrowLeft size={11} />
                  <span>Prev</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate(nextProject.id)}
                  aria-label="Next project (Arrow Right)"
                  className="flex h-7 items-center gap-1 rounded-[6px] border border-white/10 bg-white/5 px-2 font-mono text-[9.5px] uppercase tracking-wider text-white/70 hover:bg-white/10 hover:text-white"
                >
                  <span>Next</span>
                  <ArrowRight size={11} />
                </button>
              </div>

              {/* Full Case Study button */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenProject(project.id);
                }}
                className="flex h-7.5 cursor-pointer items-center gap-1.5 rounded-[7px] bg-white px-3 text-[11.5px] font-medium text-black transition-all hover:bg-white/90 active:scale-95"
              >
                <span>Open Case Study</span>
                <span className="font-mono text-[9px] opacity-60">↵</span>
                <ArrowUpRight size={13} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
