"use client";

import { useSyncExternalStore } from "react";

const MINUTE = 60_000;

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 15_000);
  return () => clearInterval(id);
}
const getMinute = () => Math.floor(Date.now() / MINUTE);
const getServerMinute = () => null;

const pad = (n: number) => String(Math.max(0, n)).padStart(2, "0");

export function Countdown({ target, className, cellClassName }: { target: string; className?: string; cellClassName?: string }) {
  const minute = useSyncExternalStore(subscribe, getMinute, getServerMinute);

  let days = 0, hours = 0, minutes = 0;
  if (minute !== null) {
    const left = Math.max(0, Math.floor((new Date(target).getTime() - minute * MINUTE) / MINUTE));
    days = Math.floor(left / 1440);
    hours = Math.floor((left % 1440) / 60);
    minutes = left % 60;
  }

  const cells = [
    [days, "HARI"],
    [hours, "JAM"],
    [minutes, "MENIT"],
  ] as const;

  return (
    <div className={className} role="timer" aria-label={`${days} hari ${hours} jam ${minutes} menit lagi`}>
      {cells.map(([value, label]) => (
        <div key={label} className={cellClassName}>
          <span className="tabular-nums">{pad(value)}</span>
          <span className="block text-[9px] tracking-[1px] text-ink-mute">{label}</span>
        </div>
      ))}
    </div>
  );
}
