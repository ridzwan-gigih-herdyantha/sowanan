"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Dropdown } from "../dropdown";
import { FILTERS } from "./filter-options";

const search = "rounded-sm border border-line bg-white px-3 py-2.5 text-[15px] outline-none transition-colors duration-150 hover:border-ink-mute focus:border-wine";

export function Filters({ shown, total }: { shown: number; total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");
  const timer = useRef(0);

  const apply = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    start(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const active = [...params.keys()].some((k) => k === "q" || k in FILTERS);

  return (
    <div className="mt-4 grid gap-3" aria-busy={pending}>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-[minmax(240px,1fr)_repeat(4,minmax(0,168px))]">
        <label className="col-span-2 lg:col-span-1">
          <span className="sr-only">Cari nama pasangan atau slug</span>
          <input
            type="search"
            value={q}
            placeholder="Cari nama pasangan atau slug"
            onChange={(e) => {
              const v = e.target.value;
              setQ(v);
              window.clearTimeout(timer.current);
              timer.current = window.setTimeout(() => apply("q", v.trim()), 250);
            }}
            className={`${search} w-full`}
          />
        </label>
        {Object.entries(FILTERS).map(([key, f]) => (
          <Dropdown
            key={key}
            label={f.label}
            prefix
            value={params.get(key) ?? ""}
            options={[{ value: "", label: "Semua" }, ...Object.entries(f.options).map(([value, label]) => ({ value, label }))]}
            onChange={(v) => apply(key, v)}
            tone={params.get(key) ? "active" : "default"}
            className="min-w-0"
          />
        ))}
      </div>
      <p className="text-[13px] text-ink-mute" aria-live="polite">
        {pending ? "Memfilter..." : active ? `${shown} dari ${total} undangan` : null}
        {active && !pending && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              start(() => router.replace(pathname, { scroll: false }));
            }}
            className="ml-3 text-wine underline underline-offset-4"
          >
            Hapus filter
          </button>
        )}
      </p>
    </div>
  );
}
