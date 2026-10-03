"use client";

import { useId, useState, type ReactNode } from "react";
import { getIn, setIn, useSettings } from "./form-context";
import { button, cx, input, ring } from "./styles";

export { button, cx, input };

export function Chip({ sys }: { sys?: boolean }) {
  return sys ? (
    <span title="Nilainya dipakai otomatis di bagian lain, misalnya tautan, perhitungan, atau kata pengganti" className="ml-1.5 inline-block rounded-full border border-[#E7D2D8] bg-[#F6EBEE] px-[7px] py-[3px] align-[1px] text-[9.5px] font-medium tracking-[.1em] text-wine uppercase">
      dipakai sistem
    </span>
  ) : (
    <span title="Hanya muncul di tempatnya sendiri, tidak mengubah perilaku" className="ml-1.5 inline-block rounded-full border border-[#E8E0D6] bg-[#F5F1EB] px-[7px] py-[3px] align-[1px] text-[9.5px] font-medium tracking-[.1em] text-ink-mute uppercase">
      tampilan
    </span>
  );
}

export function Card({ title, hint, tools, children }: { title: string; hint?: ReactNode; tools?: ReactNode; children: ReactNode }) {
  return (
    <section className="mb-[18px] rounded-[10px] border border-[#E8E0D6] bg-white">
      <header className="flex flex-wrap items-start gap-4 border-b border-[#F0EAE2] px-4 pt-[18px] pb-4 sm:px-[22px]">
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-medium">{title}</h2>
          {hint && <p className="mt-[5px] max-w-[72ch] text-[12.5px] leading-normal text-ink-mute">{hint}</p>}
        </div>
        {tools && <div className="flex flex-none gap-2">{tools}</div>}
      </header>
      <div className="px-4 pt-5 pb-[22px] sm:px-[22px]">{children}</div>
    </section>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return (
    <div className="mb-[18px] flex gap-3 rounded-[9px] border border-[#E7D2D8] bg-[#F6EBEE] px-4 py-3.5 text-[13px] leading-relaxed text-[#5E2231]">
      <span aria-hidden="true" className="mt-[7px] size-[7px] flex-none rounded-full bg-wine" />
      <div>{children}</div>
    </div>
  );
}

export function Row({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("flex flex-wrap gap-x-[18px] [&>*]:min-w-[190px] [&>*]:flex-[1_1_0]", className)}>{children}</div>;
}

export const width = { sm: "min-w-[150px]! flex-[0_0_150px]!", md: "flex-[0_0_240px]! max-sm:flex-[1_1_0]!" };

type FieldProps = {
  label: string;
  chip?: "sys" | "view";
  help?: ReactNode;
  max?: number;
  count?: number;
  error?: string;
  className?: string;
  children: (id: string, describedBy: string | undefined) => ReactNode;
};

export function Field({ label, chip, help, max, count, error, className, children }: FieldProps) {
  const id = useId();
  const helpId = `${id}-help`;
  const showHelp = error || help || max;
  return (
    <div className={cx("field mb-[18px]", className)}>
      <label htmlFor={id} className="mb-[7px] block text-[12.5px] font-medium text-[#5C5048]">
        {label}
        {chip && <Chip sys={chip === "sys"} />}
      </label>
      {children(id, showHelp ? helpId : undefined)}
      {showHelp && (
        <div id={helpId} className="mt-1.5 flex justify-between gap-3 text-[11.5px] leading-normal">
          <span className={error ? "text-wine" : "text-ink-mute"}>{error || help}</span>
          {max !== undefined && (
            <span className={cx("flex-none tabular-nums", (count ?? 0) > max ? "text-wine" : "text-ink-mute")}>
              {count ?? 0} / {max}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

type TextProps = {
  path: string;
  label: string;
  chip?: "sys" | "view";
  help?: ReactNode;
  max?: number;
  rows?: number;
  type?: "text" | "email" | "time" | "url";
  placeholder?: string;
  className?: string;
  mono?: boolean;
};

export function Text({ path, label, chip, help, max, rows, type = "text", placeholder, className, mono }: TextProps) {
  const { s, set, errors } = useSettings();
  const value = String(getIn(s, path) ?? "");
  const error = errors[path];
  return (
    <Field label={label} chip={chip} help={help} max={max} count={value.length} error={error} className={className}>
      {(id, describedBy) =>
        rows ? (
          <textarea
            id={id}
            value={value}
            rows={rows}
            placeholder={placeholder}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            onChange={(e) => set(path, e.target.value)}
            className={cx(input, "resize-y leading-relaxed", error ? "border-wine" : "border-[#E8E0D6]")}
          />
        ) : (
          <input
            id={id}
            type={type}
            value={value}
            placeholder={placeholder}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            onChange={(e) => set(path, e.target.value)}
            className={cx(input, mono && "font-mono text-[12.5px]!", error ? "border-wine" : "border-[#E8E0D6]")}
          />
        )
      }
    </Field>
  );
}

export function Select({ path, label, chip, help, options, className, toValue }: { path: string; label: string; chip?: "sys" | "view"; help?: ReactNode; options: [string, string][]; className?: string; toValue?: (v: string) => unknown }) {
  const { s, set, errors } = useSettings();
  const error = errors[path];
  return (
    <Field label={label} chip={chip} help={help} error={error} className={className}>
      {(id, describedBy) => (
        <SelectBox id={id} describedBy={describedBy} value={String(getIn(s, path) ?? "")} options={options} invalid={!!error} onChange={(v) => set(path, toValue ? toValue(v) : v)} />
      )}
    </Field>
  );
}

export function SelectBox({ id, describedBy, value, options, invalid, onChange, className, label }: { id?: string; describedBy?: string; value: string; options: [string, string][]; invalid?: boolean; onChange: (v: string) => void; className?: string; label?: string }) {
  return (
    <span className="relative block">
      <select
        id={id}
        value={value}
        aria-label={label}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        onChange={(e) => onChange(e.target.value)}
        className={cx(input, "appearance-none pr-9", invalid ? "border-wine" : "border-[#E8E0D6]", className)}
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      <svg aria-hidden="true" viewBox="0 0 10 6" className="pointer-events-none absolute top-1/2 right-3.5 w-2.5 -translate-y-1/2 fill-none stroke-[#8C7F76] stroke-[1.4]">
        <path d="M1 1l4 4 4-4" />
      </svg>
    </span>
  );
}

export function Affix({ children, side }: { children: ReactNode; side: "l" | "r" }) {
  return (
    <span className={cx("flex items-center border border-[#E8E0D6] bg-[#FBF8F4] px-3 text-[13px] whitespace-nowrap text-ink-mute", side === "l" ? "rounded-l-lg border-r-0" : "rounded-r-lg border-l-0")}>
      {children}
    </span>
  );
}

const toRupiah = (n: number | null) => (n === null || Number.isNaN(n) ? "" : n.toLocaleString("id-ID"));
const parseNum = (v: string) => {
  const digits = v.replace(/\D/g, "").slice(0, 12);
  return digits ? Number(digits) : NaN;
};

// Angka disimpan sebagai bilangan. Isian kosong disimpan NaN supaya validasi server menolaknya dengan pesan yang jelas.
export function NumberField({ path, label, chip, help, prefix, suffix, rupiah, className }: { path: string; label: string; chip?: "sys" | "view"; help?: ReactNode; prefix?: string; suffix?: string; rupiah?: boolean; className?: string }) {
  const { s, set, errors } = useSettings();
  const value = getIn(s, path) as number;
  const error = errors[path];
  return (
    <Field label={label} chip={chip} help={help} error={error} className={className}>
      {(id, describedBy) => (
        <span className="flex items-stretch">
          {prefix && <Affix side="l">{prefix}</Affix>}
          <input
            id={id}
            inputMode="numeric"
            value={rupiah ? toRupiah(value) : Number.isNaN(value) ? "" : String(value)}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            onChange={(e) => set(path, parseNum(e.target.value))}
            className={cx(input, "min-w-0 tabular-nums", prefix && "rounded-l-none", suffix && "rounded-r-none", error ? "border-wine" : "border-[#E8E0D6]")}
          />
          {suffix && <Affix side="r">{suffix}</Affix>}
        </span>
      )}
    </Field>
  );
}

export function Switch({ checked, onChange, label, bare, small }: { checked: boolean; onChange: (v: boolean) => void; label: string; bare?: boolean; small?: boolean }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-[9px] select-none" title={bare ? label : undefined}>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-label={bare ? label : undefined} className="peer sr-only" />
      <span
        aria-hidden="true"
        className={cx(
          "relative flex-none rounded-full bg-[#A3958A] transition-colors duration-150 peer-checked:bg-wine peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-wine",
          "after:absolute after:top-[3px] after:left-[3px] after:rounded-full after:bg-white after:shadow-[0_1px_2px_rgba(0,0,0,.18)] after:transition-transform after:duration-150 motion-reduce:after:transition-none",
          small
            ? "h-[15px] w-[26px] after:top-[2.5px] after:left-[2.5px] after:size-2.5 peer-checked:after:translate-x-[11px]"
            : bare
              ? "h-5 w-[34px] after:size-3.5 peer-checked:after:translate-x-3.5"
              : "h-[22px] w-[38px] after:size-4 peer-checked:after:translate-x-4",
        )}
      />
      {!bare && <span className={small ? "text-[9.5px] tracking-[.06em] text-ink-mute uppercase" : "text-[13px] text-[#5C5048]"}>{label}</span>}
    </label>
  );
}

const iconBtn = cx("flex items-center justify-center rounded-[5px] border border-[#E8E0D6] bg-white text-ink-mute transition-colors duration-150 hover:border-[#DCD2C7] hover:bg-[#F5F1EB] hover:text-[#2A2320] disabled:opacity-40", ring);

export function DeleteButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={cx(iconBtn, "size-[26px] hover:border-[#E7D2D8]! hover:bg-[#F6EBEE]! hover:text-wine!")}>
      <svg viewBox="0 0 10 10" aria-hidden="true" className="w-2.5 stroke-current stroke-[1.4]">
        <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" />
      </svg>
    </button>
  );
}

function MoveButton({ up, onClick, disabled, label }: { up: boolean; onClick: () => void; disabled: boolean; label: string }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} title={up ? "Naik" : "Turun"} className={cx(iconBtn, "h-[18px] w-[22px]")}>
      <svg viewBox="0 0 10 6" aria-hidden="true" className={cx("w-2 fill-current", !up && "rotate-180")}>
        <path d="M5 0l5 6H0z" />
      </svg>
    </button>
  );
}

type Item = { id: string; on?: boolean };

// Daftar berulang: naik turun, tampil atau sembunyi, hapus, dan tambah baris.
export function RepList<T extends Item>({ path, noun, blank, render, toggleLabel = "Tampilkan di web", min = 0, max }: { path: string; noun: string; blank: () => T; render: (item: T, i: number, base: string) => ReactNode; toggleLabel?: string; min?: number; max?: number }) {
  const { s, update } = useSettings();
  const items = (getIn(s, path) as T[]) ?? [];
  const [focusNew, setFocusNew] = useState<string | null>(null);
  const write = (next: T[]) => update((d) => setIn(d, path, next));
  const move = (i: number, to: number) => {
    const next = [...items];
    const [x] = next.splice(i, 1);
    next.splice(to, 0, x);
    write(next);
  };

  return (
    <>
      <div className="flex flex-col gap-2.5">
        {items.map((item, i) => {
          const name = `${noun} ${i + 1}`;
          return (
            <div
              key={item.id}
              ref={(el) => {
                if (el && focusNew === item.id) {
                  el.querySelector<HTMLElement>("input,textarea,select")?.focus();
                  setFocusNew(null);
                }
              }}
              className="flex items-start gap-3 rounded-[9px] border border-[#E8E0D6] bg-[#FCFAF7] px-3 py-[13px] sm:px-3.5"
            >
              <div className="flex flex-none flex-col gap-[3px] pt-[22px]">
                <MoveButton up disabled={i === 0} onClick={() => move(i, i - 1)} label={`Naikkan ${name}`} />
                <MoveButton up={false} disabled={i === items.length - 1} onClick={() => move(i, i + 1)} label={`Turunkan ${name}`} />
              </div>
              <div className={cx("min-w-0 flex-1 [&_.field]:mb-0 [&>*+*]:mt-3.5", item.on === false && "opacity-60")}>{render(item, i, `${path}.${i}`)}</div>
              <div className="flex flex-none flex-col items-center gap-2.5 pt-[26px] sm:flex-row">
                {item.on !== undefined && <Switch bare checked={item.on} label={`${toggleLabel}: ${name}`} onChange={(v) => write(items.map((x, j) => (j === i ? { ...x, on: v } : x)))} />}
                {items.length > min && <DeleteButton label={`Hapus ${name}`} onClick={() => write(items.filter((_, j) => j !== i))} />}
              </div>
            </div>
          );
        })}
      </div>
      {(max === undefined || items.length < max) && (
        <button
          type="button"
          onClick={() => {
            const item = blank();
            write([...items, item]);
            setFocusNew(item.id);
          }}
          className={cx(button.ghost, "mt-3.5 w-full border-dashed")}
        >
          + Tambah {noun}
        </button>
      )}
    </>
  );
}
