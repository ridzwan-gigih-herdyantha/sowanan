"use client";

import Image from "@/components/invitation/photo";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type PointerEvent } from "react";
import { Joystick } from "./joystick";
import { aimCamera, clearTap, markTap, shift, turn, type Camera, type Facing } from "./motion";
import { useButtonSfx } from "./sfx";
import { ARCH_BEAM, behindArch, DOOR_TARGET, MAP_H, MAP_W, move, NEAR_RADIUS, reachable, SPAWN, SPEED, type Point } from "./world";

export type GedungProps = {
  groom: string;
  bride: string;
  date: string;
  place: string;
  invited: string;
  onOpen: () => void;
};

export type Pick = "groom" | "bride";

// Peta cover berukuran 1672 x 941. Pintu gedung ada di sekitar 61,5% x 40% gambar.
const RATIO = MAP_W / MAP_H;
const COVER = "/img/rafi-kayla/cover-pixel.png";
const DOOR = { x: 61.5, y: 40 };
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

// Lembar sprite 3 x 3 (sel 44 x 64): baris menghadap bawah, samping kanan, dan atas. Kolom pertama diam,
// dua kolom lain langkah kaki.
const SPRITES: Record<Pick, string> = { groom: "/img/rafi-kayla/guest-male.png", bride: "/img/rafi-kayla/guest-female.png" };
export const CELL = { w: 44, h: 64 };
export const HERO_H = 120;
export const STEPS = [1, 0, 2, 0];
export const STEP_FPS = 8;
// Sebentar berhenti (terhalang satu frame saat meluncur di dinding) tidak mengulang langkah dari awal.
export const STEP_GRACE = 0.1;
// Posisi kaki karakter di layar, dibanding tinggi layar. Layar pendek (HP mendatar) menaruhnya lebih bawah supaya
// tidak tertutup papan di atas.
export const footAnchor = (vh: number) => vh * (vh < 520 ? 0.78 : 0.5);

const noop = () => () => {};
let autoHero: Pick | null = null;
// Karakter bawaan: yang terakhir dipilih di sesi ini, atau acak. Disimpan supaya sama dengan karakter di dalam gedung.
function defaultHero(): Pick {
  if (autoHero) return autoHero;
  try {
    const saved = window.sessionStorage.getItem("gd-hero");
    if (saved === "groom" || saved === "bride") return (autoHero = saved);
  } catch {}
  const random: Pick = Math.random() < 0.5 ? "groom" : "bride";
  rememberHero(random);
  return random;
}
function rememberHero(who: Pick) {
  autoHero = who;
  try {
    window.sessionStorage.setItem("gd-hero", who);
  } catch {}
}
const serverHero = (): Pick => "groom";

export const KEYS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  a: [-1, 0],
  d: [1, 0],
  w: [0, -1],
  s: [0, 1],
};

export const sprite = (pick: Pick, col = 0, row = 0): CSSProperties => ({
  backgroundImage: `url(${SPRITES[pick]})`,
  backgroundSize: "300% 300%",
  backgroundPosition: `${col * 50}% ${row * 50}%`,
});

export const pill = "rounded-full border-[3px] border-inv-line bg-inv-card px-4 py-2 font-display text-[13px] leading-none font-semibold shadow-[0_4px_0_rgba(0,0,0,.25)] transition-transform active:translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2";
const link = "pointer-events-auto text-[12px] font-bold text-inv-gold underline underline-offset-4 hover:text-inv-ink focus-visible:outline-2 focus-visible:outline-offset-2";

