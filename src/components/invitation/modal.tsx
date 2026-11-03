"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function Modal({ open, onClose, label, children }: { open: boolean; onClose: () => void; label: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      // showModal memfokuskan tombol atau tautan pertama di isi, yang bisa berada jauh di bawah sehingga dialog
      // ikut tergulung. Elemen dialog yang sama juga dipakai ulang dengan posisi gulir terakhirnya. Fokus dipindah
      // ke dialog, jadi isi selalu mulai dibaca dari atas.
      d.focus({ preventScroll: true });
      d.scrollTop = 0;
    }
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      tabIndex={-1}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="inv-dialog m-auto max-h-[92dvh] w-[calc(100%-32px)] max-w-lg overflow-y-auto bg-inv-paper p-0 text-inv-ink outline-none"
    >
      {open && children}
      <button
        type="button"
        onClick={onClose}
        data-sfx="close"
        className="absolute top-3 right-3 z-20 flex size-11 items-center justify-center rounded-full border border-[#d9cbbb] bg-[#f3e9df] text-[#171012] shadow-[0_4px_18px_rgba(0,0,0,.5)] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        aria-label="Tutup"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </dialog>
  );
}
