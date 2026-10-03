"use client";

import { useState } from "react";
import { ACTIVE_MONTHS, newId, PACKAGE_IDS, PACKAGE_NAMES, SYSTEM_KEYS, type MatrixRow, type PackageId } from "@/lib/settings/schema";
import { months, themeCount } from "@/lib/settings/text";
import { setIn, useSettings } from "./form-context";
import { ImagePicker } from "./image-picker";
import { VarsNote } from "./panels-content";
import { button, Card, cx, DeleteButton, input, NumberField, RepList, Row, Select, SelectBox, Switch, Text, width } from "./ui";

function PackageCard({ id }: { id: PackageId }) {
  const { s, set, errors } = useSettings();
  const p = s.packages[id];
  const base = `packages.${id}`;
  const options = [...new Set([...ACTIVE_MONTHS, p.active])].sort((a, b) => a - b).map((n): [string, string] => [String(n), months(n)]);
  return (
    <div className={cx("rounded-[9px] border border-[#E8E0D6] bg-[#FCFAF7] px-4 pt-4 pb-[18px] [&_.field]:mb-[13px] [&_.field:last-child]:mb-0", !p.on && "opacity-70")}>
      <div className="mb-3.5 flex items-center gap-2 border-b border-[#E8E0D6] pb-3">
        <h3 className="font-serif text-[21px] font-semibold">{PACKAGE_NAMES[id]}</h3>
        <span className="ml-auto">
          <Switch bare checked={p.on} label={`Tampilkan paket ${PACKAGE_NAMES[id]}`} onChange={(v) => set(`${base}.on`, v)} />
        </span>
      </div>
      {errors[`${base}.on`] && <p className="mb-3 text-[11.5px] text-wine">{errors[`${base}.on`]}</p>}
      <NumberField path={`${base}.price`} label="Harga" chip="sys" prefix="Rp" rupiah />
      <Text path={`${base}.badge`} label="Label kecil" chip="view" max={22} help="Kosongkan kalau tidak perlu. Hindari klaim jumlah pembeli." />
      <Text path={`${base}.blurb`} label="Kalimat penjelas" chip="view" max={60} rows={2} />
      <NumberField path={`${base}.sla`} label="Pengerjaan" chip="sys" suffix="hari kerja" />
      <Select path={`${base}.active`} label="Masa aktif" chip="sys" options={options} toValue={Number} help="Tampil di kartu harga dan jawaban tanya jawab." />
    </div>
  );
}

const KEY_OPTIONS: [string, string][] = [["", "Tanpa kunci"], ...Object.keys(SYSTEM_KEYS).map((k): [string, string] => [k, k])];
const COLS = "grid-cols-[26px_minmax(170px,1fr)_118px_140px_repeat(3,96px)_34px]";

