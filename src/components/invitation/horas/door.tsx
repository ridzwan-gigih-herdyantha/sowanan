"use client";

import { useAnimate, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Boras } from "./scene";

export type UlosProps = {
  groom: string;
  bride: string;
  date: string;
  invited: string;
  onOpen: () => void;
};

const EASE = [0.22, 0.61, 0.36, 1] as const;

// Pintu pembuka: dua helai ulos Ragi Hotang dengan medali HORAS di tengah. Saat dibuka ulos tersibak
// seperti saat mangulosi, beras berkat ditaburkan, lalu pintu terangkat.
export function UlosDoor({ groom, bride, date, invited, onOpen }: UlosProps) {
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const [scope, animate] = useAnimate();
  const reduce = useReducedMotion();
  const skipped = useRef(false);

  useEffect(() => {
    if (phase !== "playing") return;
    const body = document.body.style;
    body.overflow = "hidden";
    return () => {
      body.overflow = "";
    };
  }, [phase]);

  // Tanda untuk hero bahwa tirai sudah habis, supaya lapis-lapisnya baru muncul sesudahnya.
  const terbuka = () => scope.current?.closest("[data-inv-state]")?.setAttribute("data-hr-terbuka", "");

  const finish = () => {
    skipped.current = true;
    terbuka();
    setPhase("done");
  };

  async function play() {
    if (phase !== "idle") return;
    onOpen();
    if (reduce) return finish();
    setPhase("playing");
    const gone = () => skipped.current || !scope.current;

    animate(".hr-cta", { opacity: 0 }, { duration: 0.3, ease: EASE });
    await animate(".hr-medali", { opacity: 0 }, { duration: 0.4, ease: EASE });
    if (gone()) return;
    animate(".hr-boras-pintu", { opacity: 1 }, { duration: 0.2 });
    // Tirai: satu helai ke kiri, satu ke kanan, sampai keluar layar.
    animate(".hr-kiri", { x: "-100%" }, { duration: 1.5, ease: [0.65, 0, 0.35, 1] });
    await animate(".hr-kanan", { x: "100%" }, { duration: 1.5, ease: [0.65, 0, 0.35, 1] });
    if (gone()) return;
    terbuka();
    setPhase("done");
  }

  if (phase === "done") return null;

  return (
    <div ref={scope} className="hr-door fixed inset-0 z-50 overflow-hidden">
      <div className="hr-kiri absolute inset-y-0 left-0 w-1/2">
        <div aria-hidden="true" className="hr-ulos absolute inset-0" />
        <div aria-hidden="true" className="hr-rumbai absolute inset-y-0 right-0 w-3" />
      </div>
      <div className="hr-kanan absolute inset-y-0 right-0 w-1/2">
        <div aria-hidden="true" className="hr-ulos absolute inset-0 -scale-x-100" />
        <div aria-hidden="true" className="hr-rumbai absolute inset-y-0 left-0 w-3 -scale-x-100" />
      </div>
      <div aria-hidden="true" className="hr-boras-pintu pointer-events-none absolute inset-0 opacity-0">
        <Boras count={46} />
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 pb-[max(24px,env(safe-area-inset-bottom))] text-center">
        <button
          type="button"
          onClick={play}
          aria-label="Buka undangan"
          className="hr-medali relative flex aspect-square w-[min(78vw,380px)] flex-col items-center justify-center rounded-full bg-inv-night px-8 text-inv-wash shadow-[0_0_0_6px_var(--inv-accent),0_0_0_8px_var(--inv-gold),0_24px_60px_rgba(0,0,0,.55)]"
        >
          <span className="text-[12px] tracking-[0.42em] text-inv-gold-light">UNDANGAN</span>
          <span className="mt-3 font-script text-[clamp(40px,12vw,66px)] leading-[0.95]">
            {groom}
            <span className="block text-[0.45em] text-inv-gold-light">&amp;</span>
            {bride}
          </span>
          <span className="hr-ipon mt-4 h-2 w-32 opacity-80" />
          <span className="mt-3 text-[13px] tracking-[0.12em] text-inv-wash/80">{date}</span>
        </button>

        <div className="hr-cta mt-8 rounded-sm bg-inv-night/85 px-6 py-4 backdrop-blur-sm">
          {invited && (
            <p className="mb-3 text-[15px] text-inv-wash/85">
              Kepada Yth. <span className="block font-display text-[21px] text-inv-gold-light">{invited}</span>
            </p>
          )}
          <button
            type="button"
            onClick={play}
            className="rounded-sm bg-inv-gold-light px-8 py-3.5 text-[15px] font-medium tracking-[0.08em] text-inv-night shadow-[0_10px_24px_rgba(0,0,0,.35)] transition-transform duration-150 active:scale-[0.97]"
          >
            Buka undangan
          </button>
        </div>
      </div>

      {phase === "playing" && (
        <button type="button" onClick={finish} className="absolute right-4 bottom-[max(16px,env(safe-area-inset-bottom))] z-20 rounded-sm bg-inv-wash px-4 py-2 text-[13px] text-inv-ink">
          Lewati
        </button>
      )}
    </div>
  );
}
