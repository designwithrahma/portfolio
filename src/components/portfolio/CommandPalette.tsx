import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  CornerDownLeft,
  Images,
  LayoutGrid,
  Mail,
  RotateCcw,
  Search,
  User,
  Volume2,
  Eye,
  Terminal,
  BookOpen,
  FileText,
  Sparkles,
  Settings,
  Keyboard,
  Paintbrush,
  Gamepad2,
  Calculator,
  Activity,
  Sliders,
  Folder,
  LayoutList,
  Link as LinkIcon,
  Waves,
  CloudFog,
  MonitorPause,
} from "lucide-react";
import { PROJECTS } from "@/data/projects";
import { PORTFOLIO_CONFIG } from "@/config/portfolio";
import { DESKTOP_FOLDERS } from "@/config/folders";
import { SOCIALS } from "@/data/socials";

const RANK_KEY = "rahma-command-rank";

const loadRank = (): Record<string, number> => {
  try {
    return JSON.parse(localStorage.getItem(RANK_KEY) ?? "{}") as Record<string, number>;
  } catch {
    return {};
  }
};

const recordRank = (id: string) => {
  try {
    const r = loadRank();
    r[id] = (r[id] ?? 0) + 1;
    localStorage.setItem(RANK_KEY, JSON.stringify(r));
    return r[id];
  } catch {
    return 0;
  }
};

interface PaletteItem {
  id: string;
  label: string;
  hint: string;
  keywords: string;
  icon: ReactNode;
  run: () => void;
}

interface Props {
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
  onOpenProject: (id: string) => void;
  onQuickLook?: (id: string) => void;
  onNextWallpaper: () => void;
  onToggleSounds: () => void;
  onResetIcons: () => void;
  onOpenFolder?: (folderId: string) => void;
  onToggleMotion?: () => void;
  onCycleWeather?: () => void;
  onStartScreensaver?: () => void;
}

/**
 * Lightweight subsequence fuzzy match. Returns a score plus the matched
 * character indices so results can highlight without extra dependencies.
 */
function fuzzyMatch(text: string, query: string): { score: number; indices: number[] } | null {
  if (!query) return { score: 0, indices: [] };
  const haystack = text.toLowerCase();
  const needle = query.toLowerCase();

  const direct = haystack.indexOf(needle);
  if (direct !== -1) {
    const indices = Array.from({ length: needle.length }, (_, offset) => direct + offset);
    /* Prefix matches rank highest, then earlier substrings. */
    return { score: 1000 - direct * 4 - (direct === 0 ? 0 : 20), indices };
  }

  const indices: number[] = [];
  let cursor = 0;
  let score = 0;
  let streak = 0;

  for (const character of needle) {
    const found = haystack.indexOf(character, cursor);
    if (found === -1) return null;
    streak = found === cursor && cursor > 0 ? streak + 1 : 0;
    score += 12 + streak * 6 - Math.min(found - cursor, 12);
    indices.push(found);
    cursor = found + 1;
  }

  return { score, indices };
}

/** Renders a label with fuzzy-matched characters emphasised. */
function Highlighted({ text, indices }: { text: string; indices: number[] }) {
  if (!indices.length) return <>{text}</>;
  const marked = new Set(indices);
  return (
    <>
      {text.split("").map((character, position) =>
        marked.has(position) ? (
          <span key={position} className="text-white underline decoration-white/35 underline-offset-2">
            {character}
          </span>
        ) : (
          <span key={position}>{character}</span>
        ),
      )}
    </>
  );
}

