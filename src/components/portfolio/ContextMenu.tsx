import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Keyboard,
  LayoutGrid,
  Mail,
  RotateCcw,
  User,
  Volume2,
  VolumeX,
  Eye,
  Terminal,
  BookOpen,
  FileText,
  Settings,
  Sparkles,
  ArrowDownAZ,
  Calendar,
  Layers,
  Paintbrush,
  Gamepad2,
  Calculator,
  Activity,
  Sliders,
  AlignStartVertical,
  Folder,
  LayoutList,
  RefreshCw,
} from "lucide-react";
import { PORTFOLIO_CONFIG } from "@/config/portfolio";
import { DESKTOP_FOLDERS } from "@/config/folders";

interface Props {
  x: number;
  y: number;
  soundsOn: boolean;
  hasCustomLayout: boolean;
  onClose: () => void;
  onOpenAbout: () => void;
  onOpenWork: () => void;
  onOpenContact: () => void;
  onOpenTerminal: () => void;
  onOpenNotes: () => void;
  onOpenResume: () => void;
  onOpenMail: () => void;
  onOpenPaint: () => void;
  onOpenArcade: () => void;
  onOpenEstimator: () => void;
  onOpenDiagnostics: () => void;
  onOpenPlayground: () => void;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
  onOpenServices?: () => void;
  onQuickLook?: () => void;
  onToggleSounds: () => void;
  onResetIcons: () => void;
  onSortIcons?: (by: "name" | "year" | "category") => void;
  onCleanUpIcons?: () => void;
  onRefreshDesktop?: () => void;
  onOpenFolder?: (folderId: string) => void;
}

function Kbd({ children }: { children: string }) {
  return (
    <span className="rounded-[5px] border border-white/15 px-1.5 py-0.5 font-mono text-[9px] tracking-wide text-white/50">
      {children}
    </span>
  );
}

const itemCls =
  "flex h-8 w-full cursor-pointer items-center gap-2.5 rounded-[7px] px-2 text-left text-[12px] font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white";

