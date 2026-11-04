"use server";

import { checkInByName, checkInByToken, checkinPage, type CheckinResult } from "@/lib/checkin";
import { isDemo } from "@/lib/invitation/archive";
import { codeLimited, noteWrongCode } from "@/lib/invitation/private";

// Tiap aksi memeriksa ulang kode QR dan jam absensi, jadi QR lama yang diganti admin langsung mati.
async function open(token: string): Promise<{ id: string; slug: string; demo: boolean; private: boolean } | { reason: string }> {
  const page = await checkinPage(token);
  if (!page) return { reason: "QR ini sudah tidak berlaku. Tanyakan ke penerima tamu." };
  return page.open ? { id: page.row.id, slug: page.row.slug, demo: isDemo(page.row.slug, page.row.theme), private: page.row.private } : { reason: page.reason };
}

// Undangan contoh hanya peragaan: tamu tidak dicari di daftar dan kehadiran tidak disimpan.
// Di undangan private, tebakan kode lewat QR ikut dibatasi karena jawabannya memuat nama tamu.
export async function checkInSelf(token: string, k: string): Promise<CheckinResult> {
  const ctx = await open(token);
  if ("reason" in ctx) return { status: "closed", reason: ctx.reason };
  if (ctx.demo) return { status: "unknown" };
  if (ctx.private && (await codeLimited(ctx.slug))) return { status: "unknown" };
  const res = await checkInByToken(ctx.id, k);
  if (ctx.private && res.status === "unknown") await noteWrongCode(ctx.slug);
  return res;
}

// QR absensi bisa dipakai siapa pun di lokasi, jadi kode tamu tidak dikembalikan di undangan private. Kalau
// dikembalikan, siapa pun yang tahu nama tamu bisa mendapat kode untuk membuka undangannya.
export async function checkInName(token: string, name: string): Promise<CheckinResult & { k?: string }> {
  const ctx = await open(token);
  if ("reason" in ctx) return { status: "closed", reason: ctx.reason };
  if (!ctx.demo) {
    const res = await checkInByName(ctx.id, name);
    return ctx.private ? { ...res, k: undefined } : res;
  }
  const clean = name.replace(/\s+/g, " ").trim().slice(0, 80);
  return clean.length < 2 ? { status: "unknown" } : { status: "ok", name: clean, at: new Date().toISOString() };
}
