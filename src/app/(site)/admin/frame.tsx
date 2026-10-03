import type { ReactNode } from "react";
import { LogoMark } from "@/components/logo";
import { AdminTopBar } from "./top-bar";

// Kerangka halaman admin: bilah atas untuk admin yang sudah masuk, lalu judul halaman.
export function AdminFrame({ email, current, title, wide, children }: { email?: string; current: string; title: string; wide?: boolean; children: ReactNode }) {
  return (
    <>
      {email !== undefined && <AdminTopBar email={email} current={current} />}
      <main className={`mx-auto px-4 pt-6 pb-16 sm:px-7 sm:pt-[34px] ${wide ? "max-w-[1180px]" : "max-w-5xl"}`}>
        {email === undefined && (
          <p className="flex items-center gap-2.5 text-[13px] tracking-[3px] text-wine">
            <LogoMark className="h-6 w-auto" />
            SOWANAN
          </p>
        )}
        <h1 className="mt-2 mb-8 font-serif text-[40px] leading-none font-medium sm:mt-0">{title}</h1>
        {children}
      </main>
    </>
  );
}
