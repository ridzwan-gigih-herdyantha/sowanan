"use client";

import { useMemo, useState } from "react";
import { rsvpSheet } from "@/lib/export/rsvp-sheet";
import { deleteResponse } from "./actions";

type Rsvp = { id: number; name: string; attending: boolean; guests: number; created_at: string };
type Wish = { id: number; name: string; message: string; created_at: string };
type Props = { slug: string; rsvps: Rsvp[]; wishes: Wish[]; guestNames: string[] };

const PAGE = 50;
const field = "block w-full rounded-sm border border-line bg-white px-3 py-2.5 text-base outline-none focus:border-wine";
const timeFmt = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
const key = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

async function saveXlsx(name: string, data: import("write-excel-file/browser").SheetData, options: import("write-excel-file/browser").SheetOptions<Blob>) {
  const { default: writeXlsxFile } = await import("write-excel-file/browser");
  await writeXlsxFile(data, options).toFile(name);
}

function Stat({ label, value, note }: { label: string; value: number | string; note?: string }) {
  return (
    <div className="rounded-sm border border-line bg-white p-4">
      <p className="text-[13px] text-ink-mute">{label}</p>
      <p className="mt-1 font-serif text-3xl leading-none">{value}</p>
      {note && <p className="mt-1.5 text-[12px] text-ink-mute">{note}</p>}
    </div>
  );
}

