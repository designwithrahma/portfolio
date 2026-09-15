import { useState } from "react";
import { ArrowUpRight, LayoutGrid, List } from "lucide-react";
import { getFolder } from "@/config/folders";
import { getProject } from "@/data/projects";

interface Props {
  folderId: string;
  onOpenProject: (id: string) => void;
}

/** Simple data-driven folder view. Icons or list, nothing filesystem-like. */
export function FolderWindow({ folderId, onOpenProject }: Props) {
  const [view, setView] = useState<"icons" | "list">("icons");
  const folder = getFolder(folderId);

  if (!folder) {
    return (
      <div className="grid h-full place-items-center bg-paper">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/40">Folder not found.</p>
      </div>
    );
  }

  const projects = folder.projectIds
    .map((id) => getProject(id))
    .filter((project): project is NonNullable<typeof project> => Boolean(project));

  return (
    <div className="os-scroll h-full overflow-y-auto bg-paper text-ink">
      <div className="px-5 pb-10 pt-6 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-ink/10 pb-4">
          <div>
            <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink/40">
              Folder · {projects.length} items
            </p>
            <h2 className="mt-1.5 text-[22px] font-medium tracking-[-0.02em]">{folder.title}</h2>
            <p className="mt-1 text-[12px] text-ink/55">{folder.description}</p>
          </div>

          <div className="flex gap-1 rounded-[8px] border border-ink/10 bg-white/60 p-0.5" role="group" aria-label="Folder view">
            <button
              type="button"
              onClick={() => setView("icons")}
              aria-pressed={view === "icons"}
              aria-label="Icon view"
              className={`grid h-7 w-8 cursor-pointer place-items-center rounded-[6px] transition-colors ${
                view === "icons" ? "bg-ink text-white" : "text-ink/50 hover:text-ink"
              }`}
            >
              <LayoutGrid size={13} />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
              aria-label="List view"
              className={`grid h-7 w-8 cursor-pointer place-items-center rounded-[6px] transition-colors ${
                view === "list" ? "bg-ink text-white" : "text-ink/50 hover:text-ink"
              }`}
            >
              <List size={13} />
            </button>
          </div>
        </div>

        {view === "icons" ? (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {projects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => onOpenProject(project.id)}
                data-cursor="OPEN"
                className="group flex cursor-pointer flex-col items-center gap-2 rounded-[10px] border border-transparent p-3 text-center transition-colors hover:border-ink/12 hover:bg-white/60"
              >
                <img
                  src={project.icon}
                  alt=""
                  className="h-14 w-14 rounded-[10px] object-cover ring-1 ring-black/10"
                />
                <span className="line-clamp-2 text-[12px] font-medium leading-tight">{project.title}</span>
                <span className="font-mono text-[9px] uppercase tracking-wider text-ink/40">{project.year}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-3">
            {projects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => onOpenProject(project.id)}
                data-cursor="OPEN"
                className="group grid min-h-[56px] w-full cursor-pointer grid-cols-[36px_1fr_auto_18px] items-center gap-3 border-b border-ink/[0.08] text-left transition-colors hover:bg-white/45"
              >
                <img src={project.icon} alt="" className="h-8 w-8 rounded-[7px] object-cover ring-1 ring-black/10" />
                <span>
                  <span className="block text-[13.5px] font-medium">{project.title}</span>
                  <span className="block text-[11px] text-ink/50">{project.category}</span>
                </span>
                <span className="font-mono text-[10px] text-ink/40">{project.year}</span>
                <ArrowUpRight size={13} className="text-ink/30 transition-opacity group-hover:opacity-100 sm:opacity-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
