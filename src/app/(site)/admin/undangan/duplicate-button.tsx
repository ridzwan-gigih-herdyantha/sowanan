"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { duplicateInfo, duplicateTo } from "./actions";

type Info = { couple: string; left: number; reason?: string };

// Dialog duplikat undangan, pemicunya dari luar seperti dialog hapus.
export function DuplicateButton({ slug, children }: { slug: string; children: (open: () => void) => ReactNode }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [info, setInfo] = useState<Info | null>(null);
  const [target, setTarget] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const [opened, setOpened] = useState(0);
  useEffect(() => {
    if (opened) dialog.current?.showModal();
  }, [opened]);

  const open = () => {
    setTarget("");
    setError("");
    setInfo(null);
    setOpened((n) => n + 1);
    start(async () => {
      const res = await duplicateInfo(slug).catch(() => ({ ok: false as const, error: "Gagal memuat data. Cek koneksi." }));
      if (res.ok) setInfo(res.data);
      else setError(res.error);
    });
  };

  const submit = () =>
    start(async () => {
      const res = await duplicateTo(slug, target).catch(() => ({ ok: false as const, error: "Gagal menduplikat. Cek koneksi." }));
      if (!res.ok) return setError(res.error);
      dialog.current?.close();
      router.push(`/admin/undangan/${res.slug}`);
    });

  const ready = Boolean(info && !info.reason);

  return (
    <>
      {children(open)}
      <dialog
        ref={dialog}
        aria-labelledby={`duplikat-${slug}`}
        className="m-auto w-[min(460px,calc(100vw-32px))] rounded-sm border border-line bg-white p-6 text-ink shadow-[0_20px_60px_rgba(0,0,0,.25)] backdrop:bg-ink/50"
      >
        <h2 id={`duplikat-${slug}`} className="font-serif text-2xl">
          Duplikat undangan
        </h2>
        <p className="mt-2 text-[15px] text-ink-soft">
          {info?.couple ? `${info.couple}, ` : ""}sowanan.com/{slug} disalin jadi undangan baru untuk acara terpisah.
        </p>
        <div className="mt-4 rounded-sm bg-ivory px-4 py-3 text-[14px] text-ink-soft" aria-live="polite">
          {info?.reason ? (
            <p className="text-wine">{info.reason}</p>
          ) : info ? (
            <>
              <p>
                <b className="font-medium text-ink">Ikut tersalin:</b> tema, paket, palet, font, data mempelai, foto, cerita, musik, dress code, imbauan, dan rekening amplop.
              </p>
              <p className="mt-1.5">
                <b className="font-medium text-ink">Diisi ulang:</b> tanggal, jam, lokasi, foto tempat, susunan acara, denah, siaran, deskripsi link, dan daftar tamu.
              </p>
              <p className="mt-1.5">RSVP, ucapan, dan QR absensi terpisah. Undangan baru belum tayang sampai datanya lengkap.</p>
            </>
          ) : (
            !error && <p className="text-ink-mute">Memeriksa add-on...</p>
          )}
        </div>
        {ready && (
          <label className="mt-5 block text-[14px] font-medium">
            Alamat undangan baru
            <span className="mt-2 flex items-center rounded-sm border border-line bg-white px-3 focus-within:border-wine">
              <span className="text-[15px] font-normal text-ink-mute">sowanan.com/</span>
              <input value={target} onChange={(e) => setTarget(e.target.value.toLowerCase())} autoComplete="off" spellCheck={false} maxLength={80} className="w-full bg-transparent py-2.5 text-base font-normal outline-none" />
            </span>
          </label>
        )}
        {error && <p className="mt-3 text-[13px] text-wine">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => dialog.current?.close()} className="rounded-sm border border-line px-4 py-2 text-[14px]">
            {ready ? "Batal" : "Tutup"}
          </button>
          {ready && (
            <button type="button" onClick={submit} disabled={pending || !target.trim()} className="rounded-sm bg-wine px-4 py-2 text-[14px] text-white transition-opacity duration-150 disabled:opacity-40">
              {pending ? "Menyalin..." : "Duplikat"}
            </button>
          )}
        </div>
      </dialog>
    </>
  );
}