export function Responses({ slug, rsvps: initialRsvps, wishes: initialWishes, guestNames }: Props) {
  const [rsvps, setRsvps] = useState(initialRsvps);
  const [wishes, setWishes] = useState(initialWishes);
  const [tab, setTab] = useState<"rsvp" | "wish">("rsvp");
  const [filter, setFilter] = useState<"all" | "yes" | "no">("all");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const [error, setError] = useState("");

  const invited = useMemo(() => new Set(guestNames.map(key)), [guestNames]);

  // Respon ganda dari nama yang sama dihitung sekali, pakai yang terbaru.
  const latest = useMemo(() => {
    const map = new Map<string, Rsvp>();
    for (const r of rsvps) if (!map.has(key(r.name))) map.set(key(r.name), r);
    return map;
  }, [rsvps]);
  const unique = [...latest.values()];
  const yes = unique.filter((r) => r.attending);
  const people = yes.reduce((n, r) => n + r.guests, 0);
  const duplicates = rsvps.length - unique.length;
  const answeredInvited = [...latest.keys()].filter((k) => invited.has(k)).length;

  const q = key(query);
  const rsvpList = rsvps.filter((r) => (filter === "all" || r.attending === (filter === "yes")) && (!q || key(r.name).includes(q)));
  const wishList = wishes.filter((w) => !q || key(w.name).includes(q) || w.message.toLowerCase().includes(q));
  const list = tab === "rsvp" ? rsvpList : wishList;

  async function remove(kind: "rsvp" | "wish", id: number, name: string) {
    if (!confirm(kind === "wish" ? `Hapus ucapan dari ${name}? Ucapan juga hilang dari halaman undangan.` : `Hapus konfirmasi dari ${name}?`)) return;
    const res = await deleteResponse(slug, kind, id);
    if (!res.ok) return setError(res.error);
    setError("");
    if (kind === "rsvp") setRsvps((l) => l.filter((r) => r.id !== id));
    else setWishes((l) => l.filter((w) => w.id !== id));
  }

  async function exportXlsx() {
    if (tab === "rsvp") {
      const rows = unique.map((r) => ({ name: r.name, attending: r.attending, guests: r.guests, time: timeFmt.format(new Date(r.created_at)), invited: invited.has(key(r.name)) }));
      const { data, options } = rsvpSheet(rows);
      await saveXlsx(`rsvp-${slug}.xlsx`, data, options);
    } else {
      const head = (value: string) => ({ value, fontWeight: "bold" as const, backgroundColor: "#F2F2F2" });
      await saveXlsx(
        `ucapan-${slug}.xlsx`,
        [[head("Nama"), head("Ucapan"), head("Waktu")], ...wishes.map((w) => [w.name, { value: w.message, wrap: true, alignVertical: "top" as const }, timeFmt.format(new Date(w.created_at))])],
        { sheet: "Ucapan", columns: [{ width: 24 }, { width: 70 }, { width: 20 }], stickyRowsCount: 1 },
      );
    }
  }

  const switchTab = (t: "rsvp" | "wish") => {
    setTab(t);
    setLimit(PAGE);
  };

  return (
    <div className="mt-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Hadir" value={people} note={`${yes.length} konfirmasi`} />
        <Stat label="Tidak hadir" value={unique.length - yes.length} note="konfirmasi" />
        <Stat
          label={guestNames.length ? "Tamu undangan menjawab" : "Nama yang konfirmasi"}
          value={guestNames.length ? `${answeredInvited}/${guestNames.length}` : unique.length}
          note={guestNames.length ? "dicocokkan dari nama" : "belum ada daftar tamu"}
        />
        <Stat label="Ucapan" value={wishes.length} />
      </div>
      {duplicates > 0 && <p className="mt-3 text-[13px] text-ink-mute">{duplicates} konfirmasi ganda dari nama yang sama. Angka di atas memakai konfirmasi terbaru.</p>}

      <div role="tablist" className="mt-8 flex border-b border-line text-[15px]">
        {(
          [
            ["rsvp", `RSVP ${rsvps.length}`],
            ["wish", `Ucapan ${wishes.length}`],
          ] as const
        ).map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => switchTab(k)} className={`relative px-4 py-2.5 ${tab === k ? "text-wine" : "text-ink-soft hover:text-ink"}`}>
            {label}
            {tab === k && <span className="absolute inset-x-3 -bottom-px h-0.5 bg-wine" aria-hidden="true" />}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setLimit(PAGE);
          }}
          placeholder={tab === "rsvp" ? "Cari nama" : "Cari nama atau isi ucapan"}
          className={`${field} max-w-xs flex-1`}
        />
        {tab === "rsvp" && (
          <div className="flex gap-1 text-[13px]">
            {(
              [
                ["all", "Semua"],
                ["yes", "Hadir"],
                ["no", "Tidak hadir"],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                aria-pressed={filter === k}
                onClick={() => {
                  setFilter(k);
                  setLimit(PAGE);
                }}
                className={`rounded-full border px-3 py-1.5 ${filter === k ? "border-wine bg-wine text-white" : "border-line bg-white text-ink-soft"}`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
        {list.length > 0 && (
          <button type="button" onClick={exportXlsx} className="text-[14px] text-wine underline underline-offset-4">
            Unduh Excel
          </button>
        )}
      </div>

      {error && <p className="mt-3 rounded-sm bg-blush px-4 py-3 text-[14px] text-wine">{error}</p>}
      {!list.length && <p className="mt-6 text-[15px] text-ink-mute">{query ? "Tidak ada yang cocok." : tab === "rsvp" ? "Belum ada konfirmasi kehadiran." : "Belum ada ucapan."}</p>}

      <ul className="mt-4 divide-y divide-line border-y border-line empty:border-0">
        {tab === "rsvp"
          ? rsvpList.slice(0, limit).map((r) => {
              const stale = latest.get(key(r.name))?.id !== r.id;
              return (
                <li key={r.id} className={`flex flex-wrap items-center gap-x-4 gap-y-1 py-3 ${stale ? "opacity-55" : ""}`}>
                  <div className="min-w-0 flex-1 basis-40">
                    <p className="truncate font-medium">{r.name}</p>
                    <p className="text-[13px] text-ink-mute">
                      {timeFmt.format(new Date(r.created_at))}
                      {invited.has(key(r.name)) && " · di daftar tamu"}
                      {stale && " · diganti konfirmasi terbaru"}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[12px] ${r.attending ? "bg-wine text-white" : "bg-blush text-ink-soft"}`}>
                    {r.attending ? `Hadir, ${r.guests} orang` : "Tidak hadir"}
                  </span>
                  <button type="button" onClick={() => remove("rsvp", r.id, r.name)} className="text-[14px] text-ink-mute hover:text-wine">
                    Hapus
                  </button>
                </li>
              );
            })
          : wishList.slice(0, limit).map((w) => (
              <li key={w.id} className="py-4">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="min-w-0 truncate font-medium">{w.name}</p>
                  <button type="button" onClick={() => remove("wish", w.id, w.name)} className="shrink-0 text-[14px] text-ink-mute hover:text-wine">
                    Hapus
                  </button>
                </div>
                <p className="mt-1 text-[15px] whitespace-pre-line text-ink-soft">{w.message}</p>
                <p className="mt-1 text-[12px] text-ink-mute">{timeFmt.format(new Date(w.created_at))}</p>
              </li>
            ))}
      </ul>

      {list.length > limit && (
        <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="mt-4 text-[14px] text-wine underline underline-offset-4">
          Tampilkan {Math.min(PAGE, list.length - limit)} lagi
        </button>
      )}
    </div>
  );
}
