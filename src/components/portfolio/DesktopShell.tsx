import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { Images } from "lucide-react";
import { PROJECTS, getProject, type Breakpoint, type Project } from "@/data/projects";
import { getFolder } from "@/config/folders";
import { WALLPAPERS } from "@/data/media";
import { useBreakpoint, useIsTouch } from "@/hooks/useBreakpoint";
import { uiSound } from "@/utils/sound";
import { lofiAudio } from "@/utils/audioPlayer";
import { copyText } from "@/utils/clipboard";
import { BackgroundScene, FilmGrain } from "./BackgroundScene";
import { BootIntro } from "./BootIntro";
import { CommandPalette } from "./CommandPalette";
import { ContextMenu } from "./ContextMenu";
import { CustomCursor } from "./CustomCursor";
import { Dock } from "./Dock";
import { CELL, FloatingProjectLayer } from "./FloatingProjectLayer";
import type { IconOffset } from "./FloatingProject";
import { IdentityMark } from "./IdentityMark";
import { QuickLookModal } from "./QuickLookModal";
import { Screensaver } from "./Screensaver";
import { WindowManager } from "./WindowManager";
import { ShortcutsModal } from "./windows/ShortcutsModal";
import { MusicPlayerWidget } from "./widgets/MusicPlayerWidget";
import { LockScreen, CRTShutDown } from "./widgets/PowerStates";
import { StickyNotes } from "./widgets/StickyNotes";
import { SystemMenu } from "./widgets/SystemMenu";
import { ControlCenter } from "./widgets/ControlCenter";
import { NotificationToasts } from "./NotificationToasts";
import { ProjectContextMenu } from "./ProjectContextMenu";
import { useNotifications } from "@/hooks/useNotifications";
import { MobileActionSheet } from "./MobileActionSheet";
import { ServicesIconMenu } from "./ServicesIconMenu";
import {
  clearRecentItems,
  loadRecentItems,
  DOCK_MAGNIFICATION_SCALE,
  ICON_SIZE_SCALE,
  type DockMagnification,
  type IconSize,
  type MotionMode,
  type RecentItem,
} from "@/utils/storage";
import { WeatherAtmosphere, type WeatherMode } from "./widgets/WeatherAtmosphere";
import { AppsLauncher } from "./AppsLauncher";
import { MobileAppsLauncher } from "./MobileAppsLauncher";
import { WelcomePanel } from "./WelcomePanel";
import { hashToWindow, windowToHash, type ManagedWindow, type WindowType } from "./types";
import { clearAllWindowStates } from "@/hooks/useWindowGeometry";
import {
  clearStore,
  loadDesktopLayout,
  loadPreferences,
  markSessionActive,
  markVisited,
  pushRecentItem,
  saveDesktopLayout,
  savePreferences,
  STORAGE_KEYS,
  type DesktopPreferences,
} from "@/utils/storage";

/** Legacy keys are migrated into the versioned storage namespaces. */
const LEGACY_WALLPAPER_KEY = "rahma-wallpaper";
const LEGACY_LAYOUT_PREFIX = "rahma-icon-offsets";

const APP_TITLES: Partial<Record<WindowType, string>> = {
  about: "About",
  work: "Selected Work",
  contact: "Contact",
  terminal: "Terminal",
  notes: "Journal",
  resume: "Resume",
  mail: "Reviews",
  settings: "Settings",
  paint: "Paint",
  arcade: "Arcade",
  estimator: "Estimator",
  diagnostics: "Diagnostics",
  playground: "Physics Lab",
  services: "Services",
  folder: "Folder",
};

const loadOffsets = (): Record<string, IconOffset> =>
  loadDesktopLayout() as Record<string, IconOffset>;

/** Reject unknown project/folder ids before they can create a broken window. */
const safeHashToWindow = (hash: string): ManagedWindow | null => {
  const route = hashToWindow(hash);
  if (!route) return null;
  if (route.type === "project" && !getProject(route.projectId)) return null;
  if (route.type === "folder" && !getFolder(route.folderId)) return null;
  return route;
};

