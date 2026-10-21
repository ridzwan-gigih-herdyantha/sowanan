"use client";

import { useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { FrameProps } from "@/lib/invitation/frame";
import { doorFit, useDoorFit } from "../door-fit";
import { Flora, Wash } from "./flora";

export type MekarProps = { groom: string; bride: string; date: string; place: string; photo: string; frame?: FrameProps; set: string; invited: string; onOpen: () => void };

// Lama hembusan angin. Pembuka memudar di tengahnya, saat kelopak paling rapat melintas.
const GUST = 2400;
const SWEEP = "cubic-bezier(0.45, 0.05, 0.4, 0.95)";

type Petal = { size: number; x0: number; y0: number; x1: number; y1: number; wave: number; spin: number; delay: number; duration: number; shape: string };

// Kelopak hembusan dibuat setelah tombol ditekan, jadi angka acak tidak memengaruhi tampilan server.
function gust(w: number, h: number): Petal[] {
  // Sedikit kelopak berukuran besar, cukup untuk terasa seperti hembusan tanpa membebani HP.
  const count = w < 640 ? 14 : 22;
  const shapes = ["75% 0 75% 0", "60% 10% 70% 20%", "80% 20% 60% 10%"];
  return Array.from({ length: count }, (_, i) => {
    const y0 = Math.random() * h;
    return {
      size: 68 + Math.random() * 80,
      x0: -110 - Math.random() * w * 0.5,
      y0,
      x1: w + 60 + Math.random() * w * 0.3,
      y1: y0 + (Math.random() - 0.6) * h * 0.5,
      wave: (Math.random() - 0.5) * h * 0.25,
      spin: (Math.random() < 0.5 ? -1 : 1) * (360 + Math.random() * 540),
      delay: Math.random() * GUST * 0.35,
      duration: GUST * (0.55 + Math.random() * 0.35),
      shape: shapes[i % 3],
    };
  });
}

// Kelopak yang melayang turun pelan. Posisi, lama, dan jeda tetap supaya tampilan server dan peramban sama.
export function Petals({ count = 6 }: { count?: number }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="mm-petal" style={{ left: `${8 + i * 15}%`, animationDuration: `${9 + (i % 3) * 2.5}s`, animationDelay: `${-i * 1.7}s` }} />
      ))}
    </div>
  );
}

