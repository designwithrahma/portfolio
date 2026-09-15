import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Info, X } from "lucide-react";
import type { DesktopNotification } from "@/hooks/useNotifications";

interface Props {
  toasts: DesktopNotification[];
  onDismiss: (id: string) => void;
}

/** Quiet stacked toasts above the dock; matches the desktop's dark chrome. */
export function NotificationToasts({ toasts, onDismiss }: Props) {
  const reduced = useReducedMotion();

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-[96px] left-1/2 z-[86] flex -translate-x-1/2 flex-col items-center gap-2"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: reduced ? 0 : 10, scale: reduced ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduced ? 0 : 6, scale: reduced ? 1 : 0.98 }}
            transition={{ duration: reduced ? 0.01 : 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto flex min-w-[240px] max-w-[min(92vw,360px)] items-center gap-2.5 rounded-[10px] border border-white/12 bg-[#101013]/92 px-3 py-2 text-white shadow-dock backdrop-blur-xl"
          >
            {toast.tone === "success" ? (
              <Check size={13} className="shrink-0 text-emerald-300" />
            ) : (
              <Info size={13} className="shrink-0 text-white/50" />
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-medium text-white/90">{toast.title}</span>
              {toast.detail && (
                <span className="block truncate text-[10.5px] text-white/50">{toast.detail}</span>
              )}
            </span>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="grid h-6 w-6 shrink-0 cursor-pointer place-items-center rounded-[6px] text-white/45 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={12} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
