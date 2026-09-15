import { useState, useRef, useEffect } from "react";
import { Terminal, Send, HelpCircle } from "lucide-react";
import { PROJECTS } from "@/data/projects";
import { PORTFOLIO_CONFIG } from "@/config/portfolio";

interface Props {
  onOpenProject: (id: string) => void;
  onOpenWindow: (
    type: "about" | "work" | "contact" | "notes" | "resume" | "mail" | "settings" | "services",
  ) => void;
  onNextWallpaper: () => void;
  onToggleSounds: () => void;
}

interface CommandHistory {
  cmd: string;
  output: string | React.ReactNode;
  time: string;
}

export function TerminalWindow({ onOpenProject, onOpenWindow, onNextWallpaper, onToggleSounds }: Props) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<CommandHistory[]>([
    {
      cmd: "init",
      output: (
        <div className="space-y-1 text-emerald-400">
          <p className="font-bold">Designwithrahma Terminal [Version 2026.4.2]</p>
          <p className="text-white/60">Type <span className="text-emerald-300 font-bold">help</span> to view available commands.</p>
        </div>
      ),
      time: new Date().toLocaleTimeString(),
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const followOutputRef = useRef(true);

  useEffect(() => {
    if (!followOutputRef.current) return;
    const scroller = scrollRef.current;
    if (scroller) scroller.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" });
  }, [history]);

  const handleCommand = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;

    const time = new Date().toLocaleTimeString();
    let output: React.ReactNode = "";

    const parts = cmd.split(" ");
    const main = parts[0];
    const arg = parts[1];

    switch (main) {
      case "help":
        output = (
          <div className="space-y-1 text-white/80">
            <p className="text-emerald-300 font-semibold mb-1.5">Available Commands:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-[12px] font-mono">
              <p><span className="text-emerald-400 font-bold">about</span> : View creator identity & biography</p>
              <p><span className="text-emerald-400 font-bold">projects</span> : List all available case studies</p>
              <p><span className="text-emerald-400 font-bold">open &lt;name&gt;</span> : Launch project case study</p>
              <p><span className="text-emerald-400 font-bold">services</span> : Browse services & reel showcase</p>
              <p><span className="text-emerald-400 font-bold">notes</span> : Read design engineering essays</p>
              <p><span className="text-emerald-400 font-bold">resume</span> : View credentials & experience</p>
              <p><span className="text-emerald-400 font-bold">reviews</span> : Read client testimonials</p>
              <p><span className="text-emerald-400 font-bold">contact</span> : Get in touch or send a message</p>
              <p><span className="text-emerald-400 font-bold">skills</span> : List design & tech stack</p>
              <p><span className="text-emerald-400 font-bold">wallpaper</span> : Cycle desktop wallpaper</p>
              <p><span className="text-emerald-400 font-bold">sounds</span> : Toggle UI sound effects</p>
              <p><span className="text-emerald-400 font-bold">whoami</span> : Display visitor permissions</p>
              <p><span className="text-emerald-400 font-bold">date</span> : Print current system timestamp</p>
              <p><span className="text-emerald-400 font-bold">clear</span> : Clear terminal output</p>
            </div>
          </div>
        );
        break;

      case "about":
        output = (
          <div className="space-y-1 text-white/80">
            <p className="font-bold text-white">{PORTFOLIO_CONFIG.identity.name} — {PORTFOLIO_CONFIG.identity.role}</p>
            <p className="text-white/60">{PORTFOLIO_CONFIG.identity.bio}</p>
            <p className="text-emerald-400 text-xs mt-1">Location: {PORTFOLIO_CONFIG.identity.location} | Status: {PORTFOLIO_CONFIG.identity.status}</p>
          </div>
        );
        onOpenWindow("about");
        break;

      case "projects":
        output = (
          <div className="space-y-1 text-white/80">
            <p className="text-emerald-300 font-semibold">Project Index:</p>
            {PROJECTS.map((p) => (
              <div key={p.id} className="flex items-center gap-3 text-xs">
                <span className="text-emerald-400 font-bold w-6">{p.index}</span>
                <span className="font-bold text-white w-32">{p.title}</span>
                <span className="text-white/50">{p.category} ({p.year})</span>
                <button
                  onClick={() => onOpenProject(p.id)}
                  className="ml-auto text-emerald-400 underline hover:text-emerald-300 cursor-pointer"
                >
                  open
                </button>
              </div>
            ))}
          </div>
        );
        break;

      case "open":
        if (!arg) {
          output = <span className="text-amber-400">Usage: open &lt;project-id&gt; (e.g. open echoroom, open haction)</span>;
        } else {
          const match = PROJECTS.find((p) => p.id.toLowerCase() === arg || p.title.toLowerCase() === arg);
          if (match) {
            output = <span className="text-emerald-400">Launching case study: {match.title}...</span>;
            onOpenProject(match.id);
          } else {
            output = <span className="text-rose-400">Error: Project "{arg}" not found. Type 'projects' to list valid IDs.</span>;
          }
        }
        break;

      case "services":
      case "pricing":
      case "hire":
        output = <span className="text-emerald-400">Opening Services catalogue...</span>;
        onOpenWindow("services");
        break;

      case "notes":
      case "essays":
      case "journal":
        output = <span className="text-emerald-400">Opening Notes & Journal app...</span>;
        onOpenWindow("notes");
        break;

      case "resume":
      case "cv":
        output = <span className="text-emerald-400">Opening Interactive Resume...</span>;
        onOpenWindow("resume");
        break;

      case "reviews":
      case "testimonials":
      case "mail":
        output = <span className="text-emerald-400">Opening Client Testimonials...</span>;
        onOpenWindow("mail");
        break;

      case "contact":
      case "email":
        output = <span className="text-emerald-400">Opening Contact portal ({PORTFOLIO_CONFIG.contact.email})...</span>;
        onOpenWindow("contact");
        break;

      case "skills":
      case "stack":
        output = (
          <div className="space-y-1.5 text-white/80">
            <p className="text-emerald-300 font-semibold">Core Capabilities:</p>
            <p><span className="text-white/50">Development:</span> {PORTFOLIO_CONFIG.resume.skills.development.join(", ")}</p>
            <p><span className="text-white/50">Design:</span> {PORTFOLIO_CONFIG.resume.skills.design.join(", ")}</p>
            <p><span className="text-white/50">Tools:</span> {PORTFOLIO_CONFIG.resume.skills.tools.join(", ")}</p>
          </div>
        );
        break;

      case "wallpaper":
      case "bg":
        onNextWallpaper();
        output = <span className="text-emerald-400">Switched desktop wallpaper successfully.</span>;
        break;

      case "sounds":
      case "audio":
        onToggleSounds();
        output = <span className="text-emerald-400">Toggled UI synthesized sound effects.</span>;
        break;

      case "whoami":
        output = <span className="text-emerald-300">visitor@designwithrahma [role: guest-explorer, access: full-read]</span>;
        break;

      case "date":
      case "time":
        output = <span className="text-emerald-400">{new Date().toString()}</span>;
        break;

      case "clear":
      case "cls":
        setHistory([]);
        setInput("");
        return;

      default:
        output = (
          <span className="text-rose-400">
            Command not recognized: "{cmd}". Type <span className="text-emerald-300 underline font-bold">help</span> for available commands.
          </span>
        );
    }

    setHistory((prev) => [...prev, { cmd: raw, output, time }]);
    setInput("");
  };

  return (
    <div
      ref={scrollRef}
      onClick={() => inputRef.current?.focus()}
      onScroll={(event) => {
        const element = event.currentTarget;
        followOutputRef.current =
          element.scrollHeight - element.scrollTop - element.clientHeight < 56;
      }}
      className="h-full bg-[#0a0a0d] text-white/90 font-mono text-[13px] p-4 sm:p-6 overflow-y-auto flex flex-col os-scroll cursor-text"
    >
      <div className="space-y-4 flex-1">
        {history.map((h, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex items-center gap-2 text-white/45 text-xs">
              <span className="text-emerald-500 font-bold">visitor@designwithrahma:~$</span>
              <span className="text-white font-medium">{h.cmd}</span>
              <span className="ml-auto text-[10px] text-white/30">{h.time}</span>
            </div>
            <div className="pl-3 border-l border-emerald-500/20 py-0.5">{h.output}</div>
          </div>
        ))}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCommand(input);
          }}
          className="flex items-center gap-2 pt-2"
        >
          <span className="text-emerald-500 font-bold shrink-0">visitor@designwithrahma:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-white outline-none border-none font-mono text-[13px] caret-emerald-400"
            placeholder="Type 'help'..."
          />
          <button type="submit" aria-label="Send command" className="text-white/30 hover:text-emerald-400">
            <Send size={13} />
          </button>
        </form>
        <div ref={bottomRef} />
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10.5px] text-white/35 shrink-0">
        <span className="flex items-center gap-1.5">
          <Terminal size={12} className="text-emerald-500" />
          Interactive Shell v2.6
        </span>
        <span className="flex items-center gap-1">
          <HelpCircle size={11} /> Type help to explore
        </span>
      </div>
    </div>
  );
}
