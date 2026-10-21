import type { CSSProperties } from "react";

// Foto utama yang posisi dan zoomnya bisa diatur di editor, beserta isian sumbernya.
export const FRAME_SLOTS = {
  hero: "media.hero",
  heroWide: "media.heroWide",
  groom: "couple.groom.photo",
  bride: "couple.bride.photo",
  couple: "media.couple",
  venue: "media.venue",
  closing: "media.closing",
  rsvp: "media.rsvp",
} as const;
export type FrameSlot = keyof typeof FRAME_SLOTS;

export const FRAME_LABELS: Record<FrameSlot, string> = {
  hero: "foto hero (potret)",
  heroWide: "foto hero lebar",
  groom: "foto mempelai pria",
  bride: "foto mempelai wanita",
  couple: "foto berdua",
  venue: "foto tempat",
  closing: "foto penutup",
  rsvp: "foto latar RSVP",
};

export const slotOfPath = (path: string) => (Object.keys(FRAME_SLOTS) as FrameSlot[]).find((s) => FRAME_SLOTS[s] === path);

// x dan y adalah titik fokus foto dalam persen, z adalah zoom (1 berarti tanpa zoom).
export type Frame = { x: number; y: number; z: number };
export type FrameDevice = "hp" | "desktop";
export type Frames = Partial<Record<FrameSlot, Partial<Record<FrameDevice, Frame>>>>;

// Batas HP dan layar lebar, sama dengan pergantian foto hero potret ke foto hero lebar di tema.
export const FRAME_BREAKPOINT = 760;
export const ZOOM_MAX = 3;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Number.isFinite(v) ? v : lo));
export const cleanFrame = (f: Frame): Frame => ({ x: clamp(f.x, 0, 100), y: clamp(f.y, 0, 100), z: clamp(f.z, 1, ZOOM_MAX) });

const KEY = { hp: "m", desktop: "d" } as const;

export function frameVars(device: FrameDevice, f: Frame): Record<string, string> {
  const { x, y, z } = cleanFrame(f);
  const k = KEY[device];
  return { [`--f${k}-x`]: `${x}%`, [`--f${k}-y`]: `${y}%`, [`--f${k}-z`]: String(z) };
}

// Atribut untuk elemen img sebuah slot. Foto hero yang berganti antara potret dan lebar memakai slot berbeda untuk
// HP dan layar lebar. Elemen tanpa pengaturan tetap ditandai supaya editor bisa menemukan dan mengubahnya langsung.
export function frameProps(frames: Frames | undefined, hp: FrameSlot, desktop: FrameSlot = hp) {
  const m = frames?.[hp]?.hp;
  const d = frames?.[desktop]?.desktop;
  return {
    "data-frame": `${hp}:hp ${desktop}:desktop`,
    "data-frame-m": m ? "" : undefined,
    "data-frame-d": d ? "" : undefined,
    style: { ...(m && frameVars("hp", m)), ...(d && frameVars("desktop", d)) } as CSSProperties,
  };
}

export type FrameProps = ReturnType<typeof frameProps>;

export function cleanFrames(v: unknown): Frames {
  if (!v || typeof v !== "object") return {};
  const out: Frames = {};
  for (const slot of Object.keys(FRAME_SLOTS) as FrameSlot[]) {
    const s = (v as Record<string, Partial<Record<FrameDevice, Frame>> | undefined>)[slot];
    if (!s) continue;
    const entry: Partial<Record<FrameDevice, Frame>> = {};
    for (const dev of ["hp", "desktop"] as const) if (s[dev]) entry[dev] = cleanFrame(s[dev]);
    if (entry.hp || entry.desktop) out[slot] = entry;
  }
  return out;
}