export function CommandPalette({
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
  onOpenProject,
  onQuickLook,
  onNextWallpaper,
  onToggleSounds,
  onResetIcons,
  onOpenFolder,
  onToggleMotion,
  onCycleWeather,
  onStartScreensaver,
}: Props) {
  const reduced = useReducedMotion();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const rankRef = useRef<Record<string, number>>(loadRank());

  const items = useMemo<PaletteItem[]>(() => {
    const base: PaletteItem[] = [
      { id: "about", label: `About ${PORTFOLIO_CONFIG.identity.name}`, hint: "Window · A", keywords: "about profile bio who creator background", icon: <User size={15} className="text-white/55" />, run: onOpenAbout },
      { id: "work", label: "Selected Work & Projects", hint: "Window · W", keywords: "work projects index portfolio gallery apps", icon: <LayoutGrid size={15} className="text-white/55" />, run: onOpenWork },
      { id: "terminal", label: "Terminal Shell CLI", hint: "App · T", keywords: "terminal cli shell command prompt console bash", icon: <Terminal size={15} className="text-emerald-400" />, run: onOpenTerminal },
      { id: "notes", label: "Journal & Engineering Essays", hint: "Window", keywords: "notes journal blog essays thoughts design craft writing", icon: <BookOpen size={15} className="text-white/55" />, run: onOpenNotes },
      { id: "resume", label: "Curriculum Vitae / Resume", hint: "Document", keywords: "resume cv experience education skills work history pdf print", icon: <FileText size={15} className="text-white/55" />, run: onOpenResume },
      { id: "mail", label: "Client Reviews & Testimonials", hint: "Inbox", keywords: "reviews testimonials feedback clients endorsements references", icon: <Sparkles size={15} className="text-amber-400" />, run: onOpenMail },
      { id: "estimator", label: "Project Scope & Budget Estimator", hint: "Tool", keywords: "calculator price cost budget estimate timeline quote pricing", icon: <Calculator size={15} className="text-emerald-400" />, run: onOpenEstimator },
      { id: "paint", label: "Paint & Guestbook Signature", hint: "Canvas", keywords: "paint draw doodle sketch guestbook signature art canvas", icon: <Paintbrush size={15} className="text-pink-400" />, run: onOpenPaint },
      { id: "arcade", label: "MONO//SHIFT Mini Arcade Runner", hint: "Game", keywords: "game arcade play mono shift runner 8bit jump", icon: <Gamepad2 size={15} className="text-cyan-400" />, run: onOpenArcade },
      { id: "diagnostics", label: "System Telemetry & Diagnostics", hint: "System", keywords: "diagnostics telemetry fps specs performance vitals memory", icon: <Activity size={15} className="text-emerald-400" />, run: onOpenDiagnostics },
      { id: "playground", label: "Physics & Spring Lab Playground", hint: "Lab", keywords: "playground physics spring stiffness damping lab animation", icon: <Sliders size={15} className="text-purple-400" />, run: onOpenPlayground },
      ...(onOpenServices
        ? [{
            id: "services",
            label: "Services & Pricing",
            hint: "App",
            keywords:
              "services offerings graphic design poster flyer banner thumbnail brand video editing reel youtube promo motion subtitle web development portfolio business landing ui ux dashboard social carousel ad campaign branding",
            icon: <LayoutList size={15} className="text-white/55" />,
            run: onOpenServices,
          }]
        : []),
      { id: "contact", label: "Say Hello — Contact & Hire", hint: "Window · C", keywords: "contact email mail hello hire freelance booking", icon: <Mail size={15} className="text-white/55" />, run: onOpenContact },
      { id: "settings", label: "System Preferences & Wallpaper", hint: "Settings", keywords: "settings preferences audio sound theme wallpaper config", icon: <Settings size={15} className="text-white/55" />, run: onOpenSettings },
      { id: "shortcuts", label: "Keyboard Shortcuts Cheat Sheet", hint: "Hotkeys · ?", keywords: "shortcuts keys hotkeys help commands", icon: <Keyboard size={15} className="text-white/55" />, run: onOpenShortcuts },

      ...PROJECTS.map(
        (p): PaletteItem => ({
          id: `p-${p.id}`,
          label: p.title,
          hint: `${p.index} · ${p.category}`,
          keywords: `${p.title} ${p.category} ${p.stack.join(" ")} ${p.year} case study`,
          icon: <img src={p.icon} alt="" className="h-5 w-5 rounded-[5px] object-cover ring-1 ring-white/15" />,
          run: () => onOpenProject(p.id),
        }),
      ),

      ...(onQuickLook
        ? [
            {
              id: "quick-look",
              label: "Quick Look Preview",
              hint: "Space",
              keywords: "quick look space preview inspect peek slide",
              icon: <Eye size={15} className="text-white/55" />,
              run: () => onQuickLook(PROJECTS[0].id),
            },
          ]
        : []),

      { id: "wall", label: "Change Wallpaper", hint: "Desktop", keywords: "wallpaper background image theme switch picture", icon: <Images size={15} className="text-white/55" />, run: onNextWallpaper },
      { id: "sounds", label: `Toggle Sound — ${soundsOn ? "Enabled" : "Muted"}`, hint: "Desktop", keywords: "sound audio mute volume toggle chimes", icon: <Volume2 size={15} className="text-white/55" />, run: onToggleSounds },

      /* Desktop folders */
      ...(onOpenFolder
        ? DESKTOP_FOLDERS.map(
            (folder): PaletteItem => ({
              id: `folder-${folder.id}`,
              label: folder.title,
              hint: `Folder · ${folder.projectIds.length} items`,
              keywords: `folder ${folder.title} ${folder.description} collection group`,
              icon: <Folder size={15} className="text-white/55" />,
              run: () => onOpenFolder(folder.id),
            }),
          )
        : []),

      /* Social links */
      ...SOCIALS.map(
        (social): PaletteItem => ({
          id: `social-${social.id}`,
          label: social.label,
          hint: social.handle,
          keywords: `${social.label} ${social.handle} social link profile follow`,
          icon: <LinkIcon size={15} className="text-white/55" />,
          run: () => window.open(social.href, "_blank", "noopener,noreferrer"),
        }),
      ),

      ...(onToggleMotion
        ? [{
            id: "motion",
            label: "Toggle Background Motion",
            hint: "Desktop",
            keywords: "motion parallax animation background movement reduce",
            icon: <Waves size={15} className="text-white/55" />,
            run: onToggleMotion,
          }]
        : []),
      ...(onCycleWeather
        ? [{
            id: "weather",
            label: "Weather & Atmosphere Effect",
            hint: "Desktop",
            keywords: "weather rain mist fog atmosphere effect particles",
            icon: <CloudFog size={15} className="text-white/55" />,
            run: onCycleWeather,
          }]
        : []),
      ...(onStartScreensaver
        ? [{
            id: "screensaver",
            label: "Start Screensaver",
            hint: "Desktop",
            keywords: "screensaver sleep idle ambient clock display",
            icon: <MonitorPause size={15} className="text-white/55" />,
            run: onStartScreensaver,
          }]
        : []),
    ];

    if (hasCustomLayout) {
      base.push({ id: "reset", label: "Reset Icon Grid Order", hint: "Desktop", keywords: "reset icons layout positions default arrange grid", icon: <RotateCcw size={15} className="text-white/55" />, run: onResetIcons });
    }

    const rank = rankRef.current;
    return [...base].sort((a, b) => (rank[b.id] ?? 0) - (rank[a.id] ?? 0));
  }, [
    soundsOn,
    hasCustomLayout,
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
    onOpenProject,
    onQuickLook,
    onNextWallpaper,
    onToggleSounds,
    onResetIcons,
    onOpenFolder,
    onToggleMotion,
    onCycleWeather,
    onStartScreensaver,
  ]);

  /** Fuzzy ranked results; label matches score above keyword-only matches. */
  const filtered = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return items.map((item) => ({ item, indices: [] as number[] }));

    return items
      .map((item) => {
        const labelMatch = fuzzyMatch(item.label, trimmed);
        const keywordMatch = fuzzyMatch(item.keywords, trimmed);
        if (!labelMatch && !keywordMatch) return null;
        const score = (labelMatch?.score ?? 0) * 2 + (keywordMatch?.score ?? 0);
        return { item, indices: labelMatch?.indices ?? [], score };
      })
      .filter((entry): entry is { item: PaletteItem; indices: number[]; score: number } => entry !== null)
      .sort((a, b) => b.score - a.score);
  }, [items, query]);

  useEffect(() => setIndex(0), [query]);

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-idx="${index}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [index]);

  const runAndClose = (item: PaletteItem) => {
    rankRef.current[item.id] = recordRank(item.id);
    onClose();
    item.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => (filtered.length ? (i + 1) % filtered.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => (filtered.length ? (i - 1 + filtered.length) % filtered.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const entry = filtered[index];
      if (entry) runAndClose(entry.item);
    }
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-start justify-center px-4 pt-[14vh]">
      <motion.button
        type="button"
        aria-label="Close command palette"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.15 } }}
        transition={{ duration: reduced ? 0.01 : 0.25 }}
        className="absolute inset-0 cursor-default bg-black/40 backdrop-blur-[3px]"
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        initial={{ opacity: 0, scale: reduced ? 1 : 0.97, y: reduced ? 0 : 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: reduced ? 1 : 0.97, y: reduced ? 0 : 6, transition: { duration: 0.14 } }}
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
        className="shadow-window relative w-[min(560px,94vw)] overflow-hidden rounded-[16px] border border-white/10 bg-[#101013]/95 backdrop-blur-xl select-none"
      >
        <div className="flex h-[52px] items-center gap-3 border-b border-white/10 px-4">
          <Search size={15} className="shrink-0 text-white/40" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search apps, calculator, paint, arcade, notes, terminal..."
            aria-label="Command palette search"
            className="h-full w-full bg-transparent text-[14px] text-white placeholder:text-white/30 outline-none"
          />
          <span className="shrink-0 rounded-[5px] border border-white/15 px-1.5 py-0.5 font-mono text-[9px] tracking-wide text-white/45">
            esc
          </span>
        </div>

        <div ref={listRef} className="os-scroll max-h-[340px] overflow-y-auto p-1.5">
          {filtered.length === 0 && (
            <p className="px-3 py-8 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
              Nothing found — try "terminal", "paint", "game" or "estimator"
            </p>
          )}
          {filtered.map(({ item, indices }, i) => (
            <button
              key={item.id}
              type="button"
              data-idx={i}
              onMouseEnter={() => setIndex(i)}
              onClick={() => runAndClose(item)}
              className={[
                "flex h-10 w-full cursor-pointer items-center gap-3 rounded-[9px] px-2.5 text-left transition-colors",
                i === index ? "bg-white/10 text-white" : "text-white/72",
              ].join(" ")}
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center">{item.icon}</span>
              <span className="flex-1 truncate text-[13px] font-medium">
                <Highlighted text={item.label} indices={indices} />
              </span>
              <span className="max-w-[150px] truncate font-mono text-[9px] uppercase tracking-[0.14em] text-white/35">
                {item.hint}
              </span>
              {i === index && <CornerDownLeft size={13} className="shrink-0 text-white/45" />}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 border-t border-white/10 px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.16em] text-white/35">
          <span className="flex items-center gap-1.5">↑↓ navigate</span>
          <span className="flex items-center gap-1.5">
            <CornerDownLeft size={11} /> open
          </span>
          <span className="ml-auto">{PORTFOLIO_CONFIG.identity.mark} OS · learns your flow</span>
        </div>
      </motion.div>
    </div>
  );
}
