"use client";

import { useEffect, useRef, type PointerEvent } from "react";

// Joystick layar sentuh: seret knob dari tengah, arah dan kuatnya (0 sampai 1) dilaporkan ke onMove.
// Posisi knob ditulis langsung ke elemen supaya seretan tidak merender ulang komponen.
export function Joystick({ onMove, className = "" }: { onMove: (x: number, y: number) => void; className?: string }) {
  const base = useRef<HTMLDivElement>(null);
  const knob = useRef<HTMLSpanElement>(null);
  const active = useRef<number | null>(null);
  const report = useRef(onMove);
  useEffect(() => {
    report.current = onMove;
  });
  useEffect(() => () => report.current(0, 0), []);

  const steer = (e: PointerEvent) => {
    const el = base.current;
    const k = knob.current;
    if (!el || !k) return;
    const r = el.getBoundingClientRect();
    const reach = (r.width - k.offsetWidth) / 2;
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const d = Math.hypot(dx, dy);
    const scale = d > reach ? reach / d : 1;
    const x = (dx * scale) / reach;
    const y = (dy * scale) / reach;
    k.style.transform = `translate(${dx * scale}px, ${dy * scale}px)`;
    // Area mati kecil di tengah supaya tangan yang bergetar tidak menggeser karakter.
    report.current(Math.hypot(x, y) < 0.18 ? 0 : x, Math.hypot(x, y) < 0.18 ? 0 : y);
  };
  const end = (e: PointerEvent) => {
    if (active.current !== e.pointerId) return;
    active.current = null;
    if (knob.current) knob.current.style.transform = "";
    report.current(0, 0);
  };

  return (
    <div
      ref={base}
      aria-hidden="true"
      className={`relative size-[clamp(104px,28vw,128px)] touch-none rounded-full border-[3px] border-inv-line bg-inv-card/75 shadow-[0_5px_0_rgba(0,0,0,.25)] backdrop-blur-sm select-none ${className}`}
      onPointerDown={(e) => {
        active.current = e.pointerId;
        e.currentTarget.setPointerCapture(e.pointerId);
        steer(e);
      }}
      onPointerMove={(e) => active.current === e.pointerId && steer(e)}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] leading-none text-inv-ink/45">&#9650;</span>
      <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] leading-none text-inv-ink/45">&#9660;</span>
      <span className="absolute top-1/2 left-2 -translate-y-1/2 text-[10px] leading-none text-inv-ink/45">&#9664;</span>
      <span className="absolute top-1/2 right-2 -translate-y-1/2 text-[10px] leading-none text-inv-ink/45">&#9654;</span>
      <span ref={knob} className="absolute top-1/2 left-1/2 -mt-[22px] -ml-[22px] size-11 rounded-full border-[3px] border-inv-line bg-inv-accent shadow-[0_4px_0_rgba(0,0,0,.3)]" />
    </div>
  );
}
