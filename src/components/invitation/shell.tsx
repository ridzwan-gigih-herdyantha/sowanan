"use client";

import Image from "next/image";
import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";

const GUEST_KEY = "sowanan:guest";

type GuestCtx = { guest: string; setGuest: (name: string) => void };
const GuestContext = createContext<GuestCtx>({ guest: "", setGuest: () => {} });
export const useGuest = () => useContext(GuestContext);

const noop = () => () => {};
function readGuestParam() {
  const to = new URLSearchParams(window.location.search).get("to");
  return to ? to.trim().slice(0, 40) : "";
}

function readStoredGuest() {
  try {
    return localStorage.getItem(GUEST_KEY) ?? "";
  } catch {
    return "";
  }
}

function storeGuest(name: string) {
  try {
    localStorage.setItem(GUEST_KEY, name);
  } catch {}
}

type Door =
  | { kind: "seal"; couple: string; monogram: string; seal: string }
  | { kind: "walls"; groom: string; bride: string; date: string }
  | { kind: "vellum"; groom: string; bride: string; number: string; date: string; place: string; specimen: string };

type Props = {
  door: Door;
  music: string;
  className: string;
  style: CSSProperties;
  children: ReactNode;
};

function GuestField({ invited, greeting, className = "" }: { invited: string; greeting: string; className?: string }) {
  if (!invited) return null;
  return (
    <div className={className}>
      <p className="text-[13px] text-inv-ink/70">{greeting}</p>
      <p className="mt-1 font-display text-3xl italic">{invited}</p>
    </div>
  );
}

const arrow = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M4 12h16M14 6l6 6-6 6" />
  </svg>
);