function Matrix() {
  const { s, update, errors } = useSettings();
  const rows = s.matrix;
  const [armed, setArmed] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const write = (next: MatrixRow[]) => update((d) => ({ ...d, matrix: next }));
  const edit = (i: number, path: string, value: unknown) => update((d) => setIn(d, `matrix.${i}.${path}`, value));
  const move = (from: number, to: number) => {
    if (to < 0 || to >= rows.length || from === to) return;
    const next = [...rows];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    write(next);
    requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-handle="${x.id}"]`)?.focus());
  };
  const rowErrors = rows.flatMap((r, i) =>
    Object.entries(errors)
      .filter(([k]) => k.startsWith(`matrix.${i}.`))
      .map(([, m]) => `Baris ${i + 1} (${r.label || "tanpa nama"}): ${m}`),
  );

  return (
    <div className="overflow-hidden rounded-[9px] border border-[#E8E0D6]">
      <div className="overflow-x-auto">
        <div className="min-w-[780px]" role="table" aria-label="Isi paket">
          <div role="row" className={cx("grid items-center border-b border-[#E8E0D6] bg-[#FBF8F4] px-3 text-[10.5px] tracking-[.12em] text-ink-mute uppercase [&>*]:px-2 [&>*]:py-[11px]", COLS)}>
            <span role="columnheader" aria-label="Urutan" />
            <span role="columnheader">Isi paket</span>
            <span role="columnheader">Tipe</span>
            <span role="columnheader">Kunci sistem</span>
            {PACKAGE_IDS.map((p) => (
              <span key={p} role="columnheader" className="text-center">
                {PACKAGE_NAMES[p]}
              </span>
            ))}
            <span role="columnheader" aria-label="Hapus" />
          </div>
          {rows.map((r, i) => {
            const computed = r.key === "jumlah_tema";
            return (
              <div
                key={r.id}
                role="row"
                draggable={armed === i}
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", String(i));
                }}
                onDragOver={(e) => {
                  if (armed === null) return;
                  e.preventDefault();
                  setOver(i);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (armed !== null) move(armed, i);
                  setArmed(null);
                  setOver(null);
                }}
                onDragEnd={() => {
                  setArmed(null);
                  setOver(null);
                }}
                className={cx(
                  "grid items-center border-b border-[#F0EAE2] bg-white px-3 last:border-b-0 hover:bg-[#FCFAF7] [&>*]:px-2 [&>*]:py-[9px]",
                  COLS,
                  over === i && armed !== i && "shadow-[inset_0_2px_0_#7C2B3E]",
                  armed === i && "opacity-60",
                )}
              >
                <span role="cell" className="pl-0!">
                  <button
                    type="button"
                    data-handle={r.id}
                    aria-label={`Urutan baris ${r.label || i + 1}. Tekan panah atas atau bawah untuk memindahkan.`}
                    title="Geser untuk mengubah urutan"
                    onPointerDown={() => setArmed(i)}
                    onPointerUp={() => setArmed(null)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                        e.preventDefault();
                        move(i, i + (e.key === "ArrowUp" ? -1 : 1));
                      }
                    }}
                    className="flex h-7 w-5 cursor-grab flex-col items-center justify-center gap-[3px] rounded text-[#B5A79C] hover:text-ink-mute focus-visible:outline-2 focus-visible:outline-wine active:cursor-grabbing"
                  >
                    {[0, 1, 2].map((d) => (
                      <span key={d} className="size-[3px] rounded-full bg-current" />
                    ))}
                  </button>
                </span>
                <span role="cell">
                  <input
                    value={r.label}
                    aria-label={`Isi paket baris ${i + 1}`}
                    aria-invalid={!!errors[`matrix.${i}.label`]}
                    onChange={(e) => edit(i, "label", e.target.value)}
                    className={cx(input, "px-2.5! py-2! sm:text-[13px]!", errors[`matrix.${i}.label`] ? "border-wine" : "border-[#E8E0D6]")}
                  />
                </span>
                <span role="cell">
                  <SelectBox
                    label={`Tipe baris ${i + 1}`}
                    value={r.kind}
                    invalid={!!errors[`matrix.${i}.kind`]}
                    options={[
                      ["check", "Centang"],
                      ["count", "Berjumlah"],
                    ]}
                    onChange={(v) => edit(i, "kind", v)}
                    className="px-2.5! py-2! sm:text-[12.5px]!"
                  />
                </span>
                <span role="cell">
                  <SelectBox
                    label={`Kunci sistem baris ${i + 1}`}
                    value={r.key}
                    invalid={!!errors[`matrix.${i}.key`]}
                    options={KEY_OPTIONS}
                    onChange={(v) => update((d) => setIn(setIn(d, `matrix.${i}.key`, v), `matrix.${i}.kind`, v ? "count" : d.matrix[i].kind))}
                    className="px-2.5! py-2! font-mono sm:text-[11.5px]!"
                  />
                </span>
                {PACKAGE_IDS.map((p) => {
                  const c = r.cells[p];
                  const name = `${r.label || `baris ${i + 1}`} paket ${PACKAGE_NAMES[p]}`;
                  if (computed) {
                    return (
                      <span key={p} role="cell" className="text-center text-[13px] tabular-nums text-[#5C5048]" title="Dihitung dari tab Tema">
                        {themeCount(s, p).n}
                      </span>
                    );
                  }
                  return (
                    <span key={p} role="cell" className="flex flex-col items-center gap-[5px]">
                      <Switch bare checked={c.on} label={`Termasuk: ${name}`} onChange={(v) => edit(i, `cells.${p}.on`, v)} />
                      {r.kind === "count" && c.on && (
                        <>
                          <input
                            inputMode="numeric"
                            aria-label={`Jumlah: ${name}`}
                            disabled={c.n === null}
                            value={c.n === null || Number.isNaN(c.n) ? "" : String(c.n)}
                            onChange={(e) => {
                              const d = e.target.value.replace(/\D/g, "").slice(0, 4);
                              edit(i, `cells.${p}.n`, d ? Number(d) : NaN);
                            }}
                            className={cx(input, "w-[58px]! px-1.5! py-1.5! text-center sm:text-[12.5px]!", errors[`matrix.${i}.cells.${p}.n`] ? "border-wine" : "border-[#E8E0D6]")}
                          />
                          <Switch small checked={c.n === null} label="tanpa batas" onChange={(v) => edit(i, `cells.${p}.n`, v ? null : NaN)} />
                        </>
                      )}
                    </span>
                  );
                })}
                <span role="cell" className="flex justify-center">
                  <DeleteButton label={`Hapus baris ${r.label || i + 1}`} onClick={() => write(rows.filter((_, j) => j !== i))} />
                </span>
              </div>
            );
          })}
        </div>
      </div>
      {rowErrors.length > 0 && (
        <ul className="border-t border-[#E7D2D8] bg-[#F6EBEE] px-5 py-3 text-[12.5px] text-wine">
          {rowErrors.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-3.5 border-t border-[#E8E0D6] bg-[#FBF8F4] px-4 py-[13px] sm:px-5">
        <button
          type="button"
          onClick={() => write([...rows, { id: newId(), label: "", kind: "check", key: "", cells: { dasar: { on: false, n: null }, lengkap: { on: false, n: null }, istimewa: { on: false, n: null } } }])}
          className={cx(button.ghost, button.sm, "flex-none whitespace-nowrap")}
        >
          + Tambah baris
        </button>
        <span className="min-w-[240px] flex-1 text-[11.5px] leading-normal text-ink-mute">
          Kunci sistem hanya diisi untuk baris yang mengubah perilaku aplikasi. <code className="font-mono">jumlah_tema</code> dihitung otomatis dari tab Tema,{" "}
          <code className="font-mono">galeri_foto</code> membatasi jumlah foto galeri di editor undangan sesuai paketnya.
        </span>
      </div>
    </div>
  );
}

export function PaketPanel() {
  return (
    <>
      <Card title="Tiga paket" hint="Harga, pengerjaan, dan masa aktif dipakai di kartu harga, judul halaman, dan kata pengganti seperti {harga} dan {pengerjaan}. Paket yang dimatikan tidak tampil dan tidak ikut dihitung.">
        <div className="grid gap-4 lg:grid-cols-3">
          {PACKAGE_IDS.map((p) => (
            <PackageCard key={p} id={p} />
          ))}
        </div>
      </Card>
      <Card
        title="Isi paket"
        hint="Satu baris sama dengan satu baris di kartu harga, urutannya berlaku untuk ketiga paket supaya kartu tetap sejajar. Baris tanpa kunci sistem hanya tampilan, bebas ditambah atau diubah kapan saja."
        tools={
          <a href="/#harga" target="_blank" rel="noopener" className={cx(button.quiet, button.sm)}>
            Lihat halaman harga
          </a>
        }
      >
        <Matrix />
      </Card>
    </>
  );
}

export function AddonPanel() {
  return (
    <Card title="Tambahan di luar paket" hint="Kolom Berlaku untuk muncul sebagai baris kecil di bawah nama. Yang dimatikan tetap tersimpan, hanya tidak ditampilkan.">
      <RepList
        path="addons"
        noun="item"
        max={30}
        blank={() => ({ id: newId(), on: true, name: "", price: NaN, scope: "" })}
        render={(_, __, base) => (
          <Row>
            <Text path={`${base}.name`} label="Nama tambahan" max={46} />
            <NumberField path={`${base}.price`} label="Harga" chip="view" prefix="Rp" rupiah className={width.sm} />
            <Text path={`${base}.scope`} label="Berlaku untuk" max={60} />
          </Row>
        )}
      />
    </Card>
  );
}

export function KontakPanel() {
  return (
    <>
      <Card title="Kontak">
        <Row>
          <Text path="contact.wa" label="Nomor WhatsApp" chip="sys" help="Format 628xxx, tanpa spasi atau tanda +" />
          <Text path="contact.instagram" label="Username Instagram" chip="sys" help="Dipakai di tautan footer." />
        </Row>
        <Row>
          <Text path="contact.email" label="Email" chip="view" type="email" help="Muncul sebagai tautan di footer kalau diisi." />
          <Text path="contact.city" label="Kota" chip="view" className={width.md} help="Muncul di footer lewat {kota}." />
        </Row>
        <Row>
          <Text path="contact.open" label="Jam buka" chip="view" type="time" className={width.sm} />
          <Text path="contact.close" label="Jam tutup" chip="view" type="time" className={width.sm} />
          <Text path="contact.days" label="Hari operasional" chip="view" max={40} placeholder="Senin sampai Sabtu" help="Muncul lewat {hari}. Jam buka dan tutup muncul lewat {jam}." />
        </Row>
      </Card>
      <Card title="Template chat WhatsApp" hint="Teks yang sudah terisi di kolom pesan ketika pembeli menekan tombol WhatsApp.">
        <Text path="wa.general" label="Pesan pembuka" chip="sys" max={200} rows={3} help="Dipakai semua tombol WhatsApp kecuali tombol di kartu harga." />
        <Text path="wa.plan" label="Pesan pembuka dari kartu harga" chip="sys" max={200} rows={3} help="Tulis {paket} di tempat nama paket akan disisipkan otomatis." />
      </Card>
    </>
  );
}

export function PembayaranPanel() {
  return (
    <>
      <VarsNote keys={["dp", "bank", "rekening_nama", "rekening_nomor"]} />
      <Card title="Transfer bank">
        <Row>
          <Text path="payment.bank" label="Bank" chip="view" className={width.md} />
          <Text path="payment.accountName" label="Nama rekening" chip="view" help="Muncul di ketentuan lewat {rekening_nama}." />
          <Text path="payment.accountNumber" label="Nomor rekening" chip="view" />
        </Row>
        <NumberField path="payment.dp" label="Persentase uang muka" chip="sys" suffix="%" className={cx("max-w-[200px]")} help="Mengisi {dp} di tanya jawab, ketentuan, dan catatan harga." />
      </Card>
      <Card title="QRIS">
        <Row>
          <Text path="payment.qrisNmid" label="Nomor QRIS (NMID)" chip="view" help="Tertera di bawah kode QRIS. Kosongkan kalau tidak ada." />
          <ImagePicker path="payment.qrisImage" label="Gambar QRIS" chip="view" purpose="qris" help="Format PNG atau JPG, sisi terpanjang minimal 800 piksel." />
        </Row>
      </Card>
      <Card title="Kalimat pembayaran di halaman harga">
        <Text path="payment.note" label="Catatan di bawah kartu harga" chip="view" max={160} rows={2} help="Tulis {dp} supaya angkanya mengikuti kolom persentase uang muka." />
      </Card>
    </>
  );
}
