import { useEffect, type ComponentProps, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ManagedWindow, WindowType } from "./types";
import { WindowShell } from "./WindowShell";
import { ProjectWindow } from "./windows/ProjectWindow";
import { AboutWindow } from "./windows/AboutWindow";
import { WorkWindow } from "./windows/WorkWindow";
import { ContactWindow } from "./windows/ContactWindow";
import { TerminalWindow } from "./windows/TerminalWindow";
import { NotesWindow } from "./windows/NotesWindow";
import { ResumeWindow } from "./windows/ResumeWindow";
import { MailWindow } from "./windows/MailWindow";
import { SettingsWindow } from "./windows/SettingsWindow";
import { ShortcutsModal } from "./windows/ShortcutsModal";
import { PaintWindow } from "./windows/PaintWindow";
import { ArcadeWindow } from "./windows/ArcadeWindow";
import { EstimatorWindow } from "./windows/EstimatorWindow";
import { DiagnosticsWindow } from "./windows/DiagnosticsWindow";
import { PlaygroundWindow } from "./windows/PlaygroundWindow";
import { ServicesWindow } from "./windows/ServicesWindow";
import { FolderWindow } from "./windows/FolderWindow";
import { getFolder } from "@/config/folders";
import { getProject } from "@/data/projects";
import { PORTFOLIO_CONFIG } from "@/config/portfolio";

interface WindowManagerProps {
  windows: ManagedWindow[];
  minimizedIds?: Set<string>;
  activeWindowId: string | null;
  isMobile: boolean;
  origin: { x: number; y: number } | null;
  soundsOn: boolean;
  suppressEscape?: boolean;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onFocus: (id: string) => void;
  onOpenProject: (id: string, opts?: { from?: "work" }) => void;
  onOpenWindow: (type: WindowType) => void;
  onOpenContactWithScope?: (msg: string) => void;
  onToggleSounds: () => void;
  onResetLayout: () => void;
  /** Appearance + motion preferences forwarded to the Settings app. */
  appearance?: Omit<
    ComponentProps<typeof SettingsWindow>,
    "soundsOn" | "onToggleSounds" | "onResetLayout" | "onOpenShortcuts"
  >;
}

const METAS: Record<string, { title: string; kicker: string }> = {
  about: { title: "About", kicker: `${PORTFOLIO_CONFIG.identity.mark} — PROFILE` },
  work: { title: "Selected Work", kicker: "INDEX — 2024 → 2026" },
  contact: { title: "Contact", kicker: "SAY HELLO" },
  terminal: { title: "Terminal Shell", kicker: "CLI ENGINE v2.6" },
  notes: { title: "Notes & Essays", kicker: "JOURNAL OF CRAFT" },
  resume: { title: "Curriculum Vitae", kicker: "DOCUMENT VIEWER" },
  mail: { title: "Client Testimonials", kicker: "VERIFIED INBOX" },
  settings: { title: "System Preferences", kicker: "SETTINGS & CONTROLS" },
  shortcuts: { title: "Keyboard Hotkeys", kicker: "SHORTCUTS GUIDE" },
  paint: { title: "Paint & Guestbook", kicker: "CANVAS DOODLE PAD" },
  arcade: { title: "MONO//SHIFT Arcade", kicker: "RETRO RUNNER GAME" },
  estimator: { title: "Scope & Budget Calculator", kicker: "ESTIMATOR TOOL" },
  diagnostics: { title: "System Diagnostics", kicker: "TELEMETRY & SPECS" },
  playground: { title: "Physics Lab", kicker: "MOTION PLAYGROUND" },
  services: { title: "Services", kicker: "STUDIO OFFERINGS" },
};

