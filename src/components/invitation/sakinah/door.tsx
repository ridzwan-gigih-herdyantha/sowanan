"use client";

import { motion, useAnimate, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Arch, ArchCard, Hias, Lantern, Lattice, Pattern, Star } from "./ornaments";
import { BISMILLAH, SAKINAH_ENTER } from "./text";


export type PintuProps = { groom: string; bride: string; date: string; hijri: string; invited: string; onOpen: () => void };

const EASE = [0.22, 0.61, 0.36, 1] as const;

function Leaf({ side }: { side: "l" | "r" }) {
  return (
    <div className={`sk-leaf absolute inset-y-0 w-1/2 overflow-hidden ${side === "l" ? "left-0 origin-left" : "right-0 origin-right"}`}>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--sk-night2),color-mix(in_srgb,var(--sk-night2)_70%,#000))]" />
      <Pattern name="zellige" color="var(--sk-emas)" opacity={0.08} />
      <Arch className={`absolute top-[7%] bottom-[5%] ${side === "l" ? "right-[8%] left-[14%]" : "right-[14%] left-[8%]"}`} gap="var(--sk-night2)" line="var(--sk-emas)">
        <Lattice className="absolute inset-0 text-[var(--sk-emas)] opacity-35" size={30} />
      </Arch>
      <Hias name="sudut" corner={side === "l" ? "tl" : "tr"} className="m-2 w-24 text-[var(--sk-emas)] opacity-50 sm:w-32" />
      <Hias name="sudut" corner={side === "l" ? "bl" : "br"} className="m-2 w-24 text-[var(--sk-emas)] opacity-50 sm:w-32" />
      <span className={`absolute top-1/2 size-7 -translate-y-1/2 rounded-full border-2 border-[var(--sk-emas)] ${side === "l" ? "right-[3%]" : "left-[3%]"}`} aria-hidden="true" />
      <span className={`absolute inset-y-0 w-px bg-black/40 ${side === "l" ? "right-0" : "left-0"}`} aria-hidden="true" />
    </div>
  );
}

