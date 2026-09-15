import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Calculator,
  Compass,
  FileText,
  FolderOpen,
  Gamepad2,
  LayoutGrid,
  LayoutList,
  Mail,
  Paintbrush,
  Search,
  Settings,
  Sparkles,
  Stethoscope,
  Terminal,
  User,
  FlaskConical,
} from "lucide-react";
import type { WindowType } from "./types";

interface AppsLauncherProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWindow: (type: WindowType) => void;
  onOpenFolder: (id: string) => void;
}

interface AppEntry {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
}

interface AppSection {
  title: string;
  items: AppEntry[];
}

export function AppsLauncher({ isOpen, onClose, onOpenWindow, onOpenFolder }: AppsLauncherProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setSearchQuery("");
    
    const onPointer = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      // Prevent closing if interacting with scrollbar or internal elements
      if (!ref.current?.contains(target) && !target.closest('.group')) {
        onClose();
      }
    };
    
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    // Use a slight delay to avoid capturing the click that opened it
    const timer = setTimeout(() => {
      window.addEventListener("pointerdown", onPointer);
      window.addEventListener("keydown", onKey);
    }, 10);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  const sections: AppSection[] = [
    {
      title: "Main",
      items: [
        { id: "about", label: "About Designwithrahma", icon: <User size={16} />, action: () => onOpenWindow("about") },
        { id: "work", label: "Projects & Work", icon: <LayoutGrid size={16} />, action: () => onOpenWindow("work") },
        { id: "services", label: "Services", icon: <LayoutList size={16} />, action: () => onOpenWindow("services") },
        { id: "contact", label: "Contact", icon: <Mail size={16} />, action: () => onOpenWindow("contact") },
      ],
    },
    {
      title: "Creative",
      items: [
        { id: "notes", label: "Journal & Notes", icon: <BookOpen size={16} />, action: () => onOpenWindow("notes") },
        { id: "resume", label: "Curriculum Vitae", icon: <FileText size={16} />, action: () => onOpenWindow("resume") },
        { id: "mail", label: "Client Reviews", icon: <Sparkles size={16} />, action: () => onOpenWindow("mail") },
      ],
    },
    {
      title: "Tools",
      items: [
        { id: "terminal", label: "Terminal CLI", icon: <Terminal size={16} />, action: () => onOpenWindow("terminal") },
        { id: "estimator", label: "Budget Estimator", icon: <Calculator size={16} />, action: () => onOpenWindow("estimator") },
        { id: "paint", label: "Doodle Guestbook", icon: <Paintbrush size={16} />, action: () => onOpenWindow("paint") },
        { id: "arcade", label: "Mini Arcade Game", icon: <Gamepad2 size={16} />, action: () => onOpenWindow("arcade") },
        { id: "diagnostics", label: "System Diagnostics", icon: <Stethoscope size={16} />, action: () => onOpenWindow("diagnostics") },
        { id: "playground", label: "Physics Lab", icon: <FlaskConical size={16} />, action: () => onOpenWindow("playground") },
      ],
    },
    {
      title: "Folders",
      items: [
        { id: "folder-selected", label: "Selected Work", icon: <FolderOpen size={16} />, action: () => onOpenFolder("selected-work") },
        { id: "folder-experiments", label: "Experiments", icon: <FolderOpen size={16} />, action: () => onOpenFolder("experiments") },
        { id: "folder-archive", label: "Archive", icon: <FolderOpen size={16} />, action: () => onOpenFolder("archive") },
      ],
    },
    {
      title: "System",
      items: [
        { id: "settings", label: "Settings", icon: <Settings size={16} />, action: () => onOpenWindow("settings") },
      ],
    },
  ];

  const filteredSections = sections.map(section => ({
    ...section,
    items: section.items.filter(item => 
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.items.length > 0);

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={ref}
          role="dialog"
          aria-label="Apps Launcher"
          initial={{ opacity: 0, scale: 0.95, y: 10, x: "-50%" }}
          animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, scale: 0.95, y: 10, x: "-50%" }}
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
          className="fixed bottom-[90px] left-1/2 z-[85] flex max-h-[calc(100dvh-120px)] w-[340px] flex-col overflow-hidden rounded-[16px] border border-white/15 bg-[#101013]/95 shadow-2xl backdrop-blur-2xl"
        >
          {/* Header & Search */}
          <div className="shrink-0 border-b border-white/10 p-3 pb-2 pt-3">
            <div className="flex items-center gap-2 pb-2 pl-1">
              <Compass size={14} className="text-emerald-400" />
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-white/90">Explore</span>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                autoFocus
                placeholder="Search apps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 w-full rounded-md border border-white/10 bg-white/5 pl-8 pr-3 text-xs text-white placeholder:text-white/40 focus:border-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-400/50"
              />
            </div>
          </div>

          {/* Scrollable List */}
          <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
            {filteredSections.length > 0 ? (
              filteredSections.map((section, idx) => (
                <div key={section.title} className={idx > 0 ? "mt-3" : ""}>
                  <div className="mb-1 pl-2 font-mono text-[9px] uppercase tracking-[0.16em] text-white/35">
                    {section.title}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleAction(item.action)}
                        className="flex h-9 w-full items-center gap-3 rounded-md px-2 text-left text-[13px] font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:bg-white/10 focus-visible:text-white focus-visible:outline-none"
                      >
                        <span className="text-white/60">{item.icon}</span>
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-white/40">No apps found for "{searchQuery}"</div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
