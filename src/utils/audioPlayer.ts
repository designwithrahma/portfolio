/**
 * Synthesized Ambient & Lofi Sound Engine
 * Uses WebAudio API oscillators, pink noise generators, and biquad filters
 * to produce warm ambient chords, vinyl crackle, and rain ambience with
 * zero audio file dependencies.
 */

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentTrack = 0;
  private masterGain: GainNode | null = null;
  private noiseNode: AudioNode | null = null;
  private chordInterval: number | null = null;
  private volume = 0.5;

  public tracks = [
    { title: "Midnight Ridgeline", mood: "Lofi Chords & Vinyl", key: "Dm7 - Gm7" },
    { title: "Chennai Rain", mood: "Warm Rain & Sub-Bass", key: "Fmaj7 - Am7" },
    { title: "Silicon Drift", mood: "Ambient Cyber Drone", key: "Em9 - Cmaj7" },
  ];

  private initCtx() {
    if (!this.ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume * 0.15, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
  }

  private createVinylNoise(): AudioNode {
    if (!this.ctx || !this.masterGain) throw new Error("No context");
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02; // Pink noise filter
      lastOut = data[i];
      if (Math.random() < 0.001) {
        data[i] += (Math.random() * 2 - 1) * 0.4; // Crackle pop
      }
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1200;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.value = 0.08;

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start();
    return noise;
  }

  private playChord(freqs: number[], duration = 5) {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;
    const now = this.ctx.currentTime;

    freqs.forEach((freq) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.exponentialRampToValueAtTime(800, now + duration * 0.4);
      filter.frequency.exponentialRampToValueAtTime(350, now + duration);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.06, now + 1.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration + 0.5);
    });
  }

  private startTrackSequence() {
    const chordProgressions = [
      // Track 1: Dm7 -> Gm7 -> Cmaj7 -> Fmaj7
      [
        [146.83, 220.0, 261.63, 349.23], // Dm7
        [196.0, 293.66, 349.23, 440.0],  // Gm7
        [130.81, 196.0, 246.94, 329.63], // Cmaj7
        [174.61, 261.63, 329.63, 440.0], // Fmaj7
      ],
      // Track 2: Fmaj7 -> Am7 -> Bbmaj7 -> C7
      [
        [174.61, 261.63, 329.63, 440.0],
        [220.0, 329.63, 392.0, 523.25],
        [233.08, 349.23, 440.0, 587.33],
        [261.63, 329.63, 392.0, 466.16],
      ],
      // Track 3: Em9 -> Cmaj7 -> Gmaj7 -> D
      [
        [164.81, 246.94, 329.63, 392.0, 493.88],
        [130.81, 196.0, 246.94, 329.63],
        [196.0, 293.66, 392.0, 493.88],
        [146.83, 220.0, 293.66, 370.0],
      ],
    ];

    let step = 0;
    const chords = chordProgressions[this.currentTrack % chordProgressions.length];

    this.playChord(chords[step], 5.5);
    this.chordInterval = window.setInterval(() => {
      if (!this.isPlaying) return;
      step = (step + 1) % chords.length;
      this.playChord(chords[step], 5.5);
    }, 5500);
  }

  public play() {
    this.initCtx();
    if (this.isPlaying) return;
    this.isPlaying = true;

    try {
      this.noiseNode = this.createVinylNoise();
      this.startTrackSequence();
    } catch {
      // Audio context permission
    }
  }

  public pause() {
    this.isPlaying = false;
    if (this.chordInterval) {
      clearInterval(this.chordInterval);
      this.chordInterval = null;
    }
    if (this.noiseNode) {
      try {
        (this.noiseNode as AudioBufferSourceNode).stop();
      } catch {}
      this.noiseNode = null;
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  public nextTrack(): number {
    const wasPlaying = this.isPlaying;
    this.pause();
    this.currentTrack = (this.currentTrack + 1) % this.tracks.length;
    if (wasPlaying) this.play();
    return this.currentTrack;
  }

  public prevTrack(): number {
    const wasPlaying = this.isPlaying;
    this.pause();
    this.currentTrack = (this.currentTrack - 1 + this.tracks.length) % this.tracks.length;
    if (wasPlaying) this.play();
    return this.currentTrack;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume * 0.15, this.ctx.currentTime);
    }
  }

  public getPlaying() {
    return this.isPlaying;
  }

  public getCurrentTrackIndex() {
    return this.currentTrack;
  }
}

export const lofiAudio = new AmbientSoundEngine();
