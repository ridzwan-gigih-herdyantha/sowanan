"use server";

import { checkInByName, checkInByToken, checkinPage, type CheckinResult } from "@/lib/checkin";

// Tiap aksi memeriksa ulang kode QR dan jam absensi, jadi QR yang sudah diganti admin langsung berhenti bekerja.
async function open(token: string): Promise<{ id: string } | { reason: string }> {
  const page = await checkinPage(token);
  if (!page) return { reason: "QR ini sudah tidak berlaku. Tanyakan ke penerima tamu." };
  return page.open ? { id: page.row.id } : { reason: page.reason };
}

export async function checkInSelf(token: string, k: string): Promise<CheckinResult> {
  const ctx = await open(token);
  return "reason" in ctx ? { status: "closed", reason: ctx.reason } : checkInByToken(ctx.id, k);
}

export async function checkInName(token: string, name: string): Promise<CheckinResult & { k?: string }> {
  const ctx = await open(token);
  return "reason" in ctx ? { status: "closed", reason: ctx.reason } : checkInByName(ctx.id, name);
}
