import { useMemo, useState } from "react";
import { ArrowUpRight, Filter as FilterIcon, Search } from "lucide-react";
import { PROJECTS, type Project, type ProjectKind } from "@/data/projects";

interface Props {
  onOpenProject: (id: string) => void;
}

type Filter = "all" | ProjectKind;
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All Work" },
  { id: "product", label: "Products" },
  { id: "experiment", label: "Experiments" },
];
const STACKS = ["All", "Next.js", "TypeScript", "React", "WebGL", "Supabase", "Redis"];

export function WorkWindow({ onOpenProject }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedTech, setSelectedTech] = useState("All");
  const [query, setQuery] = useState("");
  const [hovered, setHovered] = useState<Project | null>(null);

  const projects = useMemo(() => PROJECTS.filter((project) => {
    const kind = filter === "all" || project.kind === filter;
    const tech = selectedTech === "All" || project.stack.some((item) => item.toLowerCase().includes(selectedTech.toLowerCase()));
    const search = !query.trim() || `${project.title} ${project.category} ${project.summary} ${project.stack.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase());
    return kind && tech && search;
  }), [filter, query, selectedTech]);

  return (
    <div className="os-scroll h-full overflow-y-auto overscroll-contain bg-[#fbfbfa] text-ink">
      <div className="relative px-5 pb-12 pt-6 md:px-9 md:pt-8">
        <div className="flex flex-col justify-between gap-4 border-b border-ink/10 pb-5 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/40">Directory · {projects.length} of {PROJECTS.length} cases</p>
            <h2 className="mt-1.5 text-[clamp(26px,3.4vw,34px)] font-medium leading-none tracking-[-0.025em]">Selected Work & Archives</h2>
            <p className="font-editorial mt-2 text-[17px] italic text-ink/55">Production products, design systems & creative technology</p>
          </div>
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <label className="relative">
              <span className="sr-only">Filter projects</span>
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink/40" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter projects..." className="h-8 w-full rounded-[8px] border border-ink/15 bg-white pl-8 pr-3 text-xs outline-none focus:border-ink/40 sm:w-44" />
            </label>
            <div className="flex gap-1 rounded-[8px] border border-ink/10 bg-white p-0.5" role="tablist">
              {FILTERS.map((item) => (
                <button key={item.id} type="button" role="tab" aria-selected={filter === item.id} onClick={() => setFilter(item.id)} className={`h-7 cursor-pointer rounded-[6px] px-2.5 font-mono text-[9.5px] uppercase tracking-[0.14em] ${filter === item.id ? "bg-ink text-white" : "text-ink/55 hover:text-ink"}`}>{item.label}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="os-scroll flex items-center gap-1.5 overflow-x-auto py-3">
          <span className="mr-1 flex items-center gap-1 whitespace-nowrap font-mono text-[10px] uppercase tracking-wider text-ink/40"><FilterIcon size={10} /> Tech:</span>
          {STACKS.map((stack) => (
            <button key={stack} type="button" onClick={() => setSelectedTech(stack)} className={`cursor-pointer whitespace-nowrap rounded-md px-2.5 py-1 font-mono text-[10.5px] ${selectedTech === stack ? "bg-emerald-600 text-white" : "bg-ink/5 text-ink/65 hover:bg-ink/10"}`}>{stack}</button>
          ))}
        </div>

        {hovered && (
          <div className="pointer-events-none fixed right-16 top-1/2 z-30 hidden w-64 -translate-y-1/2 overflow-hidden rounded-xl border border-ink/15 bg-white shadow-2xl lg:block">
            <img src={hovered.cover} alt="" className="aspect-[16/10] w-full object-cover" />
            <div className="space-y-1 p-3">
              <span className="font-mono text-[9px] font-semibold uppercase tracking-wider text-emerald-700">{hovered.category} · {hovered.year}</span>
              <p className="text-xs font-semibold">{hovered.title}</p>
              <p className="line-clamp-2 text-[11px] leading-tight text-ink/60">{hovered.summary}</p>
            </div>
          </div>
        )}

        <div className="mt-2 border-t border-ink/10">
          {projects.map((project) => (
            <button
              key={project.id}
              type="button"
              data-cursor="OPEN"
              onClick={() => onOpenProject(project.id)}
              onMouseEnter={() => setHovered(project)}
              onMouseLeave={() => setHovered(null)}
              className="group grid w-full cursor-pointer grid-cols-[2.2rem_1fr_auto] items-center gap-3 border-b border-ink/10 py-3.5 text-left hover:bg-ink/[0.03] md:grid-cols-[2.6rem_1.2fr_1fr_8rem_4rem_1.5rem]"
            >
              <span className="font-mono text-[10.5px] text-ink/35">{project.index}</span>
              <span><span className="block text-[15px] font-medium">{project.title}</span><span className="mt-0.5 block text-[11px] text-ink/50 md:hidden">{project.category}</span></span>
              <span className="hidden text-[12.5px] text-ink/50 md:block">{project.category}</span>
              <span className="hidden gap-1 md:flex">{project.stack.slice(0, 2).map((item) => <span key={item} className="rounded bg-ink/5 px-1.5 py-0.5 font-mono text-[9.5px] text-ink/60">{item}</span>)}</span>
              <span className="text-right font-mono text-[11px] text-ink/40">{project.year}</span>
              <ArrowUpRight size={14} className="hidden text-ink/40 opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100 md:block" />
            </button>
          ))}
          {!projects.length && <p className="py-12 text-center font-mono text-[10px] uppercase tracking-wider text-ink/40">No matching projects</p>}
        </div>
      </div>
    </div>
  );
}