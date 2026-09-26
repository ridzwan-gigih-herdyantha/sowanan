export const BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "sowanan-storage";

type ImagePreset = { kind: "image"; label: string; width: number; height?: number; format: "webp" | "jpeg"; quality: number; lossless?: boolean };
type FilePreset = { kind: "video" | "audio"; label: string; maxBytes: number; types: Record<string, string> };
export type Preset = ImagePreset | FilePreset;

const img = (label: string, width: number, extra: Partial<ImagePreset> = {}): ImagePreset => ({
  kind: "image",
  label,
  width,
  format: "webp",
  quality: 82,
  ...extra,
});

export const PURPOSES = {
  hero: img("Foto hero (potret)", 1600),
  herowide: img("Foto hero lebar", 2400),
  og: img("Preview WhatsApp", 1200, { height: 630, format: "jpeg" }),
  venue: img("Foto venue", 1800),
  couple: img("Foto pasangan", 1800),
  photo: img("Foto slider pasangan", 1600),
  groom: img("Foto mempelai pria", 1000),
  bride: img("Foto mempelai wanita", 1000),
  closing: img("Foto penutup", 900),
  detail: img("Foto detail", 900),
  rsvp: img("Foto RSVP", 2000),
  story: img("Foto cerita", 1400),
  gallery: img("Foto galeri", 1800),
  polaroid: img("Foto polaroid", 900),
  specimen: img("Foto spesimen", 700),
  poster: img("Poster video", 900),
  qris: img("QRIS", 800, { lossless: true }),
  video: { kind: "video", label: "Video", maxBytes: 15 * 1024 * 1024, types: { "video/mp4": "mp4", "video/webm": "webm" } },
  music: { kind: "audio", label: "Musik latar", maxBytes: 8 * 1024 * 1024, types: { "audio/mpeg": "mp3", "audio/mp4": "m4a", "audio/ogg": "ogg" } },
} satisfies Record<string, Preset>;

export type Purpose = keyof typeof PURPOSES;

export const MAX_RAW_IMAGE_BYTES = 25 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "image/avif"];

export const isPurpose = (v: string): v is Purpose => v in PURPOSES;

export const fileName = (purpose: Purpose, index: number, ext: string) => `${purpose}_${index}.${ext}`;

export function parseFileName(name: string): { purpose: string; index: number } | null {
  const m = /^([a-z]+)_(\d+)\.[a-z0-9]+$/.exec(name);
  return m ? { purpose: m[1], index: Number(m[2]) } : null;
}

export function storageBase(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url ? `${new URL(url).origin}/storage/v1/object/public/${BUCKET}/` : "";
}

export function mediaUrl(value: string): string {
  if (!value || value.startsWith("/") || /^https?:\/\//.test(value)) return value;
  return storageBase() + value;
}
