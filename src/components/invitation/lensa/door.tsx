"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { FrameProps } from "@/lib/invitation/frame";
import { FitText } from "./fit";
import { LensaPhoto, SCRIM } from "./photo";

export type LensaProps = { headline: string; groom: string; bride: string; monogram: string; date: string; portrait: string; wide: string; frame?: FrameProps; invited: string; onOpen: () => void };

// Teks yang berpindah dari pembuka ke hero. Pasangannya di hero memakai data-ls-target dengan nama yang sama.
const MORPH = ["city", "names", "mono", "date"] as const;

// Kurva gerak berdurasi tetap: mulai pelan, cepat di tengah, berhenti pelan tepat di akhir tanpa ekor.
const ease = (x: number) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2);
const span = (t: number, from: number, length: number) => ease(Math.min(1, Math.max(0, (t - from) / length)));

// Waktu dalam detik. Foto dan teks utama tiba bersamaan, lalu lapisan langsung dilepas karena hero di baliknya sama persis.
const FADE = [0, 0.35] as const;
const LENS = [0, 1.5] as const;
const MOVE = [0.08, 1.42] as const;
// Pergantian huruf terjadi di awal perpindahan, sebelum huruf lama sempat membesar dan terlihat buram.
const SWAP = [0.04, 0.34] as const;

// from dan to adalah skala awal dan akhir. Teks yang membesar dipindah ke salinan berukuran akhir, supaya tetap tajam.
// fade diisi saat jenis huruf awal dan akhir berbeda: versi lama memudar, versi baru muncul, keduanya di jalur yang sama.
type Move = { el: HTMLElement; dx: number; dy: number; from: number; to: number; fade?: "out" | "in" };

