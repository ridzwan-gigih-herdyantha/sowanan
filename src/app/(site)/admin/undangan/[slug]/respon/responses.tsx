"use client";

import { useMemo, useState } from "react";
import { rsvpSheet } from "@/lib/export/rsvp-sheet";
import { useWorking } from "../../../use-working";
import { markArchiveNotified } from "../../actions";
import { deleteResponse, hideWish } from "./actions";

type Rsvp = { id: number; name: string; attending: boolean; guests: number; created_at: string };
type Wish = { id: number; name: string; message: string; created_at: string; hidden_at: string | null; hidden_by: "admin" | "mempelai" | null };
// Pemberitahuan arsip ke klien, muncul sejak tujuh hari sebelum undangan dibekukan.
export type ArchiveNotice = { archiveAt: string; archived: boolean; notifiedAt: string | null; couple: string };
type Props = { slug: string; rsvps: Rsvp[]; wishes: Wish[]; guestNames: string[]; exportLock?: string; notice?: ArchiveNotice };

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

export function Responses({ slug, rsvps: initialRsvps, wishes: initialWishes, guestNames, exportLock, notice }: Props) {
  const [rsvps, setRsvps] = useState(initialRsvps);
  const [wishes, setWishes] = useState(initialWishes);
  const [tab, setTab] = useState<"rsvp" | "wish">("rsvp");
  const [filter, setFilter] = useState<"all" | "yes" | "no">("all");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const [error, setError] = useState("");
  const { working, run } = useWorking(setError);

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

  function remove(kind: "rsvp" | "wish", id: number, name: string) {
    if (!confirm(kind === "wish" ? `Hapus ucapan dari ${name}? Ucapan juga hilang dari halaman undangan.` : `Hapus konfirmasi dari ${name}?`)) return;
    run(`hapus:${kind}:${id}`, async () => {
      const res = await deleteResponse(slug, kind, id);
      if (!res.ok) return setError(res.error);
      setError("");
      if (kind === "rsvp") setRsvps((l) => l.filter((r) => r.id !== id));
      else setWishes((l) => l.filter((w) => w.id !== id));
    });
  }

  // Ucapan yang disembunyikan tetap tersimpan, hanya tidak tampil di undangan.
  function toggleHidden(w: Wish) {
    const hide = !w.hidden_at;
    run(`sembunyi:${w.id}`, async () => {
      const res = await hideWish(slug, w.id, hide);
      if (!res.ok) return setError(res.error);
      setError("");
      setWishes((l) => l.map((x) => (x.id === w.id ? { ...x, hidden_at: res.hiddenAt, hidden_by: hide ? "admin" : null } : x)));
    });
  }
  const hiddenCount = wishes.filter((w) => w.hidden_at).length;

  async function exportXlsx(which: "rsvp" | "wish" = tab) {
    if (which === "rsvp") {
      const rows = unique.map((r) => ({ name: r.name, attending: r.attending, guests: r.guests, time: timeFmt.format(new Date(r.created_at)), invited: invited.has(key(r.name)) }));
      const { data, options } = rsvpSheet(rows);
      await saveXlsx(`rsvp-${slug}.xlsx`, data, options);
    } else {
      const head = (value: string) => ({ value, fontWeight: "bold" as const, backgroundColor: "#F2F2F2" });
      await saveXlsx(
        `ucapan-${slug}.xlsx`,
        [
          [head("Nama"), head("Ucapan"), head("Waktu"), head("Status")],
          ...wishes.map((w) => [w.name, { value: w.message, wrap: true, alignVertical: "top" as const }, timeFmt.format(new Date(w.created_at)), w.hidden_at ? "Disembunyikan" : "Tampil"]),
        ],
        { sheet: "Ucapan", columns: [{ width: 24 }, { width: 70 }, { width: 20 }, { width: 16 }], stickyRowsCount: 1 },
      );
    }
  }

  const switchTab = (t: "rsvp" | "wish") => {
    setTab(t);
    setLimit(PAGE);
  };

  return (
    <div className="mt-8">
      {notice && (
        <ArchivePanel
          slug={slug}
          notice={notice}
          onExport={async () => {
            await exportXlsx("rsvp");
            await exportXlsx("wish");
          }}
        />
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Hadir" value={people} note={`${yes.length} konfirmasi`} />
        <Stat label="Tidak hadir" value={unique.length - yes.length} note="konfirmasi" />
        <Stat
          label={guestNames.length ? "Tamu undangan menjawab" : "Nama yang konfirmasi"}
          value={guestNames.length ? `${answeredInvited}/${guestNames.length}` : unique.length}
          note={guestNames.length ? "dicocokkan dari nama" : "belum ada daftar tamu"}
        />
        <Stat label="Ucapan" value={wishes.length} note={hiddenCount ? `${hiddenCount} disembunyikan` : undefined} />
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
        {list.length > 0 && exportLock && <span className="max-w-xs text-[12px] text-ink-mute">{exportLock}</span>}
        {list.length > 0 && !exportLock && (
          <button type="button" onClick={() => run("excel", () => exportXlsx())} disabled={working !== null} className="text-[14px] text-wine underline underline-offset-4 disabled:opacity-60">
            {working === "excel" ? "Menyiapkan Excel..." : "Unduh Excel"}
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
                <li key={r.id} aria-busy={working === `hapus:rsvp:${r.id}` || undefined} className={`flex flex-wrap items-center gap-x-4 gap-y-1 py-3 transition-opacity duration-150 ${stale || working === `hapus:rsvp:${r.id}` ? "opacity-55" : ""}`}>
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
                  <button type="button" onClick={() => remove("rsvp", r.id, r.name)} disabled={working !== null} className="text-[14px] text-ink-mute hover:text-wine disabled:opacity-60">
                    {working === `hapus:rsvp:${r.id}` ? "Menghapus..." : "Hapus"}
                  </button>
                </li>
              );
            })
          : wishList.slice(0, limit).map((w) => {
              const busy = working === `hapus:wish:${w.id}` || working === `sembunyi:${w.id}`;
              return (
                <li key={w.id} aria-busy={busy || undefined} className={`py-4 transition-opacity duration-150 ${busy ? "opacity-55" : ""}`}>
                  <div className="flex items-baseline justify-between gap-4">
                    <p className={`min-w-0 truncate font-medium ${w.hidden_at ? "text-ink-mute" : ""}`}>
                      {w.name}
                      {w.hidden_at && (
                        <span className="ml-2 rounded-full bg-blush px-2 py-0.5 text-[11px] font-normal text-ink-soft">
                          Disembunyikan {w.hidden_by === "mempelai" ? "mempelai" : "admin"}
                        </span>
                      )}
                    </p>
                    <span className="flex shrink-0 gap-4 text-[14px]">
                      <button type="button" onClick={() => toggleHidden(w)} disabled={working !== null} className="text-ink-mute hover:text-wine disabled:opacity-60">
                        {working === `sembunyi:${w.id}` ? "Menyimpan..." : w.hidden_at ? "Tampilkan" : "Sembunyikan"}
                      </button>
                      <button type="button" onClick={() => remove("wish", w.id, w.name)} disabled={working !== null} className="text-ink-mute hover:text-wine disabled:opacity-60">
                        {working === `hapus:wish:${w.id}` ? "Menghapus..." : "Hapus"}
                      </button>
                    </span>
                  </div>
                  <p className={`mt-1 text-[15px] whitespace-pre-line ${w.hidden_at ? "text-ink-mute" : "text-ink-soft"}`}>{w.message}</p>
                  <p className="mt-1 text-[12px] text-ink-mute">{timeFmt.format(new Date(w.created_at))}</p>
                </li>
              );
            })}
      </ul>

      {list.length > limit && (
        <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="mt-4 text-[14px] text-wine underline underline-offset-4">
          Tampilkan {Math.min(PAGE, list.length - limit)} lagi
        </button>
      )}
    </div>
  );
}

