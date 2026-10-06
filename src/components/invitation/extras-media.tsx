"use client";

import Image from "next/image";
import { useId, useRef, useState, type CSSProperties, type SyntheticEvent } from "react";
import type { ExtraView } from "@/lib/invitation/view";
import { useInvitationMedia } from "./shell";

// Warna kartu diambil dari warna teks bagian, jadi serasi di semua pilihan warna latar.
const tint = (pct: number): CSSProperties => ({ background: `color-mix(in srgb, currentColor ${pct}%, transparent)` });

// Satu media hanya berbunyi sendirian. Saat diputar, media lain berhenti dan musik latar meredup.
function useExclusive() {
  const media = useInvitationMedia();
  const id = useId();
  return {
    onPlay: (e: SyntheticEvent<HTMLMediaElement>) => {
      const el = e.currentTarget;
      media.claim(id, () => el.pause());
    },
    release: () => media.release(id),
  };
}

function Video({ src, poster }: ExtraView["videos"][number]) {
  const { onPlay, release } = useExclusive();
  return (
    <video
      src={src}
      poster={poster || undefined}
      controls
      playsInline
      preload="metadata"
      onPlay={onPlay}
      onPause={release}
      onEnded={release}
      className="max-h-[80svh] w-full rounded-[2px] bg-black"
    />
  );
}

export function ExtraVideos({ videos }: { videos: ExtraView["videos"] }) {
  return (
    <div className="grid gap-6">
      {videos.map((v, i) => (
        <Video key={`${v.src}-${i}`} {...v} />
      ))}
    </div>
  );
}

const time = (s: number) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00");

// onFinish memutar lagu berikutnya dan mengembalikan false kalau ini lagu terakhir.
type TrackProps = ExtraView["tracks"][number] & { register: (el: HTMLAudioElement | null) => void; onFinish: (failed: () => void) => boolean };

function Track({ src, cover, title, artist, register, onFinish }: TrackProps) {
  const { onPlay, release } = useExclusive();
  const el = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [now, setNow] = useState(0);
  const [length, setLength] = useState(0);

  const toggle = () => {
    const a = el.current;
    if (!a) return;
    if (a.paused) void a.play().catch(() => setPlaying(false));
    else a.pause();
  };

  return (
    <li className="flex w-full min-w-0 items-center gap-3 rounded-[2px] p-3 sm:gap-4" style={tint(7)}>
      <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-[2px]" style={tint(12)}>
        {cover ? (
          <Image src={cover} alt="" fill sizes="64px" className="object-cover" />
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <path d="M9 18V6l10-2v12" />
            <circle cx="6.5" cy="18" r="2.5" />
            <circle cx="16.5" cy="16" r="2.5" />
          </svg>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-[19px] leading-tight">{title}</p>
        {artist && <p className="mt-0.5 truncate text-[13px] opacity-75">{artist}</p>}
        <div className="mt-2 flex items-center gap-2 text-[12px] tabular-nums opacity-80">
          <span>{time(now)}</span>
          <input
            type="range"
            min={0}
            max={length || 0}
            step={0.1}
            value={Math.min(now, length || 0)}
            onChange={(e) => {
              const a = el.current;
              if (a) a.currentTime = Number(e.target.value);
              setNow(Number(e.target.value));
            }}
            aria-label={`Posisi lagu ${title}`}
            className="h-1 min-w-0 flex-1 cursor-pointer"
            style={{ accentColor: "currentColor" }}
          />
          <span>{time(length)}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? `Jeda ${title}` : `Putar ${title}`}
        className="flex size-11 shrink-0 items-center justify-center rounded-full border border-current transition-transform duration-150 active:scale-95"
      >
        {playing ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
          </svg>
        )}
      </button>
      <audio
        ref={(a) => {
          el.current = a;
          register(a);
          // Metadata bisa sudah termuat sebelum React terpasang, jadi event-nya terlewat.
          if (a && a.readyState >= 1 && Number.isFinite(a.duration)) setLength(a.duration);
        }}
        src={src}
        preload="metadata"
        onPlay={(e) => {
          setPlaying(true);
          onPlay(e);
        }}
        onPause={(e) => {
          setPlaying(false);
          // Event pause juga muncul tepat sebelum ended. Lagu yang selesai diurus onEnded.
          if (!e.currentTarget.ended) release();
        }}
        onEnded={() => {
          setPlaying(false);
          setNow(0);
          // Lagu berikutnya langsung menyambung, jadi musik latar tidak sempat menyala di antaranya.
          if (!onFinish(release)) release();
        }}
        onTimeUpdate={(e) => setNow(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setLength(e.currentTarget.duration)}
        onDurationChange={(e) => setLength(e.currentTarget.duration)}
      />
    </li>
  );
}

export function ExtraTracks({ tracks }: { tracks: ExtraView["tracks"] }) {
  const els = useRef<(HTMLAudioElement | null)[]>([]);
  return (
    <ul className="mx-auto flex max-w-[560px] flex-col gap-3">
      {tracks.map((t, i) => (
        <Track
          key={`${t.src}-${i}`}
          {...t}
          register={(el) => {
            els.current[i] = el;
          }}
          onFinish={(failed) => {
            const next = els.current[i + 1];
            if (!next) return false;
            next.currentTime = 0;
            // Browser bisa menolak putar otomatis, misalnya di iOS. Musik latar lalu dinyalakan lagi.
            next.play().catch(failed);
            return true;
          }}
        />
      ))}
    </ul>
  );
}
