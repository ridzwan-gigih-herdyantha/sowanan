"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { Modal } from "../modal";
import { CELL, HERO_H, KEYS, sprite, STEPS, STEP_FPS, type Pick } from "./door";
import { Booth, BOOTH, type BoothKind } from "./booth";
import { type BoothArt, FLOOR_OUTLINE, IN_H, IN_NEAR, IN_SPAWN, IN_W, interiorWorld, obstacles, placePois, type PoiId } from "./interior-world";
import { Joystick } from "./joystick";
import { SPEED, type Point } from "./world";

// label dan icon menimpa nama dan ikon kios bawaan pos, dipakai pos bagian tambahan yang isinya berubah-ubah.
// Kotak tampil kios di peta: gambar jadi memakai ukuran dan titik tapaknya sendiri, kios kode memakai BOOTH.
function boxOf(b: { c: Point; art?: BoothArt }): CSSProperties {
  const w = b.art ? b.art.w : BOOTH.w;
  const h = b.art ? b.art.h : BOOTH.h;
  const left = b.c.x - (b.art ? b.art.ax * w : BOOTH.cx);
  const top = b.c.y - (b.art ? b.art.ay * h : BOOTH.cy);
  return { left: `${(left / IN_W) * 100}%`, top: `${(top / IN_H) * 100}%`, width: `${(w / IN_W) * 100}%`, height: `${(h / IN_H) * 100}%` };
}

export type Panel = { id: PoiId; title: string; body: ReactNode; label?: string; icon?: BoothKind };

const RATIO = IN_W / IN_H;
const ZOOM = 1.2;
// Di dalam aula karakter digambar lebih kecil dari di halaman depan supaya sebanding dengan kios dan perabot.
const HERO = HERO_H * 0.8;
const FOLLOW = 4;
const MAP = "/img/rafi-kayla/inside-map.webp";

// Karakter yang dipilih di cover disimpan di sessionStorage oleh GedungDoor.
function savedHero(): Pick {
  try {
    return window.sessionStorage.getItem("gd-hero") === "bride" ? "bride" : "groom";
  } catch {
    return "groom";
  }
}

