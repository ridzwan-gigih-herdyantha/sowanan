"use client";

import { useMemo, useState } from "react";
import { useWorking } from "@/app/(site)/admin/use-working";
import { rsvpSheet } from "@/lib/export/rsvp-sheet";
import { guestLink } from "@/lib/guests";
import { coupleHideWish } from "../actions";

export type BoardRsvp = { id: number; name: string; attending: boolean; guests: number; created_at: string };
export type BoardWish = { id: number; name: string; message: string; created_at: string; hidden_at: string | null; hidden_by: "admin" | "mempelai" | null };
export type BoardGuest = { id: number; name: string; sent_at: string | null; qr_token: string | null; checked_in_at: string | null; walk_in: boolean };

type Tab = "rsvp" | "wish" | "guest" | "checkin";
type Props = {
  slug: string;
  origin: string;
  rsvps: BoardRsvp[];
  wishes: BoardWish[];
  guests: BoardGuest[];
  // Fitur paket. Teks berisi alasan kalau tidak termasuk paket.
  excelLock: string | null;
  qr: boolean;
  personalLinks: boolean;
};

const PAGE = 50;
const field = "block w-full rounded-sm border border-line bg-white px-3 py-2.5 text-base outline-none focus:border-wine";
const timeFmt = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
const clockFmt = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
const key = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

async function saveXlsx(name: string, data: import("write-excel-file/browser").SheetData, options: import("write-excel-file/browser").SheetOptions<Blob>) {
  const { default: writeXlsxFile } = await import("write-excel-file/browser");
  await writeXlsxFile(data, options).toFile(name);
}

function Stat({ label, value, note }: { label: string; value: number | string; note?: string }) {
  return (
    <div className="rounded-sm border border-line bg-white p-4">
      <p className="text-[13px] text-ink-mute">{label}</p>
      <p className="mt-1 font-serif text-3xl leading-none lining-nums">{value}</p>
      {note && <p className="mt-1.5 text-[12px] text-ink-mute">{note}</p>}
    </div>
  );
}

