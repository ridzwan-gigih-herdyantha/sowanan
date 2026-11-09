import "server-only";
import { getSettingsFresh, packageRules, type Purchased } from "@/lib/settings";
import { validateSlug } from "@/lib/reserved-slugs";
import { BUCKET } from "@/lib/storage/media";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isDemo } from "./archive";
import { invitationDataSchema, type InvitationData } from "./schema";

// Add-on undangan kedua, misalnya untuk pihak laki-laki dan pihak perempuan. Yang biasanya sama ikut tersalin: tema,
// palet, font, data mempelai, foto, cerita, musik, dan rekening. Yang mengikuti acara diisi ulang: tanggal, jam, lokasi,
// foto tempat, susunan acara, denah, siaran, deskripsi link, dan daftar tamu. RSVP, ucapan, tamu, dan QR absensi
// menempel ke baris undangan, jadi otomatis terpisah, dan arsip dihitung dari tanggal acaranya sendiri.

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

// Alamat berkas ditulis ulang ke folder undangan baru. Menghapus undangan menghapus foldernya, jadi berkas ikut
// disalin, bukan dipakai bersama. Berkas bawaan tema (/img/...) tidak berada di folder undangan dan dibiarkan.
function moveFiles<T>(value: T, from: string, to: string, files: Map<string, string>): T {
  if (typeof value === "string") {
    if (!value.startsWith(`${from}/`)) return value;
    const [path, query] = value.split("?");
    const target = `${to}/${path.slice(from.length + 1)}`;
    files.set(path, target);
    return (query ? `${target}?${query}` : target) as T;
  }
  if (Array.isArray(value)) return value.map((v) => moveFiles(v, from, to, files)) as T;
  if (isObject(value)) return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, moveFiles(v, from, to, files)])) as T;
  return value;
}

export function duplicateData(source: InvitationData, from: string, to: string) {
  const blank = invitationDataSchema.parse({});
  // Bagian tambahan yang isinya mengikuti acara dikosongkan, jadi editor meminta isian barunya.
  const extras = source.extras.map((e) => ({
    ...e,
    rundown: [],
    plan: { src: "", w: 0, h: 0 },
    stream: { url: "", time: "" },
  }));
  const reset: InvitationData = {
    ...source,
    copyOf: from,
    // Zona waktu biasanya sama. Sisanya data acara yang harus diisi ulang.
    event: { ...blank.event, timezone: source.event.timezone },
    copy: { ...source.copy, headline: "" },
    // Foto tempat dan deskripsi link bisa menunjuk lokasi atau tanggal undangan asal. Foto tempat yang kosong memakai foto hero.
    media: { ...source.media, venue: "" },
    frames: Object.fromEntries(Object.entries(source.frames).filter(([slot]) => slot !== "venue")),
    share: blank.share,
    postGallery: [],
    extras,
  };
  const files = new Map<string, string>();
  return { data: moveFiles(reset, from, to, files), files };
}

type Source = { id: string; slug: string; theme: string; data: unknown; draft: unknown; package: string | null; addons: Purchased | null; payment_status: string; guest_message: string | null };

const COLS = "id, slug, theme, data, draft, package, addons, payment_status, guest_message";

async function loadSource(slug: string): Promise<Source | null> {
  const { data } = await supabaseAdmin().from("invitations").select(COLS).eq("slug", slug).maybeSingle();
  return (data as unknown as Source) ?? null;
}

// Satu unit add-on untuk satu salinan. Menghapus salinan mengembalikan jatahnya.
export async function duplicateAllowance(slug: string): Promise<{ couple: string; left: number; reason?: string } | null> {
  const row = await loadSource(slug);
  if (!row) return null;
  const parsed = invitationDataSchema.safeParse(row.draft ?? row.data);
  const couple = parsed.success ? [parsed.data.couple.groom.name, parsed.data.couple.bride.name].filter(Boolean).join(" & ") : "";
  if (isDemo(row.slug, row.theme)) return { couple, left: 0, reason: "Undangan contoh tidak bisa diduplikat." };
  const settings = await getSettingsFresh();
  const lock = packageRules(settings, row.package, row.addons ?? {}).locked.undangan_kedua;
  if (lock) return { couple, left: 0, reason: lock };
  const units = settings.addons.filter((a) => a.unlock === "undangan_kedua").reduce((n, a) => n + Math.max(0, row.addons?.[a.id] ?? 0), 0);
  const { count } = await supabaseAdmin().from("invitations").select("id", { count: "exact", head: true }).eq("data->>copyOf", slug);
  // Tanpa paket tidak ada kunci maupun unit, jadi jatahnya satu salinan.
  const left = (units || 1) - (count ?? 0);
  return left > 0 ? { couple, left } : { couple, left: 0, reason: "Jatah add-on undangan kedua sudah dipakai. Centang unit baru setelah dibayar, atau hapus salinan yang lama." };
}

export type DuplicateResult = { ok: true; slug: string; files: number } | { ok: false; error: string };

export async function duplicateInvitation(slug: string, rawTarget: string): Promise<DuplicateResult> {
  const target = rawTarget.trim().toLowerCase();
  const check = validateSlug(target);
  if (!check.ok) return { ok: false, error: check.reason };
  const allowance = await duplicateAllowance(slug);
  if (!allowance) return { ok: false, error: "Undangan tidak ditemukan." };
  if (allowance.reason) return { ok: false, error: allowance.reason };

  const sb = supabaseAdmin();
  const { data: taken } = await sb.from("invitations").select("id").eq("slug", target).maybeSingle();
  if (taken) return { ok: false, error: `Link sowanan.com/${target} sudah dipakai.` };

  const row = (await loadSource(slug))!;
  const parsed = invitationDataSchema.safeParse(row.draft ?? row.data);
  if (!parsed.success) return { ok: false, error: "Data undangan ini tidak bisa dibaca." };
  const { data, files } = duplicateData(parsed.data, slug, target);

  // Berkas disalin dulu. Kalau ada yang gagal, semua yang sudah tersalin dihapus lagi dan undangan tidak dibuat.
  const bucket = sb.storage.from(BUCKET);
  const copied: string[] = [];
  const undo = () => (copied.length ? bucket.remove(copied) : Promise.resolve());
  for (const [from, to] of files) {
    const { error } = await bucket.copy(from, to);
    if (error) {
      await undo();
      return { ok: false, error: `Berkas ${from.split("/").pop()} gagal disalin. Cek di halaman Media, lalu coba lagi.` };
    }
    copied.push(to);
  }

  // Add-on ikut supaya isi yang tersalin tetap terbuka, kecuali jatah undangan kedua, kuota pasca acara, dan tamu
  // terundang. Tamu terundang dilepas karena harganya untuk undangan kedua belum diputuskan, centang kalau sudah dibayar.
  const settings = await getSettingsFresh();
  const drop = new Set(settings.addons.filter((a) => a.unlock === "undangan_kedua" || a.unlock === "galeri_pasca" || a.unlock === "tamu_terundang").map((a) => a.id));
  const addons = Object.fromEntries(Object.entries(row.addons ?? {}).filter(([id]) => !drop.has(id)));
  const { error } = await sb.from("invitations").insert({ slug: target, theme: row.theme, package: row.package, addons, payment_status: row.payment_status, guest_message: row.guest_message, published: false, data, draft: data });
  if (error) {
    await undo();
    return { ok: false, error: "Gagal membuat salinan." };
  }
  return { ok: true, slug: target, files: copied.length };
}