export function WindowManager({
  windows,
  minimizedIds = new Set<string>(),
  activeWindowId,
  isMobile,
  origin,
  soundsOn,
  suppressEscape,
  onClose,
  onMinimize,
  onFocus,
  onOpenProject,
  onOpenWindow,
  onOpenContactWithScope,
  onToggleSounds,
  onResetLayout,
  appearance,
}: WindowManagerProps) {
  const reduced = useReducedMotion();
  const visibleWindows = windows.filter((item) => !minimizedIds.has(item.id));
  const topWindow =
    visibleWindows.find((item) => item.id === activeWindowId) ||
    visibleWindows[visibleWindows.length - 1];

  /* Escape closes top active window (palette grabs Escape first) */
  useEffect(() => {
    if (!topWindow) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !suppressEscape) {
        onClose(topWindow.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [topWindow, suppressEscape, onClose]);

  /** Resolve window chrome + body for a managed window. */
  const resolve = (
    win: ManagedWindow,
  ): { title: string; kicker: string; body: ReactNode; onBack?: () => void } | null => {
    switch (win.type) {
      case "project": {
        const project = getProject(win.projectId);
        return {
          title: project?.title ?? "Project",
          kicker: `CASE FILE — ${project?.index ?? ""}`,
          onBack: win.from === "work" ? () => onOpenWindow("work") : undefined,
          body: (
            <ProjectWindow
              id={win.projectId}
              onOpenProject={(id) => onOpenProject(id)}
              isActive={win.id === activeWindowId}
            />
          ),
        };
      }
      case "about":
        return { ...METAS.about, body: <AboutWindow onOpenContact={() => onOpenWindow("contact")} /> };
      case "work":
        return {
          ...METAS.work,
          body: <WorkWindow onOpenProject={(id) => onOpenProject(id, { from: "work" })} />,
        };
      case "contact":
        return { ...METAS.contact, body: <ContactWindow /> };
      case "terminal":
        return {
          ...METAS.terminal,
          body: (
            <TerminalWindow
              onOpenProject={onOpenProject}
              onOpenWindow={onOpenWindow}
              onToggleSounds={onToggleSounds}
            />
          ),
        };
      case "notes":
        return { ...METAS.notes, body: <NotesWindow /> };
      case "resume":
        return { ...METAS.resume, body: <ResumeWindow /> };
      case "mail":
        return { ...METAS.mail, body: <MailWindow /> };
      case "settings":
        return {
          ...METAS.settings,
          body: (
            <SettingsWindow
              {...appearance}
              soundsOn={soundsOn}
              onToggleSounds={onToggleSounds}
              onResetLayout={onResetLayout}
              onOpenShortcuts={() => onOpenWindow("shortcuts")}
            />
          ),
        };
      case "paint":
        return { ...METAS.paint, body: <PaintWindow /> };
      case "arcade":
        return { ...METAS.arcade, body: <ArcadeWindow /> };
      case "estimator":
        return {
          ...METAS.estimator,
          body: (
            <EstimatorWindow
              onOpenContactWithScope={(scopeMsg) => {
                if (onOpenContactWithScope) onOpenContactWithScope(scopeMsg);
                else onOpenWindow("contact");
              }}
            />
          ),
        };
      case "diagnostics":
        return { ...METAS.diagnostics, body: <DiagnosticsWindow /> };
      case "playground":
        return { ...METAS.playground, body: <PlaygroundWindow /> };
      case "services":
        return {
          ...METAS.services,
          body: (
            <ServicesWindow
              onOpenContact={() => onOpenWindow("contact")}
              onOpenEstimator={() => onOpenWindow("estimator")}
            />
          ),
        };
      case "folder": {
        const folder = getFolder(win.folderId);
        return {
          title: folder?.title ?? "Folder",
          kicker: "DESKTOP FOLDER",
          body: <FolderWindow folderId={win.folderId} onOpenProject={(id) => onOpenProject(id)} />,
        };
      }
      default:
        return null;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {visibleWindows.length > 0 && !isMobile && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.18 } }}
            transition={{ duration: reduced ? 0.01 : 0.3 }}
            onClick={() => topWindow && onClose(topWindow.id)}
            aria-hidden
            className="fixed inset-0 z-50 bg-black/25 backdrop-blur-[2.5px]"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {windows.map((win, idx) => {
          /* Shortcuts stays a centered modal, not a resizable window. */
          if (win.type === "shortcuts") {
            return <ShortcutsModal key={win.id} isOpen onClose={() => onClose(win.id)} />;
          }

          const resolved = resolve(win);
          if (!resolved) return null;

          const isActive = win.id === activeWindowId;
          /* Controlled stack: inactive windows stay ordered, active sits on top. */
          const zIndex = isActive ? 90 : 60 + idx;

          return (
            <WindowShell
              key={win.id}
              windowId={win.id}
              windowIndex={idx}
              minimized={minimizedIds.has(win.id)}
              isMobile={isMobile}
              title={resolved.title}
              kicker={resolved.kicker}
              onClose={() => onClose(win.id)}
              onMinimize={() => onMinimize(win.id)}
              onBack={resolved.onBack}
              onFocus={() => onFocus(win.id)}
              zIndex={zIndex}
              origin={win.type === "project" ? origin : null}
            >
              {resolved.body}
            </WindowShell>
          );
        })}
      </AnimatePresence>
    </>
  );
}
