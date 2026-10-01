"use client";

import { animate, motion, useAnimate, useInView, useMotionValue, useReducedMotion, useTransform, type PanInfo } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { pad, useTimeLeft } from "@/components/countdown";
import { angkaJawa } from "@/lib/javanese";
import { CopyButton } from "../copy-button";
import { Modal } from "../modal";
import { Lung, Motif, type MotifName } from "../pakeliran-ornaments";
import { ENTER_EVENT, Puppet, type PuppetName } from "./puppet";

const EASE = [0.22, 0.61, 0.36, 1] as const;

// Nada gamelan sederhana dari WebAudio: fundamental plus dua parsial logam.
let audio: AudioContext | null = null;
export function gong(freq: number, length = 2.2) {
  try {
    audio ??= new AudioContext();
    const t = audio.currentTime;
    const out = audio.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(0.3, t + 0.008);
    out.gain.exponentialRampToValueAtTime(0.0001, t + length);
    out.connect(audio.destination);
    for (const [mul, level] of [
      [1, 1],
      [2.76, 0.3],
      [5.4, 0.1],
    ]) {
      const o = audio.createOscillator();
      const g = audio.createGain();
      o.frequency.value = freq * mul;
      g.gain.value = level;
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + length + 0.1);
    }
  } catch {}
}

const LG = "(min-width: 1024px)";
const subscribeLg = (cb: () => void) => {
  const m = window.matchMedia(LG);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
function useLg() {
  return useSyncExternalStore(subscribeLg, () => window.matchMedia(LG).matches, () => false);
}

type Side = { name: string; aksara: string };

// Hero: foto mempelai besar berbingkai lengkung, dimahkotai ukiran lung-lungan, diapit wayang kecil di bawah.
// Setelah pintu dibuka, tirai jarik tersingkap, foto mendekat, lalu nama dan wayang muncul.
export function HeroStage({ photo, groom, bride, names, below }: { photo: ReactNode; groom: Side; bride: Side; names: ReactNode; below: ReactNode }) {
  const reduce = useReducedMotion();
  const [go, setGo] = useState(false);
  const on = go || !!reduce;

  useEffect(() => {
    const start = () => setGo(true);
    window.addEventListener(ENTER_EVENT, start);
    const t = window.setTimeout(() => {
      if (!document.querySelector(".pk-door")) start();
    }, 60);
    return () => {
      window.removeEventListener(ENTER_EVENT, start);
      window.clearTimeout(t);
    };
  }, []);

  const show = (delay: number, y = 24, duration = 0.9) => ({
    initial: reduce ? false : { opacity: 0, y },
    animate: on ? { opacity: 1, y: 0 } : undefined,
    transition: reduce ? { duration: 0 } : { duration, ease: EASE, delay },
  });

  const puppet = (name: PuppetName, className: string, delay: number) => (
    <motion.div {...show(delay, 50, 1.1)} className={className}>
      <Puppet name={name} eager className="drop-shadow-[0_12px_14px_rgba(62,46,34,.3)]" />
    </motion.div>
  );

  const column = (p: Side, name: PuppetName, align: "l" | "r") => (
    <div className={`hidden min-w-0 flex-1 flex-col justify-end pb-2 lg:flex ${align === "l" ? "items-end text-right" : "items-start text-left"}`}>
      <motion.div {...show(1.1)}>
        <p className="font-display text-[clamp(52px,5vw,88px)] leading-none text-inv-ink">{p.name}</p>
        {p.aksara && (
          <p lang="jv" className="mt-3 font-jawa text-[22px] text-inv-accent">
            {p.aksara}
          </p>
        )}
      </motion.div>
      {puppet(name, "mt-8 h-[32svh] min-h-[200px]", 1.3)}
    </div>
  );

  return (
    <div>
      <div className="flex items-end justify-center gap-8 xl:gap-14">
        {column(groom, "kamajaya", "l")}
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.97 }}
          animate={on ? { opacity: 1, scale: 1 } : undefined}
          transition={reduce ? { duration: 0 } : { duration: 1.1, ease: EASE }}
          className="relative mt-[calc(min(100vw-28px,560px)*0.25)] w-[calc(100vw-28px)] max-w-[560px] shrink-0 lg:mt-[calc(min(40vw,600px)*0.21)] lg:w-[min(40vw,600px)] lg:max-w-none"
        >
          <Lung name="mahkota" className="absolute bottom-[calc(100%-10px)] left-1/2 z-10 w-[62%] -translate-x-1/2 text-pk-ukir lg:w-[54%]" />
          <div className="relative h-[min(78svh,700px)] overflow-hidden rounded-t-[999px] shadow-[0_0_0_5px_var(--inv-paper),0_0_0_6px_var(--pk-emas),0_26px_46px_rgba(62,46,34,.22)] lg:h-[max(520px,calc(100svh-250px))]">
            <motion.div
              initial={reduce ? false : { scale: 1.12 }}
              animate={on ? { scale: 1 } : undefined}
              transition={reduce ? { duration: 0 } : { duration: 1.9, ease: EASE, delay: 0.3 }}
              className="absolute inset-0"
            >
              {photo}
            </motion.div>
            <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-inv-ink/90 via-inv-ink/45 to-transparent lg:h-1/4 lg:from-inv-ink/35" />
            <motion.div {...show(1.2)} className="absolute inset-x-0 bottom-0 px-4 pb-7 text-center lg:hidden">
              {names}
            </motion.div>
            <motion.div initial={false} animate={{ x: on ? "-101%" : "0%" }} transition={reduce ? { duration: 0 } : { duration: 1.3, ease: [0.65, 0, 0.35, 1], delay: 0.45 }} className="pk-tirai absolute inset-y-0 left-0 w-1/2" aria-hidden="true" />
            <motion.div initial={false} animate={{ x: on ? "101%" : "0%" }} transition={reduce ? { duration: 0 } : { duration: 1.3, ease: [0.65, 0, 0.35, 1], delay: 0.45 }} className="pk-tirai absolute inset-y-0 right-0 w-1/2" aria-hidden="true" />
          </div>
          <Lung name="sudut" corner="bl" className="-bottom-4 -left-4 w-[26%] text-pk-ukir" />
          <Lung name="sudut" corner="br" className="-right-4 -bottom-4 w-[26%] text-pk-ukir" />
        </motion.div>
        {column(bride, "kamaratih", "r")}
      </div>

      <div className="mt-5 flex items-end justify-center gap-2 px-2 lg:mt-7">
        {puppet("kamajaya", "h-28 shrink-0 sm:h-36 lg:hidden", 1.3)}
        <motion.div {...show(1.4)} className="min-w-0 flex-1 lg:flex-none">
          {below}
        </motion.div>
        {puppet("kamaratih", "h-28 shrink-0 sm:h-36 lg:hidden", 1.45)}
      </div>
    </div>
  );
}

