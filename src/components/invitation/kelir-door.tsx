"use client";

import { motion, useAnimate, useMotionValue, useReducedMotion, useTransform, type PanInfo } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Lurik, Seret, texture } from "./pakeliran-ornaments";
import { ENTER_EVENT, Puppet, Sudut } from "./pakeliran/puppet";

export type KelirProps = {
  groom: string;
  bride: string;
  groomAksara: string;
  brideAksara: string;
  date: string;
  invited: string;
  onOpen: () => void;
};

const EASE = [0.22, 0.61, 0.36, 1] as const;
const KAWUNG = texture("kawung", "var(--pk-tex)", 0.1);

// Pintu pembuka: nama mempelai besar di atas, panggung kecil di bawahnya dengan gunungan tertancap di gedebog.
// Tamu menggeser gunungan atau menekan tombol, gunungan dikebut ke samping, bayangan wayang masuk lalu berubah prada,
// kemudian seluruh layar terangkat ke hero.
export function KelirDoor({ groom, bride, groomAksara, brideAksara, date, invited, onOpen }: KelirProps) {
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const [scope, animate] = useAnimate();
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const tilt = useTransform(x, [-200, 0, 200], [-16, 0, 16]);
  const skipped = useRef(false);

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
    window.dispatchEvent(new Event(ENTER_EVENT));
  };

  async function play(dir: number) {
    if (phase !== "idle") return;
    onOpen();
    if (reduce) return finish();
    setPhase("playing");
    // Berhenti bila tamu menekan Lewati, karena pintunya sudah dilepas dari halaman.
    const gone = () => skipped.current || !scope.current;

    const w = window.innerWidth;
    animate(".pk-cta", { opacity: 0, y: 12 }, { duration: 0.35, ease: EASE });
    await animate(".pk-gunungan", { x: dir * w, rotateY: dir * 540, scale: 0.7, opacity: [1, 1, 0] }, { duration: 1.1, ease: [0.55, 0, 0.3, 1] });
    if (gone()) return;

    animate(".pk-flare", { opacity: [0, 1, 0.6] }, { duration: 0.9, ease: EASE });
    animate(".pk-shadow-l", { x: ["-70%", "0%"], opacity: [0, 0.6] }, { duration: 1.2, ease: EASE });
    await animate(".pk-shadow-r", { x: ["70%", "0%"], opacity: [0, 0.6] }, { duration: 1.2, ease: EASE });
    if (gone()) return;

    animate(".pk-shadow-l, .pk-shadow-r", { opacity: 0.12 }, { duration: 0.8, ease: EASE });
    await animate(".pk-gold", { opacity: [0, 1], y: [24, 0], scale: [0.94, 1] }, { duration: 0.85, ease: EASE });
    if (gone()) return;
    animate(".pk-gold-l", { rotate: 3 }, { type: "spring", stiffness: 55, damping: 8 });
    animate(".pk-gold-r", { rotate: -3 }, { type: "spring", stiffness: 55, damping: 8 });

    await new Promise((r) => setTimeout(r, 1000));
    if (gone()) return;
    window.dispatchEvent(new Event(ENTER_EVENT));
    await animate(scope.current, { y: "-100%" }, { duration: 0.9, ease: [0.65, 0, 0.35, 1] });
    if (!skipped.current) setPhase("done");
  }

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 70 || Math.abs(info.velocity.x) > 450) play(Math.sign(info.offset.x || info.velocity.x) || 1);
  };

  if (phase === "done") return null;

  return (
    <div ref={scope} className="pk-door fixed inset-0 z-50 flex flex-col overflow-hidden bg-inv-paper text-inv-ink">
      <div aria-hidden="true" className="absolute inset-0" style={KAWUNG} />
      <div aria-hidden="true" className="pk-flare pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-[radial-gradient(45%_60%_at_50%_75%,rgba(232,207,150,.75),transparent_72%)] opacity-0" />

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div aria-hidden="true" className="pointer-events-none absolute inset-3 bottom-2 border border-pk-emas/70 outline outline-1 outline-offset-4 outline-pk-emas/35 lg:inset-5 lg:bottom-3" />
        <Sudut corner="tl" className="m-1 w-14 lg:m-3 lg:w-24" />
        <Sudut corner="tr" className="m-1 w-14 lg:m-3 lg:w-24" />

        <header className="relative z-10 flex-none px-8 pt-[max(44px,7svh)] text-center">
          <p className="text-[12px] tracking-[0.32em] text-inv-accent">PAHARGYAN PAWIWAHAN</p>
          <p className="mt-3 font-script text-[clamp(48px,13.5vw,108px)] leading-[0.95]">
            {groom}
            <span className="my-1 block text-[0.42em] text-inv-accent lg:mx-5 lg:my-0 lg:inline">&amp;</span>
            {bride}
          </p>
          {(groomAksara || brideAksara) && (
            <p lang="jv" className="mt-3 font-jawa text-[clamp(16px,4.4vw,24px)] text-inv-accent">
              {[groomAksara, brideAksara].filter(Boolean).join(" ꧋ ")}
            </p>
          )}
          <Seret className="mx-auto mt-4 w-40" />
          <p className="mt-3 text-[15px] text-inv-ink/80">{date}</p>
        </header>

        <div className="relative z-10 mt-3 min-h-0 flex-1">
          <div aria-hidden="true" className="pk-gedebog absolute inset-x-[10%] bottom-1 h-5 rounded-full lg:inset-x-[28%]" />
          <div className="absolute inset-x-0 top-0 bottom-3 flex items-end justify-center gap-[12%]">
            <div className="pk-shadow-l h-[94%] max-h-[290px] opacity-0 lg:max-h-[400px]">
              <Puppet name="kamajaya" shadow eager />
            </div>
            <div className="pk-shadow-r h-[94%] max-h-[290px] opacity-0 lg:max-h-[400px]">
              <Puppet name="kamaratih" shadow eager />
            </div>
          </div>
          <div className="absolute inset-x-0 top-0 bottom-3 flex items-end justify-center gap-[4%] lg:gap-[2%]">
            <div className="pk-gold pk-gold-l h-[96%] max-h-[300px] origin-bottom opacity-0 lg:max-h-[410px]">
              <Puppet name="kamajaya" eager className="drop-shadow-[0_10px_14px_rgba(62,46,34,.35)]" />
            </div>
            <div className="pk-gold pk-gold-r h-[96%] max-h-[300px] origin-bottom opacity-0 lg:max-h-[410px]">
              <Puppet name="kamaratih" eager className="drop-shadow-[0_10px_14px_rgba(62,46,34,.35)]" />
            </div>
          </div>
          <motion.div
            className="pk-gunungan absolute inset-x-0 top-0 bottom-2 mx-auto flex w-fit cursor-grab touch-pan-y items-end active:cursor-grabbing [perspective:900px]"
            style={{ x, rotate: tilt, transformOrigin: "50% 100%" }}
            drag={phase === "idle" ? "x" : false}
            dragSnapToOrigin
            dragElastic={0.55}
            onDragEnd={onDragEnd}
          >
            <motion.div
              className="h-full max-h-[320px] origin-bottom lg:max-h-[440px]"
              animate={phase === "idle" && !reduce ? { rotate: [0, -2, 0, 2, 0] } : { rotate: 0 }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Puppet name="gunungan" eager className="drop-shadow-[0_14px_22px_rgba(62,46,34,.4)]" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      <footer className="relative z-10 flex-none bg-inv-night px-6 pt-5 pb-[max(20px,env(safe-area-inset-bottom))] text-center text-inv-wash">
        <Lurik className="absolute inset-x-0 top-0 -translate-y-full" />
        <div className="pk-cta">
          {invited && (
            <p className="text-[15px] text-inv-wash/85">
              Kagem <span className="font-display text-[22px] text-inv-gold-light">{invited}</span>
            </p>
          )}
          <div className="mt-3 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => play(1)}
              className="rounded-sm bg-inv-wash px-7 py-3.5 text-[15px] font-medium text-inv-ink shadow-[0_8px_20px_rgba(0,0,0,.25)] transition-transform duration-150 active:scale-[0.97]"
            >
              Buka undangan
            </button>
            <p className="max-w-[15ch] text-left text-[13px] leading-snug text-inv-wash/80">atau geser gunungannya</p>
          </div>
        </div>
        {phase === "playing" && (
          <button type="button" onClick={finish} className="absolute top-1/2 right-4 -translate-y-1/2 rounded-sm bg-inv-wash px-4 py-2 text-[13px] text-inv-ink">
            Lewati
          </button>
        )}
      </footer>
    </div>
  );
}
