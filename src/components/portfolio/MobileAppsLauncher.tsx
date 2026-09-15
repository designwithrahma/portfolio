import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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

interface MobileAppsLauncherProps {
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

export function MobileAppsLauncher({ isOpen, onClose, onOpenWindow, onOpenFolder }: MobileAppsLauncherProps) {
  const reduced = useReducedMotion();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setSearchQuery("");
    
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const sections: AppSection[] = [
    {
      title: "Main",
      items: [
        { id: "about", label: "About Designwithrahma", icon: <User size={20} />, action: () => onOpenWindow("about") },
        { id: "work", label: "Projects & Work", icon: <LayoutGrid size={20} />, action: () => onOpenWindow("work") },
        { id: "services", label: "Services", icon: <LayoutList size={20} />, action: () => onOpenWindow("services") },
        { id: "contact", label: "Contact", icon: <Mail size={20} />, action: () => onOpenWindow("contact") },
      ],
    },
    {
      title: "Creative",
      items: [
        { id: "notes", label: "Journal & Notes", icon: <BookOpen size={20} />, action: () => onOpenWindow("notes") },
        { id: "resume", label: "Curriculum Vitae", icon: <FileText size={20} />, action: () => onOpenWindow("resume") },
        { id: "mail", label: "Client Reviews", icon: <Sparkles size={20} />, action: () => onOpenWindow("mail") },
      ],
    },
    {
      title: "Tools",
      items: [
        { id: "terminal", label: "Terminal CLI", icon: <Terminal size={20} />, action: () => onOpenWindow("terminal") },
        { id: "estimator", label: "Budget Estimator", icon: <Calculator size={20} />, action: () => onOpenWindow("estimator") },
        { id: "paint", label: "Doodle Guestbook", icon: <Paintbrush size={20} />, action: () => onOpenWindow("paint") },
        { id: "arcade", label: "Mini Arcade Game", icon: <Gamepad2 size={20} />, action: () => onOpenWindow("arcade") },
        { id: "diagnostics", label: "System Diagnostics", icon: <Stethoscope size={20} />, action: () => onOpenWindow("diagnostics") },
        { id: "playground", label: "Physics Lab", icon: <FlaskConical size={20} />, action: () => onOpenWindow("playground") },
      ],
    },
    {
      title: "Folders",
      items: [
        { id: "folder-selected", label: "Selected Work", icon: <FolderOpen size={20} />, action: () => onOpenFolder("selected-work") },
        { id: "folder-experiments", label: "Experiments", icon: <FolderOpen size={20} />, action: () => onOpenFolder("experiments") },
        { id: "folder-archive", label: "Archive", icon: <FolderOpen size={20} />, action: () => onOpenFolder("archive") },
      ],
    },
    {
      title: "System",
      items: [
        { id: "settings", label: "Settings", icon: <Settings size={20} />, action: () => onOpenWindow("settings") },
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
        <div className="fixed inset-0 z-[96] flex items-end" role="dialog" aria-modal="true" aria-label="Apps Launcher">
          <motion.button
            type="button"
            aria-label="Dismiss launcher"
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
            className="relative z-10 flex max-h-[85dvh] w-full flex-col rounded-t-[20px] border-t border-white/12 bg-[#101013]/97 pt-2 text-white backdrop-blur-2xl"
          >
            {/* Drag Handle */}
            <div className="flex justify-center p-2" onClick={onClose}>
              <span aria-hidden className="block h-1.5 w-12 rounded-full bg-white/20" />
            </div>
            
            {/* Header & Search */}
            <div className="shrink-0 px-4 pb-3 pt-1">
              <div className="mb-3 flex items-center gap-2 pl-1">
                <Compass size={18} className="text-emerald-400" />
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-white/90">Explore</span>
              </div>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search apps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 w-full rounded-[10px] border border-white/10 bg-white/5 pl-10 pr-4 text-[15px] text-white placeholder:text-white/40 focus:border-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-400/50"
                />
              </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto px-2 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] scrollbar-none">
              {filteredSections.length > 0 ? (
                filteredSections.map((section, idx) => (
                  <div key={section.title} className={idx > 0 ? "mt-4" : ""}>
                    <div className="mb-2 pl-3 font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">
                      {section.title}
                    </div>
                    <div className="flex flex-col gap-1">
                      {section.items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleAction(item.action)}
                          className="flex min-h-[52px] w-full items-center gap-4 rounded-[12px] px-3 text-left text-[15px] font-medium text-white/85 transition-colors active:bg-white/10"
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/70">
                            {item.icon}
                          </span>
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-[14px] text-white/40">No apps found for "{searchQuery}"</div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