// Kartu mempelai: sisi depan wayang di atas kelir, dibalik untuk memperlihatkan mempelainya.
export function PuppetFlip({ puppet, label, back }: { puppet: PuppetName; label: string; back: ReactNode }) {
  const [flipped, setFlipped] = useState(false);
  const reduce = useReducedMotion();
  const face =
    "absolute inset-0 overflow-hidden rounded-t-[999px] [backface-visibility:hidden] shadow-[0_0_0_4px_var(--inv-wash),0_0_0_5px_var(--pk-emas),0_18px_30px_rgba(62,46,34,.18)]";
  return (
    <button
      type="button"
      aria-pressed={flipped}
      aria-label={flipped ? `Tutup kartu ${label}` : `Balik kartu ${label}`}
      onClick={() => {
        setFlipped((f) => !f);
        gong(flipped ? 330 : 392, 1.2);
      }}
      className="block w-full max-w-[340px] text-left [perspective:1400px]"
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 60, damping: 13 }}
        className="relative aspect-[3/4.6] [transform-style:preserve-3d]"
      >
        <div className={`${face} bg-[radial-gradient(80%_60%_at_50%_35%,var(--inv-wash),var(--pk-pasir)_70%,color-mix(in_srgb,var(--pk-pasir)_88%,var(--inv-ink)))]`}>
          <div className="absolute inset-x-0 bottom-[16%] flex h-[68%] justify-center">
            <Puppet name={puppet} className="drop-shadow-[0_12px_16px_rgba(62,46,34,.3)]" />
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-inv-ink py-2.5 text-center">
            <p className="font-display text-[clamp(18px,5vw,26px)] leading-none text-inv-wash">{label}</p>
            <p className="mt-1 text-[11px] tracking-[0.14em] text-inv-gold-light">KETUK UNTUK MEMBALIK</p>
          </div>
        </div>
        <div className={`${face} bg-inv-wash [transform:rotateY(180deg)]`}>{back}</div>
      </motion.div>
    </button>
  );
}

