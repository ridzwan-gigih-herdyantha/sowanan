"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { BridgeMessage, EditorMessage } from "@/app/admin/pratinjau/[slug]/bridge";
import { cleanFrame, FRAME_LABELS, ZOOM_MAX, type Frame, type FrameDevice, type FrameSlot } from "@/lib/invitation/frame";

const DEVICES = {
  hp: { w: 390, h: 844, label: "HP" },
  desktop: { w: 1280, h: 800, label: "Tablet dan desktop" },
} as const;

type Value = Partial<Record<FrameDevice, Frame>>;

// Pratinjau undangan seukuran layar perangkat, diperkecil supaya muat di dialog.
function Screen({ slug, device, hidden, onFrame }: { slug: string; device: FrameDevice; hidden: boolean; onFrame: (el: HTMLIFrameElement | null) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const { w, h, label } = DEVICES[device];

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setScale(Math.min(el.clientWidth / w, el.clientHeight / h));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [w, h]);

  return (
    <div ref={box} className={`absolute inset-0 flex items-center justify-center ${hidden ? "invisible" : ""}`}>
      <div className="overflow-hidden rounded-sm border border-line bg-white shadow-[0_8px_30px_rgba(0,0,0,.12)]" style={{ width: w * scale, height: h * scale }}>
        <iframe
          ref={onFrame}
          src={`/admin/pratinjau/${slug}?atur`}
          title={`Pratinjau di ${label}`}
          className="origin-top-left border-0"
          style={{ width: w, height: h, transform: `scale(${scale})` }}
        />
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step = 1, unit, onChange }: { label: string; value: number; min: number; max: number; step?: number; unit: string; onChange: (v: number) => void }) {
  return (
    <label className="block text-[13px] font-medium">
      <span className="flex justify-between">
        {label}
        <span className="font-normal text-ink-mute tabular-nums">
          {Math.round(value)}
          {unit}
        </span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 block w-full accent-wine" />
    </label>
  );
}

