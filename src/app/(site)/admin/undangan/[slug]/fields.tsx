"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { InvitationData } from "@/lib/invitation/schema";
import { TIMEZONES } from "@/lib/invitation/schema";
import { forTheme, getIn, setIn, type Field } from "@/lib/invitation/spec";
import { mediaUrl, PURPOSES } from "@/lib/storage/media";
import { ACCEPT, useUploader, type UploadResult } from "../../media/use-uploader";

type Ctx = {
  slug: string;
  theme: string;
  data: InvitationData;
  update: (fn: (d: InvitationData) => InvitationData) => void;
  errors: Record<string, string>;
  focus: string;
  names: string;
};

const FormCtx = createContext<Ctx | null>(null);
export const FormProvider = ({ value, children }: { value: Ctx; children: ReactNode }) => <FormCtx.Provider value={value}>{children}</FormCtx.Provider>;
const useForm = () => useContext(FormCtx)!;

const input = (err?: string) =>
  `mt-2 block w-full rounded-sm border bg-white px-3 py-2.5 text-base font-normal outline-none focus:border-wine ${err ? "border-wine bg-blush/40" : "border-line"}`;

function Label({ f, path, err, children }: { f: Field; path: string; err?: string; children: ReactNode }) {
  return (
    <div id={`f-${path}`} className="scroll-mt-28 text-[14px] font-medium">
      <label className="block">
        {f.label}
        {f.required === false && <span className="ml-1.5 text-[12px] font-normal text-ink-mute">opsional</span>}
        {children}
      </label>
      {err ? (
        <span className="mt-1.5 block text-[13px] font-normal text-wine">{err}</span>
      ) : (
        f.hint && <span className="mt-1.5 block text-[13px] font-normal text-ink-mute">{f.hint}</span>
      )}
    </div>
  );
}

const fileName = (v: string) => v.split("/").pop()?.split("?")[0] ?? v;

function MediaInput({ f, path }: { f: Extract<Field, { kind: "media" }>; path: string }) {
  const { slug, data, update, errors, names } = useForm();
  const upload = useUploader(slug);
  const [status, setStatus] = useState("");
  const value = String(getIn(data, path) ?? "");
  const kind = PURPOSES[f.purpose].kind;
  const err = errors[path];

  const apply = (res: UploadResult) => {
    if (!res.ok) return setStatus(res.error);
    setStatus("");
    update((d) => {
      let next = setIn(d, path, res.data.path);
      const base = path.slice(0, path.lastIndexOf("."));
      if (f.dims && res.data.width && res.data.height) next = setIn(setIn(next, `${base}.w`, res.data.width), `${base}.h`, res.data.height);
      if (f.dims || f.purpose === "photo") {
        const alt = `${base}.alt`;
        if (getIn(next, alt) === "") next = setIn(next, alt, `Foto ${names}`);
      }
      return next;
    });
  };

  return (
    <Label f={f} path={path} err={err}>
      <span className={`mt-2 flex items-center gap-3 rounded-sm border bg-white p-2 font-normal ${err ? "border-wine bg-blush/40" : "border-line"}`}>
        <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-blush/60 text-[11px] text-ink-mute">
          {!value ? (
            "kosong"
          ) : kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaUrl(value)} alt="" className="size-full object-cover" />
          ) : kind === "video" ? (
            <video src={mediaUrl(value)} muted preload="metadata" className="size-full object-cover" />
          ) : (
            "audio"
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] text-ink-soft">{status || (value ? fileName(value) : "Belum ada file")}</span>
          {kind === "audio" && value && <audio src={mediaUrl(value)} controls preload="none" className="mt-1 h-8 w-full" />}
          <span className="mt-1 flex gap-4 text-[13px]">
            <span className="relative cursor-pointer text-wine underline underline-offset-4 focus-within:outline-2 focus-within:outline-wine">
              {value ? "Ganti" : "Unggah"}
              <input
                type="file"
                accept={ACCEPT[kind]}
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  apply(await upload(file, f.purpose, (s) => setStatus(s === "upload" ? "Mengunggah..." : "Mengompres...")));
                }}
              />
            </span>
            {value && (
              <button type="button" className="text-ink-mute hover:text-wine" onClick={() => update((d) => setIn(d, path, ""))}>
                Kosongkan
              </button>
            )}
          </span>
        </span>
      </span>
    </Label>
  );
}

