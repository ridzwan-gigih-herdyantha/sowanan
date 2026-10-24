import { audio } from "../pakeliran/gamelan";

// Lagu chiptune Co-op Adventure, karangan sendiri, dibentuk langsung dari Web Audio:
// melodi gelombang pulsa, bas gelombang segitiga, dan desis pendek sebagai hi-hat.

// Nada dalam nomor MIDI, null berarti jeda, 0 berarti nada sebelumnya ditahan. Satu ketukan seperdelapan.
const _ = null;
const H = 0;
const LEAD: (number | null)[] = [
  76, 79, 84, 79, 76, 79, 84, 86,
  84, 81, 76, 81, 84, 81, 76, 72,
  77, 81, 84, 81, 77, 81, 84, 86,
  86, 83, 79, 83, 86, 88, 86, 83,
  88, H, 84, H, 79, H, 84, 88,
  86, H, 84, H, 81, H, 76, _,
  77, 81, 84, 89, 88, 86, 84, 81,
  83, H, 79, H, 74, 77, 79, _,
];
// Akar akor per birama: C, Am, F, G, diulang dua kali.
const ROOTS = [48, 45, 41, 43, 48, 45, 41, 43];
const STEP = 60 / 138 / 2;
const AHEAD = 1.2;

const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

let pulse: PeriodicWave | null = null;
// Gelombang pulsa seperempat, suara khas melodi konsol 8-bit.
function pulseWave(ctx: AudioContext) {
  if (pulse) return pulse;
  const n = 32;
  const real = new Float32Array(n);
  const imag = new Float32Array(n);
  for (let k = 1; k < n; k++) real[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * 0.25);
  pulse = ctx.createPeriodicWave(real, imag);
  return pulse;
}

let noise: AudioBuffer | null = null;
function noiseBuffer(ctx: AudioContext) {
  if (noise) return noise;
  const len = Math.floor(ctx.sampleRate * 0.05);
  noise = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return noise;
}

function tone(ctx: AudioContext, dest: AudioNode, { freq, when, length, gain, wave }: { freq: number; when: number; length: number; gain: number; wave: "pulse" | "triangle" }) {
  const o = ctx.createOscillator();
  if (wave === "pulse") o.setPeriodicWave(pulseWave(ctx));
  else o.type = "triangle";
  o.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(gain, when + 0.008);
  g.gain.setValueAtTime(gain, when + length * 0.7);
  g.gain.exponentialRampToValueAtTime(0.0001, when + length);
  o.connect(g).connect(dest);
  o.start(when);
  o.stop(when + length + 0.02);
}

function hat(ctx: AudioContext, dest: AudioNode, when: number, gain: number) {
  const n = ctx.createBufferSource();
  n.buffer = noiseBuffer(ctx);
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 7000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, when);
  g.gain.exponentialRampToValueAtTime(0.0001, when + 0.04);
  n.connect(hp).connect(g).connect(dest);
  n.start(when);
}

class Chiptune {
  private bus: GainNode | null = null;
  private timer = 0;
  private next = 0;
  private step = 0;
  playing = false;

  // fade dalam detik.
  play(fade = 0.6) {
    if (this.playing) return;
    const a = audio();
    // Gelombang kotak terdengar tajam, jadi disaring sedikit dan dibuat pelan.
    const soft = a.ctx.createBiquadFilter();
    soft.type = "lowpass";
    soft.frequency.value = 3600;
    this.bus = a.ctx.createGain();
    this.bus.gain.setValueAtTime(0.0001, a.ctx.currentTime);
    this.bus.gain.exponentialRampToValueAtTime(0.7, a.ctx.currentTime + Math.max(0.05, fade));
    this.bus.connect(soft).connect(a.out);
    this.next = a.ctx.currentTime + 0.1;
    this.playing = true;
    this.tick();
    this.timer = window.setInterval(() => this.tick(), 200);
  }

