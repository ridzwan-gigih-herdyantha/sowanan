"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { Modal } from "../modal";
import { useCloseInvitation } from "../shell";
import { newDodge } from "../pathing";
import type { BoothKind } from "./booth";
import { CELL, KEYS, sprite, STEPS, STEP_FPS, STEP_GRACE, type Pick } from "./door";
import { Joystick } from "./joystick";
import { clearTap, markTap, shift, turn, type Facing } from "./motion";
import { BLOCKS, COUPLE, MAP, WALK } from "./pantai-data";
import { HERO_H, NEAR, pantaiWorld, PH, poiDistance, POIS, PW, SPAWN, SPEED, type Poi, type PoiId } from "./pantai-world";
import { useButtonSfx } from "./sfx";
import type { Point } from "./world";

export type Panel = { id: PoiId; title: string; body: ReactNode; label?: string; icon?: BoothKind };

const LABELS: Record<PoiId, string> = {
  pembuka: "Selamat datang",
  pelaminan: "Pelaminan",
  mempelai: "Mempelai",
  cerita: "Cerita",
  galeri: "Galeri",
  pasca: "Galeri Pasca Acara",
  acara: "Acara",
  slot1: "Info",
  slot2: "Info",
  rsvp: "Buku tamu",
  angpao: "Kotak amplop",
};
// Tinggi label nama pos di atas bendanya, dalam piksel peta.
const TAG_Y: Record<PoiId, number> = { pembuka: 1250, pelaminan: 112, mempelai: 440, cerita: 120, galeri: 640, pasca: 805, acara: 545, slot1: 1160, slot2: 752, rsvp: 1165, angpao: 1305 };

const COUPLE_SRC = "/img/dimas-salsa/couple-sprite.png";

// Skala kamera (piksel layar per piksel peta) saat mengikuti karakter. Peta selalu menutupi seluruh layar; di HP
// taman ditampilkan sekitar 470 piksel ke samping supaya karakter cukup besar.
function cameraScale(vw: number, vh: number) {
  const cover = Math.max(vw / PW, vh / PH);
  return { cover, k: Math.max(cover, Math.min(vh / 760, vw / 470)) };
}
type Mode = "overview" | "follow";
// Lama kamera menyapu seluruh taman saat pertama masuk, lalu lama kamera turun ke karakter.
const INTRO_MS = 3000;
const DIVE_MS = 1300;

function savedHero(): Pick {
  try {
    return window.sessionStorage.getItem("gd-hero") === "bride" ? "bride" : "groom";
  } catch {
    return "groom";
  }
}

const pct = (v: number, of: number) => `${(v / of) * 100}%`;

