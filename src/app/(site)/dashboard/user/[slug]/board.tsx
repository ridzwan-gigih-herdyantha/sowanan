"use client";

import { useMemo, useState } from "react";
import { useWorking } from "@/app/(site)/admin/use-working";
import { PrivatePanel, SessionSelect, type PrivateActions, type PrivateMode } from "@/components/private-panel";
import { rsvpSheet } from "@/lib/export/rsvp-sheet";
import { fillGuestMessage, guestLink, parseGuestText, privateLink, type GuestRow } from "@/lib/guests";
import { coupleAddGuests, coupleAddSession, coupleAddWalkIn, coupleDeleteGuest, coupleHideWish, coupleMarkSent, coupleRemoveSession, coupleSetGuestSession, coupleSetPresent, coupleSetPrivate, coupleSetSessionItem, coupleUpdateSession } from "../actions";

export type BoardRsvp = { id: number; name: string; attending: boolean; guests: number; created_at: string };
export type BoardWish = { id: number; name: string; message: string; created_at: string; hidden_at: string | null; hidden_by: "admin" | "mempelai" | null };
export type BoardGuest = GuestRow;

type Tab = "rsvp" | "wish" | "guest" | "checkin";
type Props = {
  slug: string;
  origin: string;
  rsvps: BoardRsvp[];
  wishes: BoardWish[];
  guests: BoardGuest[];
  // Fitur paket. Yang tidak termasuk disembunyikan tanpa keterangan, karena alasan kunci ditulis untuk admin.
  excel: boolean;
  qr: boolean;
  personalLinks: boolean;
  // Link tamu memuat kode (?k=), untuk QR absensi dan add-on tamu terundang.
  codeLinks: boolean;
  // Pembeli boleh menambah tamu, membagi sesi, dan menyalakan mode private.
  manage: boolean;
  privateMode: PrivateMode;
  // Template pesan WhatsApp dari admin, beserta isian {mempelai} dan {tanggal}.
  template: string;
  couple: string;
  date: string;
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

// Isi dashboard mempelai. Data lain hanya dibaca, kecuali tombol sembunyikan ucapan, tanda link terkirim, tanda hadir
// sebagai cadangan kalau pemindaian QR bermasalah, dan daftar tamu serta sesi kalau paket atau add-on menyediakannya.
export function CoupleBoard({ slug, origin, rsvps, wishes: initialWishes, guests: initialGuests, excel, qr, personalLinks, codeLinks, manage, privateMode, template, couple, date }: Props) {
  const [wishes, setWishes] = useState(initialWishes);
  const [guests, setGuests] = useState(initialGuests);
  const [isPrivate, setIsPrivate] = useState(privateMode.on);
  const [sessions, setSessions] = useState(privateMode.sessions);
  const [newGuests, setNewGuests] = useState("");
  const privateActions: PrivateActions = {
    setPrivate: (on) => coupleSetPrivate(slug, on),
    addSession: (input) => coupleAddSession(slug, input),
    updateSession: (id, input) => coupleUpdateSession(slug, id, input),
    removeSession: (id) => coupleRemoveSession(slug, id),
    setSessionItem: (name) => coupleSetSessionItem(slug, name),
  };
  const [tab, setTab] = useState<Tab>("rsvp");
  const [filter, setFilter] = useState<"all" | "yes" | "no">("all");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const [copied, setCopied] = useState<string | null>(null);
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
  const link = (g: BoardGuest) => (isPrivate ? privateLink(origin, slug, g.qr_token) : guestLink(origin, slug, g.name, codeLinks ? g.qr_token : null));
  const message = (g: BoardGuest) => fillGuestMessage(template, { nama: g.name, link: link(g), mempelai: couple, tanggal: date });

  // WhatsApp dibuka langsung, tanda terkirim menyusul di latar.
  function send(g: BoardGuest) {
    window.open(`https://wa.me/${g.phone ?? ""}?text=${encodeURIComponent(message(g))}`, "_blank", "noopener");
    if (g.sent_at) return;
    run(`terkirim:${g.id}`, async () => {
      const res = await coupleMarkSent(slug, g.id);
      if (!res.ok) return setError(res.error);
      setGuests((list) => list.map((x) => (x.id === g.id ? { ...x, sent_at: res.data } : x)));
    });
  }

  async function copy(g: BoardGuest, what: "link" | "pesan") {
    await navigator.clipboard.writeText(what === "link" ? link(g) : message(g));
    setCopied(`${what}:${g.id}`);
    setTimeout(() => setCopied((c) => (c === `${what}:${g.id}` ? null : c)), 1500);
  }

  function addGuests() {
    const list = parseGuestText(newGuests);
    if (!list.length) return setError("Tulis nama tamu lebih dulu.");
    run("tambah", async () => {
      const res = await coupleAddGuests(slug, list);
      if (!res.ok) return setError(res.error);
      setError(res.data.skipped ? `${res.data.skipped} nama dilewati karena sudah ada.` : "");
      setGuests((g) => [...g, ...res.data.added]);
      setNewGuests("");
    });
  }

  function removeGuest(g: BoardGuest) {
    if (!confirm(`Hapus ${g.name} dari daftar tamu? Link pribadinya tidak bisa dibuka lagi.`)) return;
    run(`hapus:${g.id}`, async () => {
      const res = await coupleDeleteGuest(slug, g.id);
      if (!res.ok) return setError(res.error);
      setError("");
      setGuests((list) => list.filter((x) => x.id !== g.id));
    });
  }

  const chooseSession = (g: BoardGuest, sessionId: number | null) =>
    run(`sesi:${g.id}`, async () => {
      const res = await coupleSetGuestSession(slug, g.id, sessionId);
      if (!res.ok) return setError(res.error);
      setError("");
      setGuests((list) => list.map((x) => (x.id === g.id ? { ...x, session_id: res.data } : x)));
    });

  function togglePresent(g: BoardGuest) {
    if (g.checked_in_at && !confirm(`Batalkan tanda hadir ${g.name}?`)) return;
    run(`hadir:${g.id}`, async () => {
      const res = await coupleSetPresent(slug, g.id, !g.checked_in_at);
      if (!res.ok) return setError(res.error);
      setError("");
      setGuests((list) => list.map((x) => (x.id === g.id ? { ...x, checked_in_at: res.data } : x)));
    });
  }

  function addWalkIn(name: string) {
    run("datang", async () => {
      const res = await coupleAddWalkIn(slug, name);
      if (!res.ok) return setError(res.error);
      setError("");
      setGuests((list) => (list.some((x) => x.id === res.data.id) ? list.map((x) => (x.id === res.data.id ? res.data : x)) : [...list, res.data]));
      setQuery("");
    });
  }

  const q = key(query);
  const lists = {
    rsvp: rsvps.filter((r) => (filter === "all" || r.attending === (filter === "yes")) && (!q || key(r.name).includes(q))),
    wish: wishes.filter((w) => !q || key(w.name).includes(q) || w.message.toLowerCase().includes(q)),
    guest: invited.filter((g) => !q || key(g.name).includes(q)),
    // Saat mencari, tamu yang belum hadir ikut tampil supaya bisa ditandai.
    checkin: q ? guests.filter((g) => key(g.name).includes(q)) : present,
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
          placeholder={tab === "wish" ? "Cari nama atau isi ucapan" : tab === "checkin" ? "Cari nama tamu" : "Cari nama"}
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
        {list.length > 0 && excel && (
          <button type="button" onClick={() => run("excel", exportXlsx)} disabled={working !== null} className="text-[14px] text-wine underline underline-offset-4 disabled:opacity-60">
            {working === "excel" ? "Menyiapkan Excel..." : "Unduh Excel"}
          </button>
        )}
      </div>

      {tab === "guest" && manage && (
        <div className="mt-5 grid gap-5">
          <PrivatePanel slug={slug} origin={origin} mode={privateMode} on={isPrivate} onToggle={setIsPrivate} sessions={sessions} onSessions={setSessions} actions={privateActions} />
          <section className="rounded-sm border border-line bg-white p-5">
            <label className="block text-[14px] font-medium" htmlFor="tamu-baru">
              Tambah tamu
            </label>
            <textarea id="tamu-baru" rows={4} value={newGuests} onChange={(e) => setNewGuests(e.target.value)} placeholder={"Budi Santoso 081234567890\nKeluarga Pak RT"} className={`${field} mt-2 resize-y`} />
            <p className="mt-1.5 text-[13px] text-ink-mute">Pisahkan dengan baris baru atau koma. Nomor WhatsApp di akhir nama ikut terbaca. Kode tamu dibuat otomatis.</p>
            <button type="button" onClick={addGuests} disabled={working !== null || !newGuests.trim()} className="mt-3 rounded-sm bg-wine px-4 py-2.5 text-[14px] text-white disabled:opacity-60">
              {working === "tambah" ? "Menyimpan..." : "Tambahkan"}
            </button>
          </section>
        </div>
      )}
      {tab === "checkin" && <p className="mt-3 text-[13px] text-ink-mute">Kalau pemindaian QR bermasalah, cari nama tamu di sini lalu tandai hadir.</p>}
      {error && <p className="mt-3 rounded-sm bg-blush px-4 py-3 text-[14px] text-wine">{error}</p>}
      {!list.length && <p className="mt-6 text-[15px] text-ink-mute">{query ? "Tidak ada yang cocok." : empty}</p>}
      {tab === "checkin" && !list.length && query.trim().length >= 2 && (
        <button type="button" onClick={() => addWalkIn(query)} disabled={working !== null} className="mt-3 rounded-sm bg-wine px-4 py-2.5 text-[14px] text-white disabled:opacity-60">
          {working === "datang" ? "Mencatat..." : `Catat "${query.trim()}" sebagai datang langsung`}
        </button>
      )}

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
              {manage && isPrivate && sessions.length > 0 && <SessionSelect sessions={sessions} value={g.session_id} disabled={working !== null} onChange={(id) => chooseSession(g, id)} label={`Sesi ${g.name}`} />}
              {personalLinks && (
                <span className="flex flex-wrap gap-x-4 gap-y-1 text-[14px]">
                  <button type="button" onClick={() => send(g)} className="text-wine underline underline-offset-4">
                    {working === `terkirim:${g.id}` ? "Menandai terkirim..." : "Kirim WA"}
                  </button>
                  <button type="button" onClick={() => copy(g, "link")} className="text-ink-soft hover:text-wine">
                    {copied === `link:${g.id}` ? "Tersalin" : "Salin link"}
                  </button>
                  <button type="button" onClick={() => copy(g, "pesan")} className="text-ink-soft hover:text-wine">
                    {copied === `pesan:${g.id}` ? "Tersalin" : "Salin pesan"}
                  </button>
                </span>
              )}
              {manage && (
                <button type="button" onClick={() => removeGuest(g)} disabled={working !== null} className="text-[14px] text-ink-mute hover:text-wine disabled:opacity-60">
                  {working === `hapus:${g.id}` ? "Menghapus..." : "Hapus"}
                </button>
              )}
            </li>
          ))}
        {tab === "checkin" &&
          lists.checkin.slice(0, limit).map((g) => (
            <li key={g.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
              <p className="min-w-0 flex-1 basis-40 truncate font-medium">{g.name}</p>
              {g.walk_in && <span className="rounded-full bg-blush px-2.5 py-0.5 text-[12px] text-ink-soft">Datang langsung</span>}
              {g.checked_in_at ? (
                <>
                  <span className="text-[14px] text-ink-soft tabular-nums">{clockFmt.format(new Date(g.checked_in_at))}</span>
                  <button type="button" onClick={() => togglePresent(g)} disabled={working !== null} className="text-[14px] text-ink-mute hover:text-wine disabled:opacity-60">
                    {working === `hadir:${g.id}` ? "Menyimpan..." : "Batalkan"}
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => togglePresent(g)} disabled={working !== null} className="rounded-sm border border-wine px-3 py-1.5 text-[14px] text-wine disabled:opacity-60">
                  {working === `hadir:${g.id}` ? "Menyimpan..." : "Tandai hadir"}
                </button>
              )}
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