// Pintu pembuka: dua daun pintu berkisi mashrabiya menutupi layar, papan nama di tengah.
// Tamu menekan tombol, daun pintu terbuka ke dalam menuju cahaya, lalu lapisan memudar ke hero.
export function PintuDoor({ groom, bride, date, hijri, invited, onOpen }: PintuProps) {
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const [scope, animate] = useAnimate();
  const reduce = useReducedMotion();
  const skipped = useRef(false);
  const fit = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Papan nama diperkecil bila lebih tinggi dari layar, supaya tamu tidak perlu menggulir untuk membuka undangan.
  useEffect(() => {
    const el = fit.current;
    if (!el) return;
    const measure = () => setScale(Math.min(1, (window.innerHeight - 32) / el.offsetHeight));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    const body = document.body.style;
    body.overflow = "hidden";
    return () => {
      body.overflow = "";
    };
  }, [phase]);

  const finish = () => {
    skipped.current = true;
    setPhase("done");
    window.dispatchEvent(new Event(SAKINAH_ENTER));
  };

  async function play() {
    if (phase !== "idle") return;
    onOpen();
    if (reduce) return finish();
    setPhase("playing");
    const gone = () => skipped.current || !scope.current;

    animate(".sk-plaque", { opacity: 0, scale: 0.96, y: 10 }, { duration: 0.45, ease: EASE });
    animate(".sk-lamp", { opacity: 0 }, { duration: 0.4 });
    await new Promise((r) => setTimeout(r, 250));
    if (gone()) return;
    animate(".sk-light", { opacity: [0, 1] }, { duration: 1.2, ease: EASE });
    animate(".sk-leaf.origin-left", { rotateY: -100 }, { duration: 1.5, ease: [0.6, 0, 0.25, 1] });
    await animate(".sk-leaf.origin-right", { rotateY: 100 }, { duration: 1.5, ease: [0.6, 0, 0.25, 1] });
    if (gone()) return;
    window.dispatchEvent(new Event(SAKINAH_ENTER));
    await animate(scope.current, { opacity: 0 }, { duration: 0.6, ease: EASE });
    if (!skipped.current) setPhase("done");
  }

  if (phase === "done") return null;

  return (
    <div ref={scope} className="sk-door fixed inset-0 z-50 overflow-hidden bg-inv-night [perspective:1400px]">
      <div className="sk-light absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_45%,var(--inv-wash),var(--inv-paper)_55%,var(--sk-pasir))] opacity-0" aria-hidden="true" />
      <Leaf side="l" />
      <Leaf side="r" />

      {[0, 1].map((i) => (
        <motion.div
          key={i}
          aria-hidden="true"
          className={`sk-lamp absolute top-0 w-10 text-[var(--sk-emas)] sm:w-14 ${i ? "right-[9%]" : "left-[9%]"}`}
          style={{ transformOrigin: "50% 0%" }}
          animate={reduce ? undefined : { rotate: i ? [1.5, -1.5, 1.5] : [-1.5, 1.5, -1.5] }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
        >
          <Lantern chain={i ? 90 : 60} />
        </motion.div>
      ))}

      {/* Papan nama mengikuti tinggi isinya dan selalu di tengah. Di layar yang sangat pendek bisa digulir. */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden px-4">
        <div ref={fit} style={{ transform: `scale(${scale})` }}>
          <div className="sk-plaque relative w-[min(84vw,400px)] [@media(max-height:700px)]:w-[min(78vw,340px)] [@media(max-height:620px)]:w-[min(80vw,380px)]">
            <div aria-hidden="true" className="aspect-[100/18] [@media(max-height:620px)]:aspect-[100/11]" />
            <Hias name="mahkota" className="absolute top-0 left-1/2 z-10 w-[64%] -translate-x-1/2 text-sk-emas [@media(max-height:620px)]:w-[44%]" />
            <ArchCard fill="var(--inv-night)" cap="pt-[30cqw] [@media(max-height:620px)]:pt-[20cqw]">
              <div className="flex flex-col items-center px-6 pb-7 text-center text-inv-wash [@media(max-height:700px)]:pb-5">
                <p lang="ar" dir="rtl" className="font-arab text-[clamp(20px,6vw,28px)] leading-loose text-inv-gold-light [@media(max-height:620px)]:text-[20px] [@media(max-height:620px)]:leading-normal">
                  {BISMILLAH}
                </p>
                <p className="mt-3 text-[11px] tracking-[0.32em] text-inv-wash/75">WALIMATUL &lsquo;URSY</p>
                <div className="contents [@media(max-height:620px)]:hidden">
                  <p className="mt-2 font-display text-[clamp(36px,10.5vw,56px)] leading-[1.02] [@media(max-height:700px)]:text-[clamp(30px,8vw,44px)]">{groom}</p>
                  <Star className="my-1.5 size-5 text-inv-gold-light" />
                  <p className="font-display text-[clamp(36px,10.5vw,56px)] leading-[1.02] [@media(max-height:700px)]:text-[clamp(30px,8vw,44px)]">{bride}</p>
                </div>
                <p className="mt-1 hidden font-display text-[34px] leading-tight [@media(max-height:620px)]:block">
                  {groom} <span className="text-inv-gold-light">&amp;</span> {bride}
                </p>
                <p className="mt-4 text-[14px] text-inv-wash/85 [@media(max-height:620px)]:mt-2">{date}</p>
                <p className="text-[13px] text-inv-gold-light/90">{hijri}</p>
                {invited && (
                  <p className="mt-5 text-[14px] text-inv-wash/80 [@media(max-height:620px)]:mt-3">
                    Kepada Yth. <span className="font-display text-[19px] text-inv-wash">{invited}</span>
                  </p>
                )}
                <button
                  type="button"
                  onClick={play}
                  className="mt-5 rounded-sm bg-inv-wash px-8 py-3.5 [@media(max-height:620px)]:mt-3 [@media(max-height:620px)]:py-3 text-[15px] font-medium text-inv-ink shadow-[0_8px_20px_rgba(0,0,0,.3)] transition-transform duration-150 active:scale-[0.97]"
                >
                  Buka undangan
                </button>
              </div>
            </ArchCard>
          </div>
        </div>
      </div>

      {phase === "playing" && (
        <button type="button" onClick={finish} className="absolute right-4 bottom-4 z-10 rounded-sm bg-inv-wash px-4 py-2 text-[13px] text-inv-ink">
          Lewati
        </button>
      )}
    </div>
  );
}