export function ContextMenu({
  x,
  y,
  soundsOn,
  hasCustomLayout,
  onClose,
  onOpenAbout,
  onOpenWork,
  onOpenContact,
  onOpenTerminal,
  onOpenNotes,
  onOpenResume,
  onOpenMail,
  onOpenPaint,
  onOpenArcade,
  onOpenEstimator,
  onOpenDiagnostics,
  onOpenPlayground,
  onOpenSettings,
  onOpenShortcuts,
  onOpenServices,
  onQuickLook,
  onToggleSounds,
  onResetIcons,
  onSortIcons,
  onCleanUpIcons,
  onRefreshDesktop,
  onOpenFolder,
}: Props) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onBlur = () => onClose();
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("blur", onBlur);
    };
  }, [onClose]);

  const left = Math.max(8, Math.min(x, window.innerWidth - 240));
  const top = Math.max(8, Math.min(y, window.innerHeight - 480));

  return (
    <motion.div
      ref={ref}
      role="menu"
      aria-label="Desktop context menu"
      onContextMenu={(e) => e.preventDefault()}
      initial={{ opacity: 0, scale: reduced ? 1 : 0.94, y: reduced ? 0 : 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: reduced ? 1 : 0.96, y: reduced ? 0 : 4, transition: { duration: 0.12 } }}
      transition={{ type: "spring", stiffness: 520, damping: 32 }}
      style={{ left, top }}
      className="shadow-dock fixed z-[80] w-[234px] rounded-[14px] border border-white/10 bg-[#101013]/95 p-1.5 backdrop-blur-xl max-h-[85vh] overflow-y-auto os-scroll select-none"
    >
      {/* Primary Apps */}
      <button type="button" role="menuitem" onClick={() => { onOpenAbout(); onClose(); }} className={itemCls}>
        <User size={14} className="text-white/55" />
        <span className="flex-1">About {PORTFOLIO_CONFIG.identity.name}</span>
        <Kbd>A</Kbd>
      </button>
      <button type="button" role="menuitem" onClick={() => { onOpenWork(); onClose(); }} className={itemCls}>
        <LayoutGrid size={14} className="text-white/55" />
        <span className="flex-1">Projects &amp; Work</span>
        <Kbd>W</Kbd>
      </button>
      {onOpenServices && (
        <button type="button" role="menuitem" onClick={() => { onOpenServices(); onClose(); }} className={itemCls}>
          <LayoutList size={14} className="text-white/55" />
          <span className="flex-1">Services</span>
        </button>
      )}
      <button type="button" role="menuitem" onClick={() => { onOpenTerminal(); onClose(); }} className={itemCls}>
        <Terminal size={14} className="text-emerald-400" />
        <span className="flex-1">Terminal CLI</span>
        <Kbd>T</Kbd>
      </button>
      <button type="button" role="menuitem" onClick={() => { onOpenNotes(); onClose(); }} className={itemCls}>
        <BookOpen size={14} className="text-white/55" />
        <span className="flex-1">Journal &amp; Notes</span>
      </button>
      <button type="button" role="menuitem" onClick={() => { onOpenResume(); onClose(); }} className={itemCls}>
        <FileText size={14} className="text-white/55" />
        <span className="flex-1">Curriculum Vitae</span>
      </button>
      <button type="button" role="menuitem" onClick={() => { onOpenMail(); onClose(); }} className={itemCls}>
        <Sparkles size={14} className="text-amber-400" />
        <span className="flex-1">Client Reviews</span>
      </button>

      <div className="my-1 h-px bg-white/10" />

      {/* Creative & Lab Tools */}
      <button type="button" role="menuitem" onClick={() => { onOpenEstimator(); onClose(); }} className={itemCls}>
        <Calculator size={14} className="text-emerald-400" />
        <span className="flex-1">Budget Estimator</span>
      </button>
      <button type="button" role="menuitem" onClick={() => { onOpenPaint(); onClose(); }} className={itemCls}>
        <Paintbrush size={14} className="text-pink-400" />
        <span className="flex-1">Doodle Guestbook</span>
      </button>
      <button type="button" role="menuitem" onClick={() => { onOpenArcade(); onClose(); }} className={itemCls}>
        <Gamepad2 size={14} className="text-cyan-400" />
        <span className="flex-1">Mini Arcade Game</span>
      </button>
      <button type="button" role="menuitem" onClick={() => { onOpenDiagnostics(); onClose(); }} className={itemCls}>
        <Activity size={14} className="text-emerald-400" />
        <span className="flex-1">System Diagnostics</span>
      </button>
      <button type="button" role="menuitem" onClick={() => { onOpenPlayground(); onClose(); }} className={itemCls}>
        <Sliders size={14} className="text-purple-400" />
        <span className="flex-1">Physics Lab</span>
      </button>
      <button type="button" role="menuitem" onClick={() => { onOpenContact(); onClose(); }} className={itemCls}>
        <Mail size={14} className="text-white/55" />
        <span className="flex-1">Say Hello</span>
        <Kbd>C</Kbd>
      </button>

      {onQuickLook && (
        <button type="button" role="menuitem" onClick={() => { onQuickLook(); onClose(); }} className={itemCls}>
          <Eye size={14} className="text-white/55" />
          <span className="flex-1">Quick Look</span>
          <Kbd>Space</Kbd>
        </button>
      )}

      <div className="my-1 h-px bg-white/10" />

      {/* Sorting Sub-Group */}
      {onSortIcons && (
        <>
          <button type="button" role="menuitem" onClick={() => { onSortIcons("name"); onClose(); }} className={itemCls}>
            <ArrowDownAZ size={14} className="text-white/55" />
            <span className="flex-1">Sort by Name</span>
          </button>
          <button type="button" role="menuitem" onClick={() => { onSortIcons("year"); onClose(); }} className={itemCls}>
            <Calendar size={14} className="text-white/55" />
            <span className="flex-1">Sort by Year</span>
          </button>
          <button type="button" role="menuitem" onClick={() => { onSortIcons("category"); onClose(); }} className={itemCls}>
            <Layers size={14} className="text-white/55" />
            <span className="flex-1">Sort by Category</span>
          </button>
          {onCleanUpIcons && (
            <button type="button" role="menuitem" onClick={() => { onCleanUpIcons(); onClose(); }} className={itemCls}>
              <AlignStartVertical size={14} className="text-white/55" />
              <span className="flex-1">Clean Up Icons</span>
            </button>
          )}
          <div className="my-1 h-px bg-white/10" />
        </>
      )}

      {/* Desktop folders */}
      {onOpenFolder && DESKTOP_FOLDERS.length > 0 && (
        <>
          {DESKTOP_FOLDERS.map((folder) => (
            <button
              key={folder.id}
              type="button"
              role="menuitem"
              onClick={() => { onOpenFolder(folder.id); onClose(); }}
              className={itemCls}
            >
              <Folder size={14} className="text-white/55" />
              <span className="flex-1">{folder.title}</span>
              <span className="font-mono text-[9px] text-white/35">{folder.projectIds.length}</span>
            </button>
          ))}
          <div className="my-1 h-px bg-white/10" />
        </>
      )}

      {/* Controls & Preferences */}
      <button type="button" role="menuitem" onClick={() => { onOpenSettings(); onClose(); }} className={itemCls}>
        <Settings size={14} className="text-white/55" />
        <span className="flex-1">System Settings</span>
      </button>


      <button
        type="button"
        role="menuitemcheckbox"
        aria-checked={soundsOn}
        onClick={onToggleSounds}
        className={itemCls}
      >
        {soundsOn ? <Volume2 size={14} className="text-white/55" /> : <VolumeX size={14} className="text-white/55" />}
        <span className="flex-1">UI Sound FX</span>
        <span className={["font-mono text-[9px] uppercase tracking-[0.18em]", soundsOn ? "text-emerald-300" : "text-white/35"].join(" ")}>
          {soundsOn ? "On" : "Off"}
        </span>
      </button>

      <button
        type="button"
        role="menuitem"
        onClick={() => { onResetIcons(); onClose(); }}
        disabled={!hasCustomLayout}
        className={hasCustomLayout ? itemCls : `${itemCls} cursor-default text-white/30 hover:bg-transparent hover:text-white/30`}
      >
        <RotateCcw size={14} className="text-white/55" />
        <span className="flex-1">Reset Icon Positions</span>
      </button>

      {onRefreshDesktop && (
        <button type="button" role="menuitem" onClick={() => { onRefreshDesktop(); onClose(); }} className={itemCls}>
          <RefreshCw size={14} className="text-white/55" />
          <span className="flex-1">Refresh Desktop</span>
        </button>
      )}

      <div className="my-1 h-px bg-white/10" />

      <button type="button" role="menuitem" onClick={() => { onOpenShortcuts(); onClose(); }} className={itemCls}>
        <Keyboard size={14} className="text-white/45" />
        <span className="flex-1">Keyboard Shortcuts</span>
        <Kbd>?</Kbd>
      </button>
    </motion.div>
  );
}