export function DesktopShell() {
  const initialWindow = safeHashToWindow(window.location.hash);
  const [windows, setWindows] = useState<ManagedWindow[]>(initialWindow ? [initialWindow] : []);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(initialWindow?.id ?? null);
  const [minimizedIds, setMinimizedIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);
  const [quickLookId, setQuickLookId] = useState<string | null>(null);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [systemMenuOpen, setSystemMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [musicPlayerOpen, setMusicPlayerOpen] = useState(false);
  const storedPreferences = useRef<DesktopPreferences>(loadPreferences()).current;
  const [weather, setWeather] = useState<WeatherMode>(storedPreferences.weather as WeatherMode);
  const [saver, setSaver] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isShutDown, setIsShutDown] = useState(false);
  const [wallToast, setWallToast] = useState(0);
  const [isMonoMode, setIsMonoMode] = useState(false);
  const [controlCenterOpen, setControlCenterOpen] = useState(false);
  const [appsLauncherOpen, setAppsLauncherOpen] = useState(false);
  const [projectMenu, setProjectMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [recentItems, setRecentItems] = useState<RecentItem[]>(() => loadRecentItems());
  const [motionOn, setMotionOn] = useState(storedPreferences.backgroundMotion);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mobileSheetId, setMobileSheetId] = useState<string | null>(null);
  const [servicesIconMenu, setServicesIconMenu] = useState<{
    x: number;
    y: number;
    mobile: boolean;
  } | null>(null);
  const [iconSize, setIconSize] = useState<IconSize>(storedPreferences.iconSize);
  const [dockMagnification, setDockMagnification] = useState<DockMagnification>(
    storedPreferences.dockMagnification,
  );
  const [motionMode, setMotionMode] = useState<MotionMode>(storedPreferences.motionMode);
  const [weatherEffects, setWeatherEffects] = useState(storedPreferences.weatherEffects);
  const [volume, setVolume] = useState(storedPreferences.volume);
  const [screensaverTrack, setScreensaverTrack] = useState<string | null>(null);
  const { history: notifications, toasts, notify, dismissToast, clearHistory } = useNotifications();
  const [offsets, setOffsets] = useState<Record<string, IconOffset>>(loadOffsets);
  const [soundsOn, setSoundsOn] = useState(uiSound.enabled);
  const [wallIdx, setWallIdx] = useState(() => {
    /* Preference store first, then the legacy key for existing visitors. */
    let savedId = storedPreferences.wallpaperId;
    if (!savedId) {
      try {
        savedId = localStorage.getItem(LEGACY_WALLPAPER_KEY);
      } catch {
        savedId = null;
      }
    }
    const index = savedId ? WALLPAPERS.findIndex((wallpaper) => wallpaper.id === savedId) : 0;
    return index >= 0 ? index : 0;
  });
  const [showHint, setShowHint] = useState(false);

  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
  const touch = useIsTouch();
  const reduced = useReducedMotion();
  /* Browser reduced-motion always wins over the in-app preference. */
  const motionAllowed = !reduced && motionOn && motionMode === "full";
  const parallax = !touch && motionAllowed;
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const historyNavigationRef = useRef(false);
  const routeInitializedRef = useRef(false);
  const visibleWindowCount = windows.reduce(
    (count, item) => count + (minimizedIds.has(item.id) ? 0 : 1),
    0,
  );

  const onPointerMove = useCallback((event: ReactPointerEvent) => {
    if (!parallax) return;
    mouseX.set(event.clientX / window.innerWidth - 0.5);
    mouseY.set(event.clientY / window.innerHeight - 0.5);
  }, [mouseX, mouseY, parallax]);

  /* One-time cleanup of pre-versioned keys, then session bookkeeping. */
  useEffect(() => {
    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith(LEGACY_LAYOUT_PREFIX) || key === "rahma-layout-schema")
        .forEach((key) => localStorage.removeItem(key));
    } catch {
      /* Private mode can block storage. */
    }
    markSessionActive();
    markVisited();
  }, []);

  useEffect(() => {
    const applyRoute = () => {
      historyNavigationRef.current = true;
      const next = safeHashToWindow(window.location.hash);
      if (!next) {
        setWindows([]);
        setActiveWindowId(null);
        setMinimizedIds(new Set());
        return;
      }
      setWindows((current) => current.some((item) => item.id === next.id) ? current : [...current, next]);
      setActiveWindowId(next.id);
      setMinimizedIds((current) => {
        const updated = new Set(current);
        updated.delete(next.id);
        return updated;
      });
    };
    window.addEventListener("popstate", applyRoute);
    window.addEventListener("hashchange", applyRoute);
    return () => {
      window.removeEventListener("popstate", applyRoute);
      window.removeEventListener("hashchange", applyRoute);
    };
  }, []);

  useEffect(() => {
    const active = windows.find((item) => item.id === activeWindowId) ?? null;
    const target = windowToHash(active);
    const url = `${window.location.pathname}${window.location.search}${target}`;

    if (!routeInitializedRef.current) {
      routeInitializedRef.current = true;
      if (window.location.hash !== target) history.replaceState(null, "", url);
      return;
    }
    if (historyNavigationRef.current) {
      historyNavigationRef.current = false;
      return;
    }
    if (window.location.hash !== target) history.pushState(null, "", url);
  }, [activeWindowId, windows]);

  /* Preferences persist together so one write covers the whole workspace. */
  useEffect(() => {
    savePreferences({
      ...storedPreferences,
      wallpaperId: WALLPAPERS[wallIdx].id,
      soundsOn,
      musicOn: musicPlayerOpen,
      volume,
      weather,
      weatherEffects,
      backgroundMotion: motionOn,
      motionMode,
      iconSize,
      dockMagnification,
    });
  }, [
    dockMagnification,
    iconSize,
    motionMode,
    motionOn,
    musicPlayerOpen,
    soundsOn,
    storedPreferences,
    volume,
    wallIdx,
    weather,
    weatherEffects,
  ]);

  /* User icon layout only; designer defaults are never written here. */
  useEffect(() => {
    saveDesktopLayout(offsets);
  }, [offsets]);

  useEffect(() => {
    WALLPAPERS.forEach((wallpaper) => {
      const image = new Image();
      image.src = wallpaper.desktop;
    });
  }, []);

  /* Keep the ambient engine aligned with the saved volume preference. */
  useEffect(() => {
    lofiAudio.setVolume(volume);
  }, [volume]);

  const openWindow = useCallback((type: WindowType) => {
    const id = `win-${type}`;
    uiSound.play("open");
    setOrigin(null);
    setWindows((current) => current.some((item) => item.id === id) ? current : [...current, { id, type } as ManagedWindow]);
    setActiveWindowId(id);
    setMinimizedIds((current) => {
      const updated = new Set(current);
      updated.delete(id);
      return updated;
    });
    /* Recent-items foundation for Part 2. */
    if (type !== "shortcuts") {
      setRecentItems(
        pushRecentItem({ id, type: "app", title: APP_TITLES[type] ?? type }),
      );
    }
  }, []);

  const openProject = useCallback((projectId: string, options?: { from?: "work" }) => {
    if (!getProject(projectId)) {
      notify("Project not found", projectId);
      return;
    }
    const id = `win-project-${projectId}`;
    uiSound.play("open");
    setWindows((current) => [...current.filter((item) => item.id !== id), { id, type: "project", projectId, from: options?.from }]);
    setActiveWindowId(id);
    setMinimizedIds((current) => {
      const updated = new Set(current);
      updated.delete(id);
      return updated;
    });
    setRecentItems(
      pushRecentItem({
        id: projectId,
        type: "project",
        title: PROJECTS.find((project) => project.id === projectId)?.title ?? projectId,
      }),
    );
  }, [notify]);

  const openProjectFromIcon = useCallback((project: Project, rect?: DOMRect) => {
    setOrigin(rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : null);
    openProject(project.id);
  }, [openProject]);

  const openFolder = useCallback((folderId: string) => {
    if (!getFolder(folderId)) {
      notify("Folder not found", folderId);
      return;
    }
    const id = `win-folder-${folderId}`;
    uiSound.play("open");
    setOrigin(null);
    setWindows((current) => current.some((item) => item.id === id) ? current : [...current, { id, type: "folder", folderId }]);
    setActiveWindowId(id);
  }, [notify]);

  /** Recent list is re-read after opens so the System Menu stays current. */
  useEffect(() => {
    setRecentItems(loadRecentItems());
  }, [windows]);

  const copyProjectLink = useCallback((projectId: string) => {
    const project = PROJECTS.find((entry) => entry.id === projectId);
    const url = `${window.location.origin}${window.location.pathname}#/work/${projectId}`;
    void copyText(url).then((copied) => {
      notify(copied ? "Project link copied" : "Could not copy link", project?.title, copied ? "success" : "info");
    });
  }, [notify]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen?.();
      setIsFullscreen(false);
    } else {
      void document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    }
  }, []);

  const handleMusicPlayback = useCallback((_: boolean, title: string | null) => {
    setScreensaverTrack(title);
  }, []);

  const closeWindow = useCallback((id: string) => {
    uiSound.play("close");
    setWindows((current) => {
      const remaining = current.filter((item) => item.id !== id);
      setActiveWindowId((active) => active === id ? remaining[remaining.length - 1]?.id ?? null : active);
      return remaining;
    });
    setMinimizedIds((current) => {
      const updated = new Set(current);
      updated.delete(id);
      return updated;
    });
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    uiSound.play("minimize");
    setMinimizedIds((current) => new Set(current).add(id));
    setActiveWindowId((active) => {
      if (active !== id) return active;
      const remaining = windows.filter((item) => item.id !== id && !minimizedIds.has(item.id));
      return remaining[remaining.length - 1]?.id ?? null;
    });
  }, [minimizedIds, windows]);

  const focusWindow = useCallback((id: string) => {
    setActiveWindowId(id);
    setMinimizedIds((current) => {
      const updated = new Set(current);
      updated.delete(id);
      return updated;
    });
  }, []);

  const nextWallpaper = useCallback(() => {
    uiSound.play("switch");
    setWallIdx((index) => {
      const next = (index + 1) % WALLPAPERS.length;
      notify("Wallpaper changed", WALLPAPERS[next].name);
      return next;
    });
    setWallToast(Date.now());
  }, [notify]);

  const selectWallpaper = useCallback((index: number) => {
    uiSound.play("switch");
    const next = ((index % WALLPAPERS.length) + WALLPAPERS.length) % WALLPAPERS.length;
    setWallIdx(next);
    setWallToast(Date.now());
    notify("Wallpaper changed", WALLPAPERS[next].name);
  }, [notify]);

  useEffect(() => {
    if (!wallToast) return;
    const timer = window.setTimeout(() => setWallToast(0), 2200);
    return () => window.clearTimeout(timer);
  }, [wallToast]);

  const toggleSounds = useCallback(() => {
    setSoundsOn((current) => {
      uiSound.set(!current);
      if (!current) uiSound.play("switch");
      notify(current ? "Sound disabled" : "Sound enabled");
      return !current;
    });
  }, [notify]);

  const toggleMotion = useCallback(() => {
    setMotionOn((current) => {
      notify(current ? "Background motion off" : "Background motion on");
      return !current;
    });
  }, [notify]);

  const cycleWeather = useCallback(() => {
    const modes: WeatherMode[] = ["clear", "rain", "mist", "aurora"];
    setWeather((current) => modes[(modes.indexOf(current) + 1) % modes.length]);
    uiSound.play("switch");
  }, []);

  const storeOffset = useCallback((breakpoint: Breakpoint, id: string, offset: IconOffset) => {
    setOffsets((current) => {
      const key = `${breakpoint}:${id}`;
      const updated = { ...current };
      if (Math.abs(offset.dx) < 1 && Math.abs(offset.dy) < 1) delete updated[key];
      else updated[key] = offset;
      return updated;
    });
  }, []);

  /** Restores the designer-defined composition and clears saved geometry. */
  const resetIcons = useCallback(() => {
    setOffsets({});
    clearStore(STORAGE_KEYS.layout);
    clearAllWindowStates();
    notify("Desktop layout reset", "Icons returned to their default positions");
  }, [notify]);

  /** Clean Up removes drag offsets so icons re-align to their grid cells. */
  const cleanUpIcons = useCallback(() => {
    setOffsets({});
    uiSound.play("switch");
    notify("Icons cleaned up", "Aligned to the desktop grid");
  }, [notify]);

  const sortIcons = useCallback((by: "name" | "year" | "category") => {
    /* Services is a first-class desktop item, so sorting includes it instead
       of leaving it behind where a project could land on top of it. */
    const desktopItems = [
      ...PROJECTS.map((project) => ({
        id: project.id,
        title: project.title,
        category: project.category,
        year: project.year,
      })),
      { id: "services", title: "Services", category: "Services", year: "2026" },
    ];
    const sorted = [...desktopItems].sort((a, b) => {
      if (by === "name") return a.title.localeCompare(b.title);
      if (by === "year") return b.year.localeCompare(a.year);
      return a.category.localeCompare(b.category);
    });
    const cell = CELL[bp];
    const rows = Math.max(1, Math.floor((window.innerHeight - (bp === "mobile" ? 192 : 216)) / cell.h));
    const next: Record<string, IconOffset> = {};
    sorted.forEach((project, desiredIndex) => {
      const originalIndex = desktopItems.findIndex((item) => item.id === project.id);
      const original = { column: Math.floor(originalIndex / rows), row: originalIndex % rows };
      const desired = { column: Math.floor(desiredIndex / rows), row: desiredIndex % rows };
      if (originalIndex !== desiredIndex) {
        next[`${bp}:${project.id}`] = {
          dx: (desired.column - original.column) * cell.w,
          dy: (desired.row - original.row) * cell.h,
        };
      }
    });
    setOffsets(next);
    uiSound.play("switch");
  }, [bp]);

  const selectProject = useCallback((id: string, multi = false) => {
    setSelectedIds((current) => {
      if (!multi) return new Set([id]);
      const updated = new Set(current);
      if (updated.has(id)) updated.delete(id); else updated.add(id);
      return updated;
    });
  }, []);

  useEffect(() => {
    let buffer = "";
    let bufferTimer: number | undefined;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target?.matches("input, textarea") || target?.isContentEditable) return;
      /* Locked, sleeping and powered-off surfaces own all keyboard input. */
      if (saver || isLocked || isShutDown) return;
      if (/^[a-zA-Z]$/.test(event.key) && !event.metaKey && !event.ctrlKey && !event.altKey) {
        buffer += event.key.toLowerCase();
        window.clearTimeout(bufferTimer);
        bufferTimer = window.setTimeout(() => { buffer = ""; }, 1200);
        if (buffer.includes("mono")) { setIsMonoMode(true); uiSound.play("switch"); buffer = ""; }
        if (buffer.includes("reset") || buffer.includes("color")) { setIsMonoMode(false); uiSound.play("switch"); buffer = ""; }
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
        return;
      }
      if (event.key === "/" && !visibleWindowCount) { event.preventDefault(); setPaletteOpen(true); return; }
      if (event.key === "?") { event.preventDefault(); setShortcutsOpen((open) => !open); return; }
      if (event.code === "Space" && !visibleWindowCount) {
        event.preventDefault();
        const selectedProjectId = [...selectedIds].find((id) => Boolean(getProject(id)));
        setQuickLookId((current) =>
          current ? null : hoveredProjectId ?? selectedProjectId ?? PROJECTS[0]?.id ?? null,
        );
        return;
      }
      if (quickLookId || paletteOpen || shortcutsOpen) return;
      const key = event.key.toLowerCase();
      if (/^[1-9]$/.test(key) && !visibleWindowCount) {
        const project = PROJECTS[Number(key) - 1];
        if (project) openProject(project.id);
      } else if (key === "a" && !visibleWindowCount) openWindow("about");
      else if (key === "w" && !visibleWindowCount) openWindow("work");
      else if (key === "c" && !visibleWindowCount) openWindow("contact");
      else if (key === "t" && !visibleWindowCount) openWindow("terminal");
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(bufferTimer);
    };
  }, [hoveredProjectId, isLocked, isShutDown, openProject, openWindow, paletteOpen, quickLookId, saver, selectedIds, shortcutsOpen, visibleWindowCount]);

  useEffect(() => {
    if (visibleWindowCount || menu || paletteOpen || shortcutsOpen || quickLookId || musicPlayerOpen || reduced) {
      setSaver(false);
      return;
    }
    const IDLE_MS = 45000;
    /* Never sleep mid-typing, mid-drag, or while a field holds focus. */
    const isBusy = () => {
      const active = document.activeElement as HTMLElement | null;
      if (active && (active.matches("input, textarea, select") || active.isContentEditable)) return true;
      return document.body.matches(":active");
    };

    let timer = window.setTimeout(() => { if (!isBusy()) setSaver(true); }, IDLE_MS);
    const reset = () => {
      setSaver(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => { if (!isBusy()) setSaver(true); }, IDLE_MS);
    };
    const events = ["pointermove", "pointerdown", "pointerup", "keydown", "wheel", "touchstart"] as const;
    events.forEach((event) => window.addEventListener(event, reset, { passive: true }));
    return () => {
      window.clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, reset));
    };
  }, [menu, musicPlayerOpen, paletteOpen, quickLookId, reduced, shortcutsOpen, visibleWindowCount]);

  const onContextMenu = useCallback((event: ReactMouseEvent) => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const target = event.target as HTMLElement;
    if (target.closest("[data-window]") || target.matches("input, textarea")) return;
    event.preventDefault();
    setMenu({ x: event.clientX, y: event.clientY });
  }, []);

  useEffect(() => {
    if (touch || reduced) return;
    const show = window.setTimeout(() => setShowHint(true), 2600);
    const hide = window.setTimeout(() => setShowHint(false), 9600);
    return () => { window.clearTimeout(show); window.clearTimeout(hide); };
  }, [reduced, touch]);

  const activeWindowTypes = new Set<WindowType>(windows.map((item) => item.type === "project" ? "work" : item.type));

  const [hintsDismissed, setHintsDismissed] = useState(false);
  useEffect(() => {
    try {
      if (localStorage.getItem("rahma-hints-seen") === "1") {
        setHintsDismissed(true);
      }
    } catch {
      //
    }
  }, []);

  const dismissHints = () => {
    setHintsDismissed(true);
    try {
      localStorage.setItem("rahma-hints-seen", "1");
    } catch {
      //
    }
  };

  return (
    <main
      className={`relative h-dvh w-full overflow-hidden select-none ${isMonoMode ? "grayscale contrast-125 invert" : ""}`}
      onPointerMove={onPointerMove}
      onContextMenu={onContextMenu}
    >
      <BackgroundScene wallpaper={WALLPAPERS[wallIdx]} mouseX={mouseX} mouseY={mouseY} parallax={parallax} />
      <WeatherAtmosphere weather={weatherEffects && motionAllowed ? weather : "clear"} />
      <IdentityMark
        hasCustomLayout={Object.keys(offsets).length > 0}
        weather={weather}
        isMusicPlaying={Boolean(screensaverTrack)}
        isSystemMenuOpen={systemMenuOpen}
        onResetLayout={() => { uiSound.play("switch"); resetIcons(); }}
        onCycleWeather={cycleWeather}
        onToggleMusicPlayer={() => setMusicPlayerOpen((open) => !open)}
        onToggleSystemMenu={() => setSystemMenuOpen((open) => !open)}
        isControlCenterOpen={controlCenterOpen}
        onToggleControlCenter={() => setControlCenterOpen((open) => !open)}
      />
      <SystemMenu
        isOpen={systemMenuOpen}
        onClose={() => setSystemMenuOpen(false)}
        onOpenWindow={openWindow}
        onSleep={() => setSaver(true)}
        onLock={() => setIsLocked(true)}
        onRestart={() => window.location.reload()}
        onShutDown={() => setIsShutDown(true)}
        recentItems={recentItems}
        onOpenRecent={(entry) => {
          if (entry.type === "project") openProject(entry.id);
          else openWindow(entry.id.replace(/^win-/, "") as WindowType);
        }}
        onClearRecent={() => {
          clearRecentItems();
          setRecentItems([]);
          notify("Recent items cleared");
        }}
      />
      <ControlCenter
        isOpen={controlCenterOpen}
        soundsOn={soundsOn}
        motionOn={motionOn}
        weather={weather}
        isFullscreen={isFullscreen}
        notifications={notifications}
        onClose={() => setControlCenterOpen(false)}
        onToggleSounds={toggleSounds}
        onToggleMotion={toggleMotion}
        onCycleWeather={cycleWeather}
        onToggleFullscreen={toggleFullscreen}
        onOpenWallpaper={() => { nextWallpaper(); setControlCenterOpen(false); }}
        onOpenSettings={() => { openWindow("settings"); setControlCenterOpen(false); }}
        onClearNotifications={clearHistory}
      />
      <FloatingProjectLayer
        mouseX={mouseX}
        mouseY={mouseY}
        parallax={parallax}
        offsets={offsets}
        selectedIds={selectedIds}
        onDragEndStore={storeOffset}
        onHoverProject={setHoveredProjectId}
        onSelectProject={selectProject}
        onSelectMultiple={(ids) => setSelectedIds(new Set(ids))}
        iconScale={ICON_SIZE_SCALE[iconSize]}
        onOpenServices={() => openWindow("services")}
        onServicesContextMenu={(x, y, mobile) => {
          setMenu(null);
          setProjectMenu(null);
          setServicesIconMenu({ x, y, mobile });
        }}
        onProjectContextMenu={(id, x, y) => {
          setMenu(null);
          /* Touch gets a bottom sheet; pointer devices get the context menu. */
          if (touch) setMobileSheetId(id);
          else setProjectMenu({ id, x, y });
        }}
        onOpenProject={openProjectFromIcon}
      />
      <StickyNotes notify={notify} />
      <FilmGrain />
      <Dock
        activeWindowTypes={activeWindowTypes}
        isMobile={isMobile}
        isCompact={bp !== "desktop"}
        magnificationStrength={DOCK_MAGNIFICATION_SCALE[dockMagnification]}
        onOpenWindow={openWindow}
        onToggleAppsLauncher={() => setAppsLauncherOpen((open) => !open)}
        appsLauncherOpen={appsLauncherOpen}
      />
      <WindowManager
        windows={windows}
        minimizedIds={minimizedIds}
        activeWindowId={activeWindowId}
        isMobile={isMobile}
        origin={origin}
        currentWallpaper={WALLPAPERS[wallIdx]}
        soundsOn={soundsOn}
        /*
          While any overlay is open, Escape belongs to that overlay alone so a
          single press never closes two interface layers at once.
        */
        suppressEscape={
          paletteOpen ||
          shortcutsOpen ||
          Boolean(quickLookId) ||
          isLocked ||
          Boolean(menu) ||
          Boolean(projectMenu) ||
          Boolean(servicesIconMenu) ||
          Boolean(mobileSheetId) ||
          controlCenterOpen ||
          systemMenuOpen ||
          appsLauncherOpen
        }
        onClose={closeWindow}
        onMinimize={minimizeWindow}
        onFocus={focusWindow}
        onOpenProject={openProject}
        onOpenWindow={openWindow}
        onOpenContactWithScope={() => openWindow("contact")}
        onSelectWallpaper={selectWallpaper}
        onToggleSounds={toggleSounds}
        onResetLayout={resetIcons}
        appearance={{
          iconSize,
          dockMagnification,
          motionMode,
          backgroundMotion: motionOn,
          weatherEffects,
          musicOn: musicPlayerOpen,
          volume,
          systemReducedMotion: Boolean(reduced),
          onChangeIconSize: (size) => { setIconSize(size); notify("Icon size updated", size); },
          onChangeDockMagnification: setDockMagnification,
          onChangeMotionMode: (mode) => { setMotionMode(mode); notify("Motion preference saved", mode === "full" ? "Full motion" : "Reduced motion"); },
          onToggleBackgroundMotion: toggleMotion,
          onToggleWeatherEffects: () => setWeatherEffects((value) => !value),
          onToggleMusic: () => setMusicPlayerOpen((open) => !open),
          onChangeVolume: setVolume,
        }}
      />
      <AnimatePresence>
        {menu && (
          <ContextMenu
            key="context-menu"
            x={menu.x}
            y={menu.y}
            wallpaperName={WALLPAPERS[wallIdx].name}
            soundsOn={soundsOn}
            hasCustomLayout={Object.keys(offsets).length > 0}
            onClose={() => setMenu(null)}
            onOpenAbout={() => openWindow("about")}
            onOpenWork={() => openWindow("work")}
            onOpenContact={() => openWindow("contact")}
            onOpenTerminal={() => openWindow("terminal")}
            onOpenNotes={() => openWindow("notes")}
            onOpenResume={() => openWindow("resume")}
            onOpenMail={() => openWindow("mail")}
            onOpenPaint={() => openWindow("paint")}
            onOpenArcade={() => openWindow("arcade")}
            onOpenEstimator={() => openWindow("estimator")}
            onOpenDiagnostics={() => openWindow("diagnostics")}
            onOpenPlayground={() => openWindow("playground")}
            onOpenSettings={() => openWindow("settings")}
            onOpenShortcuts={() => setShortcutsOpen(true)}
            onOpenServices={() => openWindow("services")}
            onQuickLook={() => {
              const selectedProjectId = [...selectedIds].find((id) => Boolean(getProject(id)));
              setQuickLookId(hoveredProjectId ?? selectedProjectId ?? PROJECTS[0]?.id ?? null);
            }}
            onNextWallpaper={nextWallpaper}
            onToggleSounds={toggleSounds}
            onResetIcons={resetIcons}
            onSortIcons={sortIcons}
            onCleanUpIcons={cleanUpIcons}
            onRefreshDesktop={() => {
              setSelectedIds(new Set());
              setHoveredProjectId(null);
              setQuickLookId(null);
              notify("Desktop refreshed");
            }}
            onOpenFolder={openFolder}
          />
        )}
      </AnimatePresence>

      {/* Project icon context menu */}
      <AnimatePresence>
        {projectMenu && (
          <ProjectContextMenu
            key={`project-menu-${projectMenu.id}`}
            projectId={projectMenu.id}
            x={projectMenu.x}
            y={projectMenu.y}
            onClose={() => setProjectMenu(null)}
            onOpen={openProject}
            onQuickLook={setQuickLookId}
            onCopyLink={copyProjectLink}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {paletteOpen && (
          <CommandPalette
            key="command-palette"
            soundsOn={soundsOn}
            hasCustomLayout={Object.keys(offsets).length > 0}
            onClose={() => setPaletteOpen(false)}
            onOpenAbout={() => openWindow("about")}
            onOpenWork={() => openWindow("work")}
            onOpenContact={() => openWindow("contact")}
            onOpenTerminal={() => openWindow("terminal")}
            onOpenNotes={() => openWindow("notes")}
            onOpenResume={() => openWindow("resume")}
            onOpenMail={() => openWindow("mail")}
            onOpenPaint={() => openWindow("paint")}
            onOpenArcade={() => openWindow("arcade")}
            onOpenEstimator={() => openWindow("estimator")}
            onOpenDiagnostics={() => openWindow("diagnostics")}
            onOpenPlayground={() => openWindow("playground")}
            onOpenSettings={() => openWindow("settings")}
            onOpenShortcuts={() => setShortcutsOpen(true)}
            onOpenServices={() => openWindow("services")}
            onOpenProject={openProject}
            onQuickLook={setQuickLookId}
            onNextWallpaper={nextWallpaper}
            onToggleSounds={toggleSounds}
            onResetIcons={resetIcons}
            onOpenFolder={openFolder}
            onToggleMotion={toggleMotion}
            onCycleWeather={cycleWeather}
            onStartScreensaver={() => setSaver(true)}
          />
        )}
      </AnimatePresence>

      <NotificationToasts toasts={toasts} onDismiss={dismissToast} />

      {/* Touch equivalent of the desktop project context menu. */}
      <MobileActionSheet
        projectId={mobileSheetId}
        onClose={() => setMobileSheetId(null)}
        onOpen={openProject}
        onQuickLook={setQuickLookId}
        onCopyLink={copyProjectLink}
      />

      <ServicesIconMenu
        menu={servicesIconMenu}
        onClose={() => setServicesIconMenu(null)}
        onOpen={() => openWindow("services")}
      />

      <AppsLauncher
        isOpen={!isMobile && appsLauncherOpen}
        onClose={() => setAppsLauncherOpen(false)}
        onOpenWindow={openWindow}
        onOpenFolder={openFolder}
      />

      <MobileAppsLauncher
        isOpen={isMobile && appsLauncherOpen}
        onClose={() => setAppsLauncherOpen(false)}
        onOpenWindow={openWindow}
        onOpenFolder={openFolder}
      />

      <WelcomePanel
        isMobile={isMobile}
        onOpenWindow={openWindow}
        onOpenApps={() => setAppsLauncherOpen(true)}
      />

      <QuickLookModal
        projectId={quickLookId}
        onClose={() => setQuickLookId(null)}
        onOpenProject={(id) => { setQuickLookId(null); openProject(id); }}
        onNavigate={setQuickLookId}
      />
      <ShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <MusicPlayerWidget
        isOpen={musicPlayerOpen}
        onClose={() => setMusicPlayerOpen(false)}
        volume={volume}
        onVolumeChange={setVolume}
        onPlaybackChange={handleMusicPlayback}
      />
      <AnimatePresence>
        {wallToast > 0 && (
          <motion.p
            key={wallToast}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            aria-live="polite"
            className="pointer-events-none fixed bottom-[92px] right-5 z-40 flex items-center gap-2 rounded-full border border-white/10 bg-[#101013]/80 px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/75 backdrop-blur"
          >
            <Images size={11} />{WALLPAPERS[wallIdx].name}
          </motion.p>
        )}
      </AnimatePresence>
      <Screensaver
        active={saver && !paletteOpen && !shortcutsOpen && !musicPlayerOpen}
        trackTitle={screensaverTrack}
      />
      <AnimatePresence>
        {showHint && !windows.length && !menu && !paletteOpen && !shortcutsOpen && !hintsDismissed && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-[96px] left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-2 text-center sm:bottom-[26px] sm:left-6 sm:translate-x-0 sm:items-start sm:text-left"
          >
            <p className="pointer-events-none font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/50">
              {isMobile ? "Tap to open · Apps to explore · Long-press for more" : "Double-click to open · Drag icons · Space preview · ⌘K search · Right-click for more"}
            </p>
            <button
              type="button"
              onClick={dismissHints}
              className="text-[10px] font-medium text-emerald-400 hover:text-emerald-300"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <LockScreen isLocked={isLocked} onUnlock={() => setIsLocked(false)} />
      <CRTShutDown isShutDown={isShutDown} onPowerOn={() => setIsShutDown(false)} />
      <CustomCursor />
      <BootIntro />
    </main>
  );
}