// Isi undangan berupa taman pernikahan di tebing pantai. Saat masuk, kamera menyapu taman dari pelaminan sampai
// gerbang, lalu mengikuti karakter. Saat tamu sampai di depan sebuah pos, isinya langsung terbuka.
export function PantaiMap({ panels, welcome, finale }: { panels: Panel[]; welcome?: ReactNode; finale?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [hero, setHero] = useState<Pick>("groom");
  const [panel, setPanel] = useState<PoiId | null>(null);
  // Pos yang sedang didekati: tombol Buka muncul, isinya baru terbuka setelah diklik.
  const [near, setNear] = useState<PoiId | null>(null);
  const [seen, setSeen] = useState<ReadonlySet<PoiId>>(() => new Set());
  const [toc, setToc] = useState(false);
  const [phase, setPhase] = useState<"play" | "done">("play");
  const [mode, setMode] = useState<Mode>("overview");
  const [zoomable, setZoomable] = useState(true);
  const [debug, setDebug] = useState(false);
  const closeInvitation = useCloseInvitation();
  const finished = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const camRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const tapRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  useButtonSfx(rootRef);
  const pos = useRef<Point>({ ...SPAWN });
  const target = useRef<Point[] | null>(null);
  const keys = useRef(new Set<string>());
  const joy = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  const paused = useRef(true);
  const modeRef = useRef<Mode>("overview");
  const intro = useRef(false);
  const nearRef = useRef<PoiId | null>(null);
  const enterRef = useRef<(id: PoiId) => void>(() => {});

  const byId = useMemo(() => new Map(panels.map((p) => [p.id, p])), [panels]);
  // Pos yang punya panel. Pembuka tidak punya titik di peta: terbuka sendiri setelah kamera turun ke gerbang.
  const pois = useMemo(() => POIS.filter((p) => p.id !== "pembuka" && byId.has(p.id)), [byId]);
  const poisRef = useRef(pois);
  const world = useMemo(() => pantaiWorld(), []);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  useEffect(() => {
    poisRef.current = pois;
    modeRef.current = mode;
  });
  useEffect(() => {
    paused.current = panel !== null || phase !== "play" || mode !== "follow";
    if (paused.current) {
      joy.current = { x: 0, y: 0 };
      keys.current.clear();
      target.current = null;
    }
  }, [panel, phase, mode]);

  // Tombol peta penuh hanya berguna bila taman bisa diperkecil tanpa menyisakan tepi kosong, yaitu di layar tegak.
  useEffect(() => {
    const check = () => {
      const root = rootRef.current;
      if (!root) return;
      const { cover, k } = cameraScale(root.clientWidth, root.clientHeight);
      setZoomable(cover < k * 0.9);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Peta aktif setelah undangan dibuka. Tiap kali dibuka, kamera menyapu taman dulu.
  useEffect(() => {
    const shell = rootRef.current?.closest("[data-inv-state]");
    if (!shell) return;
    const sync = () => {
      const now = shell.getAttribute("data-inv-state") === "open";
      setOpen(now);
      timers.current.forEach(window.clearTimeout);
      timers.current = [];
      if (!now) return;
      setHero(savedHero());
      pos.current = { ...SPAWN };
      intro.current = true;
      setMode("overview");
      timers.current.push(
        window.setTimeout(() => {
          intro.current = false;
          setMode("follow");
        }, INTRO_MS),
        window.setTimeout(() => byId.has("pembuka") && setPanel((p) => p ?? "pembuka"), INTRO_MS + DIVE_MS),
      );
    };
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(shell, { attributes: true, attributeFilter: ["data-inv-state"] });
    setDebug(new URLSearchParams(window.location.search).has("gdebug"));
    const list = timers.current;
    return () => {
      mo.disconnect();
      list.forEach(window.clearTimeout);
    };
  }, [byId]);

  useEffect(() => {
    if (!open) return;
    const root = rootRef.current;
    const camEl = camRef.current;
    const heroEl = heroRef.current;
    const body = bodyRef.current;
    if (!root || !camEl || !heroEl || !body) return;
    const held = keys.current;
    const face: Facing = { row: 2, flip: false };
    const cam = { z: 0, fx: pos.current.x, fy: pos.current.y, ay: 0.56, ready: false };
    let walked = 0;
    let still = 0;
    let last = performance.now();
    let introFrom = 0;
    let raf = 0;
    let sizeKey = "";
    const dodge = newDodge();

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const vw = root.clientWidth;
      const vh = root.clientHeight;
      const { cover, k } = cameraScale(vw, vh);
      const key = `${vw}x${vh}`;
      if (key !== sizeKey) {
        sizeKey = key;
        camEl.style.width = `${PW * k}px`;
        camEl.style.height = `${PH * k}px`;
      }

      const p = pos.current;
      let vx = 0;
      let vy = 0;
      if (!paused.current)
        held.forEach((key) => {
          const [kx, ky] = KEYS[key];
          vx += kx;
          vy += ky;
        });
      let power = 1;
      const jm = Math.hypot(joy.current.x, joy.current.y);
      if (!paused.current && !vx && !vy && jm > 0) {
        vx = joy.current.x;
        vy = joy.current.y;
        power = Math.min(1, jm);
        target.current = null;
      } else if (vx || vy) target.current = null;
      const step = SPEED * power * dt;
      const dir = paused.current ? null : world.walk(target.current ?? world.steer(dodge, p, vx, vy, step), p, step);
      if (dir) turn(face, dir.x, dir.y);
      else target.current = null;
      clearTap(tapRef.current, !target.current, now);
      if (dir) {
        walked += dt;
        still = 0;
      } else if ((still += dt) > STEP_GRACE) walked = 0;
      const col = walked > 0 ? STEPS[Math.floor(walked * STEP_FPS) % STEPS.length] : 0;
      body.style.backgroundPosition = `${col * 50}% ${face.row * 50}%`;
      body.style.transform = face.row === 1 && face.flip ? "scaleX(-1)" : "";
      shift(heroEl, SPAWN, p, k);
      heroEl.style.zIndex = String(Math.round(p.y));

      // Kamera: titik fokus dan zoom dihaluskan, lalu geseran layar dihitung darinya. Peta tidak pernah lebih kecil
      // dari layar.
      const m = modeRef.current;
      let f: Point = p;
      if (m === "overview" && intro.current) {
        // Saat pertama masuk kamera menyapu dari pelaminan turun ke gerbang; dari tombol peta, berpusat di karakter.
        introFrom ||= now;
        const t = Math.min(1, (now - introFrom) / INTRO_MS);
        f = { x: PW / 2, y: PH * (0.12 + 0.76 * (t * t * (3 - 2 * t))) };
      } else introFrom = 0;
      const zWant = m === "overview" ? cover / k : 1;
      const settled = m === "follow" && Math.abs(cam.z - 1) < 0.02;
      const ease = cam.ready ? Math.min(1, dt * (settled ? 5 : m === "overview" && intro.current ? 6 : 2.6)) : 1;
      cam.fx += (f.x - cam.fx) * ease;
      cam.fy += (f.y - cam.fy) * ease;
      cam.ay += ((m === "follow" ? 0.56 : 0.5) - cam.ay) * ease;
      const z0 = cam.z || zWant;
      cam.z = Math.max(cover / k, Math.exp(Math.log(z0) + (Math.log(zWant) - Math.log(z0)) * ease));
      cam.ready = true;
      const w = PW * k * cam.z;
      const h = PH * k * cam.z;
      // Di HP, kamera boleh turun sedikit melewati tepi bawah taman supaya karakter di jalan masuk tidak tertutup joystick.
      const below = m === "follow" && vw < 768 ? Math.min(vh * 0.16, 130) : 0;
      const tx = Math.min(0, Math.max(vw - w, vw / 2 - (cam.fx / PW) * w));
      const ty = Math.min(0, Math.max(vh - h - below, vh * cam.ay - (cam.fy / PH) * h));
      const dpr = window.devicePixelRatio || 1;
      camEl.style.transform = `translate3d(${Math.round(tx * dpr) / dpr}px, ${Math.round(ty * dpr) / dpr}px, 0) scale(${cam.z.toFixed(4)})`;
      // Label pos tetap terbaca saat peta diperkecil.
      camEl.style.setProperty("--pz", String(1 / Math.max(cam.z, 0.5)));

      // Pos terdekat dalam jangkauan: tombol Buka muncul untuknya.
      let best: PoiId | null = null;
      let bestD = NEAR;
      if (m === "follow") {
        for (const poi of poisRef.current) {
          const d = poiDistance(poi, p);
          if (d < bestD) {
            best = poi.id;
            bestD = d;
          }
        }
      }
      if (best !== nearRef.current) {
        nearRef.current = best;
        setNear(best);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const down = (e: KeyboardEvent) => {
      if (paused.current || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target instanceof HTMLElement && /^(input|textarea|select|button|a)$/i.test(e.target.tagName)) return;
      // Enter membuka pos yang sedang didekati.
      if (e.key === "Enter" && nearRef.current) {
        e.preventDefault();
        enterRef.current(nearRef.current);
        return;
      }
      if (!(e.key in KEYS)) return;
      e.preventDefault();
      held.add(e.key);
    };
    const up = (e: KeyboardEvent) => held.delete(e.key);
    const blur = () => held.clear();
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
  }, [open, world]);

  const go = (to: Point, fresh: boolean) => {
    const path = world.route(pos.current, to);
    target.current = path;
    markTap(tapRef.current, path[path.length - 1], PW, PH, fresh);
  };
  const aim = (e: PointerEvent, fresh: boolean) => {
    const stage = stageRef.current;
    if (!stage) return;
    const r = stage.getBoundingClientRect();
    go({ x: ((e.clientX - r.left) / r.width) * PW, y: ((e.clientY - r.top) / r.height) * PH }, fresh);
  };
  const onDown = (e: PointerEvent) => {
    if (paused.current) return;
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    aim(e, true);
  };

  // Isi pos terbuka setelah tamu mengklik tombol Buka.
  const enter = (id: PoiId) => {
    target.current = null;
    setToc(false);
    setPanel(id);
    setSeen((s) => (s.has(id) ? s : new Set(s).add(id)));
  };
  useEffect(() => {
    enterRef.current = enter;
  });

  const closePanel = () => {
    setPanel(null);
    setMode("follow");
    if (!finished.current && pois.length > 0 && pois.every((p) => seen.has(p.id))) {
      finished.current = true;
      later(() => setPhase("done"), 450);
    }
  };
  // Dari peta penuh atau daftar misi: kamera kembali ke karakter dan karakter berjalan ke depan pos itu.
  const walkTo = (poi: Poi) => {
    setMode("follow");
    setToc(false);
    later(() => go(poi.stand, true), 80);
  };

  const active = panels.find((p) => p.id === panel);
  const done = pois.filter((p) => seen.has(p.id)).length;
  const overview = mode === "overview";

  return (
    <div ref={rootRef} className="gd-interior fixed inset-0 z-40 overflow-hidden bg-[#2f5a2c] text-inv-ink">
      <div ref={camRef} className="absolute top-0 left-0 origin-top-left will-change-transform" style={{ width: PW / 2, height: PH / 2 }}>
        <div ref={stageRef} className="absolute inset-0 isolate touch-none" onPointerDown={onDown} onPointerMove={(e) => dragging.current && aim(e, false)} onPointerUp={() => (dragging.current = false)} onPointerCancel={() => (dragging.current = false)}>
          {/* eslint-disable-next-line @next/next/no-img-element -- lukisan peta dipakai apa adanya */}
          <img src={MAP.src} alt="" draggable={false} className="pointer-events-none absolute inset-0 size-full select-none" />
          <div ref={tapRef} aria-hidden="true" className="gd-tap z-[1]" />

          <div
            aria-hidden="true"
            className="gd-pixel pointer-events-none absolute bg-contain bg-bottom bg-no-repeat"
            style={{ left: pct(COUPLE.x - COUPLE.w / 2, PW), top: pct(COUPLE.y - COUPLE.h, PH), width: pct(COUPLE.w, PW), height: pct(COUPLE.h, PH), zIndex: COUPLE.y, backgroundImage: `url(${COUPLE_SRC})` }}
          />

          {/* Titik pos: cincin berdenyut di tempat tamu berdiri, redup setelah dikunjungi. */}
          {pois.map((p) => (
            <span key={p.id} aria-hidden="true" className={`gd-spot pointer-events-none absolute z-[2] ${seen.has(p.id) ? "opacity-40" : ""}`} style={{ left: pct(p.stand.x, PW), top: pct(p.stand.y, PH) }} />
          ))}

          <div ref={heroRef} className="pointer-events-none absolute -translate-x-1/2 -translate-y-full" style={{ left: pct(SPAWN.x, PW), top: pct(SPAWN.y, PH), width: pct((HERO_H * CELL.w) / CELL.h, PW), height: pct(HERO_H, PH), zIndex: Math.round(SPAWN.y) }}>
            <span aria-hidden="true" className="absolute inset-x-[22%] -bottom-[3%] h-[7%] rounded-full bg-black/25" />
            <div ref={bodyRef} className="gd-pixel relative size-full bg-no-repeat" style={sprite(hero, 0, 2)} role="img" aria-label="Karakter kamu" />
          </div>

          {debug && (
            <svg aria-hidden="true" viewBox={`0 0 ${PW} ${PH}`} className="pointer-events-none absolute inset-0 z-[2001] size-full">
              {WALK.map((a, i) => (
                <polygon key={i} points={a.map((q) => q.join(",")).join(" ")} fill="rgba(0,160,255,.15)" stroke="#0af" strokeWidth="3" />
              ))}
              {BLOCKS.map(([x0, y0, x1, y1], i) => (
                <rect key={i} x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="rgba(255,0,0,.35)" />
              ))}
              {pois.map((p) => (
                <circle key={p.id} cx={p.stand.x} cy={p.stand.y} r={NEAR} fill="rgba(255,200,0,.2)" stroke="#fc0" strokeWidth="3" />
              ))}
            </svg>
          )}

          {pois.map((p, i) => {
            const label = byId.get(p.id)?.label ?? LABELS[p.id];
            const ok = seen.has(p.id);
            const here = near === p.id;
            return (
              <button
                key={`${p.id}-${here}`}
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                data-sfx={here ? "open" : "tap"}
                onClick={() => (here ? enter(p.id) : walkTo(p))}
                className={`${here ? "bg-inv-accent text-inv-paper ring-4 ring-inv-paper/70" : ok ? "bg-inv-accent/85 text-inv-paper" : "bg-inv-card/90 text-inv-ink"} gd-pill absolute z-[2000] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border-[3px] border-inv-line px-3 py-1 font-display text-[12px] leading-none font-semibold shadow-[0_3px_0_rgba(0,0,0,.28)] [scale:var(--pz,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
                style={{ left: pct(p.obj.x, PW), top: pct(TAG_Y[p.id], PH), animationDelay: overview ? `${0.25 + i * 0.12}s` : undefined }}
              >
                {here ? `Buka ${label.toLowerCase()}` : ok ? `✓ ${label}` : label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Papan atas: sambutan, tombol peta penuh, dan daftar misi. */}
      <div className="pointer-events-none absolute inset-x-0 top-[max(12px,2.2dvh)] z-[999] flex flex-col items-center gap-2 px-3">
        <div className="pointer-events-auto relative flex w-full max-w-[420px] items-center gap-2 rounded-2xl border-[3px] border-inv-line bg-inv-card py-1.5 pr-1.5 pl-3.5 shadow-[0_4px_0_rgba(0,0,0,.22)]">
          <div className="min-w-0 flex-1 [&_p]:truncate">
            <span className="block text-[10px] leading-none font-semibold tracking-[.16em] text-inv-gold uppercase">Taman tepi pantai</span>
            <div className="mt-1 [&_p]:text-[clamp(13px,3.6vw,16px)] [&_p]:leading-tight">{welcome}</div>
          </div>
          {zoomable && (
            <button
              type="button"
              onClick={() => setMode((m) => (m === "overview" ? "follow" : "overview"))}
              aria-pressed={overview}
              disabled={panel !== null}
              className="flex shrink-0 items-center gap-1.5 rounded-xl border-[2.5px] border-inv-line bg-inv-paper px-2.5 py-2 font-display text-[13px] leading-none font-semibold shadow-[0_3px_0_rgba(0,0,0,.22)] active:translate-y-0.5 active:shadow-none"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14" />
              </svg>
              <span className="max-[359px]:sr-only">{overview ? "Kembali" : "Peta"}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setToc((t) => !t)}
            aria-expanded={toc}
            className="flex shrink-0 items-center gap-1.5 rounded-xl border-[2.5px] border-inv-line bg-inv-paper px-2.5 py-2 font-display text-[13px] leading-none font-semibold shadow-[0_3px_0_rgba(0,0,0,.22)] active:translate-y-0.5 active:shadow-none"
          >
            <span className="max-[359px]:sr-only">Misi</span>
            <span className="rounded-full bg-inv-accent px-1.5 py-0.5 text-[11px] text-inv-paper tabular-nums">
              {done}/{pois.length}
            </span>
          </button>
          {toc && (
            <nav aria-label="Daftar misi" className="gd-pill absolute top-full right-0 z-20 mt-2 w-[min(260px,calc(100vw-24px))] rounded-2xl border-[3px] border-inv-line bg-inv-card p-1.5 shadow-[0_6px_0_rgba(0,0,0,.25)]">
              <ul className="max-h-[min(60dvh,420px)] overflow-y-auto">
                {pois.map((p) => {
                  const ok = seen.has(p.id);
                  return (
                    <li key={p.id}>
                      <button type="button" onClick={() => walkTo(p)} className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[14px] font-semibold hover:bg-inv-wash focus-visible:bg-inv-wash">
                        <span aria-hidden="true" className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-inv-line text-[11px] ${ok ? "bg-inv-accent text-inv-paper" : "bg-inv-paper"}`}>
                          {ok ? "✓" : ""}
                        </span>
                        <span className="min-w-0 flex-1 truncate">{byId.get(p.id)?.label ?? LABELS[p.id]}</span>
                        <span className="sr-only">{ok ? "sudah dibuka" : "belum dibuka"}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}
        </div>
        {overview && seen.size === 0 && !toc && <p className="gd-pill rounded-full bg-inv-line/80 px-3 py-1 text-[11px] font-semibold text-inv-paper">Selamat datang! Ini taman pernikahannya</p>}
        {mode === "follow" && seen.size === 0 && !toc && !panel && (
          <p className="rounded-full bg-inv-line/75 px-3 py-1 text-[11px] font-semibold text-inv-paper">Jalan ke tiap pos, atau ketuk namanya</p>
        )}
      </div>

      <div className={`pointer-events-none absolute inset-x-0 bottom-[max(18px,3dvh)] z-[999] flex flex-col items-center gap-3 transition-opacity duration-300 [@media(max-height:520px)]:items-start [@media(max-height:520px)]:pl-5 ${mode === "follow" ? "opacity-100" : "opacity-0"}`}>
        {/* Tombol Buka untuk pos yang sedang didekati, di atas joystick supaya mudah dijangkau jempol. */}
        {near && !panel && mode === "follow" && (
          <button
            key={near}
            type="button"
            data-sfx="open"
            onClick={() => enter(near)}
            className="gd-pill pointer-events-auto rounded-full border-[3px] border-inv-line bg-inv-accent px-5 py-2.5 font-display text-[15px] leading-none font-semibold text-inv-paper shadow-[0_4px_0_rgba(0,0,0,.28)] active:translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Buka {(byId.get(near)?.label ?? LABELS[near]).toLowerCase()}
          </button>
        )}
        <div className={`${mode === "follow" ? "pointer-events-auto" : ""} opacity-80`}>
          <Joystick onMove={(x, y) => (joy.current = { x, y })} />
        </div>
      </div>

      <Modal open={Boolean(active)} onClose={closePanel} label={active?.title ?? "Isi undangan"}>
        {active && (
          <div className="px-5 pt-12 pb-7">
            <h2 className="mb-4 text-center font-display text-[clamp(22px,6vw,28px)] leading-tight font-semibold text-inv-accent">{active.title}</h2>
            {active.body}
            {active.id === "pembuka" && (
              <div className="mt-5 flex justify-center">
                <button type="button" onClick={closePanel} className="rounded-full border-[3px] border-inv-line bg-inv-accent px-5 py-2.5 font-display text-[15px] leading-none font-semibold text-inv-paper shadow-[0_4px_0_rgba(0,0,0,.28)] transition-transform active:translate-y-0.5">
                  Mulai jelajah
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {phase === "done" && (
        <div className="absolute inset-0 z-[1002] flex items-center justify-center bg-black/65 p-3 sm:p-6">
          <div role="dialog" aria-modal="true" aria-label="Tamat" className="gd-pill flex max-h-full w-[min(520px,100%)] flex-col overflow-hidden rounded-3xl border-[3px] border-inv-line bg-inv-paper shadow-[0_8px_0_rgba(0,0,0,.35)]">
            <div className="gd-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">{finale}</div>
            <button
              type="button"
              data-sfx="open"
              onClick={() => {
                setPhase("play");
                setSeen(new Set());
                finished.current = false;
                closeInvitation();
              }}
              className="m-3 shrink-0 rounded-full border-[3px] border-inv-line bg-inv-accent px-5 py-3 font-display text-[16px] leading-none font-semibold text-inv-paper shadow-[0_4px_0_rgba(0,0,0,.28)] active:translate-y-0.5"
            >
              Kembali ke awal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
