"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { wishesTag, type Wish } from "@/lib/guestbook";
import { GUEST_NAME_MAX, WISH_MAX } from "@/lib/guest-input";
import { archiveInfo, isDemo } from "@/lib/invitation/archive";
import { invitationDataSchema } from "@/lib/invitation/schema";
import { hasSupabase, supabaseAdmin } from "@/lib/supabase/admin";

export type ActionResult<T = null> = { ok: true; data: T } | { ok: false; error: string };

const NOT_READY = "Maaf, penyimpanan sedang tidak tersedia. Coba lagi nanti.";
const ARCHIVED = "Undangan ini sudah menjadi arsip, jadi tidak lagi menerima konfirmasi kehadiran atau ucapan baru.";

const demoMode = () => !hasSupabase() && process.env.NODE_ENV !== "production";

// Gangguan sesaat ke database dicoba ulang sekali. Penyebab aslinya dicatat di log server supaya bisa ditelusuri.
async function retry<T extends { error: { message: string } | null }>(label: string, run: () => PromiseLike<T>): Promise<T> {
  const first = await run();
  if (!first.error) return first;
  console.error(`${label} gagal, dicoba ulang:`, first.error.message);
  const second = await run();
  if (second.error) console.error(`${label} gagal lagi:`, second.error.message);
  return second;
}

type Target = { id: string; demo: boolean; archived: boolean };

// Dibaca langsung dari database, bukan dari cache halaman. Cache menyimpan hasil gagal selama beberapa menit,
// jadi satu gangguan sesaat bisa membuat semua RSVP dan ucapan ditolak. Pembekuan arsip juga berlaku tepat waktu.
// Undangan contoh di homepage hanya peragaan: kiriman tamu dibalas berhasil tapi tidak disimpan.
async function target(slug: string): Promise<Target | null> {
  const { data, error } = await retry(`Membaca undangan ${slug}`, () =>
    supabaseAdmin().from("invitations").select("id, slug, theme, data").eq("slug", slug).maybeSingle(),
  );
  if (error || !data) return null;
  const demo = isDemo(data.slug, data.theme);
  const parsed = invitationDataSchema.safeParse(data.data);
  return { id: data.id, demo, archived: parsed.success && archiveInfo(parsed.data, Date.now(), demo).archived };
}

const wishSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi.").max(GUEST_NAME_MAX, `Nama maksimal ${GUEST_NAME_MAX} karakter.`),
  message: z.string().trim().min(1, "Pesan wajib diisi.").max(WISH_MAX, `Pesan maksimal ${WISH_MAX} karakter.`),
});

export async function submitWish(slug: string, input: { name: string; message: string; website?: string }): Promise<ActionResult<Wish>> {
  if (input.website) return { ok: true, data: { id: crypto.randomUUID(), name: input.name, message: input.message } };
  const parsed = wishSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  if (demoMode()) return { ok: true, data: { id: crypto.randomUUID(), ...parsed.data } };
  const inv = await target(slug);
  if (!inv) return { ok: false, error: NOT_READY };
  if (inv.demo) return { ok: true, data: { id: crypto.randomUUID(), ...parsed.data } };
  if (inv.archived) return { ok: false, error: ARCHIVED };

  const { data, error } = await retry(`Menyimpan ucapan ${slug}`, () =>
    supabaseAdmin().from("wishes").insert({ invitation_id: inv.id, ...parsed.data }).select("id").single(),
  );
  if (error || !data) return { ok: false, error: NOT_READY };

  updateTag(wishesTag(slug));
  return { ok: true, data: { id: String(data.id), ...parsed.data } };
}

const rsvpSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi.").max(GUEST_NAME_MAX, `Nama maksimal ${GUEST_NAME_MAX} karakter.`),
  attending: z.boolean(),
  guests: z.number().int().min(0).max(2),
});

export async function submitRsvp(slug: string, input: z.infer<typeof rsvpSchema>): Promise<ActionResult> {
  const parsed = rsvpSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  if (demoMode()) return { ok: true, data: null };
  const inv = await target(slug);
  if (!inv) return { ok: false, error: NOT_READY };
  if (inv.demo) return { ok: true, data: null };
  if (inv.archived) return { ok: false, error: ARCHIVED };

  const { name, attending, guests } = parsed.data;
  const { error } = await retry(`Menyimpan RSVP ${slug}`, () =>
    supabaseAdmin().from("rsvps").insert({ invitation_id: inv.id, name, attending, guests: attending ? Math.max(1, guests) : 0 }),
  );
  if (error) return { ok: false, error: NOT_READY };

  return { ok: true, data: null };
}
