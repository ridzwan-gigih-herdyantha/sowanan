"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { Joystick } from "./joystick";
import { ARCH_BEAM, behindArch, DOOR_TARGET, MAP_H, MAP_W, move, NEAR_RADIUS, reachable, SPAWN, SPEED, type Point } from "./world";

export type GedungProps = {
  groom: string;
  bride: string;
  date: string;
  place: string;
  invited: string;
  onOpen: () => void;
};

type Pick = "groom" | "bride";

// Peta cover berukuran 1672 x 941. Pintu gedung ada di sekitar 61,5% x 40% gambar.
const RATIO = MAP_W / MAP_H;
const DOOR = { x: 61.5, y: 40 };
// Titik gambar yang diusahakan tetap terlihat di tengah layar sempit, antara gapura dan pintu.
const FOCUS = { x: 0.54, y: 0.5 };
// Peta sedikit diperbesar supaya kamera punya ruang menaikkan karakter di atas joystick.
const ZOOM = 1.2;
const ZOOM_MS = 950;
// Balok gapura pada gambar: pusatnya di sekitar 50% x 50%, lebar papan 13,6%, dan miring 27 derajat ke kanan bawah
// (garis isometrik 2:1), jadi tulisan dimiringkan dengan sudut yang sama supaya terlihat menempel di balok.
const BEAM_CLIP = `polygon(${ARCH_BEAM.map(([x, y]) => `${((x / MAP_W) * 100).toFixed(2)}% ${((y / MAP_H) * 100).toFixed(2)}%`).join(", ")})`;
const BEAM = { x: 50, y: 50, w: 13.6, h: 7.4, tilt: 27 };
// Jumlah huruf yang muat di papan pada ukuran penuh. Teks yang lebih panjang dikecilkan.
const NAME_FIT = 13;
const PLACE_FIT = 24;

// Lembar sprite 3 x 3 (sel 130 x 215): baris menghadap bawah, samping kanan, dan atas. Kolom pertama diam,
// dua kolom lain langkah kaki.
const SPRITES: Record<Pick, string> = { groom: "/img/rafi-kayla/male-guest.webp", bride: "/img/rafi-kayla/female-guest.webp" };
const CELL = { w: 130, h: 215 };
const HERO_H = 120;
const STEPS = [1, 0, 2, 0];
const STEP_FPS = 8;
// Seberapa cepat kamera menyusul karakter (per detik).
const FOLLOW = 4;

const KEYS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  a: [-1, 0],
  d: [1, 0],
  w: [0, -1],
  s: [0, 1],
};

const sprite = (pick: Pick, col = 0, row = 0): CSSProperties => ({
  backgroundImage: `url(${SPRITES[pick]})`,
  backgroundSize: "300% 300%",
  backgroundPosition: `${col * 50}% ${row * 50}%`,
});

const pill = "rounded-full border-[3px] border-inv-line bg-inv-card px-4 py-2 font-display text-[13px] leading-none font-semibold shadow-[0_4px_0_rgba(0,0,0,.25)] transition-transform active:translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2";
const link = "pointer-events-auto text-[12px] font-bold text-inv-gold underline underline-offset-4 hover:text-inv-ink focus-visible:outline-2 focus-visible:outline-offset-2";