// Pembuka Mekar Mawar: kartu di atas sapuan cat air, untaian mawar di atas, foto bulat berbingkai emas.
// Saat dibuka, angin membawa kelopak mawar melintas dari kiri ke kanan. Pembuka memudar di balik kelopak, jadi
// undangan muncul perlahan sementara kelopak terus terbang keluar layar.
export function MekarDoor({ groom, bride, date, place, photo, frame, set, invited, onOpen }: MekarProps) {
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const reduce = useReducedMotion();
  const skipped = useRef(false);
  const scene = useRef<HTMLDivElement>(null);
  const wind = useRef<HTMLDivElement>(null);
  const [petals, setPetals] = useState<Petal[]>([]);
  const fit = useRef<HTMLDivElement>(null);

  useDoorFit(fit, { y: 48 });

  const finish = () => {
    skipped.current = true;
    setPhase("done");
  };

  function play() {
    if (phase !== "idle") return;
    onOpen();
    if (reduce) return finish();
    setPetals(gust(window.innerWidth, window.innerHeight));
    setPhase("playing");
  }

  useEffect(() => {
    if (phase !== "playing") return;
    const box = wind.current;
    const sc = scene.current;
    if (!box || !sc) return;
    const anims: Animation[] = [];
    const body = sc.querySelector<HTMLElement>(".mm-door-body");
    if (body) anims.push(body.animate([{ opacity: 1 }, { opacity: 0, translate: "0 -14px" }], { duration: 450, easing: "ease-out", fill: "forwards" }));
    anims.push(sc.animate([{ opacity: 1 }, { opacity: 0 }], { duration: GUST * 0.45, delay: GUST * 0.2, easing: "ease-in-out", fill: "forwards" }));
    box.querySelectorAll<HTMLElement>(".mm-gust-petal").forEach((el, i) => {
      const p = petals[i];
      if (!p) return;
      const mid = (p.x0 + p.x1) / 2;
      anims.push(
        el.animate(
          [
            { transform: `translate(${p.x0}px, ${p.y0}px) rotate(0deg) scaleX(1)` },
            { transform: `translate(${mid}px, ${(p.y0 + p.y1) / 2 + p.wave}px) rotate(${p.spin / 2}deg) scaleX(0.35)` },
            { transform: `translate(${p.x1}px, ${p.y1}px) rotate(${p.spin}deg) scaleX(1)` },
          ],
          { duration: p.duration, delay: p.delay, easing: SWEEP, fill: "both" },
        ),
      );
    });
    Promise.all(anims.map((a) => a.finished))
      .then(() => {
        if (!skipped.current) setPhase("done");
      })
      .catch(() => {});
    return () => {
      anims.forEach((a) => a.cancel());
    };
  }, [phase, petals]);

  if (phase === "done") return null;

  return (
    <div className={`mm-door fixed inset-0 z-50 overflow-hidden ${phase === "playing" ? "pointer-events-none" : ""}`}>
      <div ref={scene} className="inv-paper absolute inset-0">
        <Wash set={set} className="opacity-90" />
        <Petals />
        <Flora set={set} piece="untaian" priority sizes="(min-width: 640px) 760px, 150vw" className="top-0 left-1/2 w-[min(150vw,760px)] -translate-x-1/2 -translate-y-[30%] rotate-180" />
        <Flora set={set} piece="mawar-2" sizes="160px" className="-bottom-4 -left-6 w-[min(30vw,150px)]" />
        <Flora set={set} piece="mawar-3" sizes="140px" className="-right-6 -bottom-3 w-[min(26vw,130px)]" />

        <div className="absolute inset-0 flex items-center justify-center px-6 pt-10">
          <div ref={fit} {...doorFit({ y: 48 })} className="mm-door-body flex w-[min(86vw,420px)] flex-col items-center text-center">
            <div className="relative">
              <div className="mm-frame relative size-[min(44vw,190px)] overflow-hidden rounded-full">
                <Image {...frame} src={photo} alt={`${groom} dan ${bride}`} fill priority sizes="190px" className="object-cover object-[50%_30%]" />
              </div>
              <Flora set={set} piece="mawar-1" sizes="90px" className="-top-3 -left-6 w-[38%]" />
              <Flora set={set} piece="rangkaian" sizes="180px" className="-right-[30%] -bottom-[12%] w-[78%] -rotate-[18deg]" />
            </div>

            <p className="mt-8 font-body text-[11px] font-semibold tracking-[0.3em] text-inv-ink/60 uppercase">Undangan pernikahan</p>
            <h1 className="mt-3 font-script text-[clamp(44px,12vw,60px)] leading-[0.95] font-light text-inv-accent italic">
              {groom}
              <span className="block">
                <span className="mm-amp text-[0.72em] text-(--mm-rose) not-italic">&amp;</span> {bride}
              </span>
            </h1>
            <p className="mt-4 font-body text-[11px] font-semibold tracking-[0.26em] text-inv-ink/60 uppercase">{date}</p>
            <p className="mt-1 font-display text-[14px] text-inv-ink/70 italic">{place}</p>

            {invited && (
              <div className="mt-6">
                <span aria-hidden="true" className="mx-auto mb-4 block h-px w-10 bg-inv-gold" />
                <p className="text-[12px] tracking-[0.2em] text-inv-ink/60 uppercase">Kepada Yth.</p>
                <p className="mt-1 font-display text-[21px] leading-tight">{invited}</p>
              </div>
            )}
            <button
              type="button"
              onClick={play}
              className="mt-7 rounded-full bg-inv-accent px-8 py-3.5 font-body text-[11px] font-semibold tracking-[0.24em] text-inv-card uppercase shadow-[0_10px_24px_-12px_var(--inv-accent)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-inv-accent"
            >
              Buka undangan
            </button>
          </div>
        </div>
      </div>

      {phase === "playing" && (
        <div ref={wind} aria-hidden="true" className="absolute inset-0">
          {petals.map((p, i) => (
            <span
              key={i}
              className="mm-gust-petal absolute top-0 left-0"
              style={{ width: p.size, height: p.size * 0.78, borderRadius: p.shape, transform: `translate(${p.x0}px, ${p.y0}px)` }}
            />
          ))}
        </div>
      )}

      {phase === "playing" && (
        <button type="button" onClick={finish} className="pointer-events-auto absolute right-4 bottom-4 z-10 rounded-full border border-inv-line bg-inv-card px-4 py-2 text-[13px] text-inv-ink">
          Lewati
        </button>
      )}
    </div>
  );
}
