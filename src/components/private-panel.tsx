"use client";

import { useState, type FormEvent } from "react";
import { useWorking } from "@/app/(site)/admin/use-working";
import { privateLink, type GuestSession } from "@/lib/guests";

type Res<T> = { ok: true; data: T } | { ok: false; error: string };
export type SessionInput = { name: string; time: string; until: string };

// Aksi server milik admin atau mempelai. Masing-masing memeriksa hak aksesnya sendiri.
export type PrivateActions = {
  setPrivate: (on: boolean) => Promise<Res<null>>;
  addSession: (input: SessionInput) => Promise<Res<GuestSession>>;
  updateSession: (id: number, input: SessionInput) => Promise<Res<GuestSession>>;
  removeSession: (id: number) => Promise<Res<null>>;
  setSessionItem: (name: string) => Promise<Res<null>>;
};

export type PrivateMode = {
  on: boolean;
  coupleCode: string;
  sessions: GuestSession[];
  sessionItem: string;
  // Nama item susunan acara di versi tayang.
  scheduleNames: string[];
  // Alasan mode private tidak bisa dinyalakan. Kosong berarti boleh.
  lock: string | null;
};

type Props = {
  slug: string;
  origin: string;
  mode: PrivateMode;
  on: boolean;
  onToggle: (on: boolean) => void;
  sessions: GuestSession[];
  onSessions: (list: GuestSession[]) => void;
  actions: PrivateActions;
};

const field = "block w-full rounded-sm border border-line bg-white px-3 py-2 text-base font-normal outline-none focus:border-wine";
const EMPTY: SessionInput = { name: "", time: "", until: "" };

export const sessionClock = (s: GuestSession) => `${s.time}${s.until ? ` sampai ${s.until}` : ""}`;
const sorted = (list: GuestSession[]) => [...list].sort((a, b) => a.time.localeCompare(b.time) || a.id - b.id);

// Pilihan sesi satu tamu. Kosong berarti tamu melihat semua sesi.
export function SessionSelect({ sessions, value, disabled, onChange, label }: { sessions: GuestSession[]; value: number | null | undefined; disabled?: boolean; onChange: (id: number | null) => void; label: string }) {
  return (
    <select aria-label={label} value={value ?? ""} disabled={disabled} onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)} className="max-w-44 rounded-sm border border-line bg-white px-2 py-1 text-[13px] outline-none focus:border-wine disabled:opacity-60">
      <option value="">Semua sesi</option>
      {sessions.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}, {s.time}
        </option>
      ))}
    </select>
  );
}

