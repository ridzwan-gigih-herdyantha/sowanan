"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Modal } from "../modal";
import { SHAPES } from "./pop";

type Photo = { src: string; w: number; h: number; alt: string };
const PILE_TILT = [-5, 4, -2, 6];
const STRIP_TILT = [-1.5, 1.2, -0.8, 1.8];
type From = { x: number; y: number; w: number; h: number; rot: number };

// Satu cetakan film instan. Di tumpukan fotonya persegi, di strip mengikuti rasio aslinya. Fotonya selalu
// memenuhi bingkai, jadi saat bingkai berubah ukuran potongannya ikut bergeser tanpa ada yang gepeng.
function Print({ p, no, stamp, square, fresh, eager }: { p: Photo; no: number; stamp: string; square?: boolean; fresh?: boolean; eager?: boolean }) {
  return (
    <>
      <div data-photo className="relative overflow-hidden bg-inv-ink" style={{ aspectRatio: square ? "1 / 1" : `${p.w} / ${p.h}` }}>
        <Image src={p.src} alt={p.alt} fill loading={eager ? "eager" : undefined} sizes={square ? "184px" : "(min-width: 980px) 300px, 45vw"} className={`object-cover ${fresh ? "tp-develop" : ""}`} />
        <span aria-hidden="true" className="tp-datestamp absolute right-2 bottom-1.5 text-[11px]">
          {stamp}
        </span>
      </div>
      <figcaption className="tp-type flex h-8 shrink-0 items-center justify-center text-[13px] text-inv-ink">Kenangan No. {no}</figcaption>
    </>
  );
}

const frame = "flex flex-col border border-inv-ink/25 bg-[#fbf7ee] px-2 pt-2 shadow-[0_6px_14px_rgba(0,0,0,.22)]";

