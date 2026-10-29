"use client";

import { useEffect, type RefObject } from "react";

// Bunyi tombol tema Isometrik, dari paket Interface Sounds karya Kenney (CC0, kenney.nl): tap untuk tombol
// biasa, open saat masuk gedung atau membuka panel, close saat panel ditutup.
const SOUNDS = { tap: "/audio/isometrik/tap.wav", open: "/audio/isometrik/open.wav", close: "/audio/isometrik/close.wav" };
export type Sfx = keyof typeof SOUNDS;

const cache = new Map<Sfx, HTMLAudioElement>();

export function sfx(kind: Sfx) {
  try {
    let base = cache.get(kind);
    if (!base) {
      base = new Audio(SOUNDS[kind]);
      base.preload = "auto";
      cache.set(kind, base);
    }
    // Salinan baru supaya ketukan cepat berturut-turut tidak saling memotong.
    const a = base.cloneNode() as HTMLAudioElement;
    a.volume = kind === "tap" ? 0.45 : 0.6;
    void a.play().catch(() => {});
  } catch {}
}

// Semua tombol di dalam root berbunyi saat diklik. Bunyinya diambil dari data-sfx pada tombol, bawaannya tap.
export function useButtonSfx(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const click = (e: MouseEvent) => {
      const b = (e.target as HTMLElement | null)?.closest<HTMLButtonElement>("button");
      if (!b || b.disabled || !el.contains(b)) return;
      sfx((b.dataset.sfx as Sfx | undefined) ?? "tap");
    };
    el.addEventListener("click", click, true);
    return () => el.removeEventListener("click", click, true);
  }, [root]);
}
