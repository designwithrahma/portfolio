import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, Calculator, Compass, FileText, FlaskConical, Gamepad2, LayoutGrid, LayoutList, Mail, Paintbrush, Settings, Sparkles, Stethoscope, Terminal, User } from "lucide-react";
import { SOCIALS } from "@/data/socials";
import { useIsTouch } from "@/hooks/useBreakpoint";
import { hasBooted } from "./BootIntro";
import { SOCIAL_ICONS } from "./icons";
import type { WindowType } from "./types";

interface Entry {
  key: string;
  label: string;
  icon: ReactNode;
  href?: string;
  onClick?: () => void;
  active?: boolean;
}

interface DockProps {
  activeWindowTypes: Set<WindowType>;
  isMobile: boolean;
  isCompact?: boolean;
  /** 0 disables magnification; higher values grow icons more under the pointer. */
  magnificationStrength?: number;
  onOpenWindow: (type: WindowType) => void;
  onToggleAppsLauncher: () => void;
  appsLauncherOpen: boolean;
}

function DockItem({
  entry,
  scale,
  magnification,
  register,
  tooltipAlign,
  isMobile,
}: {
  entry: Entry;
  scale: number;
  magnification: boolean;
  register: (key: string, element: HTMLElement | null) => void;
  tooltipAlign: "left" | "center" | "right";
  isMobile?: boolean;
}) {
  const classes = [
    "relative flex flex-col items-center justify-center cursor-pointer rounded-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50",
    isMobile ? "h-[54px] w-[56px] gap-1" : "h-11 w-11",
    entry.active ? "bg-white/15 text-white" : "text-white/72 hover:bg-white/10 hover:text-white",
  ].join(" ");
  
  const innerContent = (
    <>
      {entry.icon}
      {isMobile && <span className="text-[10px] font-medium leading-none tracking-wide">{entry.label}</span>}
    </>
  );

  const content = entry.href ? (
    <a href={entry.href} target="_blank" rel="noopener noreferrer" aria-label={entry.label} className={classes}>
      {innerContent}
    </a>
  ) : (
    <button type="button" onClick={entry.onClick} aria-label={entry.label} aria-pressed={entry.active} className={classes}>
      {innerContent}
    </button>
  );

  return (
    <div ref={(element) => register(entry.key, element)} className="group relative">
      <motion.div
        style={{ transformOrigin: "50% 100%" }}
        animate={{ scale, y: -(scale - 1) * 34 }}
        transition={{ type: "spring", stiffness: 480, damping: 26, mass: 0.6 }}
        whileHover={magnification ? undefined : { y: -6, scale: 1.12 }}
        whileTap={{ scale: 0.9 }}
      >
        {content}
      </motion.div>
      <span
        className={`pointer-events-none absolute -top-9 z-50 translate-y-1 whitespace-nowrap rounded-[7px] border border-white/10 bg-[#101013]/95 px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/85 opacity-0 shadow-lg backdrop-blur transition-all group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 ${
          tooltipAlign === "left"
            ? "left-0"
            : tooltipAlign === "right"
              ? "right-0"
              : "left-1/2 -translate-x-1/2"
        }`}
      >
        {entry.label}
      </span>
      {entry.active && <span className="absolute -bottom-[6px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-white/80" />}
    </div>
  );
}

const Separator = () => <span aria-hidden className="mx-1 h-7 w-px shrink-0 bg-white/10" />;

