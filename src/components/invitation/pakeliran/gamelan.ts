// Gamelan sintetis dari Web Audio. Tidak memakai rekaman: setiap bunyi dibentuk dari beberapa osilator
// dengan rasio parsial logam, dengung yang meluruh, dan ombak (dua nada yang sedikit berbeda sehingga bergetar).

// Laras slendro: lima nada per oktaf dengan jarak hampir rata, sekitar 240 sen.
// Tujuh bilah saron dari kiri ke kanan: 6 rendah, 1, 2, 3, 5, 6, 1 tinggi.
const ROOT = 294;
export const SARON = Array.from({ length: 7 }, (_, k) => ROOT * Math.pow(2, ((k - 1) * 240) / 1200));
export const SARON_DEGREES = ["6", "1", "2", "3", "5", "6", "1"] as const;

// Dikirim tiap kali gending memainkan nada saron, supaya bilah di layar ikut bergerak.
export const NOTE_EVENT = "pakeliran:note";

let ctx: AudioContext | null = null;
let out: GainNode | null = null;

// Harus dipanggil dari aksi pengguna (klik) supaya peramban mengizinkan suara.
export function audio() {
  if (!ctx) {
    ctx = new AudioContext();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 4;
    out = ctx.createGain();
    out.gain.value = 0.9;
    out.connect(comp).connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return { ctx, out: out! };
}

type Voice = "saron" | "peking" | "kenong" | "kempul" | "gong";

const VOICES: Record<Voice, { partials: [number, number][]; attack: number; decay: number; ombak: number; click: number }> = {
  saron: { partials: [[1, 1], [2.76, 0.3], [5.4, 0.1]], attack: 0.004, decay: 2.2, ombak: 2.4, click: 0.12 },
  peking: { partials: [[1, 1], [2.76, 0.22], [5.4, 0.06]], attack: 0.003, decay: 1.1, ombak: 3, click: 0.08 },
  kenong: { partials: [[1, 1], [2, 0.18], [3.01, 0.1], [4.1, 0.04]], attack: 0.01, decay: 3.4, ombak: 1.6, click: 0.04 },
  kempul: { partials: [[1, 1], [2.4, 0.16], [3.9, 0.05]], attack: 0.014, decay: 4.2, ombak: 1.8, click: 0.03 },
  gong: { partials: [[1, 1], [2.3, 0.12], [3.7, 0.04]], attack: 0.03, decay: 8, ombak: 2.6, click: 0 },
};

// Satu pukulan. when dalam detik AudioContext, gain puncak 0 sampai 1.
export function strike(freq: number, { voice = "saron", when, gain = 0.3, dest }: { voice?: Voice; when?: number; gain?: number; dest?: AudioNode } = {}) {
  try {
    const a = audio();
    const t = Math.max(when ?? a.ctx.currentTime, a.ctx.currentTime);
    const v = VOICES[voice];
    const env = a.ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(gain, t + v.attack);
    env.gain.exponentialRampToValueAtTime(0.0001, t + v.decay);
    env.connect(dest ?? a.out);

    for (const [mul, level] of v.partials) {
      // Pasangan osilator yang selisih beberapa Hz menghasilkan ombak, getaran khas gamelan.
      for (const detune of mul === 1 ? [0, v.ombak] : [0]) {
        const o = a.ctx.createOscillator();
        const g = a.ctx.createGain();
        o.frequency.value = freq * mul + detune;
        g.gain.value = (level * (mul === 1 ? 0.5 : 1)) / Math.sqrt(mul);
        o.connect(g).connect(env);
        o.start(t);
        o.stop(t + v.decay + 0.05);
      }
    }

    // Bunyi tabuh mengenai bilah: desis pendek yang disaring.
    if (v.click > 0) {
      const len = Math.floor(a.ctx.sampleRate * 0.02);
      const buf = a.ctx.createBuffer(1, len, a.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const n = a.ctx.createBufferSource();
      n.buffer = buf;
      const bp = a.ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = Math.min(6000, freq * 6);
      bp.Q.value = 1.2;
      const ng = a.ctx.createGain();
      ng.gain.value = gain * v.click * 3;
      n.connect(bp).connect(ng).connect(dest ?? a.out);
      n.start(t);
    }
  } catch {}
}

// Gending lancaran sederhana dalam laras slendro, karangan sendiri untuk tema ini.
// Angka adalah indeks bilah saron (0 = 6 rendah sampai 6 = 1 tinggi), null berarti jeda.
// Empat gongan, masing-masing empat gatra berisi empat ketukan.
const _ = null;
const BALUNGAN: (number | null)[] = [
  2, 1, 2, 0,  2, 1, 2, 3,  4, 5, 4, 3,  2, 1, 2, 0,
  4, 3, 2, 1,  0, 1, 2, 3,  4, 3, 2, 1,  3, 2, 1, 0,
  _, 5, _, 6,  4, 5, 6, 5,  4, 3, 4, 5,  2, 3, 2, 3,
  4, 5, 4, 3,  2, 3, 2, 1,  3, 2, 1, 2,  0, 1, 2, 0,
];
const BEAT = 0.72;
const AHEAD = 4;

class Gending {
  private bus: GainNode | null = null;
  private timer = 0;
  private next = 0;
  private beat = 0;
  private visuals: number[] = [];
  playing = false;

  // fade dalam detik.
  play(fade = 0.6) {
    if (this.playing) return;
    const a = audio();
    this.bus = a.ctx.createGain();
    this.bus.gain.setValueAtTime(0.0001, a.ctx.currentTime);
    this.bus.gain.exponentialRampToValueAtTime(0.85, a.ctx.currentTime + Math.max(0.05, fade));
    this.bus.connect(a.out);
    this.next = a.ctx.currentTime + 0.15;
    // Dibuka dengan gong sebelum ketukan pertama, seperti tanda gending dimulai.
    if (this.beat === 0) strike(SARON[0] / 4, { voice: "gong", when: this.next, gain: 0.5, dest: this.bus });
    this.playing = true;
    this.tick();
    this.timer = window.setInterval(() => this.tick(), 250);
  }

  pause(fade = 0.25) {
    if (!this.playing) return;
    this.playing = false;
    window.clearInterval(this.timer);
    this.visuals.forEach((t) => window.clearTimeout(t));
    this.visuals = [];
    // Nada yang sudah dijadwalkan ikut bus lama, jadi cukup bus itu yang dibisukan.
    const a = audio();
    this.bus?.gain.cancelScheduledValues(a.ctx.currentTime);
    this.bus?.gain.setTargetAtTime(0.0001, a.ctx.currentTime, Math.max(0.02, fade / 3));
    this.bus = null;
  }

  private tick() {
    const a = audio();
    if (!this.bus) return;
    while (this.next < a.ctx.currentTime + AHEAD) {
      this.schedule(this.beat % BALUNGAN.length, this.next);
      this.next += BEAT;
      this.beat++;
    }
  }

  private schedule(i: number, t: number) {
    const dest = this.bus!;
    const human = () => (Math.random() - 0.5) * 0.016;
    const note = BALUNGAN[i];
    const pos = i % 16;

    if (note !== null) {
      strike(SARON[note], { voice: "saron", when: t + human(), gain: 0.26 + Math.random() * 0.04, dest });
      const delay = (t - audio().ctx.currentTime) * 1000;
      this.visuals.push(window.setTimeout(() => window.dispatchEvent(new CustomEvent(NOTE_EVENT, { detail: note })), Math.max(0, delay)));
    }

    // Peking mengulang nada balungan dua kali, satu oktaf lebih tinggi.
    const ahead = note ?? BALUNGAN.slice(i + 1).find((n) => n !== null) ?? 0;
    strike(SARON[ahead] * 2, { voice: "peking", when: t + human(), gain: 0.08, dest });
    strike(SARON[ahead] * 2, { voice: "peking", when: t + BEAT / 2 + human(), gain: 0.06, dest });

    const last = BALUNGAN[i - (i % 4) + 3] ?? ahead;
    if (pos % 4 === 3) strike(SARON[last], { voice: "kenong", when: t, gain: 0.16, dest });
    if (pos === 5 || pos === 9 || pos === 13) strike(SARON[ahead] / 2, { voice: "kempul", when: t, gain: 0.18, dest });
    if (pos === 15) strike(SARON[last] / 4, { voice: "gong", when: t + 0.02, gain: 0.5, dest });
  }
}

export const gending = new Gending();
