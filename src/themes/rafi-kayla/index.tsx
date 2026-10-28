import type { CSSProperties } from "react";
import { InvitationShell } from "@/components/invitation/shell";
import type { InvitationView } from "@/lib/invitation/view";
import { themeFonts } from "./fonts";

const vars = {
  "--inv-display": "var(--font-gd-display), 'Trebuchet MS', sans-serif",
  "--inv-body": "var(--font-gd-body), Arial, sans-serif",
} as CSSProperties;

// Isometrik: undangan sebagai peta gedung bergaya game. Tahap pertama (cover) sudah jadi. Peta isi dengan
// pos-pos di sepanjang jalan menyusul, sementara itu isi undangan hanya menampilkan ringkasan acara.
export function RafiKayla({ inv }: { inv: InvitationView }) {
  return (
    <InvitationShell
      door={{ kind: "gedung", groom: inv.groom.name, bride: inv.bride.name, date: inv.dateLong, place: `${inv.venue.name}, ${inv.cityShort}` }}
      music={inv.music}
      className={`${themeFonts} min-h-dvh bg-inv-paper font-body text-inv-ink`}
      style={{ ...vars, ...inv.palette, ...inv.fonts }}
    >
      <main className="grid min-h-dvh place-items-center bg-inv-grass px-5 py-12 text-center">
        <section className="w-full max-w-[420px] rounded-[22px] border-[3px] border-inv-line bg-inv-card px-6 py-8 shadow-[0_7px_0_rgba(0,0,0,.28)]">
          <p className="font-display text-[12px] tracking-[.16em] text-inv-gold uppercase">Selamat datang di gedung</p>
          <h1 className="mt-3 font-display text-[clamp(34px,10vw,48px)] leading-[.95] font-semibold text-inv-accent">
            {inv.groom.name} <span className="text-[.6em] text-inv-ink">&amp;</span> {inv.bride.name}
          </h1>
          <p className="mt-4 text-[14px] font-bold">{inv.dateLong}</p>
          <p className="mt-1 text-[13px] text-inv-gold">
            {inv.venue.name}, {inv.cityShort}
          </p>
          <p className="mt-6 text-[12px] text-inv-gold">Peta isi undangan sedang disiapkan.</p>
        </section>
      </main>
    </InvitationShell>
  );
}
