import { useCallback, useEffect, useRef, useState } from "react";

export interface DesktopNotification {
  id: string;
  title: string;
  detail?: string;
  tone: "info" | "success";
  timestamp: number;
}

const HISTORY_LIMIT = 10;
const TOAST_DURATION = 2600;

/**
 * Minimal notification system.
 *
 * Only meaningful, user-initiated events should call `notify` — never routine
 * window opens. Toasts auto-dismiss; history is capped at ten entries.
 */
export function useNotifications() {
  const [history, setHistory] = useState<DesktopNotification[]>([]);
  const [toasts, setToasts] = useState<DesktopNotification[]>([]);
  const timers = useRef<Map<string, number>>(new Map());
  const visibleToastIds = useRef<string[]>([]);

  /* Timers are tracked so dismissals, replacements and unmount never leave
     stale callbacks updating state. */
  useEffect(() => {
    const tracked = timers.current;
    return () => {
      tracked.forEach((id) => window.clearTimeout(id));
      tracked.clear();
    };
  }, []);

  const dismissToast = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
    visibleToastIds.current = visibleToastIds.current.filter((entry) => entry !== id);
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback((title: string, detail?: string, tone: DesktopNotification["tone"] = "info") => {
    const entry: DesktopNotification = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? `notification-${crypto.randomUUID()}`
          : `notification-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      title,
      detail,
      tone,
      timestamp: Date.now(),
    };

    setHistory((current) => [entry, ...current].slice(0, HISTORY_LIMIT));

    /*
      When a fourth toast pushes an older one out of the visible stack, that
      toast's timer is cancelled immediately instead of lingering until it
      fires and runs a no-op state update.
    */
    const nextVisibleIds = [...visibleToastIds.current, entry.id].slice(-3);
    visibleToastIds.current
      .filter((id) => !nextVisibleIds.includes(id))
      .forEach((id) => {
        const stale = timers.current.get(id);
        if (stale !== undefined) window.clearTimeout(stale);
        timers.current.delete(id);
      });
    visibleToastIds.current = nextVisibleIds;
    setToasts((current) => [...current, entry].slice(-3));

    const timer = window.setTimeout(() => {
      timers.current.delete(entry.id);
      visibleToastIds.current = visibleToastIds.current.filter((id) => id !== entry.id);
      setToasts((current) => current.filter((item) => item.id !== entry.id));
    }, TOAST_DURATION);
    timers.current.set(entry.id, timer);
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  return { history, toasts, notify, dismissToast, clearHistory };
}
