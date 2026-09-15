export type WindowType =
  | "about"
  | "work"
  | "contact"
  | "project"
  | "terminal"
  | "notes"
  | "resume"
  | "mail"
  | "settings"
  | "shortcuts"
  | "paint"
  | "arcade"
  | "estimator"
  | "diagnostics"
  | "playground"
  | "services"
  | "folder";

export type ManagedWindow =
  | { id: string; type: "about" }
  | { id: string; type: "work" }
  | { id: string; type: "contact" }
  | { id: string; type: "terminal" }
  | { id: string; type: "notes" }
  | { id: string; type: "resume" }
  | { id: string; type: "mail" }
  | { id: string; type: "settings" }
  | { id: string; type: "shortcuts" }
  | { id: string; type: "paint" }
  | { id: string; type: "arcade" }
  | { id: string; type: "estimator" }
  | { id: string; type: "diagnostics" }
  | { id: string; type: "playground" }
  | { id: string; type: "services" }
  | { id: string; type: "folder"; folderId: string }
  | { id: string; type: "project"; projectId: string; from?: "work" };

export const windowToHash = (w: ManagedWindow | null): string => {
  if (!w) return "#/";
  switch (w.type) {
    case "about":
      return "#/about";
    case "work":
      return "#/work";
    case "contact":
      return "#/contact";
    case "terminal":
      return "#/terminal";
    case "notes":
      return "#/notes";
    case "resume":
      return "#/resume";
    case "mail":
      return "#/mail";
    case "settings":
      return "#/settings";
    case "shortcuts":
      return "#/shortcuts";
    case "paint":
      return "#/paint";
    case "arcade":
      return "#/arcade";
    case "estimator":
      return "#/estimator";
    case "diagnostics":
      return "#/diagnostics";
    case "playground":
      return "#/playground";
    case "services":
      return "#/services";
    case "folder":
      return `#/folder/${w.folderId}`;
    case "project":
      return `#/work/${w.projectId}`;
  }
};

export const hashToWindow = (hash: string): ManagedWindow | null => {
  const clean = hash.replace(/^#\/?/, "");
  if (!clean) return null;
  if (clean === "about") return { id: "win-about", type: "about" };
  if (clean === "contact") return { id: "win-contact", type: "contact" };
  if (clean === "work") return { id: "win-work", type: "work" };
  if (clean === "terminal") return { id: "win-terminal", type: "terminal" };
  if (clean === "notes") return { id: "win-notes", type: "notes" };
  if (clean === "resume") return { id: "win-resume", type: "resume" };
  if (clean === "mail") return { id: "win-mail", type: "mail" };
  if (clean === "settings") return { id: "win-settings", type: "settings" };
  if (clean === "shortcuts") return { id: "win-shortcuts", type: "shortcuts" };
  if (clean === "paint") return { id: "win-paint", type: "paint" };
  if (clean === "arcade") return { id: "win-arcade", type: "arcade" };
  if (clean === "estimator") return { id: "win-estimator", type: "estimator" };
  if (clean === "diagnostics") return { id: "win-diagnostics", type: "diagnostics" };
  if (clean === "playground") return { id: "win-playground", type: "playground" };
  if (clean === "services") return { id: "win-services", type: "services" };
  if (clean.startsWith("folder/")) {
    const id = clean.slice(7);
    if (id) return { id: `win-folder-${id}`, type: "folder", folderId: id };
  }
  if (clean.startsWith("work/")) {
    const id = clean.slice(5);
    if (id) return { id: `win-project-${id}`, type: "project", projectId: id };
  }
  /* Shareable short form: #project=echoroom */
  if (clean.startsWith("project=")) {
    const id = clean.slice(8);
    if (id) return { id: `win-project-${id}`, type: "project", projectId: id };
  }
  return null;
};
