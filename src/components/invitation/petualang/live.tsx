"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { pad, useTimeLeft } from "@/components/countdown";

// Menjalankan cb setelah undangan dibuka. Sebelum itu isi undangan tertutup pembuka, jadi gerak yang dimulai
// lebih awal akan selesai tanpa terlihat.
function whenOpen(cb: () => void) {
  const shell = document.querySelector<HTMLElement>("[data-inv-state]");
  const opened = () => !shell || shell.dataset.invState === "open";
  if (opened()) {
    cb();
    return () => {};
  }
  const watch = new MutationObserver(() => {
    if (!opened()) return;
    watch.disconnect();
    cb();
  });
  watch.observe(shell!, { attributes: true, attributeFilter: ["data-inv-state"] });
  return () => watch.disconnect();
}

// Mengamati el sampai masuk layar setelah undangan dibuka. hidden dipanggil bila saat mulai diamati el belum terlihat.
function onEnter(el: Element, enter: () => void, hidden?: () => void) {
  let first = true;
  const io = new IntersectionObserver(
    ([e]) => {
      if (e.isIntersecting) {
        io.disconnect();
        enter();
      } else if (first) hidden?.();
      first = false;
    },
    { rootMargin: "0px 0px -12% 0px" },
  );
  const stop = whenOpen(() => io.observe(el));
  return () => {
    stop();
    io.disconnect();
  };
}

const CPS = 38;

// Teks dialog yang muncul huruf demi huruf seperti kotak percakapan game. Ketukan langsung menampilkan semuanya.
// Sisa teks tetap ada tapi tidak terlihat, jadi tinggi kotak tidak berubah selama mengetik. Pembaca layar
// selalu menerima teks utuh.
export function Typewriter({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [shown, setShown] = useState<number | null>(null);
  const raf = useRef(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    const stop = onEnter(
      el,
      () => {
        const start = performance.now();
        const step = (now: number) => {
          const n = Math.floor(((now - start) / 1000) * CPS);
          setShown(n >= text.length ? null : n);
          if (n < text.length) raf.current = requestAnimationFrame(step);
        };
        raf.current = requestAnimationFrame(step);
      },
      () => setShown(0),
    );
    return () => {
      stop();
      cancelAnimationFrame(raf.current);
    };
  }, [text, reduce]);

  const finish = () => {
    cancelAnimationFrame(raf.current);
    setShown(null);
  };

  return (
    <p ref={ref} data-pt-type onClick={finish} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {shown === null ? (
          text
        ) : (
          <>
            {text.slice(0, shown)}
            <span className="invisible">{text.slice(shown)}</span>
          </>
        )}
      </span>
    </p>
  );
}

// Jumlah kolom kotak di setiap langkah, dari kasar sampai halus, sebelum foto aslinya tampil.
const STEPS = [5, 8, 12, 18, 28, 44, 70];
const STEP_MS = 85;

// Foto yang muncul seperti dimuat game lama: kotak-kotak besar yang makin halus sampai foto aslinya tajam.
// Mosaik digambar dari foto yang sama di kanvas, mengikuti potongan object-cover. focus adalah posisi tegak
// potongan, sama dengan object-position.
export function PixelPhoto({ children, focus = 0.5, className = "" }: { children: ReactNode; focus?: number; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = box.current;
    const c = canvas.current;
    const img = el?.querySelector("img");
    if (!el || !c || !img) return;
    const done = () => el.setAttribute("data-pt-photo-done", "");
    if (reduce) return done();
    let timer = 0;
    let gone = false;

    const draw = (cols: number) => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      if (!w || !h || !iw || !ih) return false;
      const rows = Math.max(1, Math.round((cols * h) / w));
      // Potongan foto yang terlihat, sama dengan object-cover.
      const k = Math.max(w / iw, h / ih);
      const sw = w / k;
      const sh = h / k;
      const sx = (iw - sw) / 2;
      const sy = (ih - sh) * focus;
      const small = document.createElement("canvas");
      small.width = cols;
      small.height = rows;
      small.getContext("2d")?.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);
      c.width = cols;
      c.height = rows;
      const ctx = c.getContext("2d");
      if (!ctx) return false;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(small, 0, 0);
      return true;
    };

    const ready = () => img.complete && img.naturalWidth > 0;
    const whenLoaded = (cb: () => void) => (ready() ? cb() : img.addEventListener("load", cb, { once: true }));
    whenLoaded(() => !gone && draw(STEPS[0]));

    const play = () =>
      whenLoaded(() => {
        let i = 0;
        const next = () => {
          if (gone) return;
          if (i >= STEPS.length || !draw(STEPS[i])) return done();
          i++;
          timer = window.setTimeout(next, STEP_MS);
        };
        next();
      });

    const stop = onEnter(el, play);
    return () => {
      gone = true;
      stop();
      window.clearTimeout(timer);
    };
  }, [reduce, focus]);

  return (
    <div ref={box} data-pt-photo className={className}>
      {children}
      <canvas ref={canvas} aria-hidden="true" className="pt-mosaic pointer-events-none absolute inset-0 size-full" />
    </div>
  );
}

// Hitung mundur sebagai papan skor: setiap angka di kotak piksel sendiri.
export function ScoreCountdown({ target }: { target: string }) {
  const t = useTimeLeft(target);
  if (t?.done) return <p className="font-display text-[clamp(44px,11vw,96px)] leading-none font-bold">Hari ini!</p>;
  const cells = [
    [t?.days, "Hari"],
    [t?.hours, "Jam"],
    [t?.minutes, "Menit"],
  ] as const;
  return (
    <div role="timer" aria-label={t ? `${t.days} hari ${t.hours} jam ${t.minutes} menit lagi` : "Menghitung waktu"} className="grid grid-cols-3 gap-3 sm:gap-6">
      {cells.map(([value, label]) => (
        <div key={label} className="pt-box px-2 py-4 text-center sm:py-6">
          <p className="font-display text-[clamp(40px,11vw,96px)] leading-none font-bold tabular-nums">{value === undefined ? "--" : pad(value)}</p>
          <p className="pt-label mt-2 text-[11px] text-inv-gold sm:text-[13px]">{label}</p>
        </div>
      ))}
    </div>
  );
}
