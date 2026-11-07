"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { button, cx } from "../settings/styles";
import { deleteArticle } from "./actions";

export function DeleteArticle({ id, title, published, redirectTo }: { id: string; title: string; published: boolean; redirectTo?: string }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const remove = () =>
    start(async () => {
      const res = await deleteArticle(id).catch(() => ({ ok: false as const, error: "Gagal menghapus. Cek koneksi." }));
      if (!res.ok) return setError(res.error);
      dialog.current?.close();
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    });

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError("");
          dialog.current?.showModal();
        }}
        className={cx(button.quiet, button.sm)}
      >
        Hapus
      </button>
      <dialog ref={dialog} aria-labelledby={`hapus-${id}`} className="m-auto w-[min(440px,calc(100vw-32px))] rounded-sm border border-line bg-white p-6 text-ink shadow-[0_20px_60px_rgba(0,0,0,.25)] backdrop:bg-ink/50">
        <h2 id={`hapus-${id}`} className="font-serif text-2xl">
          Hapus artikel ini?
        </h2>
        <p className="mt-2 text-[15px] text-ink-soft">
          {title}. {published ? "Artikel akan hilang dari situs, dan gambarnya" : "Artikel dan gambarnya"} ikut terhapus permanen.
        </p>
        {error && <p className="mt-3 text-[13px] text-wine">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => dialog.current?.close()} className="rounded-sm border border-line px-4 py-2 text-[14px]">
            Batal
          </button>
          <button type="button" onClick={remove} disabled={pending} className="rounded-sm bg-wine px-4 py-2 text-[14px] text-white transition-opacity duration-150 disabled:opacity-40">
            {pending ? "Menghapus..." : "Hapus permanen"}
          </button>
        </div>
      </dialog>
    </>
  );
}
