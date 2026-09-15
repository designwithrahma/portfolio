import { useRef, useState } from "react";
import { BookOpen, Clock, Tag, ArrowLeft, Share2, Check } from "lucide-react";
import { PORTFOLIO_CONFIG, type NoteItem } from "@/config/portfolio";

export function NotesWindow() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [copied, setCopied] = useState(false);

  const categories = ["All", ...Array.from(new Set(PORTFOLIO_CONFIG.notes.map((n) => n.category)))];

  const filtered = activeCategory === "All"
    ? PORTFOLIO_CONFIG.notes
    : PORTFOLIO_CONFIG.notes.filter((n) => n.category === activeCategory);

  const handleShare = (_note: NoteItem) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/#/notes`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openNote = (note: NoteItem) => {
    setSelectedNote(note);
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: 0, behavior: "auto" }));
  };

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto os-scroll bg-[#f8f7f4] text-ink p-5 sm:p-8">
      {selectedNote ? (
        /* Reading View */
        <article className="max-w-2xl mx-auto space-y-6">
          <button
            onClick={() => setSelectedNote(null)}
            className="flex items-center gap-1.5 text-xs font-mono text-ink/50 hover:text-ink transition-colors cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Back to Journal Index</span>
          </button>

          <header className="space-y-3 border-b border-ink/10 pb-6">
            <div className="flex items-center gap-3 text-xs font-mono text-ink/40">
              <span className="flex items-center gap-1"><Tag size={11} /> {selectedNote.category}</span>
              <span>·</span>
              <span>{selectedNote.date}</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Clock size={11} /> {selectedNote.readTime}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-ink">
              {selectedNote.title}
            </h1>

            <p className="font-editorial text-lg italic text-ink/70">
              "{selectedNote.summary}"
            </p>
          </header>

          <div className="space-y-4 text-[14.5px] leading-[1.8] text-ink/80">
            {selectedNote.content.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          <footer className="pt-6 border-t border-ink/10 flex items-center justify-between">
            <span className="text-xs font-mono text-ink/40">
              Written by {PORTFOLIO_CONFIG.identity.name}
            </span>
            <button
              onClick={() => handleShare(selectedNote)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ink/15 text-xs font-medium text-ink hover:bg-ink/5 transition-colors cursor-pointer"
            >
              {copied ? <Check size={12} className="text-emerald-600" /> : <Share2 size={12} />}
              <span>{copied ? "Link Copied" : "Share Essay"}</span>
            </button>
          </footer>
        </article>
      ) : (
        /* Index List View */
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-ink/10 pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-ink/40 uppercase tracking-widest">
                <BookOpen size={13} />
                <span>Journal &amp; Engineering Essays</span>
              </div>
              <h2 className="text-2xl font-medium tracking-tight text-ink mt-1">
                Notes on Craft &amp; Software
              </h2>
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={[
                    "px-2.5 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer",
                    activeCategory === cat
                      ? "bg-ink text-white"
                      : "bg-ink/5 text-ink/60 hover:bg-ink/10 hover:text-ink",
                  ].join(" ")}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filtered.map((note) => (
              <div
                key={note.id}
                onClick={() => openNote(note)}
                className="group p-5 rounded-xl border border-ink/10 bg-white hover:border-ink/25 hover:shadow-sm transition-all cursor-pointer space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs font-mono text-ink/40">
                  <span className="text-emerald-700 font-medium">{note.category}</span>
                  <div className="flex items-center gap-2">
                    <span>{note.date}</span>
                    <span>·</span>
                    <span>{note.readTime}</span>
                  </div>
                </div>

                <h3 className="text-lg font-medium text-ink group-hover:text-black group-hover:translate-x-0.5 transition-transform">
                  {note.title}
                </h3>

                <p className="text-xs text-ink/65 line-clamp-2 leading-relaxed font-sans">
                  {note.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
