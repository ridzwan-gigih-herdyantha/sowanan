"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useWorking } from "@/app/(site)/admin/use-working";
import { createAccount, removeAccount, resetPassword } from "./actions";

type Account = { createdAt: string; lastSignIn: string | null; passwordSetAt: string | null };

const timeFmt = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
const when = (iso: string | null) => (iso ? `${timeFmt.format(new Date(iso))} WIB` : "");
const primary = "rounded-sm bg-wine px-4 py-2.5 text-[14px] text-white hover:bg-wine-dark disabled:opacity-60";
// Password yang dibuat bersama akun tidak perlu disebut sebagai penggantian.
const resetSince = (a: Account) => a.passwordSetAt && Date.parse(a.passwordSetAt) - Date.parse(a.createdAt) > 60_000;
const quiet = "text-[14px] text-wine underline underline-offset-4 disabled:opacity-60";

function CopyRow({ label, value }: { label: string; value: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="grid grid-cols-[110px_minmax(0,1fr)_auto] items-baseline gap-x-4 border-b border-line py-3 max-sm:grid-cols-[minmax(0,1fr)_auto]">
      <span className="text-[13px] text-ink-mute max-sm:col-span-2">{label}</span>
      <code className="min-w-0 truncate font-mono text-[15px]">{value}</code>
      <span>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(value);
            setDone(true);
            setTimeout(() => setDone(false), 1500);
          }}
          className={quiet}
        >
          {done ? "Tersalin" : "Salin"}
        </button>
      </span>
    </div>
  );
}

// Akun dashboard untuk mempelai. Password dibuat sistem dan hanya tampil sekali setelah dibuat atau diganti.
export function AccessPanel({ slug, couple, loginUrl, account }: { slug: string; couple: string; loginUrl: string; account: Account | null }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const { working, run } = useWorking(setError);

  const message = `Halo ${couple || "kalian"}, ini akses dashboard undangan pernikahan kalian di Sowanan.

Alamat: ${loginUrl}
Username: ${slug}
Password: ${password}

Di dashboard kalian bisa melihat daftar tamu, RSVP, ucapan, dan absensi, serta menyembunyikan ucapan yang kurang pantas. Mohon simpan pesan ini dan jangan dibagikan ke orang lain.`;

  const act = (key: string, fn: () => Promise<{ ok: true; password?: string } | { ok: false; error: string }>) =>
    run(key, async () => {
      const res = await fn();
      if (!res.ok) return setError(res.error);
      setError("");
      setCopied(false);
      setPassword(res.password ?? "");
      router.refresh();
    });

  return (
    <div className="mt-8 max-w-2xl">
      <h2 className="font-serif text-2xl">Dashboard mempelai</h2>
      <p className="mt-1 text-[14px] text-ink-mute">Mempelai masuk dengan username dan password ini untuk melihat daftar tamu, RSVP, ucapan, dan absensi.</p>

      <div className="mt-5 border-t border-line">
        <CopyRow label="Alamat masuk" value={loginUrl} />
        <CopyRow label="Username" value={slug} />
      </div>

      {account ? (
        <dl className="mt-5 grid gap-1 text-[14px] text-ink-soft">
          <div>
            <dt className="inline text-ink-mute">Akun dibuat </dt>
            <dd className="inline">{when(account.createdAt)}</dd>
          </div>
          <div>
            <dt className="inline text-ink-mute">Terakhir masuk </dt>
            <dd className="inline">{when(account.lastSignIn) || "belum pernah"}</dd>
          </div>
          {resetSince(account) && (
            <div>
              <dt className="inline text-ink-mute">Password diganti </dt>
              <dd className="inline">{when(account.passwordSetAt)}</dd>
            </div>
          )}
        </dl>
      ) : (
        <p className="mt-5 text-[14px] text-ink-soft">Undangan ini belum punya akun mempelai.</p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
        {account ? (
          <>
            <button
              type="button"
              disabled={working !== null}
              onClick={() => confirm("Ganti password? Password lama langsung tidak bisa dipakai, dan perangkat yang sudah masuk akan keluar.") && act("reset", () => resetPassword(slug))}
              className={primary}
            >
              {working === "reset" ? "Mengganti..." : "Atur ulang password"}
            </button>
            <button
              type="button"
              disabled={working !== null}
              onClick={() => confirm("Hapus akun mempelai? Mempelai tidak bisa masuk lagi sampai dibuatkan akun baru.") && act("hapus", () => removeAccount(slug))}
              className="text-[14px] text-ink-mute hover:text-wine disabled:opacity-60"
            >
              {working === "hapus" ? "Menghapus..." : "Hapus akun"}
            </button>
          </>
        ) : (
          <button type="button" disabled={working !== null} onClick={() => act("buat", () => createAccount(slug))} className={primary}>
            {working === "buat" ? "Membuat..." : "Buat akun"}
          </button>
        )}
      </div>

      {error && <p className="mt-4 rounded-sm bg-blush px-4 py-3 text-[14px] text-wine">{error}</p>}

      {password && (
        <div className="mt-6 rounded-sm border border-wine/40 bg-blush/50 p-4">
          <p className="text-[13px] text-ink-mute">Password baru</p>
          <p className="mt-1 font-mono text-2xl tracking-wide">{password}</p>
          <p className="mt-2 text-[13px] text-wine">Password hanya tampil sekali. Kalau terlewat, atur ulang password.</p>
          <label className="mt-4 block text-[13px] text-ink-mute">
            Pesan untuk mempelai
            <textarea readOnly rows={9} value={message} className="mt-1.5 block w-full resize-y rounded-sm border border-line bg-white px-3 py-2.5 text-[14px] text-ink" />
          </label>
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(message);
              setCopied(true);
            }}
            className={`mt-3 ${primary}`}
          >
            {copied ? "Pesan tersalin" : "Salin pesan"}
          </button>
        </div>
      )}
    </div>
  );
}
