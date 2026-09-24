"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { getInvitationId, wishesTag, type Wish } from "@/lib/guestbook";
import { hasSupabase, supabaseAdmin } from "@/lib/supabase/admin";

export type ActionResult<T = null> = { ok: true; data: T } | { ok: false; error: string };

const NOT_READY = "Maaf, penyimpanan sedang tidak tersedia. Coba lagi nanti.";
const demoMode = () => !hasSupabase() && process.env.NODE_ENV !== "production";

const wishSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi.").max(80),
  message: z.string().trim().min(1, "Pesan wajib diisi.").max(500, "Pesan maksimal 500 karakter."),
});

export async function submitWish(slug: string, input: { name: string; message: string; website?: string }): Promise<ActionResult<Wish>> {
  if (input.website) return { ok: true, data: { name: input.name, message: input.message } };
  const parsed = wishSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  if (demoMode()) return { ok: true, data: parsed.data };
  const id = await getInvitationId(slug);
  if (!id) return { ok: false, error: NOT_READY };

  const { error } = await supabaseAdmin().from("wishes").insert({ invitation_id: id, ...parsed.data });
  if (error) return { ok: false, error: NOT_READY };

  updateTag(wishesTag(slug));
  return { ok: true, data: parsed.data };
}

const rsvpSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi.").max(80),
  attending: z.boolean(),
  guests: z.number().int().min(0).max(2),
});

export async function submitRsvp(slug: string, input: z.infer<typeof rsvpSchema>): Promise<ActionResult> {
  const parsed = rsvpSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  if (demoMode()) return { ok: true, data: null };
  const id = await getInvitationId(slug);
  if (!id) return { ok: false, error: NOT_READY };

  const { name, attending, guests } = parsed.data;
  const { error } = await supabaseAdmin()
    .from("rsvps")
    .insert({ invitation_id: id, name, attending, guests: attending ? Math.max(1, guests) : 0 });
  if (error) return { ok: false, error: NOT_READY };

  return { ok: true, data: null };
}
