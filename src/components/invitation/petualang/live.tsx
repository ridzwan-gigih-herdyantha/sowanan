"use client";

import { useReducedMotion } from "motion/react";
import Image from "next/image";
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
// Mosaik digambar dari foto yang sama di kanvas, mengikuti potongan object-cover, object-position, dan zoom fotonya.
export function PixelPhoto({ children, className = "" }: { children: ReactNode; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = box.current;
    const c = canvas.current;
    const img = el?.querySelector("img");
    if (!el || !c || !img) return;
    // Setelah memudar, kanvas mosaik disembunyikan total supaya tidak lagi menjadi lapisan yang ikut disusun tiap frame.
    let hide = 0;
    const done = () => {
      el.setAttribute("data-pt-photo-done", "");
      hide = window.setTimeout(() => (c.style.display = "none"), 300);
    };
    if (reduce) return done();
    let timer = 0;
    let gone = false;

    // Foto di-decode dan dipotong sekali menjadi bitmap kecil secara asinkron, lalu setiap langkah mosaik digambar
    // dari bitmap itu. Foto ukuran penuh tidak lagi diolah di thread utama saat bagiannya masuk layar.
    let sumber: CanvasImageSource | null = null;
    const kecil = document.createElement("canvas");
    const siapkan = async () => {
      await img.decode().catch(() => {});
      const w = el.clientWidth;
      const h = el.clientHeight;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      if (!w || !h || !iw || !ih) return false;
      // Potongan foto yang terlihat: object-cover, digeser sesuai object-position, lalu diperbesar dari titik yang sama.
      const css = getComputedStyle(img);
      const [fx, fy] = css.objectPosition.split(" ").map((v) => (v.endsWith("%") ? Number.parseFloat(v) / 100 : 0.5));
      const zoom = Number.parseFloat(css.scale) || 1;
      const k = Math.max(w / iw, h / ih);
      const cw = w / k;
      const ch = h / k;
      const sw = cw / zoom;
      const sh = ch / zoom;
      const sx = (iw - cw) * fx + (cw - sw) * fx;
      const sy = (ih - ch) * fy + (ch - sh) * fy;
      const lebar = STEPS[STEPS.length - 1] * 2;
      const tinggi = Math.max(1, Math.round((lebar * h) / w));
      try {
        sumber = await createImageBitmap(img, sx, sy, sw, sh, { resizeWidth: lebar, resizeHeight: tinggi, resizeQuality: "medium" });
      } catch {
        const cadangan = document.createElement("canvas");
        cadangan.width = lebar;
        cadangan.height = tinggi;
        cadangan.getContext("2d")?.drawImage(img, sx, sy, sw, sh, 0, 0, lebar, tinggi);
        sumber = cadangan;
      }
      return true;
    };
    const draw = (cols: number) => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      // Kanvasnya kecil, jadi digambar tanpa GPU supaya tidak dipromosikan menjadi lapisan tersendiri.
      const ctx = c.getContext("2d", { willReadFrequently: true });
      if (!sumber || !w || !h || !ctx) return false;
      const rows = Math.max(1, Math.round((cols * h) / w));
      kecil.width = cols;
      kecil.height = rows;
      kecil.getContext("2d", { willReadFrequently: true })?.drawImage(sumber, 0, 0, cols, rows);
      c.width = cols;
      c.height = rows;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(kecil, 0, 0);
      return true;
    };

    const ready = () => img.complete && img.naturalWidth > 0;
    const siap = new Promise<boolean>((resolve) => {
      const mulai = () => siapkan().then(resolve, () => resolve(false));
      if (ready()) mulai();
      else img.addEventListener("load", mulai, { once: true });
    });
    siap.then((ok) => ok && !gone && draw(STEPS[0]));

    const play = () =>
      siap.then((ok) => {
        if (!ok) return done();
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
      window.clearTimeout(hide);
    };
  }, [reduce]);

  return (
    <div ref={box} data-pt-photo className={className}>
      {children}
      <canvas ref={canvas} aria-hidden="true" className="pt-mosaic pointer-events-none absolute inset-0 size-full" />
    </div>
  );
}

type StoryEntry = { title: string; date: string; image: string; long: string; place?: string; video?: { src: string; poster: string } };

// Tombol di papan cerita yang membuka cerita lengkap dalam jendela bergaya kotak dialog game. Memakai dialog bawaan
// peramban supaya tampil di atas panggung yang diperkecil dan digeser.
export function StoryDetail({ s, no }: { s: StoryEntry; no: number }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const show = () => {
    setOpen(true);
    ref.current?.showModal();
  };
  const close = () => ref.current?.close();

  return (
    <>
      <button type="button" onClick={show} className="pt-label mt-2 text-[10px] text-inv-accent underline underline-offset-4 sm:text-[11px]">
        Lihat cerita &#9654;
      </button>
      <dialog
        ref={ref}
        aria-label={s.title}
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === ref.current && close()}
        className="m-auto max-h-[calc(100dvh-32px)] w-[min(520px,calc(100%-32px))] overflow-visible bg-transparent p-2 text-inv-ink backdrop:bg-[#1E1830]/60"
      >
        {/* Bingkai piksel di elemen dalam, karena gaya pt-box mengubah posisi dan akan menggeser dialog dari tengah layar. */}
        {open && (
          <div className="pt-box pt-modal flex max-h-[calc(100dvh-48px)] flex-col">
            <div className="pt-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <div className="relative aspect-[4/3] w-full bg-inv-wash">
                {s.video ? (
                  <video src={s.video.src} poster={s.video.poster} className="size-full object-cover" autoPlay muted loop playsInline preload="none" />
                ) : (
                  <Image src={s.image} alt={s.title} fill sizes="(min-width: 560px) 520px, 100vw" className="object-cover" />
                )}
              </div>
              <div className="px-5 pt-4 pb-2 text-left">
                <p className="pt-label text-[10px] text-inv-accent sm:text-[11px]">
                  Checkpoint {no} / {s.date}
                </p>
                <h3 className="mt-1.5 font-display text-[clamp(22px,6vw,28px)] leading-tight font-bold">{s.title}</h3>
                {s.place && <p className="mt-1 text-[13px] text-inv-ink/70">{s.place}</p>}
                <p className="mt-3 text-[15px] leading-relaxed whitespace-pre-line">{s.long}</p>
              </div>
            </div>
            <button type="button" onClick={close} className="pt-btn pt-label m-3 shrink-0 px-5 py-3 text-[12px]">
              Kembali ke dunia
            </button>
          </div>
        )}
      </dialog>
    </>
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
