"use client";

import Image from "next/image";
import { createContext, useContext, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";

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

type Props = {
  couple: string;
  monogram: string;
  seal: string;
  music: string;
  className: string;
  style: CSSProperties;
  children: ReactNode;
};

export function InvitationShell({ couple, monogram, seal, music, className, style, children }: Props) {
  const invited = useSyncExternalStore(noop, readGuestParam, () => "");
  const [typed, setTyped] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);

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
          <style>{`.inv-door{display:none}.inv-enter{opacity:1;transform:none}html{overflow:auto!important}`}</style>
        </noscript>

        <div
          className="inv-door inv-paper fixed inset-0 z-50 flex flex-col items-center justify-center px-8 text-center"
          aria-hidden={open}
        >
          <p className="text-[11px] tracking-[0.22em] text-inv-ink/70">PERNIKAHAN</p>
          <p className="mt-3 font-display text-[44px] leading-none text-inv-accent">{couple}</p>

          <div className="mt-10 flex h-24 flex-col items-center justify-center">
            {invited ? (
              <>
                <p className="text-[13px] text-inv-ink/70">Kepada Yth.</p>
                <p className="mt-1 font-display text-3xl italic">{invited}</p>
              </>
            ) : (
              <label className="flex w-64 flex-col gap-2 text-[13px] text-inv-ink/70">
                Boleh tahu namamu? (opsional)
                <input
                  value={typed ?? ""}
                  onChange={(e) => setTyped(e.target.value.slice(0, 40))}
                  onKeyDown={(e) => e.key === "Enter" && openInvitation()}
                  className="rounded-sm border border-inv-line bg-transparent px-3 py-2.5 text-center text-base text-inv-ink outline-none focus:border-inv-accent"
                  autoComplete="name"
                />
              </label>
            )}
          </div>

          <button
            type="button"
            onClick={openInvitation}
            className="inv-seal group relative mt-10 size-32 rounded-full"
            aria-label="Buka undangan"
          >
            <Image src={seal} alt="" width={128} height={128} preload className="size-32" />
            <span className="absolute inset-0 flex items-center justify-center font-display text-2xl text-[#f3d6ae] [text-shadow:0_1px_0_rgba(0,0,0,.35)]">
              {monogram}
            </span>
          </button>
          <button type="button" onClick={openInvitation} className="mt-4 text-[13px] text-inv-ink/80 underline-offset-4 hover:underline">
            Ketuk segel untuk membuka undangan
          </button>
        </div>

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
