/**
 * DESKTOP FOLDERS
 * ---------------
 * Folders are an additional way to browse work. They never replace the
 * standalone project icons and never duplicate project data — they only
 * reference project ids from src/config/projects.ts.
 */

export interface DesktopFolder {
  id: string;
  title: string;
  /** Short line shown inside the folder window header. */
  description: string;
  projectIds: string[];
}

export const DESKTOP_FOLDERS: DesktopFolder[] = [
  {
    id: "selected-work",
    title: "Selected Work",
    description: "Shipped products and client platforms.",
    projectIds: ["echoroom", "haction", "siddhavanam", "bizerax"],
  },
  {
    id: "experiments",
    title: "Experiments",
    description: "Interactive studies and creative technology.",
    projectIds: ["voxel-world", "monoshift"],
  },
  {
    id: "archive",
    title: "Archive",
    description: "Everything in one place.",
    projectIds: ["echoroom", "haction", "siddhavanam", "voxel-world", "monoshift", "bizerax"],
  },
];

export const getFolder = (id: string) => DESKTOP_FOLDERS.find((folder) => folder.id === id);
