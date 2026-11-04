"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setPrivateMode } from "./actions";

// Undangan yang masih private padahal paketnya tidak lagi menyediakan fitur ini tetap tertutup sampai admin mematikannya.
export function PrivateOff({ slug }: { slug: string }) {
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <div className="mt-4 rounded-sm bg-ivory px-4 py-3 text-[14px]">
      <p>Mode private masih menyala, jadi undangan hanya terbuka lewat link berisi kode.</p>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await setPrivateMode(slug, false).catch(() => ({ ok: false as const, error: "Gagal menyimpan. Cek koneksi." }));
            if (!res.ok) return setError(res.error);
            router.refresh();
          })
        }
        className="mt-2 text-wine underline underline-offset-4 disabled:opacity-60"
      >
        {pending ? "Menyimpan..." : "Matikan mode private"}
      </button>
      {error && <p className="mt-2 text-[13px] text-wine">{error}</p>}
    </div>
  );
}
