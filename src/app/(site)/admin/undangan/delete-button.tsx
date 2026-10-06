"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { deleteInvitation, deleteSummary } from "./actions";

type Summary = { couple: string; rsvps: number; wishes: number; guests: number; files: number };

export function DeleteButton({ slug }: { slug: string }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const open = () => {
    setTyped("");
    setError("");
    setSummary(null);
    dialog.current?.showModal();
    start(async () => {
      const res = await deleteSummary(slug).catch(() => ({ ok: false as const, error: "Gagal memuat data. Cek koneksi." }));
      if (res.ok) setSummary(res.data);
      else setError(res.error);
    });
  };

  const remove = () =>
    start(async () => {
      const res = await deleteInvitation(slug, typed).catch(() => ({ ok: false as const, error: "Gagal menghapus. Cek koneksi." }));
      if (!res.ok) return setError(res.error);
      dialog.current?.close();
      if (res.warning) window.alert(res.warning);
      router.refresh();
    });

  const count = (n: number, unit: string) => `${n} ${unit}`;

  return (
    <>
      <button type="button" onClick={open} className="text-ink-mute underline underline-offset-4 hover:text-wine">
        Hapus
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={`hapus-${slug}`}
        className="m-auto w-[min(440px,calc(100vw-32px))] rounded-sm border border-line bg-white p-6 text-ink shadow-[0_20px_60px_rgba(0,0,0,.25)] backdrop:bg-ink/50"
      >
        <h2 id={`hapus-${slug}`} className="font-serif text-2xl">
          Hapus undangan ini?
        </h2>
        <p className="mt-2 text-[15px] text-ink-soft">
          {summary?.couple ? `${summary.couple}, ` : ""}sowanan.com/{slug}. Penghapusan permanen dan tidak bisa dibatalkan.
        </p>
        <div className="mt-4 rounded-sm bg-blush/60 px-4 py-3 text-[14px]" aria-live="polite">
          {summary ? (
            <>
              <p className="font-medium">Ikut terhapus:</p>
              <p className="mt-1 text-ink-soft">
                {[count(summary.rsvps, "RSVP"), count(summary.wishes, "ucapan"), count(summary.guests, "nama tamu"), count(summary.files, "berkas foto, video, dan musik")].join(", ")}.
              </p>
              {summary.rsvps + summary.wishes > 0 && <p className="mt-2 text-ink-soft">Unduh rekap dari halaman RSVP dulu kalau klien masih membutuhkannya.</p>}
            </>
          ) : (
            !error && <p className="text-ink-mute">Menghitung data yang ikut terhapus...</p>
          )}
        </div>
        <label className="mt-5 block text-[14px] font-medium">
          Ketik <span className="rounded-sm bg-ivory px-1.5 py-0.5 font-mono text-[13px]">{slug}</span> untuk konfirmasi
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            className="mt-2 block w-full rounded-sm border border-line bg-white px-3 py-2.5 text-base font-normal outline-none focus:border-wine"
          />
        </label>
        {error && <p className="mt-3 text-[13px] text-wine">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => dialog.current?.close()} className="rounded-sm border border-line px-4 py-2 text-[14px]">
            Batal
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={pending || typed.trim() !== slug || !summary}
            className="rounded-sm bg-wine px-4 py-2 text-[14px] text-white transition-opacity duration-150 disabled:opacity-40"
          >
            {pending && summary ? "Menghapus..." : "Hapus permanen"}
          </button>
        </div>
      </dialog>
    </>
  );
}
