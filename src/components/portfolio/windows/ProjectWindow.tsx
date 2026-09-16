import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Share2, Check, Maximize2 } from "lucide-react";
import { getNextProject, getProject, PROJECTS } from "@/data/projects";
import { LightboxModal } from "./LightboxModal";
import { copyText } from "@/utils/clipboard";

interface Props {
  id: string;
  onOpenProject: (id: string) => void;
  /** True when this window owns focus, so arrow keys are safe to capture. */
  isActive?: boolean;
}

function Section({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section className="mt-10 grid gap-3 md:grid-cols-[118px_1fr] md:gap-7">
      <p className="pt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/40">
        {n} · {title}
      </p>
      <div className="max-w-[62ch] text-[14.5px] leading-[1.78] text-ink/72 space-y-3">{children}</div>
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-ink/10 py-3">
      <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink/40">{label}</p>
      <p className="mt-1.5 text-[12.5px] font-medium leading-[1.45] text-ink/80">{value}</p>
    </div>
  );
}

export function ProjectWindow({ id, onOpenProject, isActive = true }: Props) {
  const project = getProject(id);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  /* Next-project navigation reuses this component. Reset before paint so the
     previous case study's scroll position never flashes on the new one. */
  useLayoutEffect(() => {
    const scroller = scrollRef.current;
    if (scroller) scroller.scrollTop = 0;
    setScrollProgress(0);
  }, [id]);

  /* Arrow keys move between case studies, but never while typing. */
  useEffect(() => {
    if (!isActive) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.matches("input, textarea, select") || target.isContentEditable)) return;

      const position = PROJECTS.findIndex((entry) => entry.id === id);
      if (position === -1) return;
      const offset = event.key === "ArrowRight" ? 1 : -1;
      const destination = PROJECTS[(position + offset + PROJECTS.length) % PROJECTS.length];
      if (!destination) return;
      event.preventDefault();
      onOpenProject(destination.id);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [id, isActive, onOpenProject]);

  if (!project) {
    return (
      <div className="os-scroll grid h-full place-items-center overflow-y-auto">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/40">
          Case file not found.
        </p>
      </div>
    );
  }

  const next = getNextProject(id);
  const currentPosition = PROJECTS.findIndex((entry) => entry.id === id);
  const previous = PROJECTS[(currentPosition - 1 + PROJECTS.length) % PROJECTS.length];
  const [g0, g1, g2] = project.gallery;
  const allImages = [
    { src: project.cover, caption: `${project.title} Hero Canvas` },
    ...project.gallery.map((g) => ({ src: g.src, caption: g.caption })),
  ];

  const handleShare = async () => {
    const copied = await copyText(
      `${window.location.origin}${window.location.pathname}#/work/${project.id}`,
    );
    if (copied) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const progress = target.scrollTop / (target.scrollHeight - target.clientHeight || 1);
    setScrollProgress(Math.min(1, Math.max(0, progress)));
  };

  const openLightboxAt = (idx: number) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  return (
    <div className="relative h-full flex flex-col bg-paper">
      {/* Reading Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-ink/5 z-20">
        <div
          className="h-full bg-emerald-600 transition-all duration-75"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="os-scroll h-full overflow-y-auto overscroll-contain"
      >
        <div className="px-5 pb-12 pt-6 md:px-9 md:pt-8">
          {/* ── masthead ── */}
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-ink/40">
            <span>
              Case study — {project.index} / {String(PROJECTS.length).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                aria-label="Share case study link"
                className="flex items-center gap-1.5 text-[10px] text-ink/60 hover:text-ink cursor-pointer transition-colors"
              >
                {copied ? <Check size={11} className="text-emerald-600" /> : <Share2 size={11} />}
                <span>{copied ? "Link Copied" : "Share"}</span>
              </button>
              <span>{project.year}</span>
            </div>
          </div>


          <h1 className="mt-4 text-[clamp(30px,4.6vw,44px)] font-medium leading-[1.02] tracking-[-0.03em] text-ink">
            {project.title}
            <span className="text-ink/30">.</span>
          </h1>
          {project.summary && (
            <p className="font-editorial mt-3 max-w-[46ch] text-[20px] italic leading-[1.3] text-ink/60">
              {project.summary}
            </p>
          )}

          {/* Meta renders only the fields that carry data. */}
          <div className="mt-7 grid grid-cols-2 gap-x-6 md:grid-cols-4">
            {project.role && <Meta label="Role" value={project.role} />}
            {project.services.length > 0 && <Meta label="Services" value={project.services.join(" · ")} />}
            {project.stack.length > 0 && <Meta label="Stack" value={project.stack.join(" / ")} />}
            <Meta label="Year" value={project.year} />
          </div>

          {project.responsibilities && project.responsibilities.length > 0 && (
            <div className="mt-6 grid gap-3 md:grid-cols-[118px_1fr] md:gap-7">
              <p className="pt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/40">
                Responsibilities
              </p>
              <ul className="max-w-[62ch] space-y-1.5 text-[14px] leading-[1.7] text-ink/72">
                {project.responsibilities.map((entry) => (
                  <li key={entry} className="flex gap-2">
                    <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-ink/30" />
                    {entry}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── cover (clickable for Lightbox) ── */}
          <figure
            onClick={() => openLightboxAt(0)}
            className="group relative mt-8 overflow-hidden rounded-[14px] ring-1 ring-black/10 cursor-pointer"
          >
            <img
              src={project.cover}
              alt={`${project.title} — hero visual`}
              className="aspect-[16/9] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            />
            <div className="absolute top-3 right-3 p-2 rounded-lg bg-black/60 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 size={14} />
            </div>
          </figure>

          {/* ── narrative — each section appears only when written ── */}
          {project.overview && (
            <Section n="01" title="Overview">
              <p>{project.overview}</p>
            </Section>
          )}
          {project.challenge && (
            <Section n="02" title="Challenge">
              <p>{project.challenge}</p>
            </Section>
          )}

          {/* gallery — full then 2-col with lightbox trigger */}
          {g0 && (
            <figure
              onClick={() => openLightboxAt(1)}
              className="group relative mt-10 cursor-pointer"
            >
              <div className="overflow-hidden rounded-[14px] ring-1 ring-black/10">
                <img
                  src={g0.src}
                  alt={g0.caption ?? ""}
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover group-hover:scale-[1.01] transition-transform duration-500"
                />
              </div>
              <div className="mt-2 flex items-center justify-between">
                {g0.caption && (
                  <figcaption className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink/35">
                    {g0.caption}
                  </figcaption>
                )}
                <span className="font-mono text-[9px] text-ink/30 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 size={10} /> Click to expand
                </span>
              </div>
            </figure>
          )}

          {(g1 || g2) && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              {[g1, g2].map((g, i) =>
                g ? (
                  <figure
                    key={i}
                    onClick={() => openLightboxAt(i + 2)}
                    className="group relative cursor-pointer"
                  >
                    <div className="overflow-hidden rounded-[12px] ring-1 ring-black/10">
                      <img
                        src={g.src}
                        alt={g.caption ?? ""}
                        loading="lazy"
                        className="aspect-[4/3] w-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      />
                    </div>
                    {g.caption && (
                      <figcaption className="mt-2 font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink/35">
                        {g.caption}
                      </figcaption>
                    )}
                  </figure>
                ) : null,
              )}
            </div>
          )}

          {project.solution && (
            <Section n="03" title="Solution">
              <p>{project.solution}</p>
            </Section>
          )}
          {project.process && (
            <Section n="04" title="Process">
              <p>{project.process}</p>
            </Section>
          )}
          {project.outcome && (
            <Section n={project.process ? "05" : "04"} title="Outcome">
              <p>{project.outcome}</p>
            </Section>
          )}

          {/* Mobile screens render only when supplied. */}
          {project.mobileScreens && project.mobileScreens.length > 0 && (
            <div className="mt-10">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/40">Mobile screens</p>
              <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {project.mobileScreens.map((screen) => (
                  <figure key={screen.src} className="overflow-hidden rounded-[12px] ring-1 ring-black/10">
                    <img src={screen.src} alt={screen.caption ?? ""} loading="lazy" className="aspect-[9/16] w-full object-cover" />
                  </figure>
                ))}
              </div>
            </div>
          )}

          {/* ── metrics ── */}
          {project.metrics.length > 0 && (
            <div className="mt-10 grid grid-cols-3 divide-x divide-ink/10 rounded-[14px] border border-ink/10 bg-white/40">
              {project.metrics.map((metric) => (
                <div key={metric.label} className="px-4 py-4 md:px-6 md:py-5">
                  <p className="text-[19px] font-medium tracking-[-0.02em] text-ink md:text-[23px]">{metric.value}</p>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-ink/45 md:text-[9.5px]">{metric.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── actions ── */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="VIEW"
                className="group inline-flex h-10 items-center gap-2 rounded-[10px] bg-ink px-4 text-[13px] font-medium text-paper transition-all hover:bg-black active:translate-y-px"
              >
                Visit live site
                <ArrowUpRight size={14} className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            )}
            {project.repo && project.showSource && (
              <a
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-ink/15 px-4 text-[13px] font-medium text-ink/75 transition-colors hover:border-ink/35 hover:text-ink"
              >
                View source
                <ArrowUpRight size={14} />
              </a>
            )}
          </div>

          {/* ── project navigation (← / → also work) ── */}
          <nav className="mt-11 grid gap-3 border-t border-ink/10 pt-6 sm:grid-cols-2" aria-label="Project navigation">
            <button
              type="button"
              onClick={() => onOpenProject(previous.id)}
              data-cursor="OPEN"
              className="group flex cursor-pointer items-center gap-3 text-left"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-ink/15 text-ink/60 transition-all duration-200 group-hover:border-ink group-hover:bg-ink group-hover:text-paper">
                <ArrowLeft size={15} />
              </span>
              <span className="min-w-0">
                <span className="block font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink/40">
                  Previous — {previous.index}
                </span>
                <span className="mt-1 block truncate text-[17px] font-medium tracking-[-0.02em] text-ink transition-transform duration-200 group-hover:-translate-x-1">
                  {previous.title}
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => onOpenProject(next.id)}
              data-cursor="OPEN"
              className="group flex cursor-pointer items-center justify-end gap-3 text-right"
            >
              <span className="min-w-0">
                <span className="block font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink/40">
                  Next — {next.index}
                </span>
                <span className="mt-1 block truncate text-[17px] font-medium tracking-[-0.02em] text-ink transition-transform duration-200 group-hover:translate-x-1">
                  {next.title}
                </span>
              </span>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-ink/15 text-ink/60 transition-all duration-200 group-hover:border-ink group-hover:bg-ink group-hover:text-paper">
                <ArrowRight size={15} />
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Lightbox Modal */}
      <LightboxModal
        images={allImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={setLightboxIndex}
      />
    </div>
  );
}
