"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function Modal({ open, onClose, label, children }: { open: boolean; onClose: () => void; label: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="inv-dialog m-auto max-h-[92dvh] w-[calc(100%-32px)] max-w-lg overflow-y-auto bg-inv-paper p-0 text-inv-ink"
    >
      {open && children}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-3 right-3 flex size-10 items-center justify-center rounded-full bg-inv-night/80 text-inv-paper"
        aria-label="Tutup"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </dialog>
  );
}