export function InvitationShell({ door, music, className, style, children }: Props) {
  const invited = useSyncExternalStore(noop, readGuestParam, () => "");
  const [typed, setTyped] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.style.overflow = open ? "" : "hidden";
    return () => {
      root.style.overflow = "";
    };
  }, [open]);

  const guest = invited || typed || "";
  const setGuest = (name: string) => {
    setTyped(name);
    storeGuest(name);
  };

  const play = () => {
    audio.current
      ?.play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  };

  const openInvitation = () => {
    const name = guest || readStoredGuest();
    if (name) setGuest(name);
    window.scrollTo(0, 0);
    setOpen(true);
    play();
  };

  const toggleMusic = () => {
    if (playing) {
      audio.current?.pause();
      setPlaying(false);
    } else play();
  };

  return (
    <GuestContext.Provider value={{ guest, setGuest }}>
      <div data-inv-state={open ? "open" : "closed"} className={className} style={style}>
        <noscript>
          <style>{`.inv-door,.inv-door-walls,.inv-door-vellum{display:none}.inv-enter{opacity:1;transform:none}html{overflow:auto!important}`}</style>
        </noscript>

        {door.kind === "vellum" && (
          <div
            className="inv-door-vellum fixed inset-0 z-50 flex flex-col justify-end px-6 pb-[8vh] backdrop-blur-md [background:color-mix(in_srgb,var(--inv-wash)_82%,transparent)] sm:px-10"
            aria-hidden={open}
          >
            <p className="text-[11px] font-medium tracking-[0.2em] text-inv-gold">LEMBAR KOLEKSI {door.number}</p>
            <p className="mt-4 font-display text-[clamp(52px,15vw,112px)] leading-[0.95] text-inv-accent">
              {door.groom}
              <br />
              <span className="italic">&amp;</span> {door.bride}
            </p>
            <div className="relative mt-8 w-full max-w-md -rotate-1 border border-inv-line bg-inv-wash shadow-[0_10px_28px_rgba(0,0,0,.08)]">
              <span className="inv-tape -top-2.5 left-10 -rotate-3" aria-hidden="true" />
              <div className="flex items-center justify-between border-b border-inv-line px-5 py-2.5 text-[10px] font-medium tracking-[0.2em] text-inv-gold">
                <span>HERBARIUM SOWANAN</span>
                <span>{door.number}</span>
              </div>
              <div className="flex items-end gap-4 px-5 pt-4 pb-5">
                <div className="relative h-20 w-16 shrink-0 rotate-3 border border-inv-line bg-inv-paper p-1">
                  <Image src={door.specimen} alt="" width={64} height={80} className="size-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] font-medium tracking-[0.2em] text-inv-gold">DIKUMPULKAN UNTUK</span>
                  <span className="mt-1 block truncate border-b border-dashed border-inv-line pb-1 font-display text-[28px] leading-tight text-inv-accent italic">
                    {invited || "Tamu kami"}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 border-t border-inv-line text-[13px]">
                <div className="border-r border-inv-line px-5 py-2.5">
                  <span className="block text-[10px] font-medium tracking-[0.2em] text-inv-gold">TANGGAL</span>
                  {door.date}
                </div>
                <div className="px-5 py-2.5">
                  <span className="block text-[10px] font-medium tracking-[0.2em] text-inv-gold">LOKASI</span>
                  {door.place}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={openInvitation}
              className="inv-cta mt-8 flex w-full max-w-md items-center justify-between rounded-sm bg-inv-accent px-7 py-5 text-[13px] font-medium tracking-[0.2em] text-inv-wash shadow-[0_10px_28px_rgba(0,0,0,.18)] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
            >
              BUKA LEMBARNYA
              {arrow}
            </button>
          </div>
        )}

        {door.kind === "vellum" ? null : door.kind === "seal" ? (
          <div
            className="inv-door inv-paper fixed inset-0 z-50 flex flex-col items-center justify-center px-8 text-center"
            aria-hidden={open}
          >
            <p className="text-[11px] tracking-[0.22em] text-inv-ink/70">PERNIKAHAN</p>
            <p className="mt-3 mb-10 font-display text-[44px] leading-none text-inv-accent">{door.couple}</p>
            <GuestField invited={invited} greeting="Kepada Yth." className="mb-2" />
            <button
              type="button"
              onClick={openInvitation}
              className="inv-seal inv-pulse group relative mt-8 size-44 rounded-full"
              aria-label="Buka undangan"
            >
              <Image src={door.seal} alt="" width={176} height={176} preload className="size-44 transition-transform duration-200 group-hover:scale-105" />
              <span className="absolute inset-0 flex items-center justify-center font-display text-3xl text-[#f3d6ae] [text-shadow:0_1px_0_rgba(0,0,0,.35)]">
                {door.monogram}
              </span>
            </button>
            <button
              type="button"
              onClick={openInvitation}
              className="mt-8 inline-flex items-center gap-3 rounded-sm bg-inv-accent px-9 py-4 text-[13px] font-medium tracking-[0.2em] text-inv-paper shadow-[0_10px_28px_rgba(0,0,0,.18)] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
            >
              BUKA UNDANGAN
              {arrow}
            </button>
          </div>
        ) : (
          <div className="inv-door-walls fixed inset-0 z-50" aria-hidden={open}>
            <div className="inv-wall-l inv-paper absolute inset-y-0 left-0 w-1/2 border-r border-inv-line">
              <p className="absolute top-[14%] left-5 font-display text-[clamp(52px,15vw,120px)] leading-none sm:left-10">{door.groom}</p>
            </div>
            <div className="inv-wall-r inv-paper absolute inset-y-0 right-0 w-1/2">
              <p className="absolute top-[26%] right-5 font-display text-[clamp(52px,15vw,120px)] leading-none italic sm:right-10">
                {door.bride}
              </p>
            </div>
            <div className="inv-door-ui inv-paper absolute inset-x-0 bottom-[8%] flex flex-col items-center border-y border-inv-line px-8 py-10 text-center">
              <p className="mb-6 text-[11px] font-medium tracking-[0.24em] text-inv-ink/70">KAMI MENGUNDANGMU</p>
              <GuestField invited={invited} greeting="Untuk" className="mb-2" />
              <button
                type="button"
                onClick={openInvitation}
                className="inv-cta mt-6 inline-flex w-full max-w-xs items-center justify-between rounded-sm bg-inv-ink px-7 py-5 text-[13px] font-medium tracking-[0.24em] text-inv-paper shadow-[0_10px_28px_rgba(0,0,0,.2)] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
              >
                BUKA UNDANGAN
                {arrow}
              </button>
              <p className="mt-8 font-display text-lg tracking-[0.12em]">{door.date}</p>
            </div>
          </div>
        )}

        <div inert={!open}>{children}</div>

        {open && (
          <button
            type="button"
            onClick={toggleMusic}
            aria-pressed={playing}
            aria-label={playing ? "Matikan musik" : "Nyalakan musik"}
            className="fixed right-4 bottom-4 z-40 flex size-12 items-center justify-center rounded-full bg-inv-night text-inv-gold-light shadow-[0_6px_20px_rgba(0,0,0,.3)] transition-transform duration-150 active:scale-95 sm:right-6 sm:bottom-6"
          >
            {playing ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M9 18V6l10-2v12" />
                <circle cx="6.5" cy="18" r="2.5" />
                <circle cx="16.5" cy="16" r="2.5" />
              </svg>
            )}
          </button>
        )}
        <audio ref={audio} src={music} preload="none" loop />
      </div>
    </GuestContext.Provider>
  );
}
