"use client";

import Link from "next/link";
import { useState, useSyncExternalStore, type FormEvent } from "react";
import { GUEST_KEY, guestCodeKey, recall, remember } from "@/lib/guest-memory";
import { checkInName, checkInSelf } from "./actions";

const noop = () => () => {};
const timeFmt = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
const field = "block w-full rounded-sm border border-line bg-white px-4 py-3.5 text-[17px] outline-none transition-colors duration-150 focus:border-wine";

type Done = { status: "ok" | "already"; name: string; at: string };

// demo: undangan contoh tidak membaca maupun menyimpan nama dan kode tamu di HP.
export function CheckinForm({ token, slug, demo }: { token: string; slug: string; demo: boolean }) {
  const code = useSyncExternalStore(noop, () => (demo ? "" : recall(guestCodeKey(slug))), () => "");
  const remembered = useSyncExternalStore(noop, () => (demo ? "" : recall(GUEST_KEY)), () => "");
  const [mode, setMode] = useState<"auto" | "name">("auto");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<Done | null>(null);

  const finish = (res: Awaited<ReturnType<typeof checkInName>>) => {
    if (res.status === "ok" || res.status === "already") {
      if (!demo) {
        if (res.k) remember(guestCodeKey(slug), res.k);
        remember(GUEST_KEY, res.name);
      }
      setDone(res);
    } else if (res.status === "unknown") {
      setMode("name");
      setError("Kami belum mengenali undanganmu. Tulis namamu di bawah.");
    } else if (res.status === "closed") setError(res.reason);
  };

  async function self() {
    setBusy(true);
    setError("");
    // Kode link pribadi paling pasti. Tanpa kode, dipakai nama yang tersimpan saat tamu membuka undangan atau mengisi RSVP.
    const res = await (code ? checkInSelf(token, code) : checkInName(token, remembered)).catch(() => ({ status: "closed" as const, reason: "Gagal terhubung. Periksa internet lalu coba lagi." }));
    setBusy(false);
    finish(res);
  }

  async function byName(e: FormEvent) {
    e.preventDefault();
    const value = (name || remembered).trim();
    if (value.length < 2) return setError("Tulis nama lengkapmu.");
    setBusy(true);
    setError("");
    const res = await checkInName(token, value).catch(() => ({ status: "closed" as const, reason: "Gagal terhubung. Periksa internet lalu coba lagi." }));
    setBusy(false);
    finish(res);
  }

  if (done) {
    return (
      <div className="mt-8 text-center motion-safe:animate-[inv-pop_.2s_ease-out]" role="status">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-wine text-white">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
            <path d="m5 12 5 5 9-10" />
          </svg>
        </span>
        <p className="mt-5 font-serif text-[28px] leading-tight">Terima kasih, {done.name}</p>
        <p className="mt-2 text-[16px] text-ink-soft">
          {done.status === "ok" ? "Kehadiranmu sudah tercatat" : "Kehadiranmu sudah tercatat sebelumnya"} pukul {timeFmt.format(new Date(done.at))}.
        </p>
        <Link href={`/${slug}`} className="mt-8 inline-block text-[15px] text-wine underline underline-offset-4">
          Buka undangan
        </Link>
      </div>
    );
  }

  if ((code || remembered) && mode === "auto") {
    return (
      <div className="mt-8 text-center">
        <p className="text-[16px] text-ink-soft">Selamat datang{remembered ? "," : "."}</p>
        {remembered && <p className="mt-1 font-serif text-[28px] leading-tight">{remembered}</p>}
        <button
          type="button"
          onClick={self}
          disabled={busy}
          className="mt-7 w-full rounded-sm bg-wine px-5 py-4 text-[17px] text-white transition-transform duration-150 active:scale-[0.98] disabled:opacity-60"
        >
          {busy ? "Mencatat..." : "Catat kehadiran saya"}
        </button>
        {error && <p className="mt-3 text-[14px] text-wine">{error}</p>}
        <button type="button" onClick={() => setMode("name")} className="mt-5 text-[14px] text-ink-mute underline underline-offset-4">
          Bukan {remembered || "saya"}? Tulis nama
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={byName} className="mt-8">
      <label className="block text-[15px] font-medium">
        Nama kamu
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={remembered || "Nama sesuai undangan"}
          autoComplete="name"
          maxLength={80}
          className={`${field} mt-2`}
        />
      </label>
      <p className="mt-2 text-[13px] text-ink-mute">Tulis sesuai nama di undanganmu supaya mudah dicocokkan.</p>
      <button
        type="submit"
        disabled={busy}
        className="mt-6 w-full rounded-sm bg-wine px-5 py-4 text-[17px] text-white transition-transform duration-150 active:scale-[0.98] disabled:opacity-60"
      >
        {busy ? "Mencatat..." : "Catat kehadiran"}
      </button>
      {error && <p className="mt-3 text-[14px] text-wine">{error}</p>}
    </form>
  );
}