export function PrivatePanel({ slug, origin, mode, on, onToggle, sessions, onSessions, actions }: Props) {
  const [error, setError] = useState("");
  const { working, run } = useWorking(setError);
  const [draft, setDraft] = useState<SessionInput>(EMPTY);
  const [editing, setEditing] = useState<number | null>(null);
  const [item, setItem] = useState(mode.sessionItem);
  const [copied, setCopied] = useState(false);
  const coupleUrl = privateLink(origin, slug, mode.coupleCode);

  function toggle(next: boolean) {
    const ask = next
      ? "Nyalakan mode private? Undangan hanya bisa dibuka lewat link berisi kode tamu. Link lama tanpa kode tidak lagi terbuka, jadi kirim ulang link dari daftar tamu."
      : "Matikan mode private? Undangan bisa dibuka lagi oleh siapa pun yang tahu alamatnya.";
    if (!confirm(ask)) return;
    run("mode", async () => {
      const res = await actions.setPrivate(next);
      if (!res.ok) return setError(res.error);
      setError("");
      onToggle(next);
    });
  }

  function saveSession(e: FormEvent) {
    e.preventDefault();
    run("sesi", async () => {
      const res = editing === null ? await actions.addSession(draft) : await actions.updateSession(editing, draft);
      if (!res.ok) return setError(res.error);
      setError("");
      onSessions(sorted(editing === null ? [...sessions, res.data] : sessions.map((s) => (s.id === res.data.id ? res.data : s))));
      setDraft(EMPTY);
      setEditing(null);
    });
  }

  function remove(s: GuestSession) {
    if (!confirm(`Hapus ${s.name}?`)) return;
    run(`hapus:${s.id}`, async () => {
      const res = await actions.removeSession(s.id);
      if (!res.ok) return setError(res.error);
      setError("");
      onSessions(sessions.filter((x) => x.id !== s.id));
    });
  }

  function chooseItem(name: string) {
    const prev = item;
    setItem(name);
    run("bagian", async () => {
      const res = await actions.setSessionItem(name);
      if (res.ok) return setError("");
      setItem(prev);
      setError(res.error);
    });
  }

  return (
    <section className="rounded-sm border border-line bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-2xl">Khusus tamu terundang</h2>
        <label className="inline-flex cursor-pointer items-center gap-2 text-[14px]">
          <input type="checkbox" checked={on} disabled={working !== null || (!on && Boolean(mode.lock))} onChange={(e) => toggle(e.target.checked)} className="peer sr-only" />
          <span className="relative h-5 w-9 rounded-full bg-line transition-colors duration-150 peer-checked:bg-wine peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-wine after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-transform after:duration-150 peer-checked:after:translate-x-4" />
          {working === "mode" ? "Menyimpan..." : on ? "Aktif" : "Mati"}
        </label>
      </div>
      <p className="mt-2 text-[14px] text-ink-soft">Saat aktif, undangan hanya terbuka lewat link pribadi berisi kode tamu. Kode dibuat otomatis untuk setiap tamu. Tamu tetap bisa meneruskan link-nya ke orang lain.</p>
      {mode.lock && <p className="mt-3 rounded-sm bg-blush px-4 py-3 text-[14px]">{mode.lock}</p>}

      {on && (
        <div className="mt-5 grid gap-6 border-t border-line pt-5">
          <div>
            <p className="text-[14px] font-medium">Link mempelai</p>
            <p className="mt-1 text-[13px] text-ink-mute">Kode khusus mempelai, tetap berlaku setelah undangan menjadi arsip. Jangan dibagikan ke tamu.</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
              <input readOnly value={coupleUrl} onFocus={(e) => e.target.select()} aria-label="Link mempelai" className={`${field} max-w-md flex-1 font-mono text-[13px]`} />
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(coupleUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="text-[14px] text-wine underline underline-offset-4"
              >
                {copied ? "Tersalin" : "Salin link"}
              </button>
            </div>
          </div>

          <div>
            <p className="text-[14px] font-medium">Pembagian sesi</p>
            <p className="mt-1 text-[13px] text-ink-mute">Sesi untuk satu tanggal dan satu lokasi dengan jam berbeda. Tamu satu sesi hanya melihat jam sesinya, tamu semua sesi melihat seluruhnya. Tanggal atau lokasi berbeda memakai undangan kedua.</p>

            {sessions.length > 0 && (
              <ul className="mt-3 divide-y divide-line border-y border-line">
                {sessions.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2 text-[14px]">
                    <span className="min-w-0 flex-1 basis-40 truncate font-medium">{s.name}</span>
                    <span className="text-ink-soft tabular-nums">{sessionClock(s)}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(s.id);
                        setDraft({ name: s.name, time: s.time.replace(".", ":"), until: s.until.replace(".", ":") });
                      }}
                      className="text-ink-soft hover:text-wine"
                    >
                      Ubah
                    </button>
                    <button type="button" onClick={() => remove(s)} disabled={working !== null} className="text-ink-mute hover:text-wine disabled:opacity-60">
                      {working === `hapus:${s.id}` ? "Menghapus..." : "Hapus"}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={saveSession} className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_120px_120px_auto] sm:items-end">
              <label className="text-[13px] text-ink-soft">
                Nama sesi
                <input value={draft.name} maxLength={60} required onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Sesi 1" className={`${field} mt-1`} />
              </label>
              <label className="text-[13px] text-ink-soft">
                Mulai
                <input type="time" value={draft.time} required onChange={(e) => setDraft({ ...draft, time: e.target.value })} className={`${field} mt-1`} />
              </label>
              <label className="text-[13px] text-ink-soft">
                Selesai
                <input type="time" value={draft.until} onChange={(e) => setDraft({ ...draft, until: e.target.value })} className={`${field} mt-1`} />
              </label>
              <span className="flex items-center gap-3 text-[14px]">
                <button type="submit" disabled={working !== null} className="rounded-sm border border-wine px-4 py-2 text-wine transition-colors duration-150 hover:bg-wine hover:text-white disabled:opacity-50">
                  {working === "sesi" ? "Menyimpan..." : editing === null ? "Tambah sesi" : "Simpan"}
                </button>
                {editing !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(null);
                      setDraft(EMPTY);
                    }}
                    className="text-ink-mute"
                  >
                    Batal
                  </button>
                )}
              </span>
            </form>

            {sessions.length > 0 && (
              <label className="mt-4 block max-w-md text-[13px] text-ink-soft">
                Bagian acara yang dibagi sesi
                <select value={item} disabled={working !== null} onChange={(e) => chooseItem(e.target.value)} className={`${field} mt-1`}>
                  <option value="">Seluruh susunan acara</option>
                  {mode.scheduleNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <span className="mt-1 block text-ink-mute">Bagian lain, misalnya Akad, tetap tampil untuk semua tamu. Pilih Seluruh susunan acara kalau tamu hanya boleh melihat jam sesinya.</span>
              </label>
            )}
          </div>
        </div>
      )}
      {error && <p className="mt-3 text-[13px] text-wine">{error}</p>}
    </section>
  );
}