  pause(fade = 0.25) {
    if (!this.playing) return;
    this.playing = false;
    window.clearInterval(this.timer);
    const a = audio();
    this.bus?.gain.cancelScheduledValues(a.ctx.currentTime);
    this.bus?.gain.setTargetAtTime(0.0001, a.ctx.currentTime, Math.max(0.02, fade / 3));
    this.bus = null;
  }

  // Bunyi pendek untuk lompat, koin, dan garis akhir. Nada dimainkan berurutan dengan jarak sangat dekat.
  sfx(freqs: number[]) {
    try {
      const a = audio();
      const t = a.ctx.currentTime + 0.01;
      freqs.forEach((f, i) => tone(a.ctx, a.out, { freq: f, when: t + i * 0.06, length: i === freqs.length - 1 ? 0.14 : 0.07, gain: 0.05, wave: "pulse" }));
    } catch {}
  }

  private tick() {
    const a = audio();
    if (!this.bus) return;
    while (this.next < a.ctx.currentTime + AHEAD) {
      this.schedule(a.ctx, this.bus, this.step % LEAD.length, this.next);
      this.next += STEP;
      this.step++;
    }
  }

  private schedule(ctx: AudioContext, dest: GainNode, i: number, t: number) {
    const note = LEAD[i];
    if (note) {
      // Nada yang ditahan menyambung ke ketukan berikutnya.
      let hold = 1;
      while (LEAD[(i + hold) % LEAD.length] === H) hold++;
      tone(ctx, dest, { freq: hz(note), when: t, length: STEP * hold * 0.92, gain: 0.07, wave: "pulse" });
    }
    const bar = Math.floor(i / 8);
    const beat = i % 8;
    if (beat % 2 === 0) tone(ctx, dest, { freq: hz(ROOTS[bar] + (beat % 4 === 0 ? 0 : 12)), when: t, length: STEP * 1.8, gain: 0.2, wave: "triangle" });
    if (beat % 2 === 1) hat(ctx, dest, t, 0.05);
  }
}

export const chiptune = new Chiptune();

// Lagu kemenangan saat kedua mempelai muncul di atas istana: fanfare naik lalu nada panjang, dengan bas.
// Musik latar chiptune diredam sebentar lalu menyala lagi.
export function victory() {
  try {
    const a = audio();
    const bus = a.ctx.createGain();
    bus.gain.value = 0.9;
    bus.connect(a.out);
    const t = a.ctx.currentTime + 0.05;
    const resume = chiptune.playing;
    if (resume) chiptune.pause(0.2);
    const lead: [number, number, number][] = [
      [72, 0, 0.14],
      [76, 0.14, 0.14],
      [79, 0.28, 0.14],
      [84, 0.42, 0.28],
      [79, 0.72, 0.14],
      [84, 0.86, 0.9],
    ];
    for (const [n, at, len] of lead) tone(a.ctx, bus, { freq: hz(n), when: t + at, length: len, gain: 0.09, wave: "pulse" });
    for (const [n, at, len] of [
      [48, 0, 0.4],
      [55, 0.42, 0.3],
      [60, 0.86, 0.9],
    ] as const)
      tone(a.ctx, bus, { freq: hz(n), when: t + at, length: len, gain: 0.22, wave: "triangle" });
    if (resume) window.setTimeout(() => chiptune.play(1.2), 2400);
  } catch {}
}

// Bunyi pendek saat tombol mulai ditekan, dua nada naik.
export function startChime() {
  try {
    const a = audio();
    const t = a.ctx.currentTime + 0.02;
    const g = a.ctx.createGain();
    g.gain.value = 0.9;
    g.connect(a.out);
    tone(a.ctx, g, { freq: hz(84), when: t, length: 0.09, gain: 0.08, wave: "pulse" });
    tone(a.ctx, g, { freq: hz(91), when: t + 0.09, length: 0.22, gain: 0.08, wave: "pulse" });
  } catch {}
}
