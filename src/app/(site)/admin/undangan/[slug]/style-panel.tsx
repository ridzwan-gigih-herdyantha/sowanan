"use client";

import { useState } from "react";
import { canonicalFont, CUSTOM_FONT_SLOTS, customFontProblem, type CustomFontSlot } from "@/lib/invitation/custom-font";
import type { InvitationData } from "@/lib/invitation/schema";
import { contrast, CUSTOM, isHex, MIN_CONTRAST, mix, type Vars } from "@/themes/palette";
import { FONT_PRESETS, fontStack, NAME_FONTS } from "@/themes/fonts";
import { GOOGLE_DECORATIVE_FONTS, GOOGLE_TEXT_FONTS } from "@/themes/google-fonts";
import { customChecks, PALETTES, resolvePalette } from "@/themes/palettes";
import { Spinner } from "./spinner";

type Props = {
  theme: string;
  style: InvitationData["style"];
  // Nama mempelai untuk contoh font nama, misalnya "Andi & Rina".
  couple: string;
  // Alasan tiap bagian gaya tidak bisa diubah karena tidak termasuk paket. Kosong berarti terbuka.
  locked: { palette?: string; custom?: string; font?: string; customFont?: string };
  applying: string | null;
  onChange: (style: InvitationData["style"]) => void;
};

const COLOR_FIELDS = [
  { key: "paper", label: "Latar" },
  { key: "surface", label: "Permukaan", optional: true },
  { key: "accent", label: "Aksen" },
  { key: "ink", label: "Teks" },
  { key: "muted", label: "Teks sekunder", optional: true },
] as const;

const BASE_KEYS = ["paper", "accent", "ink"] as const;

function Swatch({ vars, keys }: { vars: Vars; keys: string[] }) {
  return (
    <span className="flex h-7 overflow-hidden rounded-sm ring-1 ring-black/10">
      {keys.map((k) => (
        <span key={k} className="flex-1" style={{ background: vars[k as `--${string}`] }} />
      ))}
    </span>
  );
}

