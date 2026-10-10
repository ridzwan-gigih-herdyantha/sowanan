import type { ReactNode } from "react";
import { LogoMark } from "@/components/logo";
import { coupleLogout } from "./actions";

// Kerangka halaman dashboard mempelai: merek, tombol keluar, lalu isi.
export function CoupleFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-ivory">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-3">
          <p className="flex items-center gap-2.5 text-[13px] tracking-[3px] text-wine">
            <LogoMark className="h-6 w-auto" />
            SOWANAN
          </p>
          <form action={coupleLogout}>
            <button type="submit" className="text-[14px] text-ink-mute underline underline-offset-4 hover:text-wine">
              Keluar
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-5 py-10 sm:py-14">{children}</main>
    </div>
  );
}
