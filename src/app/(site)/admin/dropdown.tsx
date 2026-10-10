"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

export type DropdownOption = { value: string; label: string; disabled?: boolean };

type Props = {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  // Nama yang dibacakan pembaca layar, sekaligus awalan di tombol kalau prefix aktif.
  label: string;
  prefix?: boolean;
  placeholder?: string;
  // Untuk form biasa, nilai ikut terkirim lewat input tersembunyi.
  name?: string;
  disabled?: boolean;
  // Garis putus-putus saat belum dipilih, garis merah saat filter aktif, kuning untuk yang perlu ditindaklanjuti.
  tone?: "default" | "empty" | "active" | "warn";
  size?: "md" | "sm";
  className?: string;
};

// Pengganti select bawaan supaya daftar pilihannya bisa ditata. Tetap bisa dipakai lewat keyboard:
// panah atas bawah, Home, End, Enter, Esc, dan ketik huruf awal pilihan.
export function Dropdown({ value, options, onChange, label, prefix, placeholder = "Pilih", name, disabled, tone = "default", size = "md", className = "" }: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [up, setUp] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: "", time: 0 });

  const current = options.find((o) => o.value === value);
  const enabled = options.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  useEffect(() => {
    if (open) list.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  function show() {
    if (disabled) return;
    const rect = button.current?.getBoundingClientRect();
    // Daftar dibuka ke atas kalau ruang di bawah tidak cukup, misalnya di baris terakhir tabel.
    setUp(Boolean(rect && window.innerHeight - rect.bottom < Math.min(280, options.length * 40 + 16) && rect.top > window.innerHeight - rect.bottom));
    const selected = options.findIndex((o) => o.value === value);
    setActive(selected >= 0 && !options[selected].disabled ? selected : (enabled[0] ?? 0));
    setOpen(true);
  }

  function choose(i: number) {
    const o = options[i];
    if (!o || o.disabled) return;
    setOpen(false);
    button.current?.focus();
    if (o.value !== value) onChange(o.value);
  }

  function move(step: number) {
    const pos = enabled.indexOf(active);
    const next = enabled[Math.min(enabled.length - 1, Math.max(0, (pos < 0 ? 0 : pos) + step))];
    if (next !== undefined) setActive(next);
  }

  function onKey(e: KeyboardEvent) {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        show();
      }
      return;
    }
    if (e.key === "ArrowDown") move(1);
    else if (e.key === "ArrowUp") move(-1);
    else if (e.key === "Home") setActive(enabled[0] ?? 0);
    else if (e.key === "End") setActive(enabled.at(-1) ?? 0);
    else if (e.key === "Enter" || e.key === " ") choose(active);
    else if (e.key === "Escape") setOpen(false);
    else if (e.key === "Tab") return setOpen(false);
    else if (e.key.length === 1) {
      const now = Date.now();
      typed.current = { text: (now - typed.current.time < 600 ? typed.current.text : "") + e.key.toLowerCase(), time: now };
      const hit = enabled.find((i) => options[i].label.toLowerCase().startsWith(typed.current.text));
      if (hit !== undefined) setActive(hit);
    } else return;
    e.preventDefault();
  }

  const pad = size === "sm" ? "px-2.5 py-1.5 text-[14px]" : "px-3 py-2.5 text-[15px]";
  const border =
    tone === "active" ? "border-wine bg-blush/50" : tone === "warn" ? "border-amber-300 bg-amber-50! text-amber-900 hover:border-amber-500" : tone === "empty" ? "border-dashed border-ink-mute text-ink-mute" : "border-line hover:border-ink-mute";

  return (
    <div ref={root} className={`relative ${className}`}>
      {name && <input type="hidden" name={name} value={value} />}
      <button
        ref={button}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-activedescendant={open ? `${id}-${active}` : undefined}
        aria-label={label}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKey}
        className={`flex w-full items-center gap-2 rounded-sm border bg-white text-left font-normal outline-none transition-colors duration-150 focus-visible:border-wine focus-visible:ring-2 focus-visible:ring-wine/15 disabled:cursor-not-allowed disabled:bg-ivory disabled:text-ink-mute ${pad} ${border} ${open ? "border-wine" : ""}`}
      >
        <span className="min-w-0 flex-1 truncate">
          {prefix && <span className="text-ink-mute">{label}: </span>}
          {current ? current.label : <span className="text-ink-mute">{placeholder}</span>}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={`shrink-0 text-ink-mute transition-transform duration-150 ${open ? "rotate-180" : ""}`}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <ul
          ref={list}
          id={`${id}-list`}
          role="listbox"
          aria-label={label}
          className={`absolute left-0 z-50 max-h-[280px] min-w-full overflow-y-auto rounded-sm border border-line bg-white p-1 shadow-[0_12px_32px_rgba(43,27,31,.14)] motion-safe:animate-[dropdown-in_.14s_ease-out] ${up ? "bottom-full mb-1.5 origin-bottom" : "top-full mt-1.5 origin-top"}`}
        >
          {options.map((o, i) => {
            const selected = o.value === value;
            return (
              <li
                key={o.value}
                id={`${id}-${i}`}
                data-index={i}
                role="option"
                aria-selected={selected}
                aria-disabled={o.disabled || undefined}
                onPointerMove={() => !o.disabled && setActive(i)}
                onClick={() => choose(i)}
                className={`flex cursor-pointer items-center gap-2.5 rounded-[3px] px-3 py-2 text-[14px] whitespace-nowrap ${
                  o.disabled ? "cursor-default text-ink-mute" : i === active ? "bg-blush text-ink" : "text-ink-soft"
                } ${selected ? "font-medium text-wine" : ""}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true" className={`shrink-0 ${selected ? "text-wine" : "invisible"}`}>
                  <path d="m5 12 5 5 9-10" />
                </svg>
                {o.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