// Isian satu warna. Sama seperti isian font, hanya kode yang sah yang diteruskan ke undangan, jadi warna lain dan
// pratinjau tidak berubah selama kode masih diketik. Isian opsional boleh kosong.
function ColorField({ label, value, picker, optional, onChange }: { label: string; value: string; picker: string; optional: boolean; onChange: (value: string) => void }) {
  const [typing, setTyping] = useState<string | null>(null);
  const text = typing ?? value;
  const valid = (s: string) => isHex(s) || (optional && !s);
  return (
    <label className="block text-[13px]">
      {label}
      <span className="mt-1 flex items-center gap-2 rounded-sm border border-line px-2 py-1.5 focus-within:border-wine">
        <input type="color" value={picker} onChange={(e) => onChange(e.target.value.toUpperCase())} className="size-7 shrink-0 cursor-pointer border-0 bg-transparent p-0" aria-label={`Pilih warna ${label.toLowerCase()}`} />
        <input
          value={text}
          onChange={(e) => {
            const hex = e.target.value.replace(/^#+/, "").toUpperCase();
            const next = optional && !hex ? "" : `#${hex}`;
            setTyping(next);
            if (valid(next)) onChange(next);
          }}
          onBlur={() => setTyping(null)}
          maxLength={7}
          spellCheck={false}
          placeholder={optional ? "Otomatis" : undefined}
          className={`w-full bg-transparent font-mono text-[13px] outline-none placeholder:font-sans ${valid(text) ? "" : "text-wine"}`}
        />
      </span>
    </label>
  );
}

// Isian nama font. Hanya nama yang sah yang diteruskan ke undangan, ketikan yang belum cocok tetap di kolom ini
// dan hilang saat kolom ditinggalkan.
function CustomFontField({ slot, label, value, onChange }: { slot: CustomFontSlot; label: string; value: string; onChange: (name: string) => void }) {
  const [typing, setTyping] = useState<string | null>(null);
  const text = typing ?? value;
  const problem = typing?.trim() ? customFontProblem(slot, typing) : undefined;
  return (
    <label className="block text-[13px]">
      {label}
      <input
        value={text}
        list={slot === "body" ? "google-fonts-teks" : "google-fonts-semua"}
        placeholder="Bawaan"
        spellCheck={false}
        autoComplete="off"
        onChange={(e) => {
          const next = e.target.value;
          setTyping(next);
          if (!next.trim()) onChange("");
          else if (!customFontProblem(slot, next)) onChange(canonicalFont(next));
        }}
        onBlur={() => setTyping(null)}
        className={`mt-1 w-full rounded-sm border bg-transparent px-2 py-1.5 outline-none focus:border-wine ${problem ? "border-wine" : "border-line"}`}
      />
      {problem && <span className="mt-1 block text-[12px] text-wine">{problem}</span>}
    </label>
  );
}

// Panel gaya: palet jadi, palet kustom sebagai slot kelima dengan cek kontras, dan pasangan font.
export function StylePanel({ theme, style, couple, locked, applying, onChange }: Props) {
  // Palet jadi terakhir yang dipilih, sumber warna saat palet kustom dimulai ulang.
  const [lastPreset, setLastPreset] = useState(style.palette === CUSTOM ? "" : style.palette);
  const p = PALETTES[theme];
  if (!p) return null;

  const current = style.palette || p.presets[0].id;
  const custom = current === CUSTOM;
  const active = resolvePalette(theme, style);
  const saved = BASE_KEYS.every((k) => isHex(style.custom[k]));
  const savedVars = saved ? resolvePalette(theme, { ...style, palette: CUSTOM }) : null;
  const seedPreset = p.presets.find((x) => x.id === lastPreset) ?? p.presets[0];
  const checks = customChecks(theme, style);
  const fonts = FONT_PRESETS[theme] ?? [];
  const font = fonts.find((f) => f.id === style.font) ?? fonts[0];
  const nameFont = NAME_FONTS.find((f) => f.id === style.nameFont);
  const hasCustomFont = CUSTOM_FONT_SLOTS.some((s) => style.customFont[s.key]);
  const changed = current !== p.presets[0].id || Boolean(style.font) || Boolean(nameFont) || hasCustomFont;
  // Kunci yang sedang dilanggar isian sekarang ditandai merah, sisanya cukup keterangan.
  const notes = [
    { text: locked.palette, broken: !custom && current !== p.presets[0].id },
    { text: locked.custom, broken: custom },
    { text: locked.font, broken: Boolean(style.font) || Boolean(nameFont) },
    { text: locked.customFont, broken: hasCustomFont },
  ].filter((n, i, all): n is { text: string; broken: boolean } => Boolean(n.text) && all.findIndex((m) => m.text === n.text) === i);

  const pick = (id: string) => {
    setLastPreset(id);
    onChange({ ...style, palette: id === p.presets[0].id ? "" : id });
  };
  // Warna yang sudah diisi tetap tersimpan saat admin mencoba palet jadi lalu kembali ke slot ini.
  const seed = () => ({ ...p.base(seedPreset.vars), surface: "", muted: "" });
  const openCustom = () => onChange({ ...style, palette: CUSTOM, custom: saved ? style.custom : seed() });
  const setColor = (key: (typeof COLOR_FIELDS)[number]["key"], value: string) => onChange({ ...style, palette: CUSTOM, custom: { ...style.custom, [key]: value } });
  // Warna yang sedang berlaku untuk isian opsional yang masih kosong, sebagai nilai awal pemilih warna.
  const pickerValue = (key: (typeof COLOR_FIELDS)[number]["key"]) => {
    const v = style.custom[key];
    if (isHex(v)) return v;
    if (key === "surface" && isHex(active[p.surface] ?? "")) return active[p.surface];
    if (key === "muted" && saved) return mix(style.custom.ink, style.custom.paper, 0.3);
    return "#000000";
  };

  return (
    <div id="g-gaya">
      <div className="mb-5 flex items-center gap-3 rounded-sm bg-ivory px-3 py-2.5">
        <span className="w-24 shrink-0">
          <Swatch vars={active} keys={p.swatch} />
        </span>
        <span className="inline-flex min-w-0 items-center gap-1.5 text-[13px] text-ink-soft">
          {applying && <Spinner className="size-3.5 text-wine" />}
          {applying ? "Menerapkan..." : `${custom ? "Palet kustom" : p.presets.find((x) => x.id === current)?.name}${font ? ` · ${font.name}` : ""}${nameFont ? ` · ${nameFont.name}` : ""}${hasCustomFont ? " · Font custom" : ""}`}
        </span>
      </div>
        <div>
          {notes.map((n) => (
            <p key={n.text} className={`mb-4 rounded-sm px-3 py-2 text-[13px] ${n.broken ? "bg-blush/60 text-wine ring-1 ring-wine/40" : "bg-ivory text-ink-mute ring-1 ring-line"}`}>
              {n.text}
              {n.broken && " Pilihan yang sudah diubah perlu dikembalikan ke bawaan sebelum simpan final."}
            </p>
          ))}

          {!(locked.palette && locked.custom) && (
            <>
            <p className="text-[13px] text-ink-mute">Palet</p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {!locked.palette && p.presets.map((x, i) => {
                const on = !custom && x.id === current;
                const busy = applying !== null && (applying === x.id || (i === 0 && applying === "bawaan"));
                return (
                  <button
                    key={x.id}
                    type="button"
                    onClick={() => pick(x.id)}
                    aria-pressed={on}
                    aria-busy={busy || undefined}
                    className={`relative rounded-sm border p-2 text-left transition-colors duration-150 ${on ? "border-wine ring-1 ring-wine" : "border-line hover:border-ink-mute"}`}
                  >
                    <Swatch vars={x.vars} keys={p.swatch} />
                    {busy && (
                      <span className="absolute inset-x-2 top-2 flex h-7 items-center justify-center rounded-sm bg-white/70">
                        <Spinner className="size-4 text-ink" />
                      </span>
                    )}
                    <span className="mt-1.5 block text-[13px]">
                      {x.name}
                      {i === 0 && <span className="text-ink-mute"> (bawaan)</span>}
                    </span>
                  </button>
                );
              })}
              {!locked.custom && (
                <button
                  type="button"
                  onClick={openCustom}
                  aria-pressed={custom}
                  aria-busy={applying === CUSTOM || undefined}
                  className={`relative rounded-sm border p-2 text-left transition-colors duration-150 ${custom ? "border-wine ring-1 ring-wine" : "border-line hover:border-ink-mute"}`}
                >
                  {savedVars ? <Swatch vars={savedVars} keys={p.swatch} /> : <span className="block h-7 rounded-sm border border-dashed border-ink-mute" />}
                  {applying === CUSTOM && (
                    <span className="absolute inset-x-2 top-2 flex h-7 items-center justify-center rounded-sm bg-white/70">
                      <Spinner className="size-4 text-ink" />
                    </span>
                  )}
                  <span className="mt-1.5 block text-[13px]">Kustom</span>
                </button>
              )}
            </div>
            </>
          )}

          {!locked.custom && (
            <>
            {custom && (
              <>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {COLOR_FIELDS.map((f) => (
                    <ColorField key={f.key} label={f.label} value={style.custom[f.key]} picker={pickerValue(f.key)} optional={"optional" in f} onChange={(v) => setColor(f.key, v)} />
                  ))}
                </div>
                <p className="mt-2 text-[12px] text-ink-mute">Kosongkan permukaan dan teks sekunder supaya dihitung otomatis. Warna lain (bagian gelap, garis, emas) selalu diturunkan dari latar, aksen, dan teks.</p>
                <button type="button" onClick={() => onChange({ ...style, palette: CUSTOM, custom: seed() })} className="mt-2 text-[13px] text-wine underline underline-offset-4">
                  Isi ulang dari palet {seedPreset.name}
                </button>

                <ul className="mt-3 grid gap-1.5">
                  {checks.map((c) => {
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
                {checks.some((c) => active[c.fg] && active[c.bg] && contrast(active[c.fg], active[c.bg]) < MIN_CONTRAST) && (
                  <p className="mt-2 text-[12px] text-wine">Ada pasangan yang kontrasnya di bawah {MIN_CONTRAST}. Teksnya bisa sulit dibaca, tapi undangan tetap bisa disimpan.</p>
                )}
              </>
            )}
            </>
          )}

          {!locked.font && (
            <>
            {fonts.length > 0 && (
              <>
                <p className={`text-[13px] text-ink-mute ${locked.palette && locked.custom ? "" : "mt-6"}`}>Pasangan font (judul dan isi)</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {fonts.map((f, i) => {
                    const on = f.id === (font?.id ?? "");
                    const busy = applying === `font:${f.id || "bawaan"}`;
                    return (
                      <button
                        key={f.id || "bawaan"}
                        type="button"
                        onClick={() => onChange({ ...style, font: f.id })}
                        aria-pressed={on}
                        aria-busy={busy || undefined}
                        className={`relative rounded-sm border px-3 py-2.5 text-left transition-colors duration-150 ${on ? "border-wine ring-1 ring-wine" : "border-line hover:border-ink-mute"}`}
                      >
                        <span className="block truncate text-[26px] leading-tight" style={{ fontFamily: fontStack(f.display, "display") }}>
                          Dua hati, <i>satu cerita</i>
                        </span>
                        <span className="mt-0.5 block text-[14px] text-ink-soft" style={{ fontFamily: fontStack(f.body, "body") }}>
                          Teks isi undangan, tanggal, dan alamat acara.
                        </span>
                        <span className="mt-1.5 flex items-center gap-2 text-[12px] text-ink-mute">
                          {busy && <Spinner className="size-3.5 text-wine" />}
                          {f.name}
                          {i === 0 && " (bawaan)"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {font && (
              <>
                <p className="mt-6 text-[13px] text-ink-mute">Font nama mempelai</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {[{ id: "", name: "Sama dengan font judul", font: font.display }, ...NAME_FONTS].map((f) => {
                    const on = f.id === (nameFont?.id ?? "");
                    const busy = applying === `nama:${f.id || "bawaan"}`;
                    return (
                      <button
                        key={f.id || "bawaan"}
                        type="button"
                        onClick={() => onChange({ ...style, nameFont: f.id })}
                        aria-pressed={on}
                        aria-busy={busy || undefined}
                        className={`relative rounded-sm border px-3 py-2 text-left transition-colors duration-150 ${on ? "border-wine ring-1 ring-wine" : "border-line hover:border-ink-mute"}`}
                      >
                        <span className="block truncate py-0.5 text-[34px] leading-[1.3]" style={{ fontFamily: fontStack(f.font, "display") }}>
                          {couple}
                        </span>
                        <span className="mt-1 flex items-center gap-2 text-[12px] text-ink-mute">
                          {busy && <Spinner className="size-3.5 text-wine" />}
                          {f.name}
                          {!f.id && " (bawaan)"}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-[12px] text-ink-mute">Hanya untuk nama mempelai. Judul lain, tanggal, jam, dan ucapan tamu tetap memakai font judul supaya mudah dibaca.</p>
              </>
            )}

            </>
          )}

          {!locked.customFont && (
            <>
              <p className={`text-[13px] text-ink-mute ${locked.palette && locked.custom && locked.font ? "" : "mt-6"}`}>Font custom dari Google Fonts</p>
              <div className="mt-2 grid gap-3 sm:grid-cols-3">
                {CUSTOM_FONT_SLOTS.map((s) => (
                  <CustomFontField key={s.key} slot={s.key} label={s.label} value={style.customFont[s.key]} onChange={(name) => onChange({ ...style, customFont: { ...style.customFont, [s.key]: name } })} />
                ))}
              </div>
              <datalist id="google-fonts-teks">
                {GOOGLE_TEXT_FONTS.map((f) => (
                  <option key={f} value={f} />
                ))}
              </datalist>
              <datalist id="google-fonts-semua">
                {[...GOOGLE_TEXT_FONTS, ...GOOGLE_DECORATIVE_FONTS].map((f) => (
                  <option key={f} value={f} />
                ))}
              </datalist>
              <p className="mt-2 text-[12px] text-ink-mute">Menimpa pilihan font di atas. Font tulisan tangan atau dekoratif hanya bisa untuk judul dan nama mempelai.</p>
            </>
          )}

          {changed && (
            <button type="button" onClick={() => onChange({ palette: "", font: "", nameFont: "", customFont: { display: "", body: "", name: "" }, custom: { paper: "", accent: "", ink: "", surface: "", muted: "" } })} className="mt-4 text-[13px] text-wine underline underline-offset-4">
              Kembali ke gaya bawaan
            </button>
          )}
        </div>
    </div>
  );
}