// Cover berupa peta isometrik: tamu memilih karakter mempelai, lalu berjalan dari parkiran lewat gapura menuju
// pintu gedung. Setelah dekat pintu muncul tombol "Masuk"; saat diklik kamera mendekat lalu isi undangan
// terbuka. "Langsung buka" tetap tersedia untuk yang tidak ingin berjalan.
export function GedungDoor({ groom, bride, date, place, invited, onOpen }: GedungProps) {
  const [entering, setEntering] = useState(false);
  const [chosen, setChosen] = useState<Pick | null>(null);
  const [choosing, setChoosing] = useState(true);
  const [nearDoor, setNearDoor] = useState(false);
  const timer = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const archRef = useRef<HTMLDivElement>(null);
  const joyRef = useRef<HTMLDivElement>(null);
  const pos = useRef<Point>({ ...SPAWN });
  const target = useRef<Point | null>(null);
  const keys = useRef(new Set<string>());
  const dragging = useRef(false);
  const joy = useRef({ x: 0, y: 0 });
  const enteringRef = useRef(false);
  // Loop dan pendengar papan ketik hidup lebih lama dari satu render, jadi memanggil onOpen terbaru lewat ref.
  const openRef = useRef(onOpen);
  useEffect(() => {
    openRef.current = onOpen;
  });

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const enter = () => {
    if (enteringRef.current) return;
    enteringRef.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return openRef.current();
    setEntering(true);
    timer.current = window.setTimeout(() => openRef.current(), ZOOM_MS);
  };

  // Satu loop untuk gerak, animasi langkah, dan kamera. Posisi ditulis langsung ke elemen supaya tidak merender
  // ulang komponen tiap frame.
  useEffect(() => {
    if (!chosen || choosing) return;
    const stage = stageRef.current;
    const hero = heroRef.current;
    const body = bodyRef.current;
    const arch = archRef.current;
    if (!stage || !hero || !body || !arch) return;
    const cam = { x: Number(stage.style.getPropertyValue("--gd-fx")) || FOCUS.x, y: Number(stage.style.getPropertyValue("--gd-fy")) || FOCUS.y };
    const held = keys.current;
    let facing = 0;
    let flip = false;
    let walked = 0;
    let last = performance.now();
    let raf = 0;
    let near = false;

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const p = pos.current;
      let vx = 0;
      let vy = 0;
      keys.current.forEach((k) => {
        const [kx, ky] = KEYS[k];
        vx += kx;
        vy += ky;
      });
      // Joystick analog: makin jauh digeser makin cepat. Papan ketik dan ketukan selalu berkecepatan penuh.
      let power = 1;
      const jm = Math.hypot(joy.current.x, joy.current.y);
      if (vx || vy) target.current = null;
      else if (jm > 0) {
        vx = joy.current.x;
        vy = joy.current.y;
        power = Math.min(1, jm);
        target.current = null;
      } else if (target.current) {
        const dx = target.current.x - p.x;
        const dy = target.current.y - p.y;
        const d = Math.hypot(dx, dy);
        if (d < 5) target.current = null;
        else {
          vx = dx / d;
          vy = dy / d;
        }
      }
      let moving = false;
      if ((vx || vy) && !enteringRef.current) {
        const len = Math.hypot(vx, vy);
        const prev = { ...p };
        moving = move(p, (vx / len) * SPEED * power * dt, (vy / len) * SPEED * power * dt);
        // Joystick menutupi layar, jadi karakter tidak boleh berjalan masuk ke belakangnya.
        const jr = joyRef.current?.getBoundingClientRect();
        if (moving && jr) {
          const sr = stage.getBoundingClientRect();
          const sx = sr.left + (p.x / MAP_W) * sr.width;
          const sy = sr.top + (p.y / MAP_H) * sr.height;
          const py = sr.top + (prev.y / MAP_H) * sr.height;
          if (sy > jr.top - 6 && sx > jr.left - 28 && sx < jr.right + 28 && sy >= py) {
            p.x = prev.x;
            p.y = prev.y;
            moving = false;
          }
        }
        if (!moving) target.current = null;
      }
      if (moving) {
        walked += dt;
        if (Math.abs(vy) > Math.abs(vx)) facing = vy < 0 ? 2 : 0;
        else {
          facing = 1;
          flip = vx < 0;
        }
      } else walked = 0;
      const col = moving ? STEPS[Math.floor(walked * STEP_FPS) % STEPS.length] : 0;
      body.style.backgroundPosition = `${col * 50}% ${facing * 50}%`;
      body.style.transform = facing === 1 && flip ? "scaleX(-1)" : "";
      hero.style.left = `${(p.x / MAP_W) * 100}%`;
      hero.style.top = `${(p.y / MAP_H) * 100}%`;
      // Gapura di depan karakter bila dia lewat di belakangnya, di belakang karakter bila dia di depannya.
      arch.style.zIndex = behindArch(p) ? "3" : "1";

      const k = Math.min(1, dt * FOLLOW);
      cam.x += (p.x / MAP_W - cam.x) * k;
      cam.y += (p.y / MAP_H - cam.y) * k;
      stage.style.setProperty("--gd-fx", cam.x.toFixed(4));
      stage.style.setProperty("--gd-fy", cam.y.toFixed(4));

      const nowNear = Math.hypot(p.x - DOOR_TARGET.x, p.y - DOOR_TARGET.y) < NEAR_RADIUS;
      if (nowNear !== near) {
        near = nowNear;
        setNearDoor(nowNear);
      }
      if (!enteringRef.current || moving) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const down = (e: KeyboardEvent) => {
      if (!(e.key in KEYS) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target instanceof HTMLElement && /^(input|textarea|select)$/i.test(e.target.tagName)) return;
      e.preventDefault();
      keys.current.add(e.key);
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.key);
    const blur = () => keys.current.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
      held.clear();
    };
  }, [chosen, choosing]);

  // Ketukan atau seretan di peta menjadi titik tujuan, diubah ke koordinat gambar peta.
  const aim = (e: PointerEvent) => {
    const stage = stageRef.current;
    if (!stage) return;
    const r = stage.getBoundingClientRect();
    const to = { x: ((e.clientX - r.left) / r.width) * MAP_W, y: ((e.clientY - r.top) / r.height) * MAP_H };
    target.current = reachable(pos.current, to);
  };
  const onDown = (e: PointerEvent) => {
    if (!chosen || enteringRef.current) return;
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    aim(e);
  };
  const onMove = (e: PointerEvent) => dragging.current && aim(e);
  const onUp = () => (dragging.current = false);

  const pickHero = (who: Pick) => {
    setChosen(who);
    setChoosing(false);
    setNearDoor(false);
  };

  const name = `${groom} & ${bride}`;
  const fit = (size: number, text: string, max: number) => `calc(var(--gd-w) * ${(size * Math.min(1, max / text.length)).toFixed(5)})`;
  // Peta menutupi seluruh layar. Titik yang dipusatkan (--gd-fx, --gd-fy) mengikuti karakter, dan batas clamp
  // menjaga tepi peta tidak pernah terlihat.
  const stage = {
    "--gd-w": `calc(max(100vw, calc(100dvh * ${RATIO})) * ${ZOOM})`,
    "--gd-h": `calc(max(100dvh, calc(100vw / ${RATIO})) * ${ZOOM})`,
    "--gd-fx": FOCUS.x,
    "--gd-fy": FOCUS.y,
    width: "var(--gd-w)",
    height: "var(--gd-h)",
    left: "clamp(calc(100vw - var(--gd-w)), calc(50vw - var(--gd-w) * var(--gd-fx)), 0px)",
    top: "clamp(calc(100dvh - var(--gd-h)), calc(44dvh - var(--gd-h) * var(--gd-fy)), 0px)",
    transformOrigin: `${DOOR.x}% ${DOOR.y}%`,
  } as CSSProperties;

  const heroW = `calc(var(--gd-w) * ${((HERO_H * CELL.w) / CELL.h / MAP_W).toFixed(5)})`;

  return (
    <div className="gd-door fixed inset-0 z-50 overflow-hidden bg-inv-sky text-inv-ink" role="dialog" aria-label="Sampul undangan" data-entering={entering}>
      <div ref={stageRef} className="gd-stage absolute touch-none" style={stage} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        <Image src="/img/rafi-kayla/cover-map.webp" alt="" fill priority draggable={false} sizes="(min-width: 900px) 100vw, 160vw" className="pointer-events-none object-cover select-none" />
        <div ref={archRef} className="pointer-events-none absolute inset-0 z-[1]">
          <Image src="/img/rafi-kayla/cover-map.webp" alt="" fill sizes="(min-width: 900px) 100vw, 160vw" draggable={false} className="object-cover select-none" style={{ clipPath: BEAM_CLIP }} />
          <div
            className="pointer-events-none absolute flex flex-col items-center justify-center whitespace-nowrap rounded-[0.25em] border-[0.12em] border-[#4a2c17] bg-[#9a6a3f] text-center text-[#fff4dc] shadow-[0_0.18em_0_rgba(40,20,8,.45)] [text-shadow:0_0.07em_0_rgba(40,20,8,.55)]"
            style={{
              left: `${BEAM.x}%`,
              top: `${BEAM.y}%`,
              width: `${BEAM.w}%`,
              height: `${BEAM.h}%`,
              transform: `translate(-50%, -50%) skewY(${BEAM.tilt}deg)`,
            }}
          >
            <h1 className="font-display leading-none font-semibold" style={{ fontSize: fit(0.0135, name, NAME_FIT) }}>
              {name}
            </h1>
            <p className="mt-[0.3em] leading-none font-bold opacity-90" style={{ fontSize: fit(0.0082, place, PLACE_FIT) }}>
              {place}
            </p>
            <p className="mt-[0.25em] leading-none font-bold text-[#ffd98a]" style={{ fontSize: fit(0.0082, date, PLACE_FIT) }}>
              {date}
            </p>
          </div>
        </div>

        {chosen && (
          <div
            ref={heroRef}
            className={`gd-spawn pointer-events-none absolute z-[2] -translate-x-1/2 -translate-y-full${choosing ? " invisible" : ""}`}
            style={{ left: `${(SPAWN.x / MAP_W) * 100}%`, top: `${(SPAWN.y / MAP_H) * 100}%`, width: heroW, height: `calc(var(--gd-w) * ${(HERO_H / MAP_W).toFixed(5)})` }}
          >
            <span aria-hidden="true" className="absolute inset-x-[18%] -bottom-[3%] h-[8%] rounded-full bg-black/25 blur-[1px]" />
            <div ref={bodyRef} className="relative size-full bg-no-repeat" style={sprite(chosen)} role="img" aria-label={`Karakter ${chosen === "groom" ? "laki-laki" : "perempuan"}`} />
          </div>
        )}

        {chosen && nearDoor && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={enter}
            className="gd-pill absolute z-[4] -translate-x-1/2  whitespace-nowrap rounded-full border-[3px] border-inv-line bg-inv-accent px-5 py-2.5 font-display text-[clamp(14px,3.8vw,18px)] leading-none text-inv-paper shadow-[0_5px_0_rgba(0,0,0,.28)] transition-transform hover:-translate-y-[calc(100%+4px)] active:translate-y-[calc(-100%+2px)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            style={{ left: `${DOOR.x}%`, top: `${DOOR.y - 6}%` }}
          >
            Masuk
          </button>
        )}
      </div>

      <p className="gd-fade pointer-events-none absolute inset-x-0 top-[max(14px,2.4dvh)] flex justify-center">
        <span className="rounded-full border-[3px] border-inv-line bg-inv-card px-4 py-1.5 font-display text-[clamp(11px,3vw,14px)] tracking-[.14em] uppercase shadow-[0_4px_0_rgba(0,0,0,.2)]">Undangan pernikahan</span>
      </p>

      <div className="gd-fade pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center px-4 pb-[max(14px,2.4dvh)]">
        {choosing && (
          <section className="gd-board pointer-events-auto w-full max-w-[420px] rounded-[22px] border-[3px] border-inv-line bg-inv-card px-5 pt-4 pb-4 text-center shadow-[0_7px_0_rgba(0,0,0,.28)]">
            {invited && (
              <p className="mb-2.5 border-b-2 border-dashed border-inv-line/25 pb-2 text-[12px] text-inv-gold">
                Kepada Yth. <span className="font-display text-[15px] font-semibold text-inv-ink">{invited}</span>
              </p>
            )}
            {choosing ? (
              <>
                <p className="font-display text-[clamp(17px,5vw,21px)] leading-snug font-semibold">Pilih karaktermu</p>
                <div className="mt-2.5 grid grid-cols-2 gap-3">
                  {(["groom", "bride"] as const).map((who) => (
                    <button
                      key={who}
                      type="button"
                      onClick={() => pickHero(who)}
                      aria-pressed={chosen === who}
                      className="group flex flex-col items-center rounded-2xl border-[3px] border-inv-line bg-inv-wash px-2 pt-2 pb-2.5 shadow-[0_4px_0_rgba(0,0,0,.2)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 aria-pressed:bg-inv-gold-light"
                    >
                      <span aria-hidden="true" className="block h-[clamp(70px,12dvh,96px)] aspect-[130/215] bg-no-repeat" style={sprite(who)} />
                      <span className="mt-1 font-display text-[15px] leading-none font-semibold">{who === "groom" ? "Laki-laki" : "Perempuan"}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : null}
            <button type="button" onClick={enter} className={`${link} mt-3 inline-block`}>
              Langsung buka
            </button>
          </section>
        )}
      </div>

      {chosen && !choosing && (
        <>
          <div className="gd-fade pointer-events-none absolute inset-x-0 top-[max(56px,7.4dvh)] flex flex-col items-center gap-2.5 px-4">
            <div className="max-w-[360px] rounded-2xl border-[3px] border-inv-line bg-inv-card px-4 py-2 text-center shadow-[0_5px_0_rgba(0,0,0,.25)]">
              {invited && (
                <p className="text-[12px] text-inv-gold">
                  Kepada Yth. <span className="font-display text-[14px] font-semibold text-inv-ink">{invited}</span>
                </p>
              )}
              <p className="font-display text-[clamp(15px,4.4vw,18px)] leading-snug font-semibold">Jalan menuju pintu gedung</p>
              <p className="text-[11px] text-inv-gold">Pakai joystick, ketuk peta, atau tombol panah.</p>
            </div>
            <div className="pointer-events-auto flex gap-2.5">
              <button type="button" onClick={() => setChoosing(true)} className={pill}>
                Ganti karakter
              </button>
              <button type="button" onClick={() => enter()} className={pill}>
                Langsung buka
              </button>
            </div>
          </div>
          <div className="gd-fade pointer-events-none absolute inset-x-0 bottom-[max(18px,3dvh)] flex justify-center">
            <div ref={joyRef} className="pointer-events-auto opacity-80">
              <Joystick onMove={(x, y) => (joy.current = { x, y })} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
