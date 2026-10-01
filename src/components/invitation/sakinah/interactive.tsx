"use client";

import { AnimatePresence, motion, useAnimate, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { pad, useTimeLeft } from "@/components/countdown";
import { angkaArab } from "@/lib/hijri";
import { CopyButton } from "../copy-button";
import { Arch, Bunga, Hias, Lantern, Pattern, Star, star8 } from "./ornaments";
import { SAKINAH_ENTER } from "./text";

const EASE = [0.22, 0.61, 0.36, 1] as const;

// Mulai animasi masuk saat pintu selesai dibuka, atau langsung bila halaman dibuka tanpa pintu.
function useEntered() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const start = () => setOn(true);
    window.addEventListener(SAKINAH_ENTER, start);
    const t = window.setTimeout(() => {
      if (!document.querySelector(".sk-door")) start();
    }, 60);
    return () => {
      window.removeEventListener(SAKINAH_ENTER, start);
      window.clearTimeout(t);
    };
  }, []);
  return on;
}

// Lentera gantung yang bisa diketuk: berayun dan cahayanya menguat sebentar.
export function HangingLantern({ chain, className = "", delay = 0, show = true, dim = false }: { chain: number; className?: string; delay?: number; show?: boolean; dim?: boolean }) {
  const reduce = useReducedMotion();
  const [scope, animate] = useAnimate();
  const [lit, setLit] = useState(!dim);
  const tap = () => {
    setLit((l) => !l);
    if (!reduce) animate(scope.current, { rotate: [0, 9, -6, 3, 0] }, { duration: 1.8, ease: "easeOut" });
  };
  return (
    <motion.div
      initial={reduce ? false : { y: -260, opacity: 0 }}
      animate={show ? { y: 0, opacity: 1 } : undefined}
      transition={reduce ? { duration: 0 } : { duration: 1.4, ease: [0.16, 1, 0.3, 1], delay }}
      className={`pointer-events-none absolute top-0 z-20 ${className}`}
    >
      <motion.div
        animate={reduce ? undefined : { rotate: [-1.4, 1.4, -1.4] }}
        transition={{ duration: 5.5 + delay * 2, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "50% 0%" }}
      >
        <button ref={scope} type="button" onClick={tap} aria-pressed={lit} aria-label={lit ? "Matikan lentera" : "Nyalakan lentera"} className="pointer-events-auto block w-full text-sk-emas" style={{ transformOrigin: "50% 0%" }}>
          <Lantern chain={chain} lit={lit ? 1 : 0.15} className="w-full transition-opacity duration-700" />
        </button>
      </motion.div>
    </motion.div>
  );
}

type Person = { name: string; full: string };