type Scene = { title: string; date: string; image: string; short: string; long: string };

const BABAK = ["Jejer", "Pathet Nem", "Pathet Sanga", "Pathet Manyura", "Tancep Kayon"];
const BABAK_MOTIF: MotifName[] = ["kawung", "truntum", "ceplok", "sekar", "wajik"];

// Lakon kami: tiap kisah adalah satu babak pagelaran. Foto berganti dari warna soga ke warna asli saat terlihat,
// ketuk tombolnya untuk membuka kisah lengkap.
export function BabakList({ items }: { items: Scene[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <ol className="relative">
      <span aria-hidden="true" className="pk-lurik-v absolute top-2 bottom-2 left-[15px] w-[6px] lg:left-1/2 lg:-ml-[3px]" />
      {items.map((s, i) => {
        const flip = i % 2 === 1;
        const isOpen = open === i;
        return (
          <li key={s.title} className="relative grid gap-5 pb-14 pl-12 last:pb-0 lg:grid-cols-2 lg:gap-24 lg:pl-0">
            <span className="absolute top-1 left-0 z-10 flex size-9 items-center justify-center rounded-full bg-inv-night text-inv-gold-light ring-2 ring-pk-emas lg:top-1/2 lg:left-1/2 lg:-mt-[18px] lg:-ml-[18px]">
              <Motif name={BABAK_MOTIF[i % BABAK_MOTIF.length]} className="size-5" />
            </span>
            <figure data-reveal="" className={`pk-babak relative ${flip ? "lg:order-2" : ""}`}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] shadow-[0_0_0_5px_var(--inv-night),0_0_0_6px_var(--pk-emas),0_24px_40px_rgba(0,0,0,.28)]">
                <Image src={s.image} alt={s.title} fill sizes="(min-width: 1024px) 460px, 80vw" className="object-cover" />
                <span aria-hidden="true" className="pk-babak-tone absolute inset-0 bg-inv-accent mix-blend-color" />
              </div>
            </figure>
            <div data-reveal="" className={`self-center ${flip ? "lg:order-1 lg:text-right" : ""}`}>
              <p className="text-[12px] tracking-[0.22em] text-inv-gold-light">
                BABAK {i + 1} / {BABAK[i % BABAK.length].toUpperCase()}
              </p>
              <p className="mt-1 text-[14px] text-inv-wash/70">{s.date}</p>
              <h3 className="mt-2 font-display text-[clamp(32px,8vw,48px)] leading-[1.05] text-inv-wash">{s.title}</h3>
              <p className="mt-3 text-[17px] leading-relaxed text-inv-wash/85">{s.short}</p>
              <div className={`grid transition-[grid-template-rows] duration-500 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
                  <p className="pt-3 text-[17px] leading-relaxed text-inv-wash/85">{s.long}</p>
                </div>
              </div>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
                className="mt-5 rounded-sm bg-inv-wash px-5 py-3 text-[14px] text-inv-ink transition-colors duration-150 hover:bg-inv-gold-light"
              >
                {isOpen ? "Tutup kisah" : "Baca kisahnya"}
              </button>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// Hitung mundur sebagai saron: bilah perunggu di atas rancakan kayu berukir. Setiap bilah bisa ditabuh.
const SLENDRO = [262, 294, 330, 392, 440];

export function SaronCountdown({ target }: { target: string }) {
  const t = useTimeLeft(target);
  const reduce = useReducedMotion();
  const [scope, animateBar] = useAnimate();

  if (t?.done) return <p className="text-center font-display text-[clamp(30px,8vw,52px)] text-inv-gold-light">Sampun rawuh dinten ingkang dipun-entosi.</p>;

  const bars = [
    { key: "a", label: "", value: "", note: SLENDRO[0], size: "h-[56%]" },
    { key: "days", label: "Dinten", value: t ? pad(t.days) : "00", note: SLENDRO[1], size: "h-full" },
    { key: "hours", label: "Jam", value: t ? pad(t.hours) : "00", note: SLENDRO[2], size: "h-[92%]" },
    { key: "minutes", label: "Menit", value: t ? pad(t.minutes) : "00", note: SLENDRO[3], size: "h-[84%]" },
    { key: "b", label: "", value: "", note: SLENDRO[4], size: "h-[52%]" },
  ];

  const hit = (i: number) => {
    gong(bars[i].note);
    if (!reduce) animateBar(`[data-bar="${i}"]`, { y: [0, 7, -2, 0] }, { duration: 0.45, ease: "easeOut" });
  };

  return (
    <div ref={scope} role="timer" aria-label={t ? `${t.days} hari ${t.hours} jam ${t.minutes} menit lagi` : "Menghitung waktu"} className="mx-auto max-w-[720px]">
      <div className="relative px-[5%] pt-6 pb-10">
        <div className="pk-rancak absolute inset-x-0 top-[18%] bottom-0 [clip-path:polygon(4%_0,96%_0,100%_100%,0_100%)]" aria-hidden="true" />
        <div className="relative flex h-[clamp(190px,52vw,300px)] items-center justify-center gap-[2.2%]">
          {bars.map((b, i) => (
            <button
              key={b.key}
              type="button"
              data-bar={i}
              onClick={() => hit(i)}
              aria-label={b.label ? `Tabuh bilah ${b.label}, ${b.value}` : "Tabuh bilah saron"}
              className={`pk-bilah relative flex ${b.size} ${b.label ? "flex-[1.35]" : "flex-[0.7]"} flex-col items-center justify-center rounded-[6px]`}
            >
              <span className="absolute top-[9%] left-1/2 size-2.5 -translate-x-1/2 rounded-full bg-[#3B2414]/70 shadow-[inset_0_1px_1px_rgba(0,0,0,.5)]" aria-hidden="true" />
              <span className="absolute bottom-[9%] left-1/2 size-2.5 -translate-x-1/2 rounded-full bg-[#3B2414]/70 shadow-[inset_0_1px_1px_rgba(0,0,0,.5)]" aria-hidden="true" />
              {b.label ? (
                <>
                  <span className="font-display text-[clamp(34px,10vw,64px)] leading-none text-[#3B2414] tabular-nums [text-shadow:0_1px_0_rgba(255,236,180,.6)]">{b.value}</span>
                  <span lang="jv" aria-hidden="true" className="mt-1 font-jawa text-[clamp(13px,3.6vw,18px)] text-[#5A3A18]">
                    {angkaJawa(b.value)}
                  </span>
                </>
              ) : (
                <span lang="jv" aria-hidden="true" className="font-jawa text-[16px] text-[#5A3A18]">
                  {angkaJawa(i === 0 ? 1 : 5)}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-[0.7fr_1.35fr_1.35fr_1.35fr_0.7fr] gap-[2.2%] px-[5%] text-center text-[14px] text-inv-paper/85">
        {bars.map((b) => (
          <span key={b.key}>{b.label}</span>
        ))}
      </div>
    </div>
  );
}

type Photo = { src: string; w: number; h: number; alt: string };

const arrowCls = "flex size-12 items-center justify-center rounded-full bg-inv-ink text-inv-wash transition-colors duration-150 hover:bg-inv-accent";
const Chevron = ({ dir }: { dir: "l" | "r" }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d={dir === "l" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
  </svg>
);

// Galeri simpingan: foto berdiri berjajar di atas gedebog seperti wayang yang disimping di tepi kelir.
// Geser atau ketuk foto samping untuk memajukannya, ketuk foto depan untuk memperbesar.
export function Simpingan({ photos }: { photos: Photo[] }) {
  const n = photos.length;
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const reduce = useReducedMotion();
  const lg = useLg();
  const panned = useRef(false);
  const go = (i: number) => setActive(((i % n) + n) % n);
  const rel = (i: number) => {
    let d = i - active;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  };
  const photo = photos[active];
  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 140, damping: 22 };

  const onLightboxDrag = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 50) go(active + (info.offset.x < 0 ? 1 : -1));
  };

  return (
    <div>
      <motion.div
        role="region"
        aria-roledescription="carousel"
        aria-label="Galeri foto"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(active + 1);
          if (e.key === "ArrowLeft") go(active - 1);
        }}
        onPanStart={() => {
          panned.current = true;
        }}
        onPanEnd={(_, info) => {
          if (Math.abs(info.offset.x) > 40) go(active + (info.offset.x < 0 ? 1 : -1));
          window.setTimeout(() => {
            panned.current = false;
          }, 50);
        }}
        className="relative touch-pan-y pt-8 pb-[52px] outline-none select-none focus-visible:ring-2 focus-visible:ring-inv-accent"
      >
        <div aria-hidden="true" className="invisible mx-auto aspect-[3/4.1] w-[min(62vw,300px)] lg:w-[350px]" />
        <div aria-hidden="true" className="pk-gedebog absolute inset-x-[-4%] bottom-4 h-8 rounded-full" />
        {photos.map((p, i) => {
          const d = rel(i);
          const a = Math.abs(d);
          const hidden = a > 2;
          return (
            <motion.button
              key={p.src}
              type="button"
              tabIndex={hidden ? -1 : 0}
              aria-hidden={hidden || undefined}
              aria-label={d === 0 ? `Perbesar foto ${i + 1}` : `Tampilkan foto ${i + 1}`}
              onClick={() => {
                if (panned.current) return;
                if (d === 0) setZoom(true);
                else go(i);
              }}
              initial={false}
              animate={{ x: `${d * (lg ? 74 : 60)}%`, scale: 1 - Math.min(a, 3) * 0.13, rotate: d * 4, opacity: hidden ? 0 : 1 }}
              transition={spring}
              style={{ zIndex: 10 - a, transformOrigin: "50% 100%" }}
              className="absolute inset-x-0 bottom-[52px] mx-auto w-[min(62vw,300px)] lg:w-[350px]"
            >
              <span className="relative block aspect-[3/4.1] overflow-hidden rounded-t-[999px] bg-inv-wash shadow-[0_0_0_4px_var(--inv-wash),0_0_0_5px_var(--pk-emas),0_22px_36px_rgba(62,46,34,.3)]">
                <Image src={p.src} alt={p.alt} fill sizes="(min-width: 1024px) 350px, 62vw" className="object-cover" draggable={false} />
                <motion.span animate={{ opacity: Math.min(a, 2) * 0.3 }} transition={spring} className="absolute inset-0 bg-inv-ink" />
              </span>
              <span aria-hidden="true" className="absolute top-full left-1/2 h-9 w-[3px] -translate-x-1/2 rounded-b-full bg-inv-night" />
            </motion.button>
          );
        })}
      </motion.div>

      <div className="mt-5 flex items-center justify-center gap-4">
        <button type="button" onClick={() => go(active - 1)} aria-label="Foto sebelumnya" className={arrowCls}>
          <Chevron dir="l" />
        </button>
        <div className="flex items-center">
          {photos.map((p, i) => (
            <button key={p.src} type="button" onClick={() => go(i)} aria-label={`Foto ${i + 1}`} aria-current={i === active || undefined} className="p-1.5">
              <span className={`block size-2.5 rotate-45 transition-colors duration-200 ${i === active ? "bg-inv-ink" : "bg-inv-ink/25"}`} />
            </button>
          ))}
        </div>
        <button type="button" onClick={() => go(active + 1)} aria-label="Foto berikutnya" className={arrowCls}>
          <Chevron dir="r" />
        </button>
      </div>
      <p aria-live="polite" className="mt-3 text-center text-[14px] text-inv-ink/75">
        Foto {active + 1} dari {n}. Geser atau ketuk foto di samping, ketuk foto depan untuk memperbesar.
      </p>

      <Modal open={zoom} onClose={() => setZoom(false)} label="Foto galeri">
        <div className="bg-inv-night">
          <motion.div
            key={photo.src}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={onLightboxDrag}
            initial={reduce ? false : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="relative aspect-[2/3] max-h-[76dvh] w-full touch-pan-y"
          >
            <Image src={photo.src} alt={photo.alt} fill sizes="512px" className="object-contain" draggable={false} />
          </motion.div>
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <button type="button" onClick={() => go(active - 1)} aria-label="Foto sebelumnya" className="flex size-12 items-center justify-center rounded-full bg-inv-wash text-inv-ink">
              <Chevron dir="l" />
            </button>
            <p className="text-center text-[14px] text-inv-wash">
              {active + 1} dari {n}
            </p>
            <button type="button" onClick={() => go(active + 1)} aria-label="Foto berikutnya" className="flex size-12 items-center justify-center rounded-full bg-inv-wash text-inv-ink">
              <Chevron dir="r" />
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

type Account = { bank: string; number: string; holder: string };

// Amplop tanda kasih. Buka: tutup terangkat dulu, lalu kartu naik. Tutup: kartu masuk dulu, lalu tutup turun.
export function Amplop({ account, monogram }: { account: Account; monogram: string }) {
  const [open, setOpen] = useState(false);
  const [scope, animateEnv] = useAnimate();
  const reduce = useReducedMotion();
  const flap = useMotionValue(0);
  const flapZ = useTransform(flap, (v) => (v > 90 ? 1 : 30));
  const busy = useRef(false);
  const room = useRef<HTMLDivElement>(null);

  async function toggle() {
    if (busy.current) return;
    busy.current = true;
    const d = reduce ? 0 : 1;
    if (!open) {
      setOpen(true);
      animate(room.current!, { paddingTop: "30%" }, { duration: 0.45 * d, ease: EASE });
      await animate(flap, 180, { duration: 0.45 * d, ease: EASE });
      await animateEnv(".pk-kartu", { y: "-50%" }, reduce ? { duration: 0 } : { type: "spring", stiffness: 70, damping: 13 });
    } else {
      setOpen(false);
      await animateEnv(".pk-kartu", { y: "0%" }, { duration: 0.4 * d, ease: EASE });
      await animate(flap, 0, { duration: 0.45 * d, ease: EASE });
      await animate(room.current!, { paddingTop: "3%" }, { duration: 0.35 * d, ease: EASE });
    }
    busy.current = false;
  }

  return (
    <div ref={room} className="mx-auto w-full max-w-[380px] pt-[3%]">
      <div ref={scope} className="relative aspect-[16/10] cursor-pointer [perspective:1000px]" onClick={toggle}>
        <span className="absolute inset-0 rounded-sm bg-[#4A2C16] shadow-[0_22px_40px_rgba(14,26,20,.35)]" />
        <motion.span
          style={{ rotateX: flap, zIndex: flapZ, transformOrigin: "50% 0%" }}
          className="pk-parang absolute inset-x-0 top-0 h-[58%] [clip-path:polygon(0_0,100%_0,50%_100%)]"
        />
        <div onClick={(e) => e.stopPropagation()} className="pk-kartu absolute inset-x-[6%] top-[6%] bottom-[6%] z-10 cursor-default rounded-sm bg-inv-wash px-5 pt-4 shadow-[0_6px_16px_rgba(0,0,0,.2)]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[14px] text-inv-accent">{account.bank}</p>
              <p className="font-display text-[22px] leading-tight tabular-nums text-inv-ink">{account.number}</p>
              <p className="truncate text-[14px] text-inv-ink/80">a.n. {account.holder}</p>
            </div>
            <CopyButton value={account.number} label={`nomor rekening ${account.holder}`} />
          </div>
        </div>
        <span className="pk-parang absolute inset-0 z-20 rounded-sm [clip-path:polygon(0_0,50%_52%,100%_0,100%_100%,0_100%)]" />
        <svg viewBox="0 0 100 62.5" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 z-20 size-full" aria-hidden="true">
          <path d="M0 0L50 32.5L100 0" fill="none" stroke="#E2C37A" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
        </svg>
        <motion.span
          animate={{ opacity: open ? 0 : 1, scale: open ? 0.6 : 1 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none absolute top-[56%] left-1/2 z-40 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[radial-gradient(circle_at_40%_35%,#C8423F,#8E1F24_60%,#5E1216)] font-display text-[13px] text-[#F3D6AE] shadow-[0_4px_12px_rgba(0,0,0,.4)]"
        >
          {monogram}
        </motion.span>
      </div>
      <button type="button" onClick={toggle} aria-expanded={open} className="mx-auto mt-3 block text-[14px] text-inv-accent underline underline-offset-4">
        {open ? `Tutup amplop ${account.bank}` : `Buka amplop ${account.bank}`}
      </button>
    </div>
  );
}

// Tancep kayon: gunungan ditancapkan ke gedebog saat bagian penutup terlihat.
export function TancepKayon() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.5 });
  const reduce = useReducedMotion();
  return (
    <div ref={ref} className="relative mx-auto flex h-60 w-fit flex-col items-center lg:h-[460px]">
      <motion.div
        initial={reduce ? false : { y: -140, opacity: 0, rotate: -6 }}
        animate={seen || reduce ? { y: 0, opacity: 1, rotate: 0 } : undefined}
        transition={{ type: "spring", stiffness: 140, damping: 11, mass: 1.1 }}
        className="relative z-10 h-[88%] origin-bottom"
      >
        <Puppet name="gunungan" className="drop-shadow-[0_16px_26px_rgba(0,0,0,.5)]" />
      </motion.div>
      <div className="pk-gedebog -mt-3 h-8 w-60 rounded-full lg:w-80" aria-hidden="true" />
    </div>
  );
}