export function Dock({
  activeWindowTypes,
  isMobile,
  isCompact = false,
  magnificationStrength = 0.3,
  onOpenWindow,
  onToggleAppsLauncher,
  appsLauncherOpen,
}: DockProps) {
  const reduced = useReducedMotion();
  const touch = useIsTouch();
  const magnification = !touch && !reduced && magnificationStrength > 0;
  const [scales, setScales] = useState<Record<string, number> | null>(null);
  const itemRefs = useRef(new Map<string, HTMLElement>());
  const frameRef = useRef<number | null>(null);
  const pointerXRef = useRef(0);

  /*
    The full mobile set (7 items ≈ 344px) only fits once the viewport gives it
    room. Below this width the dock keeps the four primary destinations so it
    never clips or overflows; every other app stays reachable through the
    system menu, command palette and desktop icons.
  */
  const [veryNarrow, setVeryNarrow] = useState(() => window.innerWidth < 350);
  useEffect(() => {
    const onResize = () => setVeryNarrow(window.innerWidth < 350);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const socialIds = isMobile
    ? ["instagram", "github"]
    : isCompact
      ? ["instagram", "github", "linkedin"]
      : ["instagram", "x", "behance", "github", "linkedin"];
  const socialEntries: Entry[] = SOCIALS.filter((social) => socialIds.includes(social.id)).map((social) => {
    const Icon = SOCIAL_ICONS[social.id];
    return { key: social.id, label: social.label, href: social.href, icon: <Icon size={18} /> };
  });

  const core: Entry[] = [
    { key: "about", label: "About", icon: <User size={isMobile ? 22 : 19} />, onClick: () => onOpenWindow("about"), active: activeWindowTypes.has("about") },
    { key: "work", label: "Work", icon: <LayoutGrid size={isMobile ? 22 : 18} />, onClick: () => onOpenWindow("work"), active: activeWindowTypes.has("work") || activeWindowTypes.has("project") },
    { key: "services", label: "Services", icon: <LayoutList size={isMobile ? 22 : 18} />, onClick: () => onOpenWindow("services"), active: activeWindowTypes.has("services") },
    { key: "apps", label: "Apps", icon: <Compass size={isMobile ? 22 : 18} />, onClick: onToggleAppsLauncher, active: appsLauncherOpen },
  ];

  const desktopApps: Entry[] = [
    { key: "terminal", label: "Terminal", icon: <Terminal size={18} />, onClick: () => onOpenWindow("terminal"), active: activeWindowTypes.has("terminal") },
    { key: "notes", label: "Journal", icon: <BookOpen size={18} />, onClick: () => onOpenWindow("notes"), active: activeWindowTypes.has("notes") },
    { key: "resume", label: "Resume", icon: <FileText size={18} />, onClick: () => onOpenWindow("resume"), active: activeWindowTypes.has("resume") },
    { key: "mail", label: "Reviews", icon: <Sparkles size={18} />, onClick: () => onOpenWindow("mail"), active: activeWindowTypes.has("mail") },
    { key: "estimator", label: "Estimator", icon: <Calculator size={18} />, onClick: () => onOpenWindow("estimator"), active: activeWindowTypes.has("estimator") },
    { key: "paint", label: "Paint", icon: <Paintbrush size={18} />, onClick: () => onOpenWindow("paint"), active: activeWindowTypes.has("paint") },
    { key: "arcade", label: "Arcade", icon: <Gamepad2 size={18} />, onClick: () => onOpenWindow("arcade"), active: activeWindowTypes.has("arcade") },
    { key: "diagnostics", label: "Diagnostics", icon: <Stethoscope size={18} />, onClick: () => onOpenWindow("diagnostics"), active: activeWindowTypes.has("diagnostics") },
    { key: "playground", label: "Physics", icon: <FlaskConical size={18} />, onClick: () => onOpenWindow("playground"), active: activeWindowTypes.has("playground") },
  ];

  const mobileExtras: (Entry | "separator")[] = veryNarrow
    ? []
    : [
        { key: "notes", label: "Journal", icon: <BookOpen size={18} />, onClick: () => onOpenWindow("notes"), active: activeWindowTypes.has("notes") },
        ...socialEntries,
      ];

  const entries: (Entry | "separator")[] = isMobile
    ? [
        ...core,
        ...mobileExtras,
        { key: "contact", label: "Contact", icon: <Mail size={22} />, onClick: () => onOpenWindow("contact"), active: activeWindowTypes.has("contact") },
      ]
    : isCompact
      ? [
          ...core,
          ...desktopApps,
          "separator",
          ...socialEntries,
          "separator",
          { key: "settings", label: "Settings", icon: <Settings size={18} />, onClick: () => onOpenWindow("settings"), active: activeWindowTypes.has("settings") },
          { key: "contact", label: "Contact", icon: <Mail size={18} />, onClick: () => onOpenWindow("contact"), active: activeWindowTypes.has("contact") },
        ]
      : [
          ...core,
          ...desktopApps,
          "separator",
          ...socialEntries,
          "separator",
          { key: "settings", label: "Settings", icon: <Settings size={18} />, onClick: () => onOpenWindow("settings"), active: activeWindowTypes.has("settings") },
          { key: "contact", label: "Contact", icon: <Mail size={18} />, onClick: () => onOpenWindow("contact"), active: activeWindowTypes.has("contact") },
        ];

  const register = (key: string, element: HTMLElement | null) => {
    if (element) itemRefs.current.set(key, element);
    else itemRefs.current.delete(key);
  };

  const onPointerMove = (event: ReactPointerEvent) => {
    if (!magnification) return;
    pointerXRef.current = event.clientX;
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const next: Record<string, number> = {};
      itemRefs.current.forEach((element, key) => {
        const rect = element.getBoundingClientRect();
        const distance = Math.abs(pointerXRef.current - (rect.left + rect.width / 2));
        next[key] = 1 + magnificationStrength * Math.max(0, 1 - distance / 100);
      });
      setScales(next);
    });
  };

  useEffect(() => () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
  }, []);

  const itemEntries = entries.filter((entry): entry is Entry => entry !== "separator");
  const firstKey = itemEntries[0]?.key;
  const lastKey = itemEntries[itemEntries.length - 1]?.key;

  return (
    <motion.nav
      aria-label="Desktop dock"
      className="fixed left-1/2 z-[55] -translate-x-1/2"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 18px)" }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduced ? 0 : hasBooted() ? 0.18 : 1.12, type: "spring", stiffness: 220, damping: 24 }}
      onPointerMove={onPointerMove}
      onPointerLeave={() => {
        if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
        setScales(null);
      }}
    >
      <div className="shadow-dock flex max-w-[calc(100vw-24px)] items-center gap-1 rounded-[18px] border border-white/10 bg-[#141417]/80 p-1.5 backdrop-blur-xl">
        {entries.map((entry, index) =>
          entry === "separator" ? (
            <Separator key={`separator-${index}`} />
          ) : (
            <DockItem
              key={entry.key}
              entry={entry}
              scale={scales?.[entry.key] ?? 1}
              magnification={magnification}
              register={register}
              tooltipAlign={entry.key === firstKey ? "left" : entry.key === lastKey ? "right" : "center"}
              isMobile={isMobile}
            />
          ),
        )}
      </div>
    </motion.nav>
  );
}