// Isi undangan berupa peta di dalam gedung: tamu berjalan ke pos-pos di sepanjang aula, dan di dekat pos muncul
// tombol untuk membuka isinya. Pos hanya ada bila panelnya ada.
export function InteriorMap({ panels, welcome }: { panels: Panel[]; welcome?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [hero, setHero] = useState<Pick>("groom");
  const [near, setNear] = useState<PoiId | null>(null);
  const [panel, setPanel] = useState<PoiId | null>(null);
  const [debug, setDebug] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const joyRef = useRef<HTMLDivElement>(null);
  const pos = useRef<Point>({ ...IN_SPAWN });
  const target = useRef<Point | null>(null);
  const keys = useRef(new Set<string>());
  const joy = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  const paused = useRef(false);

  const have = useMemo(() => new Set(panels.map((p) => p.id)), [panels]);
  const pois = useMemo(() => placePois(panels), [panels]);
  const world = useMemo(() => interiorWorld(pois), [pois]);
  const worldRef = useRef(world);
  const boothRefs = useRef(new Map<PoiId, HTMLDivElement>());
  useEffect(() => {
    worldRef.current = world;
  });
  const poisRef = useRef(pois);
  const hasIntro = useRef(false);
  const introShown = useRef(false);
  useEffect(() => {
    poisRef.current = pois;
    hasIntro.current = have.has("pembuka");
  });

  useEffect(() => {
    paused.current = panel !== null;
    if (panel) {
      joy.current = { x: 0, y: 0 };
      keys.current.clear();
      target.current = null;
    }
  }, [panel]);

  // Peta baru aktif setelah undangan dibuka, supaya tombol panah tidak menggerakkan dua karakter sekaligus.
  useEffect(() => {
    const shell = rootRef.current?.closest("[data-inv-state]");
    if (!shell) return;
    const sync = () => {
      const now = shell.getAttribute("data-inv-state") === "open";
      setOpen(now);
      if (now) setHero(savedHero());
      // Papan sambutan terbuka sekali, saat tamu pertama kali masuk aula.
      if (now && hasIntro.current && !introShown.current) {
        introShown.current = true;
        setPanel("pembuka");
      }
    };
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(shell, { attributes: true, attributeFilter: ["data-inv-state"] });
    setDebug(new URLSearchParams(window.location.search).has("gdebug"));
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const stage = stageRef.current;
    const heroEl = heroRef.current;
    const body = bodyRef.current;
    if (!stage || !heroEl || !body) return;
    const cam = { x: IN_SPAWN.x / IN_W, y: IN_SPAWN.y / IN_H };
    const held = keys.current;
    let facing = 0;
    let flip = false;
    let walked = 0;
    let last = performance.now();
    let raf = 0;
    let current: PoiId | null = null;

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const p = pos.current;
      let vx = 0;
      let vy = 0;
      if (!paused.current) {
        held.forEach((k) => {
          const [kx, ky] = KEYS[k];
          vx += kx;
          vy += ky;
        });
      }
      let power = 1;
      const jm = Math.hypot(joy.current.x, joy.current.y);
      if (paused.current || vx || vy) target.current = null;
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
      if (vx || vy) {
        const len = Math.hypot(vx, vy);
        const prev = { ...p };
        moving = worldRef.current.move(p, (vx / len) * SPEED * power * dt, (vy / len) * SPEED * power * dt);
        // Joystick menutupi layar, jadi karakter tidak boleh berjalan masuk ke belakangnya.
        const jr = joyRef.current?.getBoundingClientRect();
        if (moving && jr) {
          const sr = stage.getBoundingClientRect();
          const sx = sr.left + (p.x / IN_W) * sr.width;
          const sy = sr.top + (p.y / IN_H) * sr.height;
          const py = sr.top + (prev.y / IN_H) * sr.height;
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
      heroEl.style.left = `${(p.x / IN_W) * 100}%`;
      heroEl.style.top = `${(p.y / IN_H) * 100}%`;

      const k = Math.min(1, dt * FOLLOW);
      cam.x += (p.x / IN_W - cam.x) * k;
      cam.y += (p.y / IN_H - cam.y) * k;
      stage.style.setProperty("--gd-fx", cam.x.toFixed(4));
      stage.style.setProperty("--gd-fy", cam.y.toFixed(4));

      // Kios menutupi karakter yang lewat di belakangnya, dan tertutup karakter yang lewat di depannya.
      for (const poi of poisRef.current) {
        const el = poi.booth && boothRefs.current.get(poi.id);
        if (el && poi.booth) el.style.zIndex = p.y < poi.booth.c.y ? "3" : "1";
      }

      let best: PoiId | null = null;
      let bestD = IN_NEAR;
      for (const poi of poisRef.current) {
        const d = Math.hypot(p.x - poi.at.x, p.y - poi.at.y);
        if (d < bestD) {
          best = poi.id;
          bestD = d;
        }
      }
      if (best !== current) {
        current = best;
        setNear(best);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const down = (e: KeyboardEvent) => {
      if (paused.current || !(e.key in KEYS) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target instanceof HTMLElement && /^(input|textarea|select)$/i.test(e.target.tagName)) return;
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
  }, [open]);

  const aim = (e: PointerEvent) => {
    const stage = stageRef.current;
    if (!stage) return;
    const r = stage.getBoundingClientRect();
    target.current = worldRef.current.reachable(pos.current, { x: ((e.clientX - r.left) / r.width) * IN_W, y: ((e.clientY - r.top) / r.height) * IN_H });
  };
  const onDown = (e: PointerEvent) => {
    if (panel) return;
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    aim(e);
  };

  const stage = {
    "--gd-w": `calc(max(100vw, calc(100dvh * ${RATIO})) * ${ZOOM})`,
    "--gd-h": `calc(max(100dvh, calc(100vw / ${RATIO})) * ${ZOOM})`,
    "--gd-fx": IN_SPAWN.x / IN_W,
    "--gd-fy": IN_SPAWN.y / IN_H,
    width: "var(--gd-w)",
    height: "var(--gd-h)",
    left: "clamp(calc(100vw - var(--gd-w)), calc(50vw - var(--gd-w) * var(--gd-fx)), 0px)",
    top: "clamp(calc(100dvh - var(--gd-h)), calc(44dvh - var(--gd-h) * var(--gd-fy)), 0px)",
  } as CSSProperties;
  const heroW = `calc(var(--gd-w) * ${((HERO * CELL.w) / CELL.h / IN_W).toFixed(5)})`;
  const active = panels.find((p) => p.id === panel);

  return (
    <div ref={rootRef} className="fixed inset-0 z-40 overflow-hidden bg-inv-night text-inv-ink">
      <div ref={stageRef} className="absolute touch-none" style={stage} onPointerDown={onDown} onPointerMove={(e) => dragging.current && aim(e)} onPointerUp={() => (dragging.current = false)} onPointerCancel={() => (dragging.current = false)}>
        <Image src={MAP} alt="" fill sizes="(min-width: 900px) 100vw, 160vw" draggable={false} className="pointer-events-none object-cover select-none" />

        {debug && (
          <svg aria-hidden="true" viewBox={`0 0 ${IN_W} ${IN_H}`} className="pointer-events-none absolute inset-0 z-[5] size-full">
            <polygon points={FLOOR_OUTLINE.map((p) => p.join(",")).join(" ")} fill="rgba(0,160,255,.2)" stroke="#0af" strokeWidth="3" />
            {obstacles(pois).map((o, i) => (
              <polygon key={i} points={o.map((q) => q.join(",")).join(" ")} fill="rgba(255,0,0,.3)" stroke="#f33" strokeWidth="2" />
            ))}
            {pois.map((p) => (
              <circle key={p.id} cx={p.at.x} cy={p.at.y} r={IN_NEAR} fill="rgba(255,200,0,.2)" stroke="#fc0" strokeWidth="2" />
            ))}
          </svg>
        )}

        {pois.map((p) =>
          p.booth ? (
            <div
              key={p.id}
              ref={(el) => {
                if (el) boothRefs.current.set(p.id, el);
                else boothRefs.current.delete(p.id);
              }}
              className="pointer-events-none absolute z-[1]"
              style={boxOf(p.booth)}
            >
              {p.booth.art ? (
                <Image src={p.booth.art.src} alt="" fill sizes="25vw" draggable={false} className="object-contain select-none" />
              ) : (
                <Booth kind={p.booth.kind} tone={p.booth.tone} className="size-full" />
              )}
            </div>
          ) : null,
        )}

        <div
          ref={heroRef}
          className="pointer-events-none absolute z-[2] -translate-x-1/2 -translate-y-full"
          style={{ left: `${(IN_SPAWN.x / IN_W) * 100}%`, top: `${(IN_SPAWN.y / IN_H) * 100}%`, width: heroW, height: `calc(var(--gd-w) * ${(HERO / IN_W).toFixed(5)})` }}
        >
          <span aria-hidden="true" className="absolute inset-x-[18%] -bottom-[3%] h-[8%] rounded-full bg-black/25 blur-[1px]" />
          <div ref={bodyRef} className="relative size-full bg-no-repeat" style={sprite(hero)} role="img" aria-label="Karakter kamu" />
        </div>

        {pois.map((p) => {
          const here = near === p.id;
          // Label di atas kios, atau di atas titik berdiri untuk pos tanpa kios.
          const tag = p.booth ? { x: p.booth.c.x, y: p.booth.c.y - (p.booth.art ? p.booth.art.h * p.booth.art.ay + 6 : BOOTH.cy - 6) } : { x: p.at.x, y: p.at.y - 70 };
          return (
            <button
              key={p.id}
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => (here ? setPanel(p.id) : (target.current = worldRef.current.reachable(pos.current, p.at)))}
              className={`${here ? "gd-pill bg-inv-accent text-inv-paper" : "bg-inv-card/90 text-inv-ink"} absolute z-[4] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border-[3px] border-inv-line px-3.5 py-1.5 font-display text-[clamp(11px,3vw,15px)] leading-none font-semibold shadow-[0_4px_0_rgba(0,0,0,.28)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
              style={{ left: `${(tag.x / IN_W) * 100}%`, top: `${(tag.y / IN_H) * 100}%` }}
            >
              {here ? `Buka ${p.label.toLowerCase()}` : p.label}
            </button>
          );
        })}
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-[max(14px,2.4dvh)] z-10 flex flex-col items-center gap-2.5 px-4">
        <span className="rounded-full border-[3px] border-inv-line bg-inv-card px-4 py-1.5 font-display text-[clamp(11px,3vw,14px)] tracking-[.14em] uppercase shadow-[0_4px_0_rgba(0,0,0,.2)]">Di dalam gedung</span>
        <div className="max-w-[360px] rounded-2xl border-[3px] border-inv-line bg-inv-card px-4 py-2 text-center shadow-[0_5px_0_rgba(0,0,0,.25)]">
          {welcome}
          <p className="text-[11px] text-inv-gold">Jalan ke tiap pos, atau ketuk namanya.</p>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-[max(18px,3dvh)] z-10 flex justify-center">
        <div ref={joyRef} className="pointer-events-auto opacity-80">
          <Joystick onMove={(x, y) => (joy.current = { x, y })} />
        </div>
      </div>

      <Modal open={Boolean(active)} onClose={() => setPanel(null)} label={active?.title ?? "Isi undangan"}>
        {active && (
          <div className="px-5 pt-12 pb-7">
            <h2 className="mb-4 text-center font-display text-[clamp(22px,6vw,28px)] leading-tight font-semibold text-inv-accent">{active.title}</h2>
            {active.body}
            {active.id === "pembuka" && (
              <div className="mt-5 flex justify-center">
                <button type="button" onClick={() => setPanel(null)} className="rounded-full border-[3px] border-inv-line bg-inv-accent px-5 py-2.5 font-display text-[15px] leading-none font-semibold text-inv-paper shadow-[0_4px_0_rgba(0,0,0,.28)] transition-transform active:translate-y-0.5">
                  Jelajahi aula
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