// Cover berupa peta isometrik: karakter acak sudah berdiri di parkiran dan bisa langsung dijalankan, dengan papan
// untuk menggantinya. Tamu berjalan dari parkiran lewat gapura menuju pintu gedung. Setelah dekat pintu muncul tombol "Masuk"; saat diklik kamera mendekat lalu isi undangan
// terbuka. "Langsung buka" tetap tersedia untuk yang tidak ingin berjalan.
export function GedungDoor({ groom, bride, date, place, invited, onOpen }: GedungProps) {
  const [entering, setEntering] = useState(false);
  // Karakter sudah ada di HTML dari server. Pilihan acaknya baru diketahui di browser, dan pergantiannya tidak
  // terlihat karena loader undangan masih menutup halaman sampai hydration selesai.
  const auto = useSyncExternalStore(noop, defaultHero, serverHero);
  const [picked, setPicked] = useState<Pick | null>(null);
  const chosen = picked ?? auto;
  // Papan pilih karakter hanya terbuka lewat tombol "Ganti karakter".
  const [choosing, setChoosing] = useState(false);
  const [nearDoor, setNearDoor] = useState(false);
  const timer = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const archRef = useRef<HTMLDivElement>(null);
  const camRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLElement>(null);
  const tapRef = useRef<HTMLDivElement>(null);
  const joyRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  useButtonSfx(rootRef);
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
    const root = rootRef.current;
    const camEl = camRef.current;
    const stage = stageRef.current;
    const hero = heroRef.current;
    const body = bodyRef.current;
    const arch = archRef.current;
    if (!root || !camEl || !stage || !hero || !body || !arch) return;
    const cam: Camera = { x: 0, y: 0, ready: false };
    const held = keys.current;
    const face: Facing = { row: 0, flip: false };
    let walked = 0;
    let still = 0;
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
        moving = move(p, (vx / len) * SPEED * power * dt, (vy / len) * SPEED * power * dt);
        if (!moving) target.current = null;
        else turn(face, vx, vy);
      }
      clearTap(tapRef.current, !target.current, now);
      if (moving) {
        walked += dt;
        still = 0;
      } else if ((still += dt) > STEP_GRACE) walked = 0;
      const col = walked > 0 ? STEPS[Math.floor(walked * STEP_FPS) % STEPS.length] : 0;
      body.style.backgroundPosition = `${col * 50}% ${face.row * 50}%`;
      body.style.transform = face.row === 1 && face.flip ? "scaleX(-1)" : "";
      shift(hero, SPAWN, p, stage.offsetWidth / MAP_W);
      // Gapura di depan karakter bila dia lewat di belakangnya, di belakang karakter bila dia di depannya.
      arch.style.zIndex = behindArch(p) ? "3" : "1";

      // Papan pilih karakter atau joystick yang sedang tampil tidak boleh menutupi karakter.
      const avoid = (boardRef.current ?? joyRef.current)?.getBoundingClientRect();
      aimCamera(cam, camEl, root, { x: p.x / MAP_W, y: p.y / MAP_H }, footAnchor(root.clientHeight), avoid, dt);

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
      setChoosing(false);
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
  }, []);

  // Ketukan atau seretan di peta menjadi titik tujuan, diubah ke koordinat gambar peta.
  const aim = (e: PointerEvent, fresh: boolean) => {
    const stage = stageRef.current;
    if (!stage) return;
    const r = stage.getBoundingClientRect();
    const to = { x: ((e.clientX - r.left) / r.width) * MAP_W, y: ((e.clientY - r.top) / r.height) * MAP_H };
    target.current = reachable(pos.current, to);
    markTap(tapRef.current, target.current, MAP_W, MAP_H, fresh);
  };
  const onDown = (e: PointerEvent) => {
    if (enteringRef.current) return;
    setChoosing(false);
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    aim(e, true);
  };
  const onMove = (e: PointerEvent) => dragging.current && aim(e, false);
  const onUp = () => (dragging.current = false);

  const pickHero = (who: Pick) => {
    rememberHero(who);
    setPicked(who);
    setChoosing(false);
  };

  const name = `${groom} & ${bride}`;
  const fit = (size: number, text: string, max: number) => `calc(var(--gd-w) * ${(size * Math.min(1, max / text.length)).toFixed(5)})`;
  // Peta menutupi seluruh layar. Kamera digeser loop di atas mengikuti karakter; nilai di sini hanya posisi awal
  // sebelum loop berjalan.
  const camera = {
    "--gd-w": `calc(max(100vw, calc(100dvh * ${RATIO})) * ${ZOOM})`,
    "--gd-h": `calc(max(100dvh, calc(100vw / ${RATIO})) * ${ZOOM})`,
    width: "var(--gd-w)",
    height: "var(--gd-h)",
    transform: `translate(clamp(calc(100vw - var(--gd-w)), calc(50vw - var(--gd-w) * ${(SPAWN.x / MAP_W).toFixed(4)}), 0px), clamp(calc(100dvh - var(--gd-h)), calc(44dvh - var(--gd-h) * ${(SPAWN.y / MAP_H).toFixed(4)}), 0px))`,
  } as CSSProperties;

  const heroW = `calc(var(--gd-w) * ${((HERO_H * CELL.w) / CELL.h / MAP_W).toFixed(5)})`;

  return (
    <div ref={rootRef} className="gd-door fixed inset-0 z-50 overflow-hidden bg-inv-night text-inv-ink" role="dialog" aria-label="Sampul undangan" data-entering={entering}>
      <div ref={camRef} className="gd-pixel absolute top-0 left-0 will-change-transform" style={camera}>
      <div ref={stageRef} className="gd-stage absolute inset-0 touch-none" style={{ transformOrigin: `${DOOR.x}% ${DOOR.y}%` }} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        <Image src={COVER} alt="" fill priority draggable={false} sizes="100vw" className="pointer-events-none object-cover select-none" />
        {/* Kamera boleh turun melewati tepi bawah peta: peta memudar ke warna latar. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[3%] bg-linear-to-b from-transparent to-inv-night" />
        <div ref={archRef} className="pointer-events-none absolute inset-0 z-[1]">
          <Image src={COVER} alt="" fill sizes="100vw" draggable={false} className="object-cover select-none" style={{ clipPath: BEAM_CLIP }} />
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

        <div ref={tapRef} aria-hidden="true" className="gd-tap z-[1]" />

        <div
          ref={heroRef}
          className="pointer-events-none absolute z-[2] -translate-x-1/2 -translate-y-full"
          style={{ left: `${(SPAWN.x / MAP_W) * 100}%`, top: `${(SPAWN.y / MAP_H) * 100}%`, width: heroW, height: `calc(var(--gd-w) * ${(HERO_H / MAP_W).toFixed(5)})` }}
        >
          <span aria-hidden="true" className="absolute inset-x-[22%] -bottom-[3%] h-[7%] rounded-full bg-black/25" />
          <div ref={bodyRef} className="relative size-full bg-no-repeat" style={sprite(chosen)} role="img" aria-label={`Karakter ${chosen === "groom" ? "laki-laki" : "perempuan"}`} />
        </div>
        {/* Sprite berupa gambar latar yang tidak ditunggu loader. Salinan tersembunyi ini membuat loader menunggunya,
            jadi saat loader hilang karakter sudah tergambar. */}
        {(["groom", "bride"] as const).map((who) => (
          <Image key={who} src={SPRITES[who]} alt="" width={132} height={192} preload className="hidden" />
        ))}

        {nearDoor && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            data-sfx="open"
            onClick={enter}
            // Posisinya tidak ikut berubah saat hover: tombol yang bergeser keluar dari bawah kursor akan bergetar
            // bolak-balik. Hover cukup mencerahkan warna; saat ditekan bayangannya menipis. Tombol menempel di tengah
            // daun pintu, di atas kepala karakter dan jauh dari tombol-tombol di atas layar.
            className="gd-pill absolute z-[4] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border-[3px] border-inv-line bg-inv-accent px-5 py-2.5 font-display text-[clamp(14px,3.8vw,18px)] leading-none text-inv-paper shadow-[0_5px_0_rgba(0,0,0,.28)] transition-[filter,box-shadow] hover:brightness-110 active:shadow-[0_2px_0_rgba(0,0,0,.28)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            style={{ left: `${DOOR.x}%`, top: `${DOOR.y + 1}%` }}
          >
            Masuk
          </button>
        )}
      </div>
      </div>

      {/* Semua papan dan tombol selalu di atas peta dan karakter. */}
      <p className="gd-fade pointer-events-none absolute inset-x-0 top-[max(14px,2.4dvh)] z-[999] flex justify-center">
        <span className="rounded-full border-[3px] border-inv-line bg-inv-card px-4 py-1.5 font-display text-[clamp(11px,3vw,14px)] tracking-[.14em] uppercase shadow-[0_4px_0_rgba(0,0,0,.2)]">Undangan pernikahan</span>
      </p>

      <div className="gd-fade pointer-events-none absolute inset-x-0 bottom-0 z-[999] flex flex-col items-center px-4 pb-[max(14px,2.4dvh)]">
        {choosing && (
          <section ref={boardRef} className="gd-board pointer-events-auto w-full max-w-[420px] rounded-[22px] border-[3px] border-inv-line bg-inv-card px-5 pt-3 pb-3 text-center shadow-[0_7px_0_rgba(0,0,0,.28)] [@media(max-height:520px)]:px-3 [@media(max-height:520px)]:py-1.5">
            {invited && (
              <p className="mb-2 border-b-2 border-dashed border-inv-line/25 pb-1.5 text-[12px] text-inv-gold [@media(max-height:520px)]:hidden">
                Kepada Yth. <span className="font-display text-[15px] font-semibold text-inv-ink">{invited}</span>
              </p>
            )}
            {choosing ? (
              <>
                <p className="font-display text-[clamp(16px,4.6vw,20px)] leading-snug font-semibold [@media(max-height:520px)]:text-[13px]">Pilih karaktermu</p>
                <div className="mt-2 grid grid-cols-2 gap-3 [@media(max-height:520px)]:mt-1">
                  {(["groom", "bride"] as const).map((who) => (
                    <button
                      key={who}
                      type="button"
                      onClick={() => pickHero(who)}
                      aria-pressed={chosen === who}
                      className="group flex items-center justify-center gap-2.5 rounded-2xl border-[3px] border-inv-line bg-inv-wash px-2 py-1.5 shadow-[0_4px_0_rgba(0,0,0,.2)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 aria-pressed:bg-inv-gold-light"
                    >
                      <span aria-hidden="true" className="gd-pixel block aspect-[44/64] h-[clamp(40px,8dvh,64px)] shrink-0 bg-no-repeat" style={sprite(who)} />
                      <span className="font-display text-[14px] leading-none font-semibold">{who === "groom" ? "Laki-laki" : "Perempuan"}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : null}
            <p className="mt-2 text-[11px] leading-snug text-inv-gold [@media(max-height:520px)]:hidden">Atau ketuk peta untuk langsung berjalan.</p>
            <button type="button" data-sfx="open" onClick={enter} className={`${link} mt-1.5 inline-block [@media(max-height:520px)]:mt-0.5`}>
              Langsung buka
            </button>
          </section>
        )}
      </div>

      {!choosing && (
        <>
          <div className="gd-fade pointer-events-none absolute inset-x-0 top-[max(56px,7.4dvh)] z-[999] flex flex-col items-center gap-2.5 px-4 [@media(max-height:520px)]:top-2 [@media(max-height:520px)]:items-end">
            <div className="max-w-[360px] rounded-2xl [@media(max-height:520px)]:hidden border-[3px] border-inv-line bg-inv-card px-4 py-2 text-center shadow-[0_5px_0_rgba(0,0,0,.25)]">
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
              <button type="button" data-sfx="open" onClick={() => enter()} className={pill}>
                Langsung buka
              </button>
            </div>
          </div>
          <div className="gd-fade pointer-events-none absolute inset-x-0 bottom-[max(18px,3dvh)] z-[999] flex justify-center [@media(max-height:520px)]:justify-start [@media(max-height:520px)]:pl-5">
            <div ref={joyRef} className="pointer-events-auto opacity-80">
              <Joystick onMove={(x, y) => (joy.current = { x, y })} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