function ArchivePanel({ slug, notice, onExport }: { slug: string; notice: ArchiveNotice; onExport: () => Promise<void> }) {
  const [notifiedAt, setNotifiedAt] = useState(notice.notifiedAt);
  const [status, setStatus] = useState("");
  const { working, run } = useWorking(setStatus);
  const message = [
    `Halo ${notice.couple || "kakak"}, undangan pernikahan kalian di sowanan.com/${slug} akan menjadi arsip permanen pada ${notice.archiveAt}.`,
    "Setelah itu undangan tetap bisa dibuka selamanya di alamat yang sama, tetapi konfirmasi kehadiran, ucapan baru, amplop digital, hitung mundur, dan tautan nama tamu berhenti.",
    "Terlampir daftar tamu yang sudah konfirmasi dan rekap ucapan untuk kalian simpan. Terima kasih sudah memakai Sowanan.",
  ].join("\n\n");

  const mark = (value: boolean) =>
    run("tandai", async () => {
      const res = await markArchiveNotified(slug, value);
      if (!res.ok) return setStatus(res.error);
      setNotifiedAt(value ? res.at : null);
      setStatus(value ? "Ditandai sudah dikirim." : "Tanda dibatalkan.");
    });

  return (
    <section className={`mb-6 rounded-sm border p-4 text-[14px] ${notifiedAt ? "border-line bg-white" : "border-wine/40 bg-blush/60"}`}>
      <p className="font-medium text-wine">{notice.archived ? `Undangan ini menjadi arsip sejak ${notice.archiveAt}` : `Undangan ini menjadi arsip pada ${notice.archiveAt}`}</p>
      <p className="mt-1 text-ink-soft">
        {notifiedAt
          ? `Klien sudah diberi tahu pada ${new Date(notifiedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" })}.`
          : "Kirim pemberitahuan ke klien beserta daftar tamu dan rekap ucapan, lalu tandai sudah dikirim."}
      </p>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
        <button type="button" onClick={() => run("rekap", onExport)} disabled={working !== null} className="text-wine underline underline-offset-4 disabled:opacity-60">
          {working === "rekap" ? "Menyiapkan file..." : "Unduh daftar tamu dan rekap ucapan"}
        </button>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(message);
            setStatus("Pesan disalin. Tempel di WhatsApp klien.");
          }}
          className="text-wine underline underline-offset-4"
        >
          Salin pesan untuk klien
        </button>
        <button type="button" onClick={() => mark(!notifiedAt)} disabled={working !== null} className="text-ink-mute underline underline-offset-4 hover:text-wine disabled:opacity-60">
          {working === "tandai" ? "Menyimpan..." : notifiedAt ? "Batalkan tanda sudah dikirim" : "Tandai sudah dikirim"}
        </button>
      </div>
      {status && (
        <p role="status" className="mt-2 text-[13px] text-ink-mute">
          {status}
        </p>
      )}
    </section>
  );
}
