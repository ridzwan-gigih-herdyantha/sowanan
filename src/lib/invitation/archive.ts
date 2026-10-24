import type { InvitationData } from "./schema";

// Tiga puluh hari setelah acara undangan dibekukan jadi arsip permanen. Isi dan ucapan tetap tampil, sedangkan
// edit, RSVP, ucapan baru, amplop digital, hitung mundur, dan link nama tamu berhenti. Klien diberi tahu H-7.
export const ARCHIVE_AFTER_DAYS = 30;
export const NOTICE_BEFORE_DAYS = 7;
const DAY = 86_400_000;

export type ArchiveInfo = {
  // Tanggal acara yang dipakai. Kosong berarti belum diisi, jadi undangan tidak pernah dibekukan.
  eventAt: Date | null;
  archiveAt: Date | null;
  noticeAt: Date | null;
  archived: boolean;
  // Sudah masuk tujuh hari terakhir sebelum beku.
  noticeDue: boolean;
};

// Undangan contoh (slug sama dengan nama temanya) dipakai di homepage, jadi tidak pernah dibekukan.
export const isDemo = (slug: string, theme: string) => slug === theme;

export function archiveInfo(data: InvitationData, now = Date.now(), demo = false): ArchiveInfo {
  return archiveFromDates(data.event.start, data.event.end, now, demo);
}

// Versi yang hanya butuh tanggal mulai dan selesai acara, untuk daftar undangan.
export function archiveFromDates(start: string | null | undefined, end: string | null | undefined, now = Date.now(), demo = false): ArchiveInfo {
  const raw = Date.parse(end || start || "");
  if (demo || !Number.isFinite(raw)) return { eventAt: null, archiveAt: null, noticeAt: null, archived: false, noticeDue: false };
  const archiveAt = new Date(raw + ARCHIVE_AFTER_DAYS * DAY);
  const noticeAt = new Date(archiveAt.getTime() - NOTICE_BEFORE_DAYS * DAY);
  return {
    eventAt: new Date(raw),
    archiveAt,
    noticeAt,
    archived: now >= archiveAt.getTime(),
    noticeDue: now >= noticeAt.getTime() && now < archiveAt.getTime(),
  };
}

// Editor bisa dibuka sementara oleh admin untuk koreksi, misalnya tanggal acara yang salah ketik.
export const editLocked = (info: ArchiveInfo, unlockedUntil: string | null | undefined, now = Date.now()) =>
  info.archived && !(unlockedUntil && Date.parse(unlockedUntil) > now);

export const activeUnlock = (until: string | null | undefined, now = Date.now()) => (until && Date.parse(until) > now ? until : null);

export function formatDateId(d: Date) {
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });
}
