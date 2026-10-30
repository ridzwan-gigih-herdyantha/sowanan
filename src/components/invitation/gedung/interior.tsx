"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { Modal } from "../modal";
import { useCloseInvitation } from "../shell";
import { CELL, HERO_H, KEYS, sprite, STEPS, STEP_FPS, type Pick } from "./door";
import { Booth, BOOTH, type BoothKind } from "./booth";
import { type BoothArt, COUPLE, FLOOR_OUTLINE, IN_H, IN_NEAR, IN_SPAWN, IN_W, interiorWorld, obstacles, placePois, poiDistance, type PoiId, STAGE } from "./interior-world";
import { NPC_CELL, NPC_SHEETS, NPCS, npcStart, stepNpc, type NpcState } from "./interior-npcs";
import { Joystick } from "./joystick";
import { useButtonSfx } from "./sfx";
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

// Siapa yang sedang bicara pada giliran ke-tick: tiap kelompok obrolan bergiliran antaranggota, dan kalimatnya
// maju setiap putaran. Tamu yang sendirian hanya bergumam sesekali.
function talk(tick: number) {
  const groups = new Map<string, typeof NPCS>();
  for (const n of NPCS) if (n.chat && n.lines) groups.set(n.chat, [...(groups.get(n.chat) ?? []), n]);
  return [...groups.values()].flatMap((g) => {
    if (g.length === 1 && tick % 2) return [];
    const n = g[tick % g.length];
    const round = Math.floor(tick / (g.length === 1 ? 2 : g.length));
    return [{ n, line: n.lines![round % n.lines!.length] }];
  });
}
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
// finale tampil di layar penutup setelah tamu keluar gedung: ucapan terima kasih dan nama mempelai.
export function InteriorMap({ panels, welcome, finale }: { panels: Panel[]; welcome?: ReactNode; finale?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [hero, setHero] = useState<Pick>("groom");
  const [near, setNear] = useState<PoiId | null>(null);
  const [panel, setPanel] = useState<PoiId | null>(null);
  // Pos yang isinya sudah dibuka, untuk centang di daftar isi dan layar selesai.
  const [seen, setSeen] = useState<ReadonlySet<PoiId>>(() => new Set());
  const [toc, setToc] = useState(false);
  // play saat menjelajah, done saat semua pos sudah dibuka dan penutup "Tamat" tampil.
  const [phase, setPhase] = useState<"play" | "done">("play");
  const closeInvitation = useCloseInvitation();
  const finished = useRef(false);
  const [debug, setDebug] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  useButtonSfx(rootRef);
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
  const npcRefs = useRef(new Map<string, HTMLDivElement>());
  const [chatTick, setChatTick] = useState(0);
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
    paused.current = panel !== null || phase !== "play";
    if (panel || phase !== "play") {
      joy.current = { x: 0, y: 0 };
      keys.current.clear();
      target.current = null;
    }
  }, [panel, phase]);

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

  // Gelembung obrolan tamu lain bergantian setiap beberapa detik.
  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => setChatTick((t) => t + 1), 2800);
    return () => window.clearInterval(id);
  }, [open]);

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
    const crowd: NpcState[] = NPCS.map(npcStart);

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
      heroEl.style.zIndex = String(Math.round(p.y));

      // Tamu lain yang berjalan: posisi, arah hadap, dan langkah kakinya.
      NPCS.forEach((n, i) => {
        const s = crowd[i];
        const el = npcRefs.current.get(n.id);
        const dir = stepNpc(n, s, dt);
        if (!el || n.path.length < 2) return;
        s.walked = dir ? s.walked + dt : 0;
        const face = dir ? (Math.abs(dir.y) > Math.abs(dir.x) ? (dir.y < 0 ? 2 : 0) : 1) : 0;
        const npcCol = dir ? STEPS[Math.floor(s.walked * STEP_FPS) % STEPS.length] : 0;
        const npcBody = el.lastElementChild as HTMLElement;
        npcBody.style.backgroundPosition = `${npcCol * 50}% ${face * 50}%`;
        npcBody.style.transform = face === 1 && dir && dir.x < 0 ? "scaleX(-1)" : "";
        el.style.left = `${(s.p.x / IN_W) * 100}%`;
        el.style.top = `${(s.p.y / IN_H) * 100}%`;
        el.style.zIndex = String(Math.round(s.p.y));
      });

      const k = Math.min(1, dt * FOLLOW);
      cam.x += (p.x / IN_W - cam.x) * k;
      cam.y += (p.y / IN_H - cam.y) * k;
      stage.style.setProperty("--gd-fx", cam.x.toFixed(4));
      stage.style.setProperty("--gd-fy", cam.y.toFixed(4));

      let best: PoiId | null = null;
      let bestD = IN_NEAR;
      for (const poi of poisRef.current) {
        const d = poiDistance(poi, p);
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
  const heroH = `calc(var(--gd-w) * ${(HERO / IN_W).toFixed(5)})`;
  const npcW = `calc(var(--gd-w) * ${((HERO * NPC_CELL.w) / NPC_CELL.h / IN_W).toFixed(5)})`;
  const active = panels.find((p) => p.id === panel);
  const done = pois.filter((p) => seen.has(p.id)).length;

  const openPanel = (id: PoiId) => {
    setPanel(id);
    setToc(false);
    if (id !== "pembuka") setSeen((s) => (s.has(id) ? s : new Set(s).add(id)));
  };
  // Panel terakhir ditutup dan semua pos sudah dibuka: layar selesai muncul sekali.
  const closePanel = () => {
    setPanel(null);
    if (!finished.current && pois.length > 0 && pois.every((p) => seen.has(p.id))) {
      finished.current = true;
      window.setTimeout(() => setPhase("done"), 350);
    }
  };
  // Dari daftar isi: karakter dipindah langsung ke depan pos, kamera menyusul.
  const warp = (at: Point) => {
    pos.current = { ...at };
    target.current = null;
    setToc(false);
  };

  return (
    <div ref={rootRef} className="gd-interior fixed inset-0 z-40 overflow-hidden bg-inv-night text-inv-ink">
      <div ref={stageRef} className="absolute isolate touch-none" style={stage} onPointerDown={onDown} onPointerMove={(e) => dragging.current && aim(e)} onPointerUp={() => (dragging.current = false)} onPointerCancel={() => (dragging.current = false)}>
        <Image src={MAP} alt="" fill sizes="(min-width: 900px) 100vw, 160vw" draggable={false} className="pointer-events-none object-cover select-none" />

        {debug && (
          <svg aria-hidden="true" viewBox={`0 0 ${IN_W} ${IN_H}`} className="pointer-events-none absolute inset-0 z-[2001] size-full">
            {[FLOOR_OUTLINE, STAGE].map((a, i) => (
              <polygon key={i} points={a.map((p) => p.join(",")).join(" ")} fill="rgba(0,160,255,.2)" stroke="#0af" strokeWidth="3" />
            ))}
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
            // Urutan tumpuk mengikuti titik tapak: yang lebih bawah di layar tergambar di depan.
            <div key={p.id} className="pointer-events-none absolute" style={{ ...boxOf(p.booth), zIndex: Math.round(p.booth.c.y) }}>
              {p.booth.art ? (
                <Image src={p.booth.art.src} alt="" fill sizes="25vw" draggable={false} className="object-contain select-none" />
              ) : (
                <Booth kind={p.booth.kind} tone={p.booth.tone} className="size-full" />
              )}
            </div>
          ) : null,
        )}

        <div
          className="pointer-events-none absolute"
          style={{ left: `${((COUPLE.x - COUPLE.w / 2) / IN_W) * 100}%`, top: `${((COUPLE.y - COUPLE.h) / IN_H) * 100}%`, width: `${(COUPLE.w / IN_W) * 100}%`, height: `${(COUPLE.h / IN_H) * 100}%`, zIndex: COUPLE.y }}
        >
          <Image src={COUPLE.src} alt="Pengantin di pelaminan" fill sizes="15vw" draggable={false} className="object-contain select-none" />
        </div>

        <div
          ref={heroRef}
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full"
          style={{ left: `${(IN_SPAWN.x / IN_W) * 100}%`, top: `${(IN_SPAWN.y / IN_H) * 100}%`, width: heroW, height: heroH, zIndex: IN_SPAWN.y }}
        >
          <span aria-hidden="true" className="absolute inset-x-[18%] -bottom-[3%] h-[8%] rounded-full bg-black/25 blur-[1px]" />
          <div ref={bodyRef} className="relative size-full bg-no-repeat" style={sprite(hero)} role="img" aria-label="Karakter kamu" />
        </div>

        {NPCS.map((n) => {
          const at = n.path[0];
          return (
            <div
              key={n.id}
              ref={(el) => {
                if (el) npcRefs.current.set(n.id, el);
                else npcRefs.current.delete(n.id);
              }}
              aria-hidden="true"
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-full"
              style={{ left: `${(at.x / IN_W) * 100}%`, top: `${(at.y / IN_H) * 100}%`, width: npcW, height: heroH, zIndex: at.y }}
            >
              <span className="absolute inset-x-[18%] -bottom-[3%] h-[8%] rounded-full bg-black/25 blur-[1px]" />
              <div className="relative size-full bg-no-repeat" style={{ backgroundImage: `url(${NPC_SHEETS[n.sheet]})`, backgroundSize: "300% 300%", backgroundPosition: `0% ${(n.face ?? 0) * 50}%`, filter: n.tint, transform: n.flip ? "scaleX(-1)" : undefined }} />
            </div>
          );
        })}

        {talk(chatTick).map(({ n, line }) => (
          <span
            key={`${n.id}-${chatTick}`}
            aria-hidden="true"
            className="gd-pill pointer-events-none absolute z-[1500] -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-xl border-2 border-inv-line bg-inv-card px-2.5 py-1 font-display text-[clamp(9px,2.4vw,12px)] leading-none font-semibold shadow-[0_3px_0_rgba(0,0,0,.2)]"
            style={{ left: `${(n.path[0].x / IN_W) * 100}%`, top: `${((n.path[0].y - HERO - 4) / IN_H) * 100}%` }}
          >
            {line}
          </span>
        ))}

        {pois.map((p) => {
          const here = near === p.id;
          // Label di atas kios, atau di atas titik berdiri untuk pos tanpa kios.
          // Label pelaminan di atas kepala pengantin.
          const tag = p.booth
            ? { x: p.booth.c.x, y: p.booth.c.y - (p.booth.art ? p.booth.art.h * p.booth.art.ay + 6 : BOOTH.cy - 6) }
            : p.id === "pelaminan"
              ? { x: COUPLE.x, y: COUPLE.y - COUPLE.h - 6 }
              : { x: p.at.x, y: p.at.y - 70 };
          return (
            <button
              key={p.id}
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              data-sfx={here ? "open" : "tap"}
              onClick={() => (here ? openPanel(p.id) : (target.current = worldRef.current.reachable(pos.current, p.at)))}
              className={`${here ? "gd-pill bg-inv-accent text-inv-paper" : "bg-inv-card/90 text-inv-ink"} absolute z-[2000] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border-[3px] border-inv-line px-3.5 py-1.5 font-display text-[clamp(11px,3vw,15px)] leading-none font-semibold shadow-[0_4px_0_rgba(0,0,0,.28)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
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

      {/* Daftar isi: semua pos dengan centang yang sudah dibuka. Mengetuk pos memindahkan karakter ke sana. */}
      <div className="absolute top-[max(14px,2.4dvh)] left-3 z-20 sm:left-5">
        <button
          type="button"
          onClick={() => setToc((t) => !t)}
          aria-expanded={toc}
          className="flex items-center gap-2 rounded-full border-[3px] border-inv-line bg-inv-card px-3.5 py-1.5 font-display text-[clamp(12px,3.2vw,14px)] leading-none font-semibold shadow-[0_4px_0_rgba(0,0,0,.25)] active:translate-y-0.5"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Daftar isi
          <span className="rounded-full bg-inv-accent px-1.5 py-0.5 text-[11px] text-inv-paper tabular-nums">
            {done}/{pois.length}
          </span>
        </button>
        {toc && (
          <nav aria-label="Daftar isi" className="gd-pill mt-2 w-[min(260px,calc(100vw-24px))] rounded-2xl border-[3px] border-inv-line bg-inv-card p-1.5 shadow-[0_6px_0_rgba(0,0,0,.25)]">
            <ul className="max-h-[min(60dvh,420px)] overflow-y-auto">
              {pois.map((p) => {
                const ok = seen.has(p.id);
                return (
                  <li key={p.id}>
                    <button type="button" onClick={() => warp(p.at)} className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[14px] font-semibold hover:bg-inv-wash focus-visible:bg-inv-wash">
                      <span aria-hidden="true" className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-inv-line text-[11px] ${ok ? "bg-inv-accent text-inv-paper" : "bg-inv-paper"}`}>
                        {ok ? "✓" : ""}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{p.label}</span>
                      <span className="sr-only">{ok ? "sudah dibuka" : "belum dibuka"}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-[max(18px,3dvh)] z-10 flex justify-center">
        <div ref={joyRef} className="pointer-events-auto opacity-80">
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
                  Jelajahi aula
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Semua pos sudah dibuka: penutup "Tamat" berisi kredit dari tema, dan satu jalan keluar kembali ke sampul.
          Isi aula diatur ulang supaya kunjungan berikutnya mulai dari awal. */}
      {phase === "done" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/65 p-3 sm:p-6">
          <div role="dialog" aria-modal="true" aria-label="Tamat" className="gd-pill flex max-h-full w-[min(520px,100%)] flex-col overflow-hidden rounded-3xl border-[3px] border-inv-line bg-inv-paper shadow-[0_8px_0_rgba(0,0,0,.35)]">
            <div className="gd-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">{finale}</div>
            <button
              type="button"
              data-sfx="open"
              onClick={() => {
                setPhase("play");
                setSeen(new Set());
                finished.current = false;
                pos.current = { ...IN_SPAWN };
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
