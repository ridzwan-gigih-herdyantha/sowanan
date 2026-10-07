"use server";

import { checkInByName, checkInByToken, checkinPage, type CheckinResult } from "@/lib/checkin";
import { isDemo } from "@/lib/invitation/archive";

// Tiap aksi memeriksa ulang kode QR dan jam absensi, jadi QR yang sudah diganti admin langsung berhenti bekerja.
async function open(token: string): Promise<{ id: string; demo: boolean } | { reason: string }> {
  const page = await checkinPage(token);
  if (!page) return { reason: "QR ini sudah tidak berlaku. Tanyakan ke penerima tamu." };
  return page.open ? { id: page.row.id, demo: isDemo(page.row.slug, page.row.theme) } : { reason: page.reason };
}

// Undangan contoh hanya peragaan: tamu tidak dicari di daftar dan kehadiran tidak disimpan.
export async function checkInSelf(token: string, k: string): Promise<CheckinResult> {
  const ctx = await open(token);
  if ("reason" in ctx) return { status: "closed", reason: ctx.reason };
  return ctx.demo ? { status: "unknown" } : checkInByToken(ctx.id, k);
}

export async function checkInName(token: string, name: string): Promise<CheckinResult & { k?: string }> {
  const ctx = await open(token);
  if ("reason" in ctx) return { status: "closed", reason: ctx.reason };
  if (!ctx.demo) return checkInByName(ctx.id, name);
  const clean = name.replace(/\s+/g, " ").trim().slice(0, 80);
  return clean.length < 2 ? { status: "unknown" } : { status: "ok", name: clean, at: new Date().toISOString() };
}
