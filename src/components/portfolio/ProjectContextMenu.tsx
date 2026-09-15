import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Code2, ExternalLink, Eye, Info, Link2, SquareArrowOutUpRight } from "lucide-react";
import { getProject } from "@/data/projects";

interface Props {
  projectId: string;
  x: number;
  y: number;
  onClose: () => void;
  onOpen: (id: string) => void;
  onQuickLook: (id: string) => void;
  onCopyLink: (id: string) => void;
}

const ITEM =
  "flex h-8 w-full cursor-pointer items-center gap-2.5 rounded-[7px] px-2 text-left text-[12px] font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white";

/** Right-click menu for a project icon. Broken actions are never rendered. */
export function ProjectContextMenu({ projectId, x, y, onClose, onOpen, onQuickLook, onCopyLink }: Props) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const project = getProject(projectId);

  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) onClose();
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
  }, [onClose]);

  if (!project) return null;

  const deepLink = `${window.location.origin}${window.location.pathname}#/work/${project.id}`;
  const left = Math.max(8, Math.min(x, window.innerWidth - 224));
  const top = Math.max(8, Math.min(y, window.innerHeight - 290));

  return (
    <motion.div
      ref={ref}
      role="menu"
      aria-label={`${project.title} actions`}
      onContextMenu={(event) => event.preventDefault()}
      initial={{ opacity: 0, scale: reduced ? 1 : 0.96, y: reduced ? 0 : 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: reduced ? 1 : 0.97, y: reduced ? 0 : 3 }}
      transition={{ duration: reduced ? 0.01 : 0.13, ease: [0.22, 1, 0.36, 1] }}
      style={{ left, top }}
      className="shadow-dock fixed z-[84] w-[216px] rounded-[12px] border border-white/12 bg-[#101013]/95 p-1.5 backdrop-blur-xl"
    >
      <div className="border-b border-white/10 px-2 pb-1.5 pt-1">
        <p className="truncate text-[12px] font-semibold text-white">{project.title}</p>
        <p className="truncate font-mono text-[9px] uppercase tracking-[0.16em] text-white/38">
          {project.category} · {project.year}
        </p>
      </div>

      <div className="pt-1">
        <button type="button" role="menuitem" onClick={() => { onOpen(project.id); onClose(); }} className={ITEM}>
          <SquareArrowOutUpRight size={14} className="text-white/50" />
          <span className="flex-1">Open</span>
        </button>
        <button type="button" role="menuitem" onClick={() => { onQuickLook(project.id); onClose(); }} className={ITEM}>
          <Eye size={14} className="text-white/50" />
          <span className="flex-1">Quick Look</span>
          <span className="rounded-[5px] border border-white/15 px-1.5 py-0.5 font-mono text-[9px] text-white/45">Space</span>
        </button>
        <button type="button" role="menuitem" onClick={() => { onCopyLink(project.id); onClose(); }} className={ITEM}>
          <Link2 size={14} className="text-white/50" />
          <span className="flex-1">Copy Project Link</span>
        </button>
      </div>

      {(project.live || project.repo) && <div className="my-1 h-px bg-white/10" />}

      {project.live && (
        <a
          href={project.live}
          target="_blank"
          rel="noopener noreferrer"
          role="menuitem"
          onClick={onClose}
          className={ITEM}
        >
          <ExternalLink size={14} className="text-white/50" />
          <span className="flex-1">Open Live Site</span>
        </a>
      )}
      {project.repo && (
        <a
          href={project.repo}
          target="_blank"
          rel="noopener noreferrer"
          role="menuitem"
          onClick={onClose}
          className={ITEM}
        >
          <Code2 size={14} className="text-white/50" />
          <span className="flex-1">Open Repository</span>
        </a>
      )}

      <div className="my-1 h-px bg-white/10" />
      <a
        href={deepLink}
        target="_blank"
        rel="noopener noreferrer"
        role="menuitem"
        onClick={onClose}
        className={ITEM}
      >
        <Info size={14} className="text-white/50" />
        <span className="flex-1">Open in New Tab</span>
      </a>
    </motion.div>
  );
}
