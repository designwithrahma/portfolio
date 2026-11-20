import type { ManagedWindow } from "./types";

export interface WindowState {
  windows: ManagedWindow[];
  activeWindowId: string | null;
  minimizedIds: Set<string>;
}

type Action =
  | { type: "open"; window: ManagedWindow }
  | { type: "focus" | "close" | "minimize"; id: string }
  | { type: "reset" };

export function initialWindowState(window: ManagedWindow | null): WindowState {
  return { windows: window ? [window] : [], activeWindowId: window?.id ?? null, minimizedIds: new Set() };
}

export function windowReducer(state: WindowState, action: Action): WindowState {
  if (action.type === "reset") return initialWindowState(null);
  const id = action.type === "open" ? action.window.id : action.id;
  const existing = state.windows.find((item) => item.id === id);
  if (!existing && action.type !== "open") return state;
  const minimizedIds = new Set(state.minimizedIds);
  if (action.type === "open" || action.type === "focus") {
    if (action.type === "focus" && state.activeWindowId === id && !minimizedIds.has(id)) return state;
    minimizedIds.delete(id);
    // Activation order is also stacking order and determines who regains focus.
    const window = action.type === "open" ? action.window : existing!;
    return { windows: [...state.windows.filter((w) => w.id !== id), window], activeWindowId: id, minimizedIds };
  }
  const windows = action.type === "close" ? state.windows.filter((w) => w.id !== id) : state.windows;
  if (action.type === "minimize") minimizedIds.add(id);
  else minimizedIds.delete(id);
  const visible = windows.filter((w) => !minimizedIds.has(w.id));
  const activeWindowId = state.activeWindowId === id ? visible[visible.length - 1]?.id ?? null : state.activeWindowId;
  return { windows, activeWindowId, minimizedIds };
}
