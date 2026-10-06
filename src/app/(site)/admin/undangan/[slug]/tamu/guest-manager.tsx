"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { downloadQr, QrCode } from "@/components/qr-code";
import { fillGuestMessage, guestLink, MAX_GUESTS, parseCsv, parseGuestRows, parseGuestText, type GuestInput } from "@/lib/guests";
import type { CheckinSchedule } from "@/lib/checkin";
import { addGuests, checkinLink, deleteGuests, openCheckinNow, markSent, saveGuestMessage, setGuestCheckin, updateGuest, type Guest } from "./actions";

type Props = {
  slug: string;
  origin: string;
  initial: Guest[];
  template: string;
  couple: string;
  date: string;
  // Alasan unduh Excel terkunci, kosong berarti boleh.
  excelLock: string | null;
  qr: { on: true } | { on: false; reason: string | null };
  // Jadwal absensi di lokasi, kosong kalau tanggal acara belum diisi atau undangan contoh.
  window: CheckinSchedule | null;
};
type Notice = { tone: "ok" | "error"; text: string } | null;

const field = "mt-2 block w-full rounded-sm border border-line bg-white px-3 py-2.5 text-base font-normal outline-none focus:border-wine";
const PAGE = 50;

const prettyPhone = (p: string) => `+${p.slice(0, 2)} ${p.slice(2, 5)} ${p.slice(5, 9)} ${p.slice(9)}`.trim();
const sentFmt = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const fullFmt = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });

// QR milik mempelai. Dicetak dan dipasang di meja penerima tamu, tamu memindainya dengan HP sendiri.
function AttendancePanel({ slug, origin, present, invited, walkIns, window: open }: { slug: string; origin: string; present: number; invited: number; walkIns: number; window: Props["window"] }) {
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const url = token ? `${origin}/absen/${token}` : "";

  async function setOpen(next: boolean) {
    if (next && !confirm("Buka absensi sekarang? Tamu yang memindai QR bisa langsung mencatat kehadiran, walaupun acara belum dimulai.")) return;
    setBusy(true);
    const res = await openCheckinNow(slug, next).catch(() => ({ ok: false as const, error: "Gagal menyimpan. Cek koneksi." }));
    setBusy(false);
    if (!res.ok) return setError(res.error);
    setError("");
    router.refresh();
  }

  async function load(regenerate = false) {
    if (regenerate && !confirm("Ganti QR kehadiran? QR yang sudah dicetak langsung tidak bisa dipakai lagi.")) return;
    setBusy(true);
    const res = await checkinLink(slug, regenerate).catch(() => ({ ok: false as const, error: "Gagal memuat. Cek koneksi." }));
    setBusy(false);
    if (!res.ok) return setError(res.error);
    setError("");
    setToken(res.data);
  }

  return (
    <section className="rounded-sm border border-line bg-white p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-serif text-2xl">QR kehadiran</h2>
        <p className="text-[14px]">
          <span className="font-serif text-2xl">{present}</span>
          <span className="text-ink-mute">
            {" "}
            dari {invited} tamu hadir{walkIns > 0 && `, ditambah ${walkIns} datang langsung`}
          </span>
        </p>
      </div>
      <p className="mt-2 text-[14px] text-ink-soft">
        Cetak QR ini dan pasang di meja penerima tamu. Tamu memindainya dengan kamera HP. Tamu yang pernah membuka link pribadinya langsung dikenali, yang lain cukup menulis nama. Nama di luar daftar tetap tercatat sebagai datang langsung.
      </p>
      {open && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-sm bg-ivory px-4 py-3 text-[14px]">
          <span className={`rounded-full px-2.5 py-0.5 text-[12px] ${open.state === "open" ? "bg-wine text-white" : "bg-white text-ink-soft ring-1 ring-line"}`}>
            {open.state === "open" ? "Sedang dibuka" : open.state === "before" ? "Belum dibuka" : "Sudah ditutup"}
          </span>
          <span className="min-w-0 flex-1 text-ink-soft">
            {open.manual ? "Dibuka manual " : "Dibuka "}
            {open.from} sampai {open.until}.
          </span>
          {open.canOpen && open.state !== "open" && (
            <button type="button" onClick={() => setOpen(true)} disabled={busy} className="rounded-sm bg-wine px-4 py-2 text-[14px] text-white transition-colors duration-150 hover:bg-wine-dark disabled:opacity-50">
              Buka sekarang
            </button>
          )}
          {open.manual && (
            <button type="button" onClick={() => setOpen(false)} disabled={busy} className="text-[14px] text-ink-mute underline underline-offset-4 hover:text-wine disabled:opacity-50">
              Kembalikan ke jadwal
            </button>
          )}
          {!open.canOpen && open.state === "before" && <span className="w-full text-[12px] text-ink-mute">Jalankan migrasi 0010 untuk bisa membuka absensi lebih awal.</span>}
        </div>
      )}
      {token ? (
        <div className="mt-4 grid gap-5 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-start">
          <QrCode value={url} label="QR kehadiran untuk dicetak" className="rounded-sm ring-1 ring-line" />
          <div className="grid gap-3">
            <input readOnly value={url} onFocus={(e) => e.target.select()} aria-label="Link QR kehadiran" className={`${field} mt-0 font-mono text-[13px]`} />
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-[14px]">
              <button type="button" onClick={() => downloadQr(url, `qr-kehadiran-${slug}.png`)} className="text-wine underline underline-offset-4">
                Unduh QR untuk dicetak
              </button>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(url);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="text-ink-soft hover:text-wine"
              >
                {copied ? "Tersalin" : "Salin link"}
              </button>
              <button type="button" onClick={() => load(true)} disabled={busy} className="text-ink-mute hover:text-wine disabled:opacity-50">
                Ganti QR
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => load()}
          disabled={busy}
          className="mt-4 rounded-sm border border-wine px-4 py-2 text-[14px] text-wine transition-colors duration-150 hover:bg-wine hover:text-white disabled:opacity-50"
        >
          {busy ? "Memuat..." : "Tampilkan QR kehadiran"}
        </button>
      )}
      {error && <p className="mt-3 text-[13px] text-wine">{error}</p>}
    </section>
  );
}

