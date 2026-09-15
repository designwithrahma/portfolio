/**
 * Feather-weight synthesized UI sounds — WebAudio oscillators only,
 * zero audio assets, zero autoplay violations (context is created on
 * first user-gesture-triggered play). Default: OFF.
 */

const KEY = "rahma-ui-sounds";

export type SoundKind = "open" | "close" | "minimize" | "switch";

let ctx: AudioContext | null = null;
let enabled: boolean = (() => {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
})();

const ensureCtx = (): AudioContext => {
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
};

function tone(freqA: number, freqB: number, dur: number, peak: number) {
  const ac = ensureCtx();
  const t0 = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(freqA, t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqB), t0 + dur);

  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

/** [startHz, endHz, duration s, peak gain] — kept whisper-quiet */
const SHAPES: Record<SoundKind, [number, number, number, number]> = {
  open: [520, 760, 0.1, 0.05],
  close: [400, 270, 0.09, 0.045],
  minimize: [340, 215, 0.12, 0.05],
  switch: [620, 540, 0.07, 0.04],
};

export const uiSound = {
  get enabled() {
    return enabled;
  },
  set(v: boolean) {
    enabled = v;
    try {
      localStorage.setItem(KEY, v ? "1" : "0");
    } catch {
      /* private mode */
    }
  },
  play(kind: SoundKind) {
    if (!enabled) return;
    try {
      const [a, b, d, p] = SHAPES[kind];
      tone(a, b, d, p);
    } catch {
      /* audio unavailable — silence is fine */
    }
  },
};
