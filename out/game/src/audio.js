// Golden Ladle — tiny synthesised sound effects, one job: every sfx and the
// bistro loop, all generated with WebAudio, no audio files at all.
export class SoundBank {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicTimer = null;
    this.musicStep = 0;
  }

  ensure() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch { this.ctx = null; }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  tone(freq, dur, type = 'sine', vol = 0.12, when = 0) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  noise(dur, vol = 0.15, filterFreq = 1800, when = 0) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime + when;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start(t);
  }

  pickup() { this.tone(520, 0.08, 'triangle', 0.1); this.tone(780, 0.08, 'triangle', 0.08, 0.05); }
  putdown() { this.tone(330, 0.09, 'triangle', 0.1); }
  chop() { this.noise(0.09, 0.22, 2600); this.tone(180, 0.06, 'square', 0.06); }
  chopDone() { this.tone(660, 0.1, 'triangle', 0.12); this.tone(880, 0.12, 'triangle', 0.1, 0.08); }
  sizzle() { this.noise(0.5, 0.08, 3200); }
  ding() { this.tone(1046, 0.35, 'sine', 0.14); this.tone(1568, 0.3, 'sine', 0.08, 0.02); }
  serve() {
    this.tone(523, 0.12, 'triangle', 0.12);
    this.tone(659, 0.12, 'triangle', 0.12, 0.1);
    this.tone(784, 0.2, 'triangle', 0.12, 0.2);
  }
  error() { this.tone(160, 0.18, 'sawtooth', 0.08); this.tone(120, 0.22, 'sawtooth', 0.08, 0.1); }
  expire() { this.tone(392, 0.15, 'square', 0.08); this.tone(311, 0.2, 'square', 0.08, 0.14); }
  tick() { this.tone(980, 0.05, 'square', 0.05); }

  // A light bistro waltz loop: plucked triangle notes over a soft bass.
  startMusic() {
    if (this.musicTimer || this.muted) return;
    const melody = [523, 659, 784, 659, 587, 698, 880, 698, 523, 659, 784, 880, 784, 659, 587, 523];
    const bass = [131, 98, 110, 98];
    this.musicStep = 0;
    this.musicTimer = setInterval(() => {
      if (this.muted) return;
      const i = this.musicStep % 16;
      this.tone(melody[i], 0.22, 'triangle', 0.045);
      if (i % 4 === 0) this.tone(bass[(i / 4) | 0], 0.5, 'sine', 0.06);
      this.musicStep++;
    }, 300);
  }

  stopMusic() {
    if (this.musicTimer) { clearInterval(this.musicTimer); this.musicTimer = null; }
  }
}