function Preview({ list, existing }: { list: GuestInput[]; existing: Set<string> }) {
  const dup = list.filter((g) => existing.has(g.name.toLowerCase())).length;
  const phones = list.filter((g) => g.phone).length;
  if (!list.length) return null;
  return (
    <div className="mt-3 rounded-sm bg-ivory/60 p-3 text-[13px]">
      <p>
        <span className="font-medium">{list.length} nama terbaca</span>
        <span className="text-ink-mute">
          , {phones} dengan nomor WhatsApp{dup ? `, ${dup} sudah ada dan akan dilewati` : ""}
        </span>
      </p>
      <ul className="mt-2 grid gap-0.5 text-ink-soft">
        {list.slice(0, 5).map((g, i) => (
          <li key={i} className="truncate">
            {g.name}
            {g.phone && <span className="text-ink-mute"> · {prettyPhone(g.phone)}</span>}
          </li>
        ))}
        {list.length > 5 && <li className="text-ink-mute">dan {list.length - 5} lainnya</li>}
      </ul>
    </div>
  );
}

export function GuestManager({ slug, origin, initial, template: initialTemplate, couple, date, excelLock, qr, window: checkinWindow }: Props) {
  const [guests, setGuests] = useState(initial);
  const [tab, setTab] = useState<"paste" | "excel">("paste");
  const [text, setText] = useState("");
  const [sheet, setSheet] = useState<{ name: string; list: GuestInput[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const [template, setTemplate] = useState(initialTemplate);
  const [savedTemplate, setSavedTemplate] = useState(initialTemplate);
  const [editing, setEditing] = useState<{ id: number; name: string; phone: string } | null>(null);
  const [copied, setCopied] = useState(0);

  const existing = useMemo(() => new Set(guests.map((g) => g.name.toLowerCase())), [guests]);
  const pasted = useMemo(() => parseGuestText(text), [text]);
  const pending = tab === "paste" ? pasted : (sheet?.list ?? []);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? guests.filter((g) => g.name.toLowerCase().includes(q) || g.phone?.includes(q.replace(/\D/g, "") || "~")) : guests;
  }, [guests, query]);
  const sentCount = guests.filter((g) => g.sent_at).length;
  const presentCount = guests.filter((g) => g.checked_in_at && !g.walk_in).length;
  const walkInCount = guests.filter((g) => g.walk_in).length;
  const invitedCount = guests.length - walkInCount;

  const link = (g: Guest) => guestLink(origin, slug, g.name, qr.on ? g.qr_token : null);
  const message = (g: Guest) => fillGuestMessage(template, { nama: g.name, link: link(g), mempelai: couple, tanggal: date });

  async function readFile(file: File) {
    setNotice(null);
    try {
      let rows: unknown[][];
      if (/\.csv$/i.test(file.name) || file.type === "text/csv") rows = parseCsv(await file.text());
      else {
        const { readSheet } = await import("read-excel-file/browser");
        rows = (await readSheet(file)) as unknown[][];
      }
      const list = parseGuestRows(rows);
      setSheet({ name: file.name, list });
      if (!list.length) setNotice({ tone: "error", text: "Tidak ada nama yang terbaca. Pastikan kolom pertama atau kolom berjudul Nama berisi nama tamu." });
    } catch {
      setSheet(null);
      setNotice({ tone: "error", text: "File tidak bisa dibaca. Gunakan .xlsx atau .csv." });
    }
  }

  async function submit() {
    if (!pending.length) return;
    setBusy(true);
    const res = await addGuests(slug, pending);
    setBusy(false);
    if (!res.ok) return setNotice({ tone: "error", text: res.error });
    setGuests((g) => [...g, ...res.data.added]);
    setNotice({
      tone: "ok",
      text: `${res.data.added.length} tamu ditambahkan${res.data.skipped ? `, ${res.data.skipped} dilewati karena sudah ada` : ""}.`,
    });
    if (tab === "paste") setText("");
    else setSheet(null);
  }

  async function remove(g: Guest) {
    if (!confirm(`Hapus ${g.name} dari daftar tamu?`)) return;
    const res = await deleteGuests(slug, [g.id]);
    if (res.ok) setGuests((list) => list.filter((x) => x.id !== g.id));
    else setNotice({ tone: "error", text: res.error });
  }

  async function removeAll() {
    if (!confirm(`Hapus semua ${guests.length} tamu? Tindakan ini tidak bisa dibatalkan.`)) return;
    const res = await deleteGuests(slug, "all");
    if (res.ok) setGuests([]);
    else setNotice({ tone: "error", text: res.error });
  }

  async function saveEdit() {
    if (!editing) return;
    const res = await updateGuest(slug, editing.id, editing.name, editing.phone);
    if (!res.ok) return setNotice({ tone: "error", text: res.error });
    setGuests((list) => list.map((g) => (g.id === res.data.id ? res.data : g)));
    setEditing(null);
  }

  async function send(g: Guest) {
    const url = `https://wa.me/${g.phone ?? ""}?text=${encodeURIComponent(message(g))}`;
    window.open(url, "_blank", "noopener");
    if (g.sent_at) return;
    const res = await markSent(slug, g.id, true);
    if (res.ok) setGuests((list) => list.map((x) => (x.id === g.id ? { ...x, sent_at: res.data } : x)));
  }

  async function toggleSent(g: Guest) {
    const res = await markSent(slug, g.id, !g.sent_at);
    if (res.ok) setGuests((list) => list.map((x) => (x.id === g.id ? { ...x, sent_at: res.data } : x)));
  }

  async function copy(g: Guest, what: "link" | "pesan") {
    await navigator.clipboard.writeText(what === "link" ? link(g) : message(g));
    setCopied(g.id);
    setTimeout(() => setCopied((c) => (c === g.id ? 0 : c)), 1500);
  }

  async function storeTemplate() {
    const res = await saveGuestMessage(slug, template);
    if (!res.ok) return setNotice({ tone: "error", text: res.error });
    setSavedTemplate(template);
  }

  async function togglePresent(g: Guest) {
    if (g.checked_in_at && !confirm(`Batalkan tanda hadir ${g.name}?`)) return;
    const res = await setGuestCheckin(slug, g.id, !g.checked_in_at);
    if (!res.ok) return setNotice({ tone: "error", text: res.error });
    setGuests((list) => list.map((x) => (x.id === g.id ? { ...x, checked_in_at: res.data } : x)));
  }

  async function exportXlsx() {
    const { default: writeXlsxFile } = await import("write-excel-file/browser");
    const head = (value: string) => ({ value, fontWeight: "bold" as const, backgroundColor: "#F2F2F2" });
    const columns = ["Nama", "WhatsApp", "Link undangan", "Terkirim", ...(qr.on ? ["Hadir", "Keterangan"] : [])];
    const rows = guests.map((g) => [
      g.name,
      g.phone ? `+${g.phone}` : "",
      link(g),
      g.sent_at ? fullFmt.format(new Date(g.sent_at)) : "",
      ...(qr.on ? [g.checked_in_at ? fullFmt.format(new Date(g.checked_in_at)) : "", g.walk_in ? "Datang langsung" : "Tamu undangan"] : []),
    ]);
    await writeXlsxFile([columns.map(head), ...rows], {
      sheet: "Daftar tamu",
      columns: [{ width: 30 }, { width: 18 }, { width: 60 }, { width: 20 }, ...(qr.on ? [{ width: 20 }, { width: 18 }] : [])],
      stickyRowsCount: 1,
    }).toFile(`tamu-${slug}.xlsx`);
  }

  return (
    <div className="mt-8 grid gap-10">
      <section>
        <h2 className="font-serif text-2xl">Tambah tamu</h2>
        <div role="tablist" className="mt-3 flex border-b border-line text-[14px]">
          {(
            [
              ["paste", "Tempel daftar"],
              ["excel", "Import Excel"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={tab === k}
              onClick={() => setTab(k)}
              className={`relative px-4 py-2.5 ${tab === k ? "text-wine" : "text-ink-soft hover:text-ink"}`}
            >
              {label}
              {tab === k && <span className="absolute inset-x-3 -bottom-px h-0.5 bg-wine" aria-hidden="true" />}
            </button>
          ))}
        </div>

        {tab === "paste" ? (
          <label className="mt-4 block text-[14px] font-medium">
            Nama tamu
            <textarea
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={"Budi Santoso 081234567890\nKeluarga Pak RT\nSinta, Dewi, Rudi"}
              className={`${field} resize-y`}
            />
            <span className="mt-1.5 block text-[13px] font-normal text-ink-mute">
              Pisahkan dengan baris baru atau koma. Nomor WhatsApp di akhir nama ikut terbaca. Nama yang mengandung koma, misal gelar, tulis per baris tanpa koma.
            </span>
          </label>
        ) : (
          <div className="mt-4">
            <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-wine/40 bg-white px-5 py-8 text-center transition-colors duration-150 hover:border-wine focus-within:border-wine">
              <span className="text-[15px] text-wine">{sheet ? sheet.name : "Pilih file Excel atau CSV"}</span>
              <span className="text-[13px] text-ink-mute">Kolom Nama wajib, kolom No HP atau WhatsApp opsional. Tanpa judul kolom, kolom 1 dibaca nama dan kolom 2 nomor.</span>
              <input
                type="file"
                accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) readFile(file);
                }}
              />
            </label>
          </div>
        )}

        <Preview list={pending} existing={existing} />

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={submit}
            disabled={busy || !pending.length}
            className="rounded-sm bg-wine px-5 py-3 text-[14px] text-white transition-colors duration-150 hover:bg-wine-dark disabled:opacity-50"
          >
            {busy ? "Menyimpan..." : pending.length ? `Tambahkan ${pending.length} tamu` : "Tambahkan tamu"}
          </button>
          <span className="text-[13px] text-ink-mute">
            {guests.length} dari {MAX_GUESTS} tamu
          </span>
        </div>
        {notice && (
          <p role="status" className={`mt-3 rounded-sm px-4 py-3 text-[14px] ${notice.tone === "ok" ? "bg-ivory text-ink" : "bg-blush text-wine"}`}>
            {notice.text}
          </p>
        )}
      </section>

      {qr.on ? (
        <AttendancePanel slug={slug} origin={origin} present={presentCount} invited={invitedCount} walkIns={walkInCount} window={checkinWindow} />
      ) : (
        qr.reason && <p className="rounded-sm bg-ivory px-4 py-3 text-[13px] text-ink-mute">QR absensi tamu: {qr.reason}</p>
      )}

      <details className="rounded-sm border border-line bg-white">
        <summary className="cursor-pointer px-4 py-3 font-serif text-xl">Template pesan WhatsApp</summary>
        <div className="border-t border-line p-4">
          <textarea rows={10} value={template} onChange={(e) => setTemplate(e.target.value)} className={`${field} mt-0 resize-y text-[15px]`} />
          <p className="mt-1.5 text-[13px] text-ink-mute">
            Kata {"{nama}"}, {"{link}"}, {"{mempelai}"}, dan {"{tanggal}"} otomatis diganti untuk tiap tamu.
          </p>
          <button
            type="button"
            onClick={storeTemplate}
            disabled={template === savedTemplate}
            className="mt-3 rounded-sm border border-wine px-4 py-2 text-[14px] text-wine transition-colors duration-150 hover:bg-wine hover:text-white disabled:opacity-40"
          >
            {template === savedTemplate ? "Tersimpan" : "Simpan template"}
          </button>
        </div>
      </details>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-serif text-2xl">
            Daftar tamu <span className="text-[15px] text-ink-mute">{guests.length}</span>
          </h2>
          {guests.length > 0 && (
            <p className="text-[13px] text-ink-mute">
              {sentCount} terkirim, {guests.length - sentCount} belum
              {qr.on && `, ${presentCount} hadir${walkInCount ? `, ${walkInCount} datang langsung` : ""}`}
            </p>
          )}
        </div>

        {guests.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setLimit(PAGE);
              }}
              placeholder="Cari nama atau nomor"
              className={`${field} mt-0 max-w-xs flex-1`}
            />
            {excelLock ? (
              <span className="text-[13px] text-ink-mute">{excelLock}</span>
            ) : (
              <button type="button" onClick={exportXlsx} className="text-[14px] text-wine underline underline-offset-4">
                Unduh Excel
              </button>
            )}
          </div>
        )}

        {!guests.length && <p className="mt-4 text-[15px] text-ink-mute">Belum ada tamu.</p>}

        <ul className="mt-4 divide-y divide-line border-y border-line">
          {filtered.slice(0, limit).map((g) => (
            <li key={g.id} className="py-3">
              {editing?.id === g.id ? (
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_200px_auto] sm:items-center">
                  <input value={editing.name} maxLength={80} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={`${field} mt-0`} aria-label="Nama" />
                  <input value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} placeholder="08..." inputMode="tel" className={`${field} mt-0`} aria-label="Nomor WhatsApp" />
                  <span className="flex gap-4 text-[14px]">
                    <button type="button" onClick={saveEdit} className="text-wine underline underline-offset-4">
                      Simpan
                    </button>
                    <button type="button" onClick={() => setEditing(null)} className="text-ink-mute">
                      Batal
                    </button>
                  </span>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  <div className="min-w-0 flex-1 basis-48">
                    <p className="truncate font-medium">
                      {g.name}
                      {g.walk_in && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-normal text-amber-900">Datang langsung</span>}
                    </p>
                    <p className="text-[13px] text-ink-mute">
                      {g.phone ? prettyPhone(g.phone) : "Tanpa nomor"}
                      {g.sent_at && (
                        <button type="button" onClick={() => toggleSent(g)} title="Klik untuk batal tandai" className="ml-2 rounded-full bg-ivory px-2 py-0.5 text-[11px] text-ink-soft">
                          Terkirim {sentFmt.format(new Date(g.sent_at))}
                        </button>
                      )}
                      {qr.on && g.checked_in_at && (
                        <button type="button" onClick={() => togglePresent(g)} title="Klik untuk batalkan" className="ml-2 rounded-full bg-wine px-2 py-0.5 text-[11px] text-white">
                          Hadir {sentFmt.format(new Date(g.checked_in_at))}
                        </button>
                      )}
                    </p>
                  </div>
                  <span className="flex flex-wrap gap-x-4 gap-y-1 text-[14px]">
                    <button type="button" onClick={() => send(g)} className="text-wine underline underline-offset-4">
                      Kirim WA
                    </button>
                    <button type="button" onClick={() => copy(g, "link")} className="text-ink-soft hover:text-wine">
                      {copied === g.id ? "Tersalin" : "Salin link"}
                    </button>
                    <button type="button" onClick={() => copy(g, "pesan")} className="text-ink-soft hover:text-wine">
                      Salin pesan
                    </button>
                    {qr.on && !g.checked_in_at && (
                      <button type="button" onClick={() => togglePresent(g)} className="text-ink-soft hover:text-wine">
                        Tandai hadir
                      </button>
                    )}
                    <button type="button" onClick={() => setEditing({ id: g.id, name: g.name, phone: g.phone ?? "" })} className="text-ink-soft hover:text-wine">
                      Ubah
                    </button>
                    <button type="button" onClick={() => remove(g)} className="text-ink-mute hover:text-wine">
                      Hapus
                    </button>
                  </span>
                </div>
              )}
            </li>
          ))}
        </ul>

        {filtered.length > limit && (
          <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="mt-4 text-[14px] text-wine underline underline-offset-4">
            Tampilkan {Math.min(PAGE, filtered.length - limit)} lagi
          </button>
        )}
        {guests.length > 0 && (
          <button type="button" onClick={removeAll} className="mt-8 block text-[13px] text-ink-mute hover:text-wine">
            Hapus semua tamu
          </button>
        )}
      </section>
    </div>
  );
}
