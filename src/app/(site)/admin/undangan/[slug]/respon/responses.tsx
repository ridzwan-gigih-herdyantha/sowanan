"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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

const ICONS = {
  hide: "M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A9.8 9.8 0 0 1 12 5c5 0 9 4.5 10 7-.4 1-1.2 2.3-2.4 3.5M6.6 6.6C4.6 7.9 3.1 9.9 2 12c1 2.5 5 7 10 7 1.7 0 3.3-.5 4.6-1.3",
  show: "M2 12c1-2.5 5-7 10-7s9 4.5 10 7c-1 2.5-5 7-10 7S3 14.5 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3",
};

// Tombol aksi berupa ikon. Teksnya tetap terbaca pembaca layar dan muncul sebagai tooltip.
function IconButton({ label, icon, busy, disabled, onClick }: { label: string; icon: keyof typeof ICONS; busy?: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex size-8 items-center justify-center rounded-sm text-ink-mute transition-colors duration-150 hover:bg-blush hover:text-wine disabled:opacity-50"
    >
      {busy ? (
        <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d={ICONS[icon]} />
        </svg>
      )}
    </button>
  );
}

// Jendela detail satu RSVP atau ucapan dari tampilan grid.
function Detail({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      className="m-auto w-[min(460px,calc(100vw-32px))] rounded-sm border border-line bg-white p-0 text-ink shadow-[0_20px_60px_rgba(0,0,0,.25)] backdrop:bg-ink/50"
    >
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="font-serif text-2xl leading-tight">{title}</h3>
          <button type="button" onClick={() => ref.current?.close()} aria-label="Tutup" className="-mt-1 -mr-2 rounded-sm px-2 py-1 text-[18px] text-ink-mute hover:bg-blush hover:text-ink">
            &times;
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
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
  // Tampilan daftar: baris (bawaan) atau kartu dalam grid.
  const [view, setView] = useState<"list" | "grid">("list");
  // Kotak di grid yang sedang dibuka detailnya.
  const [opened, setOpened] = useState<{ kind: "rsvp" | "wish"; id: number } | null>(null);
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
  const grid = view === "grid";
  // Data yang sudah dihapus otomatis menutup jendelanya, karena tidak ditemukan lagi.
  const openRsvp = opened?.kind === "rsvp" ? rsvps.find((r) => r.id === opened.id) : undefined;
  const openWish = opened?.kind === "wish" ? wishes.find((w) => w.id === opened.id) : undefined;
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
        <div role="group" aria-label="Tampilan" className="ml-auto flex rounded-sm border border-line bg-white p-0.5">
          {(
            [
              ["list", "List", "M4 6h16M4 12h16M4 18h16"],
              ["grid", "Grid", "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"],
            ] as const
          ).map(([k, label, d]) => (
            <button
              key={k}
              type="button"
              aria-pressed={view === k}
              aria-label={label}
              title={label}
              onClick={() => setView(k)}
              className={`flex size-8 items-center justify-center rounded-[3px] ${view === k ? "bg-wine text-white" : "text-ink-soft hover:text-ink"}`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d={d} />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mt-3 rounded-sm bg-blush px-4 py-3 text-[14px] text-wine">{error}</p>}
      {!list.length && <p className="mt-6 text-[15px] text-ink-mute">{query ? "Tidak ada yang cocok." : tab === "rsvp" ? "Belum ada konfirmasi kehadiran." : "Belum ada ucapan."}</p>}

      {grid ? (
        // Grid: kotak kecil berisi ringkasan dan ikon aksi di pojok. Klik kotaknya untuk membuka detail.
        <ul className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(96px,1fr))] gap-2 sm:grid-cols-[repeat(auto-fit,minmax(120px,1fr))]">
          {tab === "rsvp"
            ? rsvpList.slice(0, limit).map((r) => (
                <li key={r.id} className={`relative ${latest.get(key(r.name))?.id !== r.id ? "opacity-55" : ""}`}>
                  <button
                    type="button"
                    onClick={() => setOpened({ kind: "rsvp", id: r.id })}
                    className="flex h-28 w-full flex-col justify-between rounded-sm border border-line bg-white p-2.5 pr-10 text-left transition-colors duration-150 hover:border-wine"
                  >
                    <span className="line-clamp-3 text-[13px] leading-snug font-medium">{r.name}</span>
                    <span className={`self-start rounded-full px-2 py-0.5 text-[11px] ${r.attending ? "bg-wine text-white" : "bg-blush text-ink-soft"}`}>{r.attending ? `Hadir ${r.guests}` : "Tidak hadir"}</span>
                  </button>
                  <span className="absolute right-1 bottom-1">
                    <IconButton label="Hapus" icon="trash" busy={working === `hapus:rsvp:${r.id}`} disabled={working !== null} onClick={() => remove("rsvp", r.id, r.name)} />
                  </span>
                </li>
              ))
            : wishList.slice(0, limit).map((w) => (
                <li key={w.id} className="relative">
                  <button
                    type="button"
                    onClick={() => setOpened({ kind: "wish", id: w.id })}
                    className={`flex h-36 w-full flex-col overflow-hidden rounded-sm border bg-white p-2.5 pb-10 text-left transition-colors duration-150 hover:border-wine ${w.hidden_at ? "border-dashed border-ink-mute/50" : "border-line"}`}
                  >
                    <span className={`truncate text-[13px] font-medium ${w.hidden_at ? "text-ink-mute" : ""}`}>{w.name}</span>
                    <span className={`mt-1 line-clamp-3 text-[12px] leading-snug ${w.hidden_at ? "text-ink-mute" : "text-ink-soft"}`}>{w.message}</span>
                  </button>
                  <span className="absolute right-1 bottom-1 flex">
                    <IconButton
                      label={w.hidden_at ? "Tampilkan di undangan" : "Sembunyikan dari undangan"}
                      icon={w.hidden_at ? "show" : "hide"}
                      busy={working === `sembunyi:${w.id}`}
                      disabled={working !== null}
                      onClick={() => toggleHidden(w)}
                    />
                    <IconButton label="Hapus" icon="trash" busy={working === `hapus:wish:${w.id}`} disabled={working !== null} onClick={() => remove("wish", w.id, w.name)} />
                  </span>
                </li>
              ))}
        </ul>
      ) : (
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
                    <IconButton label="Hapus" icon="trash" busy={working === `hapus:rsvp:${r.id}`} disabled={working !== null} onClick={() => remove("rsvp", r.id, r.name)} />
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
                      <span className="-my-1 flex shrink-0 gap-1">
                        <IconButton
                          label={w.hidden_at ? "Tampilkan di undangan" : "Sembunyikan dari undangan"}
                          icon={w.hidden_at ? "show" : "hide"}
                          busy={working === `sembunyi:${w.id}`}
                          disabled={working !== null}
                          onClick={() => toggleHidden(w)}
                        />
                        <IconButton label="Hapus" icon="trash" busy={working === `hapus:wish:${w.id}`} disabled={working !== null} onClick={() => remove("wish", w.id, w.name)} />
                      </span>
                    </div>
                    <p className={`mt-1 text-[15px] whitespace-pre-line ${w.hidden_at ? "text-ink-mute" : "text-ink-soft"}`}>{w.message}</p>
                    <p className="mt-1 text-[12px] text-ink-mute">{timeFmt.format(new Date(w.created_at))}</p>
                  </li>
                );
              })}
        </ul>
      )}

      {openRsvp && (
        <Detail title={openRsvp.name} onClose={() => setOpened(null)}>
          <span className={`inline-block rounded-full px-2.5 py-0.5 text-[12px] ${openRsvp.attending ? "bg-wine text-white" : "bg-blush text-ink-soft"}`}>
            {openRsvp.attending ? `Hadir, ${openRsvp.guests} orang` : "Tidak hadir"}
          </span>
          <p className="mt-3 text-[14px] text-ink-mute">
            {timeFmt.format(new Date(openRsvp.created_at))}
            {invited.has(key(openRsvp.name)) && " · di daftar tamu"}
            {latest.get(key(openRsvp.name))?.id !== openRsvp.id && " · diganti konfirmasi terbaru"}
          </p>
          <div className="mt-6 flex justify-end">
            <button type="button" onClick={() => remove("rsvp", openRsvp.id, openRsvp.name)} disabled={working !== null} className="rounded-sm border border-line px-4 py-2 text-[14px] text-ink-soft hover:border-wine hover:text-wine disabled:opacity-60">
              {working === `hapus:rsvp:${openRsvp.id}` ? "Menghapus..." : "Hapus"}
            </button>
          </div>
        </Detail>
      )}
      {openWish && (
        <Detail title={openWish.name} onClose={() => setOpened(null)}>
          {openWish.hidden_at && (
            <span className="mb-3 inline-block rounded-full bg-blush px-2 py-0.5 text-[12px] text-ink-soft">Disembunyikan {openWish.hidden_by === "mempelai" ? "mempelai" : "admin"}</span>
          )}
          <p className={`text-[16px] leading-relaxed whitespace-pre-line ${openWish.hidden_at ? "text-ink-mute" : "text-ink"}`}>{openWish.message}</p>
          <p className="mt-3 text-[13px] text-ink-mute">{timeFmt.format(new Date(openWish.created_at))}</p>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={() => toggleHidden(openWish)} disabled={working !== null} className="rounded-sm border border-line px-4 py-2 text-[14px] text-ink-soft hover:border-wine hover:text-wine disabled:opacity-60">
              {working === `sembunyi:${openWish.id}` ? "Menyimpan..." : openWish.hidden_at ? "Tampilkan" : "Sembunyikan"}
            </button>
            <button type="button" onClick={() => remove("wish", openWish.id, openWish.name)} disabled={working !== null} className="rounded-sm border border-line px-4 py-2 text-[14px] text-ink-soft hover:border-wine hover:text-wine disabled:opacity-60">
              {working === `hapus:wish:${openWish.id}` ? "Menghapus..." : "Hapus"}
            </button>
          </div>
        </Detail>
      )}

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
