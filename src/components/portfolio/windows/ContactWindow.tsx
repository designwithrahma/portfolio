import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle, ArrowUpRight, Check, Copy, Loader2, Send } from "lucide-react";
import { EMAIL, SOCIALS } from "@/data/socials";
import { PORTFOLIO_CONFIG } from "@/config/portfolio";
import { SOCIAL_ICONS } from "../icons";
import { copyText } from "@/utils/clipboard";

type Status = "idle" | "sending" | "sent" | "error";

const inputCls =
  "h-11 w-full rounded-[10px] border border-ink/12 bg-white px-3.5 text-[16px] sm:text-[14px] text-ink placeholder:text-ink/30 outline-none transition-colors focus:border-ink/45";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function ContactWindow({ scope }: { scope?: { text: string; id: number } }) {
  const [message, setMessage] = useState(scope?.text ?? "");
  useEffect(() => { if (scope) setMessage(scope.text); }, [scope]);
  const [status, setStatus] = useState<Status>("idle");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copyEmail = async () => {
    try {
      if (!await copyText(EMAIL)) throw new Error("Copy failed");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    /* Guards against duplicate submits while a request is in flight. */
    if (status === "sending" || status === "sent") return;

    const form = e.currentTarget;
    const values = new FormData(form);
    const name = String(values.get("name") ?? "").trim();
    const email = String(values.get("email") ?? "").trim();
    const message = String(values.get("message") ?? "").trim();

    if (!name || !email || !message) {
      setStatus("error");
      setError("Please complete every field before sending.");
      return;
    }
    if (!EMAIL_PATTERN.test(email)) {
      setStatus("error");
      setError("That email address does not look valid.");
      return;
    }
    if (message.length < 10) {
      setStatus("error");
      setError("Add a little more detail so I can reply properly.");
      return;
    }

    setError(null);
    setStatus("sending");

    try {
      if (PORTFOLIO_CONFIG.contact.formEndpoint) {
        const response = await fetch(PORTFOLIO_CONFIG.contact.formEndpoint, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error("Message could not be sent");
      } else {
        /* No fake success state: without an endpoint, hand off the completed
           message to the visitor's email client. */
        const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
        const body = encodeURIComponent(`${message}\n\nFrom: ${name} <${email}>`);
        window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
        setStatus("idle");
        return;
      }
      setStatus("sent");
      form.reset();
      setMessage("");
      setTimeout(() => setStatus("idle"), 4000);
    } catch {
      setStatus("error");
      setError("Sending failed. Please email me directly instead.");
    }
  };

  return (
    <div className="os-scroll h-full overflow-y-auto overscroll-contain">
      <div className="grid gap-10 px-5 pb-12 pt-6 md:grid-cols-[1fr_1.15fr] md:gap-12 md:px-9 md:pt-8">
        {/* ── left — the ask ── */}
        <div>
          <p className="text-[12px] font-medium text-ink/60">Contact — Say hello</p>

          <h2 className="mt-3 max-w-[18ch] text-[clamp(25px,3.4vw,34px)] font-medium leading-[1.08] tracking-[-0.025em] text-ink">
            Let's build something{" "}
            <em className="font-editorial font-normal italic">meaningful</em>.
          </h2>

          <p className="mt-4 max-w-[46ch] text-[14px] leading-[1.75] text-ink/68">
            Available for freelance work and collaborations. {PORTFOLIO_CONFIG.contact.replyTime}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <a
              href={`mailto:${EMAIL}`}
              className="group inline-flex min-w-0 items-baseline gap-2 text-[clamp(14px,4vw,17px)] font-medium text-ink"
            >
              <span className="break-all underline decoration-ink/25 underline-offset-[6px] transition-colors group-hover:decoration-ink">
                {EMAIL}
              </span>
              <Send size={13} className="translate-y-[1px] text-ink/50 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <button
              type="button"
              onClick={copyEmail}
              aria-label={`Copy ${EMAIL} to clipboard`}
              className="grid h-8 w-8 cursor-pointer place-items-center rounded-[8px] border border-ink/12 text-ink/50 transition-colors hover:border-ink/40 hover:text-ink"
            >
              {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            </button>
            <span
              aria-live="polite"
              className={[
                "font-mono text-[9.5px] uppercase tracking-[0.18em] text-emerald-600 transition-opacity duration-200",
                copied ? "opacity-100" : "opacity-0",
              ].join(" ")}
            >
              Copied
            </span>
          </div>

          <div className="mt-8">
            <p className="text-[12px] font-medium text-ink/60">Elsewhere</p>
            <div className="mt-3">
              {SOCIALS.map((s) => {
                const Icon = SOCIAL_ICONS[s.id];
                return (
                  <a
                    key={s.id}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between border-b border-ink/[0.08] py-2.5 first:border-t"
                  >
                    <span className="flex items-center gap-2.5 text-[13px] font-medium text-ink/75 transition-colors group-hover:text-ink">
                      <Icon size={15} className="text-ink/45 transition-colors group-hover:text-ink" />
                      {s.label}
                    </span>
                    <span className="font-mono text-[10.5px] text-ink/40 transition-colors group-hover:text-ink/70">
                      {s.handle}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>

          <p className="mt-7 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink/50">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {PORTFOLIO_CONFIG.identity.bookingLabel}
          </p>
          {PORTFOLIO_CONFIG.links.booking && (
            <a
              href={PORTFOLIO_CONFIG.links.booking}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink/60 underline decoration-ink/25 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
            >
              Book an intro call
              <ArrowUpRight size={13} />
            </a>
          )}
        </div>

        {/* ── right — the form ── */}
        <form onSubmit={onSubmit} className="flex flex-col gap-5 md:pt-1">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-[12px] font-medium text-ink/65">
                Name
              </span>
              <input required name="name" autoComplete="name" placeholder="Ada Lovelace" className={inputCls} />
            </label>
            <label className="block">
              <span className="mb-2 block text-[12px] font-medium text-ink/65">
                Email
              </span>
              <input
                required
                type="email"
                name="email"
                autoComplete="email"
                placeholder="ada@studio.com"
                className={inputCls}
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-[12px] font-medium text-ink/65">
              Message
            </span>
            <textarea
              required
              name="message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={7}
              placeholder="What are we building? Timeline, budget range, references — anything helps."
              className="w-full resize-none rounded-[10px] border border-ink/12 bg-white px-3.5 py-3 text-[16px] sm:text-[14px] leading-[1.6] text-ink placeholder:text-ink/30 outline-none transition-colors focus:border-ink/45"
            />
          </label>

          {error && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-[9px] border border-rose-600/25 bg-rose-50/70 px-3 py-2 text-[12px] leading-snug text-rose-800"
            >
              <AlertCircle size={13} className="mt-0.5 shrink-0" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "sending" || status === "sent"}
            className={[
              "inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] text-[13px] font-medium transition-all active:translate-y-px disabled:cursor-default",
              status === "sent" ? "bg-emerald-600 text-white" : "bg-ink text-paper hover:bg-black",
            ].join(" ")}
          >
            {(status === "idle" || status === "error") && (
              <>
                {PORTFOLIO_CONFIG.contact.formEndpoint ? "Send message" : "Continue in email"}
                <Send size={13} />
              </>
            )}
            {status === "sending" && (
              <>
                Sending
                <Loader2 size={14} className="animate-spin" />
              </>
            )}
            {status === "sent" && (
              <>
                Message sent — reply within 48h
                <Check size={14} />
              </>
            )}
          </button>

          <p className="text-center text-[12px] leading-5 text-ink/60">
            {PORTFOLIO_CONFIG.contact.formEndpoint ? "Your message will be sent securely." : "This opens your email app with the message ready to send."}
          </p>
        </form>
      </div>
    </div>
  );
}
