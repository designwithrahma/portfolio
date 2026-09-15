import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ExternalLink, Eye, Link2, SquareArrowOutUpRight } from "lucide-react";
import { getProject } from "@/data/projects";

interface Props {
  projectId: string | null;
  onClose: () => void;
  onOpen: (id: string) => void;
  onQuickLook: (id: string) => void;
  onCopyLink: (id: string) => void;
}

const ROW =
  "flex min-h-[52px] w-full cursor-pointer items-center gap-3 rounded-[10px] px-3 text-left text-[14px] font-medium text-white/85 transition-colors active:bg-white/10";

/**
 * Touch replacement for the desktop right-click menu.
 * Presented as a bottom sheet so every action stays thumb-reachable.
 */
export function MobileActionSheet({ projectId, onClose, onOpen, onQuickLook, onCopyLink }: Props) {
  const reduced = useReducedMotion();
  const project = projectId ? getProject(projectId) : null;

  useEffect(() => {
    if (!projectId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [projectId, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <div className="fixed inset-0 z-[96] flex items-end" role="dialog" aria-modal="true" aria-label={`${project.title} actions`}>
          <motion.button
            type="button"
            aria-label="Dismiss actions"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.01 : 0.18 }}
            className="absolute inset-0 cursor-default bg-black/55 backdrop-blur-[3px]"
          />

          <motion.div
            initial={{ y: reduced ? 0 : "100%", opacity: reduced ? 0 : 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: reduced ? 0 : "100%", opacity: reduced ? 0 : 1 }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
            className="relative z-10 w-full rounded-t-[18px] border-t border-white/12 bg-[#101013]/97 p-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] text-white backdrop-blur-2xl"
          >
            <span aria-hidden className="mx-auto mb-3 block h-1 w-9 rounded-full bg-white/20" />

            <div className="mb-2 flex items-center gap-3 px-2">
              <img src={project.icon} alt="" className="h-10 w-10 rounded-[9px] object-cover ring-1 ring-white/15" />
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-semibold">{project.title}</span>
                <span className="block truncate font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
                  {project.category} · {project.year}
                </span>
              </span>
            </div>

            <button type="button" onClick={() => { onOpen(project.id); onClose(); }} className={ROW}>
              <SquareArrowOutUpRight size={17} className="text-white/50" />
              Open project
            </button>
            <button type="button" onClick={() => { onQuickLook(project.id); onClose(); }} className={ROW}>
              <Eye size={17} className="text-white/50" />
              Quick Look
            </button>
            <button type="button" onClick={() => { onCopyLink(project.id); onClose(); }} className={ROW}>
              <Link2 size={17} className="text-white/50" />
              Copy link
            </button>
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className={ROW}
              >
                <ExternalLink size={17} className="text-white/50" />
                Open live site
              </a>
            )}

            <button
              type="button"
              onClick={onClose}
              className="mt-2 min-h-[48px] w-full cursor-pointer rounded-[10px] border border-white/10 text-[13px] font-medium text-white/65 active:bg-white/10"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
