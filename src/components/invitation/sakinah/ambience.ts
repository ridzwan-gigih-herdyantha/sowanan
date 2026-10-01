// Suasana pancuran di pelataran, disintesis dengan Web Audio tanpa rekaman dan tanpa alat musik.
// Gemericik dibentuk dari desis yang disaring, ditambah tetes air: nada pendek yang naik cepat lalu hilang.

let ctx: AudioContext | null = null;
let out: GainNode | null = null;

function audio() {
  if (!ctx) {
    ctx = new AudioContext();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 3;
    out = ctx.createGain();
    out.gain.value = 0.9;
    out.connect(comp).connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return { ctx, out: out! };
}

// Satu tetes air untuk suasana pancuran.
export function drop({ when, gain = 0.08, pitch = 1, dest }: { when?: number; gain?: number; pitch?: number; dest?: AudioNode } = {}) {
  try {
    const a = audio();
    const t = Math.max(when ?? a.ctx.currentTime, a.ctx.currentTime);
    const f0 = (520 + Math.random() * 520) * pitch;
    const len = 0.05 + Math.random() * 0.07;
    const o = a.ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f0 * (1.8 + Math.random() * 0.8), t + len);
    const g = a.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.04);
    o.connect(g).connect(dest ?? a.out);
    o.start(t);
    o.stop(t + len + 0.06);
  } catch {}
}

function noise(c: AudioContext, seconds: number) {
  const len = Math.floor(c.sampleRate * seconds);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    // Desis coklat-merah muda: lebih lembut dari desis putih, mirip aliran air.
    last = (last + 0.04 * (Math.random() * 2 - 1)) / 1.04;
    d[i] = last * 3.2 + (Math.random() * 2 - 1) * 0.12;
  }
  return buf;
}

const AHEAD = 3;

class Pancuran {
  private bus: GainNode | null = null;
  private bed: AudioBufferSourceNode | null = null;
  private timer = 0;
  private next = 0;
  playing = false;

  play() {
    if (this.playing) return;
    const a = audio();
    const t = a.ctx.currentTime;
    this.bus = a.ctx.createGain();
    this.bus.gain.setValueAtTime(0.0001, t);
    this.bus.gain.exponentialRampToValueAtTime(1, t + 1.5);
    this.bus.connect(a.out);

    // Aliran: desis lewat dua saringan, satu digoyang pelan supaya terdengar bergerak.
    const src = a.ctx.createBufferSource();
    src.buffer = noise(a.ctx, 4);
    src.loop = true;
    const bp = a.ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1100;
    bp.Q.value = 0.6;
    const lfo = a.ctx.createOscillator();
    const depth = a.ctx.createGain();
    lfo.frequency.value = 0.13;
    depth.gain.value = 380;
    lfo.connect(depth).connect(bp.frequency);
    const lp = a.ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 3200;
    const g = a.ctx.createGain();
    g.gain.value = 0.22;
    src.connect(bp).connect(lp).connect(g).connect(this.bus);
    src.start(t);
    lfo.start(t);
    this.bed = src;

    this.next = t + 0.2;
    this.playing = true;
    this.tick();
    this.timer = window.setInterval(() => this.tick(), 250);
  }

  pause() {
    if (!this.playing) return;
    this.playing = false;
    window.clearInterval(this.timer);
    const a = audio();
    const bus = this.bus;
    const bed = this.bed;
    bus?.gain.cancelScheduledValues(a.ctx.currentTime);
    bus?.gain.setTargetAtTime(0.0001, a.ctx.currentTime, 0.15);
    window.setTimeout(() => bed?.stop(), 1200);
    this.bus = null;
    this.bed = null;
  }

  // Tetes air datang bergerombol: kadang rapat, kadang jeda, seperti air jatuh dari pancuran.
  private tick() {
    const a = audio();
    if (!this.bus) return;
    while (this.next < a.ctx.currentTime + AHEAD) {
      const burst = Math.random() < 0.3;
      const n = burst ? 3 + Math.floor(Math.random() * 4) : 1;
      for (let i = 0; i < n; i++) drop({ when: this.next + i * (0.03 + Math.random() * 0.05), gain: 0.02 + Math.random() * 0.035, pitch: 0.8 + Math.random() * 0.6, dest: this.bus });
      this.next += 0.09 + Math.random() * (burst ? 0.5 : 0.28);
    }
  }
}

export const pancuran = new Pancuran();