// Dialog atur posisi dan zoom satu foto, terpisah untuk HP dan layar lebar. Setiap perubahan langsung diterapkan ke
// pratinjau lewat pesan, lalu ikut tersimpan ke draf seperti isian lain.
export function FrameDialog({ slug, slot, value, onChange, onClose }: { slug: string; slot: FrameSlot; value: Value; onChange: (device: FrameDevice, frame: Frame | null) => void; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const frames = useRef<Partial<Record<FrameDevice, HTMLIFrameElement | null>>>({});
  const [device, setDevice] = useState<FrameDevice>("hp");
  const [seen, setSeen] = useState<Set<FrameDevice>>(() => new Set(["hp"]));
  const [base, setBase] = useState<Partial<Record<FrameDevice, Frame>>>({});
  const latest = useRef(value);

  useEffect(() => {
    latest.current = value;
  }, [value]);

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  const send = (dev: FrameDevice, m: EditorMessage) => frames.current[dev]?.contentWindow?.postMessage(m, window.location.origin);

  // Begitu pratinjau siap, pengaturan yang ada diterapkan dan foto slot ini ditampilkan di layar.
  useEffect(() => {
    const send = (dev: FrameDevice, m: EditorMessage) => frames.current[dev]?.contentWindow?.postMessage(m, window.location.origin);
    const onMessage = (e: MessageEvent<BridgeMessage>) => {
      if (e.origin !== window.location.origin) return;
      const dev = (Object.keys(frames.current) as FrameDevice[]).find((d) => frames.current[d]?.contentWindow === e.source);
      if (!dev) return;
      if (e.data.type === "sowanan:ready") {
        send(dev, { type: "sowanan:frame", slot, device: dev, frame: latest.current[dev] ?? null });
        send(dev, { type: "sowanan:frame-show", slot, device: dev });
        // Pratinjau layar lebar dimuat setelah pratinjau HP siap, supaya keduanya tidak berebut jaringan.
        if (dev === "hp") setSeen((s) => new Set(s).add("desktop"));
      } else if (e.data.type === "sowanan:frame-base" && e.data.slot === slot && e.data.device === dev) {
        const { x, y } = e.data;
        setBase((b) => ({ ...b, [dev]: cleanFrame({ x, y, z: 1 }) }));
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [slot]);

  const current = value[device] ?? base[device] ?? { x: 50, y: 50, z: 1 };
  const set = (patch: Partial<Frame>) => {
    const next = cleanFrame({ ...current, ...patch });
    onChange(device, next);
    send(device, { type: "sowanan:frame", slot, device, frame: next });
  };
  const reset = () => {
    onChange(device, null);
    send(device, { type: "sowanan:frame", slot, device, frame: null });
  };
  const pick = (d: FrameDevice) => {
    setDevice(d);
    setSeen((s) => new Set(s).add(d));
  };
  const other: FrameDevice = device === "hp" ? "desktop" : "hp";
  const copy = () => {
    const from = value[other];
    if (!from) return;
    onChange(device, from);
    send(device, { type: "sowanan:frame", slot, device, frame: from });
  };

  return createPortal(
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-labelledby="atur-foto"
      className="m-auto h-[min(860px,calc(100dvh-24px))] w-[min(1180px,calc(100vw-24px))] max-w-none rounded-sm border border-line bg-ivory p-0 text-ink shadow-[0_20px_60px_rgba(0,0,0,.25)] backdrop:bg-ink/50"
    >
      <div className="flex h-full flex-col lg:flex-row">
        <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-4">
          <div className="flex gap-1 rounded-sm bg-blush/60 p-1 text-[13px]" role="tablist">
            {(Object.keys(DEVICES) as FrameDevice[]).map((d) => (
              <button
                key={d}
                type="button"
                role="tab"
                aria-selected={device === d}
                onClick={() => pick(d)}
                className={`flex-1 rounded-sm px-3 py-1.5 ${device === d ? "bg-white font-medium shadow-sm" : "text-ink-soft"}`}
              >
                {DEVICES[d].label}
                {value[d] && <span className="ml-1.5 text-wine">diatur</span>}
              </button>
            ))}
          </div>
          <div className="relative mt-3 min-h-[280px] flex-1">
            {[...seen].map((d) => (
              <Screen key={d} slug={slug} device={d} hidden={d !== device} onFrame={(el) => void (frames.current[d] = el)} />
            ))}
          </div>
        </div>

        <div className="shrink-0 border-t border-line bg-white p-4 sm:p-5 lg:w-80 lg:border-t-0 lg:border-l">
          <h2 id="atur-foto" className="font-serif text-xl">
            Atur {FRAME_LABELS[slot]}
          </h2>
          <p className="mt-1 text-[13px] text-ink-mute">
            Pengaturan {DEVICES[device].label.toLowerCase()} hanya berlaku di layar {device === "hp" ? "di bawah 760px" : "760px ke atas"}. Pratinjau langsung berubah dan tersimpan di draf.
          </p>
          <div className="mt-5 grid gap-5">
            <Slider label="Zoom" value={current.z * 100} min={100} max={ZOOM_MAX * 100} step={5} unit="%" onChange={(v) => set({ z: v / 100 })} />
            <Slider label="Geser kiri ke kanan" value={current.x} min={0} max={100} unit="%" onChange={(x) => set({ x })} />
            <Slider label="Geser atas ke bawah" value={current.y} min={0} max={100} unit="%" onChange={(y) => set({ y })} />
          </div>
          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-[13px]">
            <button type="button" onClick={reset} disabled={!value[device]} className="text-wine underline underline-offset-4 disabled:text-ink-mute disabled:no-underline">
              Kembalikan bawaan tema
            </button>
            {value[other] && (
              <button type="button" onClick={copy} className="text-wine underline underline-offset-4">
                Salin dari {DEVICES[other].label.toLowerCase()}
              </button>
            )}
          </div>
          <button type="button" onClick={() => dialog.current?.close()} className="mt-6 w-full rounded-sm bg-ink px-4 py-2.5 text-[14px] text-white">
            Selesai
          </button>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