// Pembuka Lensa: foto hero diburamkan dan sedikit diperbesar, dengan judul kota yang sangat besar. Saat dibuka,
// foto menjadi tajam dan kembali ke ukuran asli, sementara setiap teks bergeser dan mengecil atau membesar ke
// tempatnya di hero, seperti transisi morph. Di akhir lapisan ini dilepas, dan hero yang identik ada di baliknya.
export function LensaDoor({ headline, groom, bride, monogram, date, portrait, wide, frame: photoFrame, invited, onOpen }: LensaProps) {
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const reduce = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const blur = useRef<HTMLDivElement>(null);
  const tint = useRef<HTMLDivElement>(null);
  const moves = useRef<Move[]>([]);

  useEffect(() => {
    if (phase !== "playing") return;
    const extras = Array.from(root.current?.querySelectorAll<HTMLElement>("[data-ls-fade]") ?? []);
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = (now - start) / 1000;
      const fade = 1 - span(t, ...FADE);
      const lens = span(t, ...LENS);
      const morph = span(t, ...MOVE);

      for (const el of extras) el.style.opacity = String(fade);
      if (blur.current) blur.current.style.opacity = String(1 - lens);
      if (tint.current) tint.current.style.opacity = String(1 - lens);
      if (frame.current) frame.current.style.transform = `scale(${1.08 - 0.08 * lens})`;
      for (const m of moves.current) {
        m.el.style.transform = `translate3d(${(m.dx * morph).toFixed(2)}px, ${(m.dy * morph).toFixed(2)}px, 0) scale(${m.from + (m.to - m.from) * morph})`;
        if (m.fade) {
          const swap = span(morph, ...SWAP);
          m.el.style.opacity = String(m.fade === "in" ? swap : 1 - swap);
        }
      }

      if (lens >= 1 && morph >= 1) {
        setPhase("done");
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  function play() {
    if (phase !== "idle") return;
    onOpen();
    if (reduce) return setPhase("done");
    // Ukur setelah halaman kembali ke atas, karena posisi tujuan dibaca dari hero di balik lapisan ini.
    requestAnimationFrame(() => {
      // Beberapa teks punya versi HP dan layar lebar, jadi yang dipakai adalah yang sedang tampil.
      const shown = (list: NodeListOf<HTMLElement> | undefined) => Array.from(list ?? []).find((x) => x.getClientRects().length > 0);
      moves.current = MORPH.flatMap((key) => {
        const el = shown(root.current?.querySelectorAll<HTMLElement>(`[data-ls="${key}"]`));
        const to = shown(document.querySelectorAll<HTMLElement>(`[data-ls-target="${key}"]`));
        if (!el || !to) return [];
        const a = el.getBoundingClientRect();
        const b = to.getBoundingClientRect();
        // Skala dari lebar teks, karena keduanya satu baris dan lebarnya terukur lebih presisi dari tingginya.
        const scale = b.width / a.width;
        const look = getComputedStyle(to);
        if (getComputedStyle(el).fontFamily !== look.fontFamily) {
          // Huruf berganti: aslinya bergerak ke kotak tujuan sambil memudar, dan salinan dari hero (huruf akhir,
          // ukuran akhir) mulai dari kotak asal sambil muncul. Keduanya disejajarkan di tengah tinggi masing-masing.
          const copy = to.cloneNode(true) as HTMLElement;
          const start = a.width / b.width;
          Object.assign(copy.style, { position: "fixed", left: `${a.left}px`, top: `${a.top + (a.height - b.height * start) / 2}px`, margin: "0", fontSize: look.fontSize, transformOrigin: "0 0", willChange: "transform, opacity", opacity: "0", transform: `scale(${start})` });
          copy.removeAttribute("data-ls-target");
          root.current?.appendChild(copy);
          el.style.transformOrigin = "0 0";
          el.style.willChange = "transform, opacity";
          const settle = b.top + (b.height - a.height * scale) / 2;
          return [
            { el, dx: b.left - a.left, dy: settle - a.top, from: 1, to: scale, fade: "out" as const },
            { el: copy, dx: b.left - a.left, dy: b.top - (a.top + (a.height - b.height * start) / 2), from: start, to: 1, fade: "in" as const },
          ];
        }
        if (scale <= 1) {
          el.style.transformOrigin = "0 0";
          el.style.willChange = "transform";
          return [{ el, dx: b.left - a.left, dy: b.top - a.top, from: 1, to: scale }];
        }
        // Salinan digambar di ukuran akhir dan diletakkan tepat di atas aslinya, lalu dikecilkan ke ukuran awal.
        const copy = el.cloneNode(true) as HTMLElement;
        Object.assign(copy.style, { position: "fixed", left: `${a.left}px`, top: `${a.top}px`, margin: "0", fontSize: look.fontSize, fontWeight: look.fontWeight, letterSpacing: look.letterSpacing, lineHeight: look.lineHeight, transformOrigin: "0 0", willChange: "transform", transform: `scale(${1 / scale})` });
        copy.removeAttribute("data-ls");
        root.current?.appendChild(copy);
        el.style.visibility = "hidden";
        return [{ el: copy, dx: b.left - a.left, dy: b.top - a.top, from: 1 / scale, to: 1 }];
      });
      setPhase("playing");
    });
  }

  if (phase === "done") return null;

  return (
    <div ref={root} className="ls-door fixed inset-0 z-50 overflow-hidden bg-inv-night text-white">
      {/* Perbesaran awal lewat transform, sama dengan yang dianimasikan, supaya di akhir benar-benar kembali ke ukuran asli. */}
      <div ref={frame} className="absolute inset-0 will-change-transform" style={{ transform: "scale(1.08)" }}>
        <LensaPhoto portrait={portrait} wide={wide} frame={photoFrame} alt="" priority />
        <div ref={blur} className="absolute inset-0 will-change-[opacity]">
          <LensaPhoto portrait={portrait} wide={wide} alt="" className="scale-110 blur-xl" />
        </div>
      </div>
      <div aria-hidden="true" className="absolute inset-0" style={{ background: SCRIM }} />
      <div ref={tint} aria-hidden="true" className="absolute inset-0 bg-black/30" />

      {/* Di HP semua bertumpuk di tengah. Di layar lebar judul kota memenuhi lebar, keterangan di bawahnya kiri dan kanan. */}
      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center sm:px-[6vw]">
        <div className="w-full max-w-[1400px]">
          <p data-ls-fade className="text-[13px] sm:text-left sm:text-[15px]">
            {invited ? `Halo, ${invited}! Kamu diundang ke` : "Halo! Kamu diundang ke"}
          </p>
          <h1 className="mt-2 w-full sm:mt-1">
            <FitText data-ls="city" className="font-display text-[clamp(44px,13.5vw,220px)] leading-[0.82] font-extrabold tracking-[-0.01em] uppercase [font-stretch:112%]">{headline}</FitText>
          </h1>
          <div className="mt-3 flex flex-col items-center gap-1 sm:mt-5 sm:flex-row sm:items-baseline sm:justify-between">
            <p className="text-[15px] sm:text-[17px]">
              <span data-ls-fade>Pernikahan </span>
              <span data-ls="names" className="inline-block leading-none whitespace-nowrap">
                {groom} &amp; {bride}
              </span>
            </p>
            <p data-ls="date" className="hidden leading-none sm:block sm:text-[17px]">
              {date}
            </p>
          </div>
          <button
            data-ls-fade
            type="button"
            onClick={play}
            className="mt-10 border border-white/80 px-8 py-3.5 text-[12px] font-semibold tracking-[0.28em] uppercase transition-colors duration-200 hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Buka undangan
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-[max(28px,5vh)] flex flex-col items-center gap-2">
          <p data-ls="mono" className="font-display text-[13px] leading-none font-extrabold tracking-[0.12em] uppercase [font-stretch:112%]">
            {monogram}
          </p>
          <p data-ls="date" className="text-[14px] leading-none sm:hidden">
            {date}
          </p>
        </div>
      </div>

      {phase === "playing" && (
        <button type="button" onClick={() => setPhase("done")} className="absolute right-4 bottom-4 z-10 border border-white/50 px-4 py-2 text-[12px] tracking-[0.18em] uppercase">
          Lewati
        </button>
      )}
    </div>
  );
}
