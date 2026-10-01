"use client";

import { useState } from "react";
import type { InvitationData } from "@/lib/invitation/schema";
import { contrast, CUSTOM, isHex, MIN_CONTRAST, type Vars } from "@/themes/palette";
import { PALETTES, resolvePalette } from "@/themes/palettes";

type Props = {
  theme: string;
  style: InvitationData["style"];
  pkg: string | null;
  onChange: (style: InvitationData["style"]) => void;
};

const BASE_FIELDS = [
  { key: "paper", label: "Latar" },
  { key: "accent", label: "Aksen" },
  { key: "ink", label: "Teks" },
] as const;

function Swatch({ vars, keys }: { vars: Vars; keys: string[] }) {
  return (
    <span className="flex h-7 overflow-hidden rounded-sm ring-1 ring-black/10">
      {keys.map((k) => (
        <span key={k} className="flex-1" style={{ background: vars[k as `--${string}`] }} />
      ))}
    </span>
  );
}

// Panel gaya: pilih palet jadi tema, atau buat palet kustom dari tiga warna dasar dengan cek kontras.
export function StylePanel({ theme, style, pkg, onChange }: Props) {
  const p = PALETTES[theme];
  const [open, setOpen] = useState(false);
  if (!p) return null;

  const current = style.palette || p.presets[0].id;
  const custom = current === CUSTOM;
  const active = resolvePalette(theme, style);
  const base = custom && BASE_FIELDS.every((f) => isHex(style.custom[f.key])) ? style.custom : p.base(active);
  const changed = current !== p.presets[0].id;

  const pick = (id: string) => onChange({ ...style, palette: id === p.presets[0].id ? "" : id });
  const startCustom = () => onChange({ palette: CUSTOM, custom: { ...p.base(active) } });
  const setBase = (key: (typeof BASE_FIELDS)[number]["key"], value: string) => onChange({ palette: CUSTOM, custom: { ...base, [key]: value.toUpperCase() } });

  return (
    <section id="g-gaya" className="rounded-sm border border-line bg-white">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center gap-3 px-4 py-3 text-left">
        <span className="font-serif text-xl">Gaya</span>
        <span className="text-[12px] text-ink-mute">{custom ? "Palet kustom" : p.presets.find((x) => x.id === current)?.name}</span>
        <span className="ml-auto w-24">
          <Swatch vars={active} keys={p.swatch} />
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`shrink-0 text-ink-mute transition-transform duration-150 ${open ? "rotate-180" : ""}`} aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-line p-4">
          {pkg === "dasar" && changed && (
            <p className="mb-4 rounded-sm bg-amber-50 px-3 py-2 text-[13px] text-amber-900 ring-1 ring-amber-200">
              Paket Dasar. Ganti palet termasuk add-on &ldquo;Ganti font atau palet warna&rdquo;, pastikan sudah dibayar.
            </p>
          )}

          <p className="text-[13px] text-ink-mute">Palet jadi</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {p.presets.map((x, i) => {
              const on = !custom && x.id === current;
              return (
                <button
                  key={x.id}
                  type="button"
                  onClick={() => pick(x.id)}
                  aria-pressed={on}
                  className={`rounded-sm border p-2 text-left transition-colors duration-150 ${on ? "border-wine ring-1 ring-wine" : "border-line hover:border-ink-mute"}`}
                >
                  <Swatch vars={x.vars} keys={p.swatch} />
                  <span className="mt-1.5 block text-[13px]">
                    {x.name}
                    {i === 0 && <span className="text-ink-mute"> (bawaan)</span>}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <p className="text-[13px] text-ink-mute">Palet kustom</p>
            {!custom && (
              <button type="button" onClick={startCustom} className="rounded-sm border border-ink px-3 py-1.5 text-[13px]">
                Buat dari palet ini
              </button>
            )}
          </div>

          {custom && (
            <>
              <div className="mt-2 grid gap-3 sm:grid-cols-3">
                {BASE_FIELDS.map((f) => {
                  const v = style.custom[f.key];
                  return (
                    <label key={f.key} className="block text-[13px]">
                      {f.label}
                      <span className="mt-1 flex items-center gap-2 rounded-sm border border-line px-2 py-1.5 focus-within:border-wine">
                        <input type="color" value={isHex(v) ? v : "#000000"} onChange={(e) => setBase(f.key, e.target.value)} className="size-7 shrink-0 cursor-pointer border-0 bg-transparent p-0" aria-label={`Pilih warna ${f.label.toLowerCase()}`} />
                        <input
                          value={v}
                          onChange={(e) => setBase(f.key, e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`)}
                          maxLength={7}
                          spellCheck={false}
                          className={`w-full bg-transparent font-mono text-[13px] outline-none ${isHex(v) ? "" : "text-wine"}`}
                        />
                      </span>
                    </label>
                  );
                })}
              </div>
              <p className="mt-2 text-[12px] text-ink-mute">Warna lain (latar kedua, bagian gelap, garis, emas) diturunkan otomatis dari ketiganya.</p>

              <ul className="mt-3 grid gap-1.5">
                {p.checks.map((c) => {
                  const fg = active[c.fg];
                  const bg = active[c.bg];
                  const ratio = fg && bg ? contrast(fg, bg) : 0;
                  const ok = ratio >= MIN_CONTRAST;
                  return (
                    <li key={c.label} className="flex items-center gap-3 text-[13px]">
                      <span className="flex h-7 w-16 shrink-0 items-center justify-center rounded-sm text-[13px] ring-1 ring-black/10" style={{ background: bg, color: fg }}>
                        Aa
                      </span>
                      <span className="flex-1">{c.label}</span>
                      <span className={`tabular-nums ${ok ? "text-emerald-700" : "text-wine"}`}>
                        {ratio.toFixed(1)} {ok ? "lolos" : "kurang"}
                      </span>
                    </li>
                  );
                })}
              </ul>
              {p.checks.some((c) => contrast(active[c.fg], active[c.bg]) < MIN_CONTRAST) && (
                <p className="mt-2 text-[12px] text-wine">Ada pasangan yang kontrasnya di bawah {MIN_CONTRAST}. Teksnya bisa sulit dibaca, coba gelapkan warna teks atau terangkan latar.</p>
              )}
            </>
          )}

          {changed && (
            <button type="button" onClick={() => onChange({ palette: "", custom: { paper: "", accent: "", ink: "" } })} className="mt-4 text-[13px] text-wine underline underline-offset-4">
              Kembali ke palet bawaan
            </button>
          )}
        </div>
      )}
    </section>
  );
}
