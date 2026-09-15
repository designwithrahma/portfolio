import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Clapperboard,
  Code,
  Film,
  Megaphone,
  Palette,
  Play,
  Sparkles,
} from "lucide-react";
import { SERVICE_CATEGORIES, type ServiceItem } from "@/config/services";
import { PLATFORM_LABEL, REELS, REEL_CATEGORIES, type ReelItem } from "@/config/reels";
import { ReelPlayerModal } from "./ReelPlayerModal";

interface Props {
  onOpenContact: () => void;
  onOpenEstimator: () => void;
}

const CATEGORY_ICONS = {
  palette: Palette,
  clapperboard: Clapperboard,
  code: Code,
  megaphone: Megaphone,
} as const;

type TabId = (typeof SERVICE_CATEGORIES)[number]["id"] | "showcase";

/** One service card: title, description, deliverables and a single action. */
function ServiceCard({
  service,
  onAction,
}: {
  service: ServiceItem;
  onAction: (service: ServiceItem) => void;
}) {
  return (
    <article className="group flex flex-col justify-between rounded-[13px] border border-ink/10 bg-white/65 p-4 transition-colors hover:border-ink/25 hover:bg-white">
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[15px] font-medium tracking-[-0.015em] text-ink">{service.title}</h3>
          {service.featured && (
            <span className="shrink-0 rounded-[5px] border border-ink/12 px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.16em] text-ink/45">
              Popular
            </span>
          )}
        </div>

        <p className="mt-2 text-[12.5px] leading-[1.65] text-ink/65">{service.description}</p>

        {service.deliverables && service.deliverables.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {service.deliverables.map((item) => (
              <li
                key={item}
                className="rounded-[5px] bg-ink/[0.05] px-1.5 py-0.5 font-mono text-[9.5px] tracking-[0.02em] text-ink/55"
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-ink/[0.08] pt-3">
        <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink/38">
          {service.turnaround ?? "Timeline on request"}
        </span>
        <button
          type="button"
          onClick={() => onAction(service)}
          data-cursor="OPEN"
          className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-[8px] bg-ink px-3 text-[11.5px] font-medium text-paper transition-colors hover:bg-black"
        >
          {service.actionLabel ?? "Request this"}
          <ArrowUpRight size={12} />
        </button>
      </div>
    </article>
  );
}

/** Vertical-first media gallery used by Reel Editing. */
function ReelShowcase({ onPlay }: { onPlay: (reel: ReelItem) => void }) {
  const [filter, setFilter] = useState<"all" | ReelItem["category"]>("all");
  const reels = useMemo(
    () => (filter === "all" ? REELS : REELS.filter((reel) => reel.category === filter)),
    [filter],
  );
  const hasPlaceholders = reels.some((reel) => reel.placeholder);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-ink/10 pb-4">
        <div>
          <p className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink/40">
            <Film size={12} /> Reel & video showcase
          </p>
          <h2 className="mt-1.5 text-[22px] font-medium tracking-[-0.025em] text-ink">
            Selected edits
          </h2>
          <p className="mt-1 text-[12px] text-ink/55">
            Vertical reels, shorts and campaign films. Click any tile to play it inline.
          </p>
        </div>

        <div className="flex flex-wrap gap-1" role="tablist" aria-label="Filter videos">
          {[{ id: "all" as const, title: "All" }, ...REEL_CATEGORIES].map((category) => (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={filter === category.id}
              onClick={() => setFilter(category.id as typeof filter)}
              className={`min-h-8 cursor-pointer rounded-[7px] px-2.5 font-mono text-[9.5px] uppercase tracking-[0.14em] transition-colors ${
                filter === category.id ? "bg-ink text-white" : "text-ink/50 hover:text-ink"
              }`}
            >
              {category.title}
            </button>
          ))}
        </div>
      </div>

      {hasPlaceholders && (
        <p className="mt-3 border-l border-amber-600/35 pl-3 font-mono text-[9px] uppercase tracking-[0.14em] text-amber-800/70">
          Sample media. Replace thumbnails and embed URLs in src/config/reels.ts.
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {reels.map((reel) => (
          <button
            key={reel.id}
            type="button"
            onClick={() => onPlay(reel)}
            data-cursor="PLAY"
            aria-label={`Play ${reel.title}`}
            className="group flex cursor-pointer flex-col overflow-hidden rounded-[12px] border border-ink/10 bg-white/70 text-left transition-colors hover:border-ink/25 hover:bg-white"
          >
            <div
              className={`relative w-full overflow-hidden bg-black/80 ${
                reel.aspect === "9:16" ? "aspect-[9/16]" : "aspect-video"
              }`}
            >
              <img
                src={reel.thumbnail}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <span className="absolute left-2 top-2 rounded-[5px] border border-white/20 bg-black/55 px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.14em] text-white/85 backdrop-blur-sm">
                {PLATFORM_LABEL[reel.platform]}
              </span>
              {reel.duration && (
                <span className="absolute bottom-2 right-2 rounded-[5px] bg-black/65 px-1.5 py-0.5 font-mono text-[9px] text-white/85">
                  {reel.duration}
                </span>
              )}
              <span className="absolute inset-0 grid place-items-center">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-white/35 bg-black/45 text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
                  <Play size={14} fill="currentColor" />
                </span>
              </span>
            </div>

            <div className="space-y-1 p-2.5">
              <p className="truncate text-[12.5px] font-medium text-ink">{reel.title}</p>
              <p className="line-clamp-2 text-[11px] leading-snug text-ink/55">{reel.description}</p>
              {reel.client && (
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink/35">
                  {reel.client}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/** Services app — category sidebar plus data-driven service cards. */
export function ServicesWindow({ onOpenContact, onOpenEstimator }: Props) {
  const [tab, setTab] = useState<TabId>(SERVICE_CATEGORIES[0].id);
  const [activeReel, setActiveReel] = useState<ReelItem | null>(null);

  const category = SERVICE_CATEGORIES.find((entry) => entry.id === tab);
  const services = useMemo(() => {
    if (!category) return [];
    return [...category.services].sort(
      (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)),
    );
  }, [category]);

  const reelIndex = activeReel ? REELS.findIndex((reel) => reel.id === activeReel.id) : -1;
  const stepReel = (offset: number) => {
    if (reelIndex < 0) return;
    setActiveReel(REELS[(reelIndex + offset + REELS.length) % REELS.length]);
  };

  const runAction = (service: ServiceItem) => {
    if (service.action === "showcase") setTab("showcase");
    else if (service.action === "estimate") onOpenEstimator();
    else onOpenContact();
  };

  return (
    <div className="flex h-full flex-col bg-[#f8f7f4] text-ink md:flex-row">
      {/* Sidebar / category filters */}
      <div className="os-scroll w-full shrink-0 overflow-x-auto border-b border-ink/10 bg-white p-2.5 md:w-[212px] md:overflow-y-auto md:border-b-0 md:border-r md:p-3">
        <p className="hidden px-2 pb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-ink/35 md:block">
          Services
        </p>

        <div className="flex gap-1.5 md:flex-col md:gap-1">
          {SERVICE_CATEGORIES.map((entry) => {
            const Icon = CATEGORY_ICONS[entry.icon];
            const active = tab === entry.id;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => setTab(entry.id)}
                aria-pressed={active}
                className={`flex min-h-10 shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-[9px] px-3 text-left text-[12px] font-medium transition-colors md:w-full ${
                  active ? "bg-ink text-white" : "text-ink/65 hover:bg-ink/[0.06] hover:text-ink"
                }`}
              >
                <Icon size={14} />
                <span className="truncate">{entry.title}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setTab("showcase")}
            aria-pressed={tab === "showcase"}
            className={`flex min-h-10 shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-[9px] px-3 text-left text-[12px] font-medium transition-colors md:mt-1 md:w-full ${
              tab === "showcase" ? "bg-ink text-white" : "text-ink/65 hover:bg-ink/[0.06] hover:text-ink"
            }`}
          >
            <Film size={14} />
            <span className="truncate">Reel Showcase</span>
          </button>
        </div>
      </div>

      {/* Panel */}
      <div className="os-scroll min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
        {tab === "showcase" ? (
          <ReelShowcase onPlay={setActiveReel} />
        ) : category ? (
          <>
            <div className="border-b border-ink/10 pb-4">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink/40">
                {category.services.length} services
              </p>
              <h2 className="mt-1.5 text-[clamp(22px,3vw,30px)] font-medium leading-none tracking-[-0.025em] text-ink">
                {category.title}
              </h2>
              <p className="font-editorial mt-2 text-[16px] italic leading-snug text-ink/55">
                {category.tagline}
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} onAction={runAction} />
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-ink/10 bg-white/60 p-4">
              <p className="flex items-center gap-2 text-[12.5px] text-ink/65">
                <Sparkles size={14} className="text-ink/40" />
                Need something combined across categories?
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onOpenEstimator}
                  className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-[9px] border border-ink/15 px-3 text-[12px] font-medium text-ink/75 transition-colors hover:border-ink/35 hover:text-ink"
                >
                  Estimate scope
                </button>
                <button
                  type="button"
                  onClick={onOpenContact}
                  className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-[9px] bg-ink px-3 text-[12px] font-medium text-paper transition-colors hover:bg-black"
                >
                  Start a conversation
                  <ArrowUpRight size={13} />
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <ReelPlayerModal
        reel={activeReel}
        onClose={() => setActiveReel(null)}
        onPrev={() => stepReel(-1)}
        onNext={() => stepReel(1)}
      />
    </div>
  );
}