function ListInput({ f, path }: { f: Extract<Field, { kind: "list" }>; path: string }) {
  const { slug, theme, data, update, errors, focus, names } = useForm();
  const upload = useUploader(slug);
  const items = (getIn(data, path) as Record<string, unknown>[] | undefined) ?? [];
  const [open, setOpen] = useState<Set<number>>(() => new Set(items.length === 1 ? [0] : []));
  const [bulk, setBulk] = useState("");
  const fields = forTheme(f.fields, theme);
  const first = fields[0];
  const bulkMedia = first?.kind === "media" && PURPOSES[first.purpose].kind === "image" ? first : null;
  const titleField = fields.find((x) => x.kind === "text");
  const full = f.max !== undefined && items.length >= f.max;
  const err = errors[path];

  const toggle = (i: number) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  const move = (i: number, to: number) =>
    update((d) => {
      const arr = [...((getIn(d, path) as unknown[]) ?? [])];
      const [x] = arr.splice(i, 1);
      arr.splice(to, 0, x);
      return setIn(d, path, arr);
    });
  const add = (item: Record<string, unknown>) => update((d) => setIn(d, path, [...((getIn(d, path) as unknown[]) ?? []), item]));

  return (
    <div id={`f-${path}`} className="scroll-mt-28">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[14px] font-medium">
          {f.label}
          <span className="ml-2 font-normal text-ink-mute">{items.length}</span>
        </p>
      </div>
      {err && <p className="mt-1 text-[13px] text-wine">{err}</p>}

      <ul className="mt-2 grid gap-2">
        {items.map((item, i) => {
          const prefix = `${path}.${i}.`;
          const bad = Object.keys(errors).some((k) => k.startsWith(prefix));
          const isOpen = open.has(i) || focus.startsWith(prefix);
          const thumb = bulkMedia ? String(item[bulkMedia.path] ?? "") : "";
          const title = titleField ? String(getIn(item, titleField.path) ?? "") : "";
          return (
            <li key={i} className={`rounded-sm border ${bad ? "border-wine" : "border-line"} bg-ivory/40`}>
              <div className="flex items-center gap-2 px-3 py-2">
                <button type="button" onClick={() => toggle(i)} aria-expanded={isOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left text-[14px]">
                  {thumb && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaUrl(thumb)} alt="" className="size-9 shrink-0 rounded-sm object-cover" />
                  )}
                  <span className="min-w-0 truncate">
                    <span className="font-medium">
                      {f.item} {i + 1}
                    </span>
                    {title && <span className="text-ink-mute">: {title}</span>}
                  </span>
                  {bad && <span className="size-2 shrink-0 rounded-full bg-wine" aria-label="ada isian bermasalah" />}
                </button>
                <span className="flex shrink-0 gap-1 text-[12px] text-ink-mute">
                  <button type="button" disabled={i === 0} onClick={() => move(i, i - 1)} className="rounded-sm px-1.5 py-1 hover:bg-blush disabled:opacity-30" aria-label="Naikkan">
                    ↑
                  </button>
                  <button type="button" disabled={i === items.length - 1} onClick={() => move(i, i + 1)} className="rounded-sm px-1.5 py-1 hover:bg-blush disabled:opacity-30" aria-label="Turunkan">
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => confirm(`Hapus ${f.item.toLowerCase()} ${i + 1}?`) && update((d) => setIn(d, path, ((getIn(d, path) as unknown[]) ?? []).filter((_, j) => j !== i)))}
                    className="rounded-sm px-1.5 py-1 hover:bg-blush hover:text-wine"
                    aria-label="Hapus"
                  >
                    ✕
                  </button>
                </span>
              </div>
              {isOpen && (
                <div className="grid gap-4 border-t border-line bg-white p-3 sm:grid-cols-2">
                  {fields.map((x) => (
                    <FieldInput key={x.path} f={x} path={prefix + x.path} />
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px]">
        <button
          type="button"
          disabled={full}
          onClick={() => {
            setOpen((s) => new Set(s).add(items.length));
            add(structuredClone(f.blank));
          }}
          className="text-wine underline underline-offset-4 disabled:opacity-40"
        >
          Tambah {f.item.toLowerCase()}
        </button>
        {bulkMedia && !full && (
          <span className="relative cursor-pointer text-wine underline underline-offset-4 focus-within:outline-2 focus-within:outline-wine">
            Unggah beberapa foto
            <input
              type="file"
              multiple
              accept={ACCEPT.image}
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={async (e) => {
                const files = Array.from(e.target.files ?? []).slice(0, (f.max ?? 99) - items.length);
                e.target.value = "";
                let failed = 0;
                for (const [n, file] of files.entries()) {
                  setBulk(`Mengunggah ${n + 1} dari ${files.length}...`);
                  const res = await upload(file, bulkMedia.purpose);
                  if (!res.ok) {
                    failed++;
                    continue;
                  }
                  const item: Record<string, unknown> = { ...structuredClone(f.blank), [bulkMedia.path]: res.data.path };
                  if (bulkMedia.dims) Object.assign(item, { w: res.data.width ?? 0, h: res.data.height ?? 0 });
                  if ("alt" in item) item.alt = `Foto ${names}`;
                  add(item);
                }
                setBulk(failed ? `${failed} file gagal diunggah.` : "");
              }}
            />
          </span>
        )}
        {bulk && <span className="text-[13px] text-ink-mute">{bulk}</span>}
      </div>
    </div>
  );
}

export function FieldInput({ f, path }: { f: Field; path: string }) {
  const { data, update, errors } = useForm();
  const err = errors[path];
  const value = getIn(data, path);
  const set = (v: unknown) => update((d) => setIn(d, path, v));

  switch (f.kind) {
    case "heading":
      return <p className="border-b border-line pt-2 pb-1 text-[12px] tracking-[2px] text-ink-mute uppercase sm:col-span-2">{f.label}</p>;
    case "list":
      return (
        <div className="sm:col-span-2">
          <ListInput f={f} path={path} />
        </div>
      );
    case "media":
      return <MediaInput f={f} path={path} />;
    case "textarea":
      return (
        <div className="sm:col-span-2">
          <Label f={f} path={path} err={err}>
            <textarea rows={3} maxLength={f.max} placeholder={f.placeholder} value={String(value ?? "")} onChange={(e) => set(e.target.value)} className={`${input(err)} resize-y`} />
          </Label>
        </div>
      );
    case "text":
      return (
        <Label f={f} path={path} err={err}>
          <input
            type={f.format === "url" ? "url" : "text"}
            inputMode={f.format === "time" ? "decimal" : undefined}
            maxLength={f.max}
            placeholder={f.placeholder}
            value={String(value ?? "")}
            onChange={(e) => set(e.target.value)}
            className={input(err)}
          />
        </Label>
      );
    case "number":
      return (
        <Label f={f} path={path} err={err}>
          <input type="number" min={f.min} max={f.max} value={Number(value ?? 0)} onChange={(e) => set(Math.max(f.min, Math.min(f.max, Number(e.target.value) || 0)))} className={input(err)} />
        </Label>
      );
    case "select":
      return (
        <Label f={f} path={path} err={err}>
          <select
            value={String(value ?? "")}
            onChange={(e) => {
              const tz = e.target.value as keyof typeof TIMEZONES;
              update((d) => {
                let next = setIn(d, path, tz);
                if (path === "event.timezone") {
                  for (const k of ["start", "end"] as const) {
                    const v = d.event[k];
                    if (v) next = setIn(next, `event.${k}`, `${v.slice(0, 19)}${TIMEZONES[tz]}`);
                  }
                }
                return next;
              });
            }}
            className={input(err)}
          >
            {f.options.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Label>
      );
    case "datetime": {
      const tz = TIMEZONES[data.event.timezone];
      return (
        <Label f={f} path={path} err={err}>
          <input type="datetime-local" value={String(value ?? "").slice(0, 16)} onChange={(e) => set(e.target.value ? `${e.target.value}:00${tz}` : "")} className={input(err)} />
        </Label>
      );
    }
  }
}