// Hero mihrab: foto mempelai di lengkung besar bermahkota tezhip, rumpun bunga di kedua kaki lengkung,
// lentera tergantung dari tepi atas layar di sisi luar. Desktop: nama mengapit lengkung, ponsel: nama di bawahnya.
// Masuk: lentera turun, lengkung terbuka dari bawah, mahkota turun, bunga mekar, lalu nama dan tanggal.
export function SakinahHero({ photo, top, groom, bride, info }: { photo: ReactNode; top: ReactNode; groom: Person; bride: Person; info: ReactNode }) {
  const on = useEntered();
  const reduce = useReducedMotion();
  const show = on || !!reduce;
  const fade = (delay: number, y = 18) => ({
    initial: reduce ? false : { opacity: 0, y },
    animate: show ? { opacity: 1, y: 0 } : undefined,
    transition: reduce ? { duration: 0 } : { duration: 0.9, ease: EASE, delay },
  });
  const bloom = (s: "l" | "r") => ({
    initial: reduce ? false : { opacity: 0, scale: 0.8 },
    animate: show ? { opacity: 1, scale: 1 } : undefined,
    transition: reduce ? { duration: 0 } : { duration: 1.2, ease: EASE, delay: s === "l" ? 0.9 : 1 },
    style: { transformOrigin: s === "l" ? "0% 100%" : "100% 100%" },
  });
  const side = (p: Person, align: "l" | "r", delay: number) => (
    <motion.div {...fade(delay)} className={`hidden lg:block ${align === "l" ? "text-right" : "text-left"}`}>
      <p className="font-display text-[clamp(56px,5.4vw,100px)] leading-none text-inv-ink">{p.name}</p>
      {p.full && p.full !== p.name && <p className="mt-4 text-[13px] tracking-[0.24em] text-inv-accent">{p.full.toUpperCase()}</p>}
    </motion.div>
  );

  return (
    <div className="relative px-4 pt-5 pb-12 lg:px-10 lg:pt-6 lg:pb-14">
      <HangingLantern chain={46} className="left-[3%] w-9 sm:w-11 lg:left-[7%] lg:w-14" delay={0.3} show={show} />
      <HangingLantern chain={20} className="right-[3%] w-8 sm:w-10 lg:right-[7%] lg:w-12" delay={0.45} show={show} />
      <HangingLantern chain={150} className="left-[17%] hidden w-11 lg:block" delay={0.6} show={show} dim />
      <HangingLantern chain={120} className="right-[18%] hidden w-10 lg:block" delay={0.75} show={show} dim />

      <motion.div {...fade(0.2)} className="relative z-10 mx-auto max-w-[72%] text-center">
        {top}
      </motion.div>

      <div className="mx-auto mt-4 grid max-w-[1320px] items-center lg:mt-2 lg:grid-cols-[1fr_auto_1fr] lg:gap-12">
        {side(groom, "l", 1.1)}

        <div className="relative mx-auto w-[min(100%-12px,500px)] lg:w-[min(34vw,520px)]">
          <div aria-hidden="true" className="aspect-[4/1]" />
          <motion.div {...fade(0.7, -20)} className="absolute top-0 left-1/2 z-10 w-[66%] -translate-x-1/2">
            <Hias name="mahkota" className="w-full text-sk-emas" />
          </motion.div>
          <motion.div
            initial={reduce ? false : { clipPath: "inset(100% 0% 0% 0%)" }}
            animate={show ? { clipPath: "inset(0% 0% 0% 0%)" } : undefined}
            transition={reduce ? { duration: 0 } : { duration: 1.3, ease: [0.65, 0, 0.35, 1] }}
          >
            <Arch className="h-[min(62svh,600px)] lg:h-[calc(100svh-250px)] lg:max-h-[760px] lg:min-h-[480px]" inner="bg-sk-pasir">
              <motion.div
                initial={reduce ? false : { scale: 1.12 }}
                animate={show ? { scale: 1 } : undefined}
                transition={reduce ? { duration: 0 } : { duration: 2, ease: EASE, delay: 0.2 }}
                className="absolute inset-0"
              >
                {photo}
              </motion.div>
            </Arch>
          </motion.div>
          <motion.div {...bloom("l")} className="absolute -bottom-[7%] -left-[16%] z-10 w-[54%]">
            <motion.div animate={reduce ? undefined : { rotate: [0, 1.2, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "0% 100%" }}>
              <Bunga className="w-full" />
            </motion.div>
          </motion.div>
          <motion.div {...bloom("r")} className="absolute -right-[16%] -bottom-[7%] z-10 w-[54%]">
            <motion.div animate={reduce ? undefined : { rotate: [0, -1.2, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "100% 100%" }}>
              <Bunga side="r" className="w-full" />
            </motion.div>
          </motion.div>
        </div>

        {side(bride, "r", 1.25)}
      </div>

      <motion.div {...fade(1.1)} className="relative z-10 mt-12 text-center lg:hidden">
        <p aria-hidden="true" className="font-display text-[clamp(48px,14vw,80px)] leading-[0.95] text-inv-ink">
          {groom.name}
          <span className="my-2 block font-display text-[0.42em] text-inv-accent">&amp;</span>
          {bride.name}
        </p>
      </motion.div>

      <motion.div {...fade(1.4)} className="relative z-10 mt-8 text-center lg:mt-14">
        {info}
      </motion.div>
    </div>
  );
}

// Hitung mundur di dalam ubin bintang delapan. Ketuk ubin untuk memutarnya dan berganti ke angka Arab.
const STAR_PATH = star8(50, 50, 48);
const STAR_INNER = star8(50, 50, 42);

export function StarCountdown({ target }: { target: string }) {
  const t = useTimeLeft(target);
  const reduce = useReducedMotion();
  const [arab, setArab] = useState<Record<string, boolean>>({});

  if (t?.done) return <p className="text-center font-display text-[clamp(28px,7vw,44px)]">Alhamdulillah, hari yang dinanti telah tiba.</p>;

  const tiles = [
    { key: "days", label: "Hari", labelAr: "يوم", value: t ? pad(t.days) : "00" },
    { key: "hours", label: "Jam", labelAr: "ساعة", value: t ? pad(t.hours) : "00" },
    { key: "minutes", label: "Menit", labelAr: "دقيقة", value: t ? pad(t.minutes) : "00" },
  ];

  return (
    <div role="timer" aria-label={t ? `${t.days} hari ${t.hours} jam ${t.minutes} menit lagi` : "Menghitung waktu"} className="mx-auto grid max-w-[640px] grid-cols-3 gap-3 sm:gap-8">
      {tiles.map((x) => {
        const ar = !!arab[x.key];
        return (
          <button
            key={x.key}
            type="button"
            aria-pressed={ar}
            aria-label={`${x.label}: ${x.value}. Ketuk untuk ${ar ? "angka Latin" : "angka Arab"}`}
            onClick={() => {
              setArab((s) => ({ ...s, [x.key]: !s[x.key] }));
            }}
            className="group relative aspect-square"
          >
            <motion.svg
              viewBox="0 0 100 100"
              aria-hidden="true"
              className="absolute inset-0 size-full drop-shadow-[0_10px_18px_rgba(0,0,0,.12)]"
              animate={{ rotate: ar ? 45 : 0 }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 90, damping: 12 }}
            >
              <path d={STAR_PATH} fill="var(--inv-wash)" stroke="var(--sk-emas)" strokeWidth="1.2" />
              <path d={STAR_INNER} fill="none" stroke="var(--sk-emas)" strokeWidth=".6" strokeDasharray="1.5 1.5" />
            </motion.svg>
            <span className="relative flex size-full flex-col items-center justify-center">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={ar ? "ar" : "la"}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className={`leading-none text-inv-ink tabular-nums ${ar ? "font-arab text-[clamp(30px,9vw,56px)]" : "font-display text-[clamp(30px,9vw,58px)]"}`}
                >
                  {ar ? angkaArab(x.value) : x.value}
                </motion.span>
              </AnimatePresence>
              <span className="mt-1.5 text-[clamp(11px,3vw,14px)] tracking-[0.14em] text-inv-accent">{ar ? <span className="font-arab text-[1.15em] tracking-normal">{x.labelAr}</span> : x.label.toUpperCase()}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

type Scene = { title: string; date: string; image: string; short: string; long: string };

// Cerita sebagai serambi (riwaq): deretan lengkung berisi foto. Ketuk satu lengkung untuk membaca babaknya.
export function Riwaq({ items }: { items: Scene[] }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const s = items[active];
  if (!s) return null;
  return (
    <div>
      <div className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pt-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-5 sm:overflow-visible sm:px-0">
        {items.map((x, i) => {
          const on = i === active;
          return (
            <button
              key={x.title + i}
              type="button"
              onClick={() => {
                setActive(i);
              }}
              aria-pressed={on}
              aria-label={`Cerita ${i + 1}: ${x.title}`}
              className={`w-[40vw] max-w-[220px] shrink-0 snap-start text-left transition-transform duration-500 ease-out sm:w-auto sm:max-w-none ${on ? "-translate-y-3" : ""}`}
            >
              <Arch className="aspect-[3/4.4]" gap="var(--inv-paper)">
                <Image src={x.image} alt="" fill sizes="(min-width: 640px) 240px, 40vw" className={`object-cover transition-[filter,transform] duration-700 ${on ? "" : "grayscale-[.85] sepia-[.2]"}`} />
                <span className={`absolute inset-0 bg-inv-night transition-opacity duration-500 ${on ? "opacity-0" : "opacity-35"}`} />
              </Arch>
              <span className="mt-2 flex items-center gap-1.5 text-[12px] tracking-[0.12em] text-inv-accent">
                <Star className={`size-3.5 transition-opacity ${on ? "opacity-100" : "opacity-40"}`} filled={on} />
                {x.date}
              </span>
              <span className={`block font-display text-[clamp(16px,4.4vw,20px)] leading-tight ${on ? "text-inv-ink" : "text-inv-ink/60"}`}>{x.title}</span>
            </button>
          );
        })}
      </div>
      <div aria-live="polite" className="relative mt-5 min-h-[160px] overflow-hidden rounded-sm border border-inv-line bg-inv-wash p-5 sm:p-7">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={active} initial={reduce ? false : { opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3, ease: EASE }}>
            <p className="text-[12px] tracking-[0.16em] text-inv-accent">
              BAGIAN {active + 1} DARI {items.length} / {s.date}
            </p>
            <h3 className="mt-1 font-display text-[clamp(26px,6.6vw,36px)] leading-tight text-inv-ink">{s.title}</h3>
            <p className="mt-3 max-w-[62ch] text-[16px] leading-relaxed text-inv-ink/85">{s.long || s.short}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

type Photo = { src: string; w: number; h: number; alt: string };

// Pola petak kolase per tujuh foto. Ponsel 2 kolom, desktop 4 kolom, baris selalu terisi penuh.
const TILE = [
  "col-span-2 row-span-3",
  "col-span-2 row-span-2",
  "col-span-1 row-span-2",
  "col-span-1 row-span-2",
  "col-span-2 row-span-2",
  "col-span-1 row-span-2 lg:col-span-2",
  "col-span-1 row-span-2 lg:col-span-2",
];

// Galeri kolase: foto persegi tanpa bingkai dalam susunan grid, satu ubin bertulisan sebagai jeda.
// Ringan: tanpa animasi terus-menerus, tampilan penuh hanya dimuat saat foto diketuk.
export function Kolase({ photos, note }: { photos: Photo[]; note: ReactNode }) {
  const [open, setOpen] = useState<number | null>(null);
  const reduce = useReducedMotion();
  const n = photos.length;
  const go = (d: number) => setOpen((i) => (i === null ? i : (i + d + n) % n));

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    const html = document.documentElement.style;
    const before = html.overflow;
    html.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      html.overflow = before;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open === null]);

  const tile = (p: Photo, i: number) => (
    <li key={p.src} data-reveal="" className={TILE[i % TILE.length]}>
      <button type="button" onClick={() => setOpen(i)} aria-label={`Buka foto ${i + 1}: ${p.alt}`} className="group relative block size-full overflow-hidden rounded-sm bg-sk-pasir">
        <Image src={p.src} alt={p.alt} fill sizes={i % TILE.length < 2 ? "(min-width: 1024px) 520px, 92vw" : "(min-width: 1024px) 260px, 46vw"} className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
      </button>
    </li>
  );
  const chevron = (d: "l" | "r") => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d={d === "l" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
  const p = open === null ? null : photos[open];

  return (
    <>
      <ul className="grid auto-rows-[112px] grid-cols-2 gap-2 sm:auto-rows-[150px] sm:gap-3 lg:auto-rows-[150px] lg:grid-cols-4">
        {photos.slice(0, 2).map(tile)}
        <li data-reveal="" className="col-span-2 row-span-1 flex items-center justify-center gap-4 rounded-sm bg-inv-night px-5 text-center text-inv-wash">
          {note}
        </li>
        {photos.slice(2).map((x, k) => tile(x, k + 2))}
      </ul>

      <AnimatePresence>
        {p && open !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Foto ${open + 1} dari ${n}`}
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-inv-night/95 px-3 py-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
          >
            <motion.div
              key={p.src}
              initial={reduce ? false : { opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, ease: EASE }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.25}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) > 50) go(info.offset.x < 0 ? 1 : -1);
              }}
              onClick={(e) => e.stopPropagation()}
              className="relative h-[min(78dvh,880px)] w-full max-w-[980px] touch-pan-y"
            >
              <Image src={p.src} alt={p.alt} fill sizes="96vw" className="object-contain" draggable={false} />
            </motion.div>
            <div className="mt-4 flex items-center gap-5" onClick={(e) => e.stopPropagation()}>
              <button type="button" onClick={() => go(-1)} aria-label="Foto sebelumnya" className="flex size-12 items-center justify-center rounded-full bg-inv-wash text-inv-ink">
                {chevron("l")}
              </button>
              <p className="min-w-[70px] text-center text-[14px] text-inv-wash tabular-nums">
                {open + 1} / {n}
              </p>
              <button type="button" onClick={() => go(1)} aria-label="Foto berikutnya" className="flex size-12 items-center justify-center rounded-full bg-inv-wash text-inv-ink">
                {chevron("r")}
              </button>
            </div>
            <button type="button" onClick={() => setOpen(null)} aria-label="Tutup" className="absolute top-4 right-4 flex size-11 items-center justify-center rounded-full bg-inv-wash text-inv-ink">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

type Account = { bank: string; number: string; holder: string };

// Kartu hadiah: sisi depan bermotif zellige dengan segel bintang, ketuk untuk membalik dan melihat rekening.
export function GiftCard({ account }: { account: Account }) {
  const [flip, setFlip] = useState(false);
  const reduce = useReducedMotion();
  return (
    <div className="mx-auto w-full max-w-[400px] [perspective:1200px]">
      <motion.div
        animate={{ rotateY: flip ? 180 : 0 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 70, damping: 14 }}
        className="relative aspect-[16/10] [transform-style:preserve-3d]"
      >
        <button
          type="button"
          onClick={() => {
            setFlip(true);
          }}
          aria-label={`Lihat rekening ${account.bank}`}
          className="absolute inset-0 overflow-hidden rounded-sm bg-inv-night text-left text-inv-wash shadow-[0_18px_34px_rgba(0,0,0,.18)] [backface-visibility:hidden]"
        >
          <Pattern name="zellige" color="var(--sk-emas)" opacity={0.14} />
          <span className="absolute inset-2 rounded-sm border border-sk-emas/60" aria-hidden="true" />
          <span className="absolute top-1/2 left-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-sk-emas">
            <Star className="size-16" />
          </span>
          <span className="absolute bottom-4 left-5 font-display text-[22px]">{account.bank}</span>
          <span className="absolute right-5 bottom-4 rounded-sm bg-inv-wash px-3 py-1.5 text-[12px] font-medium text-inv-ink">Ketuk untuk melihat</span>
        </button>
        <div className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-sm border border-inv-line bg-inv-wash p-5 shadow-[0_18px_34px_rgba(0,0,0,.12)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[14px] tracking-[0.1em] text-inv-accent">{account.bank.toUpperCase()}</p>
            <button type="button" onClick={() => setFlip(false)} className="text-[13px] text-inv-accent underline underline-offset-4">
              Tutup
            </button>
          </div>
          <div>
            <p className="font-display text-[clamp(24px,7vw,32px)] leading-tight tracking-wide text-inv-ink tabular-nums">{account.number}</p>
            <p className="mt-1 truncate text-[14px] text-inv-ink/80">a.n. {account.holder}</p>
          </div>
          <div className="flex justify-end">
            <CopyButton value={account.number} label={`nomor rekening ${account.holder}`} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