// Isi dashboard mempelai. Semua data hanya dibaca, kecuali tombol sembunyikan ucapan.
export function CoupleBoard({ slug, origin, rsvps, wishes: initialWishes, guests, excelLock, qr, personalLinks }: Props) {
  const [wishes, setWishes] = useState(initialWishes);
  const [tab, setTab] = useState<Tab>("rsvp");
  const [filter, setFilter] = useState<"all" | "yes" | "no">("all");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const [copied, setCopied] = useState<number | null>(null);
  const [error, setError] = useState("");
  const { working, run } = useWorking(setError);

  // Konfirmasi ganda dari nama yang sama dihitung sekali, pakai yang terbaru.
  const latest = useMemo(() => {
    const map = new Map<string, BoardRsvp>();
    for (const r of rsvps) if (!map.has(key(r.name))) map.set(key(r.name), r);
    return [...map.values()];
  }, [rsvps]);
  const yes = latest.filter((r) => r.attending);
  const people = yes.reduce((n, r) => n + r.guests, 0);
  const present = useMemo(() => guests.filter((g) => g.checked_in_at).sort((a, b) => Date.parse(b.checked_in_at!) - Date.parse(a.checked_in_at!)), [guests]);
  const invited = guests.filter((g) => !g.walk_in);
  const hiddenCount = wishes.filter((w) => w.hidden_at).length;
  const link = (g: BoardGuest) => guestLink(origin, slug, g.name, qr ? g.qr_token : null);

  const q = key(query);
  const lists = {
    rsvp: rsvps.filter((r) => (filter === "all" || r.attending === (filter === "yes")) && (!q || key(r.name).includes(q))),
    wish: wishes.filter((w) => !q || key(w.name).includes(q) || w.message.toLowerCase().includes(q)),
    guest: invited.filter((g) => !q || key(g.name).includes(q)),
    checkin: present.filter((g) => !q || key(g.name).includes(q)),
  };
  const list = lists[tab];

  const tabs: [Tab, string][] = [
    ["rsvp", `RSVP ${rsvps.length}`],
    ["wish", `Ucapan ${wishes.length}`],
    ["guest", `Tamu ${invited.length}`],
    ...(qr ? ([["checkin", `Absensi ${present.length}`]] as [Tab, string][]) : []),
  ];

  function toggleHidden(w: BoardWish) {
    const hide = !w.hidden_at;
    run(`sembunyi:${w.id}`, async () => {
      const res = await coupleHideWish(slug, w.id, hide);
      if (!res.ok) return setError(res.error);
      setError("");
      setWishes((l) => l.map((x) => (x.id === w.id ? { ...x, hidden_at: res.hiddenAt, hidden_by: hide ? "mempelai" : null } : x)));
    });
  }

  async function exportXlsx() {
    const head = (value: string) => ({ value, fontWeight: "bold" as const, backgroundColor: "#F2F2F2" });
    if (tab === "rsvp") {
      const invitedNames = new Set(invited.map((g) => key(g.name)));
      const { data, options } = rsvpSheet(latest.map((r) => ({ name: r.name, attending: r.attending, guests: r.guests, time: timeFmt.format(new Date(r.created_at)), invited: invitedNames.has(key(r.name)) })));
      return saveXlsx(`rsvp-${slug}.xlsx`, data, options);
    }
    if (tab === "wish") {
      return saveXlsx(
        `ucapan-${slug}.xlsx`,
        [
          [head("Nama"), head("Ucapan"), head("Waktu"), head("Status")],
          ...wishes.map((w) => [w.name, { value: w.message, wrap: true, alignVertical: "top" as const }, timeFmt.format(new Date(w.created_at)), w.hidden_at ? "Disembunyikan" : "Tampil"]),
        ],
        { sheet: "Ucapan", columns: [{ width: 24 }, { width: 70 }, { width: 20 }, { width: 16 }], stickyRowsCount: 1 },
      );
    }
    const rows = tab === "guest" ? invited : present;
    return saveXlsx(
      `${tab === "guest" ? "tamu" : "absensi"}-${slug}.xlsx`,
      [
        [head("Nama"), ...(personalLinks ? [head("Link undangan")] : []), head("Link terkirim"), ...(qr ? [head("Hadir"), head("Keterangan")] : [])],
        ...rows.map((g) => [
          g.name,
          ...(personalLinks ? [link(g)] : []),
          g.sent_at ? timeFmt.format(new Date(g.sent_at)) : "",
          ...(qr ? [g.checked_in_at ? timeFmt.format(new Date(g.checked_in_at)) : "", g.walk_in ? "Datang langsung" : "Tamu undangan"] : []),
        ]),
      ],
      { sheet: tab === "guest" ? "Daftar tamu" : "Absensi", columns: [{ width: 30 }, ...(personalLinks ? [{ width: 60 }] : []), { width: 20 }, ...(qr ? [{ width: 20 }, { width: 18 }] : [])], stickyRowsCount: 1 },
    );
  }

  const empty = { rsvp: "Belum ada konfirmasi kehadiran.", wish: "Belum ada ucapan.", guest: "Daftar tamu belum diisi.", checkin: "Belum ada tamu yang hadir." }[tab];

  return (
    <div className="mt-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Akan hadir" value={people} note={`${yes.length} konfirmasi`} />
        <Stat label="Tidak hadir" value={latest.length - yes.length} note="konfirmasi" />
        <Stat label="Ucapan" value={wishes.length} note={hiddenCount ? `${hiddenCount} disembunyikan` : undefined} />
        {qr ? <Stat label="Sudah datang" value={present.length} note={`dari ${invited.length} tamu undangan`} /> : <Stat label="Tamu undangan" value={invited.length} />}
      </div>

      <div role="tablist" className="mt-8 flex overflow-x-auto border-b border-line text-[15px] [scrollbar-width:none]">
        {tabs.map(([k, label]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            onClick={() => {
              setTab(k);
              setLimit(PAGE);
            }}
            className={`relative shrink-0 px-4 py-2.5 ${tab === k ? "text-wine" : "text-ink-soft hover:text-ink"}`}
          >
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
          placeholder={tab === "wish" ? "Cari nama atau isi ucapan" : "Cari nama"}
          className={`${field} w-full sm:max-w-xs sm:flex-1`}
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
        {list.length > 0 && excelLock && <span className="max-w-xs text-[12px] text-ink-mute">{excelLock}</span>}
        {list.length > 0 && !excelLock && (
          <button type="button" onClick={() => run("excel", exportXlsx)} disabled={working !== null} className="text-[14px] text-wine underline underline-offset-4 disabled:opacity-60">
            {working === "excel" ? "Menyiapkan Excel..." : "Unduh Excel"}
          </button>
        )}
      </div>

      {error && <p className="mt-3 rounded-sm bg-blush px-4 py-3 text-[14px] text-wine">{error}</p>}
      {!list.length && <p className="mt-6 text-[15px] text-ink-mute">{query ? "Tidak ada yang cocok." : empty}</p>}

      <ul className="mt-4 divide-y divide-line border-y border-line empty:border-0">
        {tab === "rsvp" &&
          lists.rsvp.slice(0, limit).map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
              <div className="min-w-0 flex-1 basis-40">
                <p className="truncate font-medium">{r.name}</p>
                <p className="text-[13px] text-ink-mute">{timeFmt.format(new Date(r.created_at))}</p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-[12px] ${r.attending ? "bg-wine text-white" : "bg-blush text-ink-soft"}`}>{r.attending ? `Hadir, ${r.guests} orang` : "Tidak hadir"}</span>
            </li>
          ))}
        {tab === "wish" &&
          lists.wish.slice(0, limit).map((w) => {
            const byAdmin = w.hidden_by === "admin";
            return (
              <li key={w.id} aria-busy={working === `sembunyi:${w.id}` || undefined} className={`py-4 transition-opacity duration-150 ${working === `sembunyi:${w.id}` ? "opacity-55" : ""}`}>
                <div className="flex items-baseline justify-between gap-4">
                  <p className={`min-w-0 truncate font-medium ${w.hidden_at ? "text-ink-mute" : ""}`}>
                    {w.name}
                    {w.hidden_at && (
                      <span className="ml-2 rounded-full bg-blush px-2 py-0.5 text-[11px] font-normal text-ink-soft">{byAdmin ? "Disembunyikan tim Sowanan" : "Disembunyikan"}</span>
                    )}
                  </p>
                  {!byAdmin && (
                    <button type="button" onClick={() => toggleHidden(w)} disabled={working !== null} className="shrink-0 text-[14px] text-ink-mute hover:text-wine disabled:opacity-60">
                      {working === `sembunyi:${w.id}` ? "Menyimpan..." : w.hidden_at ? "Tampilkan" : "Sembunyikan"}
                    </button>
                  )}
                </div>
                <p className={`mt-1 text-[15px] whitespace-pre-line ${w.hidden_at ? "text-ink-mute" : "text-ink-soft"}`}>{w.message}</p>
                <p className="mt-1 text-[12px] text-ink-mute">{timeFmt.format(new Date(w.created_at))}</p>
              </li>
            );
          })}
        {tab === "guest" &&
          lists.guest.slice(0, limit).map((g) => (
            <li key={g.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
              <div className="min-w-0 flex-1 basis-40">
                <p className="truncate font-medium">{g.name}</p>
                <p className="text-[13px] text-ink-mute">
                  {g.sent_at ? `Link terkirim ${timeFmt.format(new Date(g.sent_at))}` : "Link belum dikirim"}
                  {qr && g.checked_in_at && ` · hadir ${clockFmt.format(new Date(g.checked_in_at))}`}
                </p>
              </div>
              {personalLinks && (
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(link(g));
                    setCopied(g.id);
                    setTimeout(() => setCopied((c) => (c === g.id ? null : c)), 1500);
                  }}
                  className="text-[14px] text-wine underline underline-offset-4"
                >
                  {copied === g.id ? "Tersalin" : "Salin link"}
                </button>
              )}
            </li>
          ))}
        {tab === "checkin" &&
          lists.checkin.slice(0, limit).map((g) => (
            <li key={g.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
              <p className="min-w-0 flex-1 basis-40 truncate font-medium">{g.name}</p>
              {g.walk_in && <span className="rounded-full bg-blush px-2.5 py-0.5 text-[12px] text-ink-soft">Datang langsung</span>}
              <span className="text-[14px] text-ink-soft tabular-nums">{clockFmt.format(new Date(g.checked_in_at!))}</span>
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
