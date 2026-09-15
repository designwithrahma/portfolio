import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, Disc, Volume2, X } from "lucide-react";
import { lofiAudio } from "@/utils/audioPlayer";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  volume?: number;
  onVolumeChange?: (value: number) => void;
  onPlaybackChange?: (playing: boolean, title: string | null) => void;
}

export function MusicPlayerWidget({
  isOpen,
  onClose,
  volume: controlledVolume,
  onVolumeChange,
  onPlaybackChange,
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIdx, setTrackIdx] = useState(0);
  const [volume, setVolume] = useState(0.6);

  useEffect(() => {
    setIsPlaying(lofiAudio.getPlaying());
    setTrackIdx(lofiAudio.getCurrentTrackIndex());
    if (controlledVolume !== undefined) {
      setVolume(controlledVolume);
      lofiAudio.setVolume(controlledVolume);
    }
  }, [controlledVolume, isOpen]);

  useEffect(() => {
    onPlaybackChange?.(
      isPlaying,
      isPlaying ? lofiAudio.tracks[trackIdx]?.title ?? null : null,
    );
  }, [isPlaying, onPlaybackChange, trackIdx]);

  const handleToggle = () => {
    const next = lofiAudio.toggle();
    setIsPlaying(next);
  };

  const handleNext = () => {
    const next = lofiAudio.nextTrack();
    setTrackIdx(next);
    setIsPlaying(lofiAudio.getPlaying());
  };

  const handlePrev = () => {
    const prev = lofiAudio.prevTrack();
    setTrackIdx(prev);
    setIsPlaying(lofiAudio.getPlaying());
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    lofiAudio.setVolume(val);
    onVolumeChange?.(val);
  };

  const track = lofiAudio.tracks[trackIdx];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          drag
          dragMomentum={false}
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="fixed bottom-20 left-6 z-[70] w-[290px] rounded-[16px] border border-white/15 bg-[#121216]/95 p-3.5 shadow-2xl backdrop-blur-xl text-white select-none"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Disc size={14} className={isPlaying ? "animate-spin" : ""} style={{ animationDuration: "3s" }} />
              <span className="font-mono text-[9.5px] uppercase tracking-widest font-semibold">
                Lofi Ambient Tape Deck
              </span>
            </div>
            <button
              onClick={onClose}
              aria-label="Close music player"
              className="p-1 rounded-md text-white/50 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X size={13} />
            </button>
          </div>

          {/* Cassette Visual Display */}
          <div className="relative rounded-lg bg-black/50 border border-white/10 p-3 mb-3 text-center space-y-1 overflow-hidden">
            <div className="flex items-center justify-center gap-4 py-1">
              <div className={`w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center ${isPlaying ? "animate-spin" : ""}`}>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <div className="w-12 h-2 rounded-full bg-white/10 relative overflow-hidden">
                <div className={`h-full bg-emerald-400/60 rounded-full transition-all duration-300 ${isPlaying ? "w-3/4" : "w-1/4"}`} />
              </div>
              <div className={`w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center ${isPlaying ? "animate-spin" : ""}`}>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
            </div>

            <p className="text-xs font-semibold text-white truncate">{track.title}</p>
            <p className="font-mono text-[9px] text-white/50">{track.mood} · {track.key}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 mb-2.5">
            <button
              onClick={handlePrev}
              aria-label="Previous track"
              className="p-1.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              <SkipBack size={15} />
            </button>

            <button
              onClick={handleToggle}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            >
              {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
            </button>

            <button
              onClick={handleNext}
              aria-label="Next track"
              className="p-1.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              <SkipForward size={15} />
            </button>
          </div>

          {/* Volume Slider */}
          <div className="flex items-center gap-2 px-1 pt-1 border-t border-white/5">
            <Volume2 size={12} className="text-white/40" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              aria-label="Lofi Volume Slider"
              className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