// Galeri sebagai kamera instan. Tiap jepretan mencetak foto berikutnya, pita film menunjukkan sisa jepretan.
// Setelah semua tercetak, cetakan teratas terbang lebih dulu ke slotnya di strip.
export function CameraGallery({ photos, stamp }: { photos: readonly Photo[]; stamp: string }) {
  const [printed, setPrinted] = useState(0);
  const [fresh, setFresh] = useState<number | null>(null);
  const [arranged, setArranged] = useState(false);
  const [flash, setFlash] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const pile = useRef<HTMLDivElement>(null);
  const from = useRef<From | null>(null);
  const wait = useRef(0);
  const total = photos.length;
  const full = printed >= total;
  const shown = active === null ? null : photos[active];

  // Tunggu cetakan terakhir muncul, lalu catat posisi cetakan teratas sebelum tumpukan diganti strip.
  useEffect(() => {
    if (!total || !full || arranged) return;
    const t = setTimeout(() => {
      const top = pile.current?.querySelector<HTMLElement>("figure:last-of-type");
      if (top) {
        const r = top.getBoundingClientRect();
        from.current = { x: r.left + r.width / 2, y: r.top + r.height / 2, w: top.offsetWidth, h: top.offsetHeight, rot: parseFloat(top.style.rotate) || 0 };
      }
      setArranged(true);
    }, wait.current);
    return () => clearTimeout(t);
  }, [total, full, arranged]);

  // Salinan setiap cetakan terbang dari tumpukan ke slotnya sambil berubah ukuran, mulai dari nomor terakhir.
  // Slot aslinya disembunyikan sampai salinannya mendarat.
  useLayoutEffect(() => {
    const f = from.current;
    from.current = null;
    const box = root.current;
    if (!arranged || !f || !box || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const base = box.getBoundingClientRect();
    const targets = [...box.querySelectorAll<HTMLElement>("[data-print]")];
    const clones = targets.map((el, i) => {
      const r = el.getBoundingClientRect();
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const c = el.cloneNode(true) as HTMLElement;
      c.removeAttribute("data-print");
      const photo = c.querySelector<HTMLElement>("[data-photo]");
      if (photo) Object.assign(photo.style, { aspectRatio: "auto", flex: "1 1 0" });
      Object.assign(c.style, { position: "absolute", margin: "0", zIndex: "30", pointerEvents: "none", visibility: "visible" });
      box.appendChild(c);
      el.style.opacity = "0";
      const start = { left: `${f.x - f.w / 2 - base.left}px`, top: `${f.y - f.h / 2 - base.top}px`, width: `${f.w}px`, height: `${f.h}px`, rotate: `${f.rot}deg` };
      const end = { left: `${r.left + r.width / 2 - w / 2 - base.left}px`, top: `${r.top + r.height / 2 - h / 2 - base.top}px`, width: `${w}px`, height: `${h}px`, rotate: `${STRIP_TILT[i % STRIP_TILT.length]}deg` };
      c.animate([start, end], { duration: 800, delay: (targets.length - 1 - i) * 160, easing: "cubic-bezier(.3,.8,.3,1)", fill: "both" })
        .finished.then(() => {
          el.style.opacity = "";
          c.remove();
        })
        .catch(() => {});
      return c;
    });
    return () => {
      clones.forEach((c) => c.remove());
      targets.forEach((el) => (el.style.opacity = ""));
    };
  }, [arranged]);

  if (!total) return null;

  function snap() {
    if (full) return;
    setFlash((f) => f + 1);
    setFresh(printed);
    wait.current = 2600;
    setPrinted(printed + 1);
  }

  function printAll() {
    setFlash((f) => f + 1);
    setFresh(null);
    wait.current = 700;
    setPrinted(total);
  }

  function reset() {
    setPrinted(0);
    setFresh(null);
    setArranged(false);
  }

  const stack = Array.from({ length: Math.min(printed, 4) }, (_, k) => printed - Math.min(printed, 4) + k);

  return (
    <div ref={root} className="relative">
      <p className="mx-auto mt-4 max-w-[34ch] text-center text-[15px] text-inv-ink">Tekan tombol merah untuk mencetak kenangan kami satu per satu.</p>

      <div className="mx-auto mt-6 w-[260px]">
        <div aria-hidden="true" className="rounded-[4px] bg-inv-ink px-1.5 py-[6px]">
          <span className="block h-[3px] bg-[repeating-linear-gradient(90deg,var(--inv-card)_0_4px,transparent_4px_9px)] opacity-80" />
          <div className="my-[5px] flex gap-1">
            {photos.map((p, i) => (
              <span key={p.src} className={`relative aspect-[3/4] flex-1 overflow-hidden rounded-[2px] ${i < printed ? "bg-[#3a2c22]" : "bg-[linear-gradient(160deg,#f0a040,#c86a1e)]"}`}>
                {i < printed && <Image src={p.src} alt="" fill sizes="32px" className="object-cover opacity-80 [filter:invert(1)_sepia(0.4)]" />}
              </span>
            ))}
          </div>
          <span className="block h-[3px] bg-[repeating-linear-gradient(90deg,var(--inv-card)_0_4px,transparent_4px_9px)] opacity-80" />
        </div>
        <p className="tp-label mt-2 text-center text-[15px] text-inv-ink">
          Sisa film: {total - printed} dari {total}
        </p>
      </div>

      <div className="relative z-10 mx-auto mt-4 w-[260px]">
        <div className="tp-card relative h-[156px] overflow-hidden rounded-[18px] bg-inv-card">
          <div aria-hidden="true" className="absolute inset-y-0 left-[44%] flex w-9">
            <span className="flex-1 bg-inv-accent" />
            <span className="flex-1 bg-(--tp-sun)" />
            <span className="flex-1 bg-inv-gold" />
          </div>
          <span aria-hidden="true" className="absolute top-4 left-5 h-7 w-14 rounded-[5px] border-[3px] border-inv-ink bg-[repeating-linear-gradient(90deg,#fff_0_4px,#e8e2d4_4px_7px)]" />
          <span aria-hidden="true" className="absolute top-4 right-5 size-9 rounded-[7px] border-[3px] border-inv-ink bg-[#2a3540]" />
          <span aria-hidden="true" className="absolute top-[56%] left-1/2 grid size-[92px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[3px] border-inv-ink bg-inv-ink">
            <span className="relative size-[58px] rounded-full border-2 border-inv-card/30 bg-[radial-gradient(circle_at_35%_35%,#4d7488,#0d151b_70%)]">
              <span className="absolute top-3 left-3.5 size-2.5 rounded-full bg-white/70" />
            </span>
          </span>
          <span aria-hidden="true" className="tp-label absolute bottom-3 left-5 text-[13px] text-inv-ink">
            Kabar-Cam
          </span>
          <button
            type="button"
            onClick={snap}
            disabled={full}
            aria-label={full ? "Film habis, semua foto sudah tercetak" : "Jepret foto berikutnya"}
            className="tp-label absolute right-4 bottom-3.5 grid size-12 place-items-center rounded-full border-[3px] border-inv-ink bg-inv-accent text-[12px] text-inv-card shadow-[3px_3px_0_var(--inv-ink)] transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:bg-inv-ink/40 disabled:shadow-none"
          >
            Jepret
          </button>
        </div>
        <span aria-hidden="true" className="absolute inset-x-8 -bottom-1 h-2 rounded-full bg-inv-ink" />
        {/* Blitz ala komik: bintang kilau dari jendela lampu kilat dan tulisan klik di dekat tombol. */}
        {flash > 0 && (
          <>
            <span key={`b${flash}`} aria-hidden="true" className="tp-blitz pointer-events-none absolute -top-[42px] -left-[52px] z-20 h-36 w-50">
              <svg viewBox="-4 -4 112 112" preserveAspectRatio="none" className="absolute inset-x-[14%] inset-y-[28%] h-[44%] w-[72%] overflow-visible">
                <path d={SHAPES.star} transform="translate(4 4)" fill="var(--inv-ink)" />
                <path d={SHAPES.star} fill="var(--tp-sun)" stroke="var(--inv-ink)" strokeWidth="3" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              </svg>
            </span>
            <span key={`k${flash}`} aria-hidden="true" className="tp-klik tp-chip tp-label pointer-events-none absolute -top-5 -right-4 z-20 bg-(--tp-sun) text-[16px] text-inv-ink">
              Klik!
            </span>
          </>
        )}
      </div>

      <div ref={pile} className="relative mx-auto h-[250px] w-[200px] [clip-path:inset(0_-60%_-30%_-60%)]">
        {(printed === 0 || arranged) && (
          <p className="tp-label absolute inset-x-3 top-6 rounded-[6px] border-2 border-dashed border-inv-ink/40 px-3 py-14 text-center text-[15px] text-inv-ink/60">
            {arranged ? "Semua kenangan sudah tersusun di strip" : "Fotonya keluar di sini"}
          </p>
        )}
        {!arranged &&
          stack.map((i) => (
            <figure key={i} className={`${frame} absolute inset-x-0 top-1 ${i === fresh ? "tp-eject" : ""}`} style={{ rotate: `${PILE_TILT[i % PILE_TILT.length]}deg` }}>
              <Print p={photos[i]} no={i + 1} stamp={stamp} square fresh={i === fresh} />
            </figure>
          ))}
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <p aria-live="polite" className="tp-label text-[16px] text-inv-ink">
          Tercetak {printed}/{total}
        </p>
        <div className="flex gap-2">
          {printed > 0 && (
            <button type="button" onClick={reset} className="tp-pill tp-pill-ghost tp-label px-3! py-1! text-[14px]">
              Ulangi
            </button>
          )}
          {!full && (
            <button type="button" onClick={printAll} className="tp-pill tp-label px-3! py-1! text-[14px]">
              Cetak semua
            </button>
          )}
        </div>
      </div>
      <ul className="mt-4 columns-2 gap-4 lg:columns-3 lg:gap-6">
        {photos.map((p, i) => (
          <li key={p.src} className="relative mb-4 break-inside-avoid lg:mb-6" style={{ rotate: `${STRIP_TILT[i % STRIP_TILT.length]}deg` }}>
            <figure data-print className={`${frame} ${arranged ? "" : "invisible"}`}>
              <button type="button" tabIndex={arranged ? 0 : -1} onClick={() => setActive(i)} className="flex h-full w-full flex-col text-left" aria-label={`Buka foto: ${p.alt}`}>
                <Print p={p} no={i + 1} stamp={stamp} eager />
              </button>
            </figure>
            {!arranged && (
              <div className="absolute inset-0 grid place-items-center rounded-[3px] border-2 border-dashed border-inv-ink/40 text-inv-ink/50">
                <span className="tp-label text-[14px]">No. {String(i + 1).padStart(2, "0")}</span>
              </div>
            )}
          </li>
        ))}
      </ul>

      <Modal open={shown !== null} onClose={() => setActive(null)} label={shown?.alt ?? "Foto"}>
        {shown && <Image src={shown.src} alt={shown.alt} width={shown.w} height={shown.h} quality={85} sizes="(min-width: 560px) 512px, 100vw" className="h-auto w-full" />}
      </Modal>
    </div>
  );
}
