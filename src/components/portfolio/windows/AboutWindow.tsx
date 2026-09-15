import { ArrowUpRight } from "lucide-react";
import { EMAIL, IDENTITY, SITE_LINKS } from "@/data/socials";
import { MEDIA } from "@/data/media";
import { PORTFOLIO_CONFIG } from "@/config/portfolio";

interface Props {
  onOpenContact: () => void;
}

const CAPABILITIES: { label: string; items: readonly string[] }[] = [
  {
    label: "Design",
    items: PORTFOLIO_CONFIG.resume.skills.design,
  },
  {
    label: "Development",
    items: PORTFOLIO_CONFIG.resume.skills.development,
  },
];

const EXPERIENCE = PORTFOLIO_CONFIG.resume.experiences.map((item) => ({
  role: `${item.role} · ${item.company}`,
  years: item.period,
}));

const TOOLS = PORTFOLIO_CONFIG.resume.skills.tools;

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-ink/[0.08] pb-2">
      <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink/40">{k}</span>
      <span className="text-right text-[12px] font-medium text-ink/75">{v}</span>
    </div>
  );
}

export function AboutWindow({ onOpenContact }: Props) {
  return (
    <div className="os-scroll h-full overflow-y-auto overscroll-contain">
      <div className="grid gap-9 px-5 pb-12 pt-6 md:grid-cols-[280px_1fr] md:gap-10 md:px-9 md:pt-8">
        {/* ── portrait column ── */}
        <div>
          <figure>
            <div className="overflow-hidden rounded-[14px] ring-1 ring-black/10">
              <img
                src={MEDIA.portrait.src}
                alt={MEDIA.portrait.alt}
                className="aspect-[3/4] w-full object-cover grayscale"
              />
            </div>
            <figcaption className="mt-2 flex items-center justify-between font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink/35">
              <span>{IDENTITY.name} — studio of one</span>
              <span>Est. {IDENTITY.established}</span>
            </figcaption>
          </figure>

          <div className="mt-5 space-y-2">
            <Fact k="Based in" v={IDENTITY.location} />
            <Fact k="Timezone" v={IDENTITY.timezone} />
            <Fact k="Discipline" v={IDENTITY.discipline} />
            <Fact k="Status" v={IDENTITY.availability} />
          </div>
        </div>

        {/* ── content column ── */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/40">About — Hello</p>

          <h2 className="mt-3 max-w-[24ch] text-[clamp(25px,3.4vw,34px)] font-medium leading-[1.08] tracking-[-0.025em] text-ink">
            I design &amp; build digital products with an{" "}
            <em className="font-editorial font-normal italic">editorial eye</em> and an{" "}
            <em className="font-editorial font-normal italic">engineer's patience</em>.
          </h2>

          <p className="mt-5 max-w-[60ch] text-[14.5px] leading-[1.78] text-ink/72">
            {IDENTITY.bio}
          </p>

          {/* capabilities — lists, no fake percentage bars */}
          <div className="mt-9 grid gap-7 sm:grid-cols-2">
            {CAPABILITIES.map((cap) => (
              <div key={cap.label}>
                <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink/40">{cap.label}</p>
                <ul className="mt-3 space-y-2">
                  {cap.items.slice(0, 6).map((item, i) => (
                    <li key={item} className="flex items-baseline gap-2 text-[13px] leading-snug text-ink/75">
                      <span className="font-mono text-[9px] text-ink/30">{String(i + 1).padStart(2, "0")}</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* experience */}
          <div className="mt-9">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink/40">Experience</p>
            <div className="mt-3">
              {EXPERIENCE.map((e) => (
                <div
                  key={e.role}
                  className="flex items-baseline justify-between gap-4 border-b border-ink/[0.08] py-3 first:border-t"
                >
                  <p className="text-[13.5px] font-medium text-ink/80">{e.role}</p>
                  <p className="shrink-0 font-mono text-[10.5px] text-ink/45">{e.years}</p>
                </div>
              ))}
            </div>
          </div>

          {/* tools */}
          <div className="mt-9">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink/40">Daily tools</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {TOOLS.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-ink/12 px-2.5 py-1 font-mono text-[10px] tracking-[0.04em] text-ink/60"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onOpenContact}
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-[10px] bg-ink px-4 text-[13px] font-medium text-paper transition-all hover:bg-black active:translate-y-px"
            >
              Start a project
              <ArrowUpRight size={14} />
            </button>
            <a
              href={`mailto:${EMAIL}`}
              className="text-[13px] font-medium text-ink/60 underline decoration-ink/25 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
            >
              {EMAIL}
            </a>
            {SITE_LINKS.resume && (
              <a
                href={SITE_LINKS.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink/60 underline decoration-ink/25 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
              >
                View résumé
                <ArrowUpRight size={13} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
