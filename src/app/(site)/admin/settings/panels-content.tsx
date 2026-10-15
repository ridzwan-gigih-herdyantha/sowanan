"use client";

import { HOME_THEMES, ICONS, newId, PACKAGE_IDS, PACKAGE_NAMES, THEME_CATEGORIES, THEME_TIERS, type Settings } from "@/lib/settings/schema";
import { generalWaLink, themeCount, themesLimited, VARIABLES } from "@/lib/settings/text";
import { THEME_NAMES } from "@/themes/media";
import Image from "next/image";
import { Dropdown } from "../dropdown";
import { mediaUrl } from "@/lib/storage/media";
import { setIn, useSettings } from "./form-context";
import { ImagePicker } from "./image-picker";
import { RichField } from "./rich-field";
import { Card, DeleteButton, Note, RepList, Row, Select, Text, width } from "./ui";

const v = (k: string) => `{${k}}`;

// Daftar kata pengganti untuk panel yang memakainya.
export function VarsNote({ keys, rich }: { keys: string[]; rich?: boolean }) {
  return (
    <Note>
      <details>
        <summary className="cursor-pointer font-medium">Kata pengganti yang bisa ditulis di teks</summary>
        <p className="mt-2">Nilainya mengikuti data terbaru, jadi tidak perlu diketik ulang tiap kali harga atau jam layanan berubah.</p>
        <ul className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2">
          {keys.map((k) => (
            <li key={k}>
              <code className="rounded bg-white/70 px-1 font-mono text-[12px]">{v(k)}</code> {VARIABLES[k]}
            </li>
          ))}
        </ul>
        {rich ? (
          <p className="mt-2">Kata pengganti juga bisa dipakai di dalam tautan, misalnya alamat tautan {v("wa_link")}.</p>
        ) : (
          <p className="mt-2">
            Format: <b>**tebal**</b> dan <code className="font-mono text-[12px]">[teks](tautan)</code>.
          </p>
        )}
      </details>
    </Note>
  );
}

const SECTIONS: [keyof Settings["sections"], string][] = [
  ["tema", "Pilihan tema"],
  ["fitur", "Fitur"],
  ["harga", "Harga"],
  ["addon", "Tambahan di luar paket"],
  ["cara", "Cara pesan"],
  ["faq", "Tanya jawab"],
];

const OFFER_CARDS = [
  ["tema", "Kartu tema khusus", "di bawah daftar tema"],
  ["harga", "Kartu kebutuhan khusus", "setelah daftar tambahan"],
] as const;

const ANCHORS = "#tema, #fitur, #harga, #cara, atau #tanya";

export function BerandaPanel() {
  const { s } = useSettings();
  const wa = generalWaLink(s).replace(/^https:\/\//, "");
  return (
    <>
      <VarsNote keys={["harga", "waktu", "pengerjaan", "masa_aktif", "dp", "jam", "hari", "kota", "wa_link"]} />
      <Card title="Bagian pembuka" hint="Baris pertama yang dibaca calon klien. Judul sebaiknya memuat harga atau janji waktu, bukan dua-duanya.">
        <Text path="hero.eyebrow" label="Teks kecil di atas judul" chip="view" max={60} help="Tampil huruf besar semua. Maksimal satu baris di ponsel." />
        <Text path="hero.title" label="Judul" chip="view" max={70} help="Tulis {harga} supaya angkanya ikut berubah tiap kali harga paket diubah." />
        <Text path="hero.sub" label="Kalimat penjelas" chip="view" max={320} rows={3} help="Boleh dikosongkan. Baris kosong memisahkan paragraf." />
        <Row>
          <Text path="hero.cta1" label="Label tombol utama" chip="view" max={28} />
          <Text
            path="hero.cta1Href"
            label="Tujuan tombol utama"
            chip="sys"
            placeholder="Kosong berarti WhatsApp"
            help={s.hero.cta1Href ? `Isi ${ANCHORS}, /halaman, atau https://alamat. Kosongkan untuk WhatsApp.` : `Sekarang ke WhatsApp ${wa.slice(0, 60)}${wa.length > 60 ? "..." : ""}, nomor dan pesan dari tab Kontak.`}
          />
        </Row>
        <Row>
          <Text path="hero.cta2" label="Label tombol kedua" chip="view" max={28} help="Kosongkan untuk menyembunyikan tombol." />
          <Text path="hero.cta2Href" label="Tujuan tombol kedua" chip="sys" placeholder="#tema" help={`Isi anchor seperti ${ANCHORS}.`} />
        </Row>
        <Text path="hero.note" label="Catatan di bawah tombol" chip="view" max={120} help="Baris kecil di bawah tombol. Bisa memakai {jam}." />
      </Card>

      <Card title="Judul tiap bagian" hint="Mengubah judul di sini sekaligus mengubah teks di menu atas. Penjelas tampil di bawah judul dan boleh dikosongkan.">
        {SECTIONS.map(([key, label]) => (
          <Row key={key}>
            <Text path={`sections.${key}.title`} label={label} chip="view" max={40} className={width.md} />
            <Text path={`sections.${key}.sub`} label={`Penjelas ${label.toLowerCase()}`} chip="view" max={240} />
          </Row>
        ))}
      </Card>

      {OFFER_CARDS.map(([key, title, where]) => (
        <Card key={key} title={title} hint={`Kartu panjang berlatar wine ${where}. Kosongkan judul dan kalimat untuk menyembunyikan kartu.`}>
          <Row>
            <Text path={`sections.${key}.custom.title`} label="Judul kartu" chip="view" max={60} />
            <Text path={`sections.${key}.custom.button`} label="Label tombol kartu" chip="view" max={28} help="Tujuannya WhatsApp, nomor dan pesan dari tab Kontak." />
          </Row>
          <Text path={`sections.${key}.custom.text`} label="Kalimat kartu" chip="view" max={240} rows={2} />
          <Row>
            {[0, 1, 2].map((i) => (
              <Text key={i} path={`sections.${key}.custom.points.${i}`} label={`Poin kartu ${i + 1}`} chip="view" max={40} />
            ))}
          </Row>
        </Card>
      ))}

      <Card title="Daftar fitur" hint="Urutan di sini sama dengan urutan di halaman. Yang dimatikan tetap tersimpan, hanya tidak ditampilkan.">
        <RepList
          path="features"
          noun="fitur"
          max={30}
          blank={() => ({ id: newId(), on: true, name: "", text: "", icon: "centang" as const, label: "" })}
          render={(_, i, base) => (
            <>
              <Row>
                <Text path={`${base}.name`} label="Nama fitur" max={30} />
                <Text path={`${base}.text`} label="Keterangan singkat" max={90} />
                <Select path={`${base}.icon`} label="Ikon" className={width.md} options={Object.entries(ICONS)} />
              </Row>
              <Row>
                <Text path={`${base}.label`} label="Label paket" max={30} className={width.md} help={i === 0 ? "Opsional, misalnya Paket Lengkap ke atas." : undefined} />
              </Row>
            </>
          )}
        />
      </Card>

      <Card title="Cara pesan" hint="Langkah ditampilkan berurutan dan diberi nomor otomatis. Penjelasan cukup satu kalimat.">
        <RepList
          path="steps"
          noun="langkah"
          min={1}
          max={8}
          blank={() => ({ id: newId(), title: "", text: "" })}
          render={(_, __, base) => (
            <Row>
              <Text path={`${base}.title`} label="Judul langkah" max={24} className={width.md} />
              <Text path={`${base}.text`} label="Penjelasan" max={110} />
            </Row>
          )}
        />
      </Card>

      <Card title="Bagian penutup dan footer">
        <Row>
          <Text path="closing.title" label="Judul penutup" chip="view" max={50} />
          <Text path="closing.button" label="Label tombol" chip="view" max={28} help="Tujuannya WhatsApp, nomor dan pesan dari tab Kontak." />
        </Row>
        <Text path="closing.text" label="Kalimat penutup" chip="view" max={160} />
        <Text path="closing.button2" label="Label tombol kedua" chip="view" max={28} help="Menuju bagian pilihan tema. Kosongkan untuk menyembunyikan tombol." />
        <Row>
          {["Sampul kiri", "Sampul tengah (paling depan)", "Sampul kanan"].map((label, i) => (
            <Select
              key={label}
              path={`closing.covers.${i}`}
              label={label}
              chip="view"
              help={i === 0 ? "Tumpukan sampul tema di samping ajakan penutup. Tema yang dimatikan dilewati." : undefined}
              options={[["", "Tidak ditampilkan"], ...s.themes.map((t): [string, string] => [t.slug, t.name])]}
            />
          ))}
        </Row>
        <Row>
          {[0, 1, 2].map((i) => (
            <Text key={i} path={`closing.points.${i}`} label={`Poin ${i + 1}`} chip="view" max={40} help={i === 0 ? "Muncul di bawah tombol. Bisa memakai {harga} dan {waktu}." : undefined} />
          ))}
        </Row>
        <Row>
          <Text path="footer.line1" label="Baris footer" chip="view" max={80} help="Bisa memakai {kota}." />
          <Text path="footer.line2" label="Baris kedua footer" chip="view" max={60} />
        </Row>
        <Row>
          <Text path="footer.nav" label="Judul kolom tautan" chip="view" max={24} />
          <Text path="footer.demos" label="Judul kolom kategori tema" chip="view" max={24} />
          <Text path="footer.reach" label="Judul kolom kontak" chip="view" max={24} />
        </Row>
      </Card>
    </>
  );
}

const SLUG_OPTIONS = Object.entries(THEME_NAMES).map(([slug, name]): [string, string] => [slug, `${slug} (${name})`]);

export function TemaPanel() {
  const { s } = useSettings();
  return (
    <>
      <HomeThemesCard />
      <ThemeList s={s} />
    </>
  );
}

function ThemeList({ s }: { s: Settings }) {
  const counts = PACKAGE_IDS.map((p) => `${PACKAGE_NAMES[p]} ${themeCount(s, p).n}`).join(", ");
  const limited = themesLimited(s);
  return (
    <Card
      title="Daftar tema"
      hint={
        limited ? (
          <>
            Slug dan kolom Tersedia di paket dipakai sistem, sisanya tampilan. Pilihan tema saat membuat undangan dan jumlah tema di kartu harga mengikuti kolom Tersedia di paket. Sekarang:{" "}
            <b className="font-medium text-[#2A2320]">{counts}</b> dari {themeCount(s, "dasar").total} tema aktif.
          </>
        ) : (
          <>
            Semua paket bisa memilih semua tema, karena baris berkunci <code className="font-mono">jumlah_tema</code> tidak ada di Isi paket. Kolom Tersedia di paket baru dipakai lagi
            kalau baris itu ditambahkan kembali.
          </>
        )
      }
    >
      <RepList
        path="themes"
        noun="tema"
        max={SLUG_OPTIONS.length}
        blank={() => {
          const used = new Set(s.themes.map((t) => t.slug));
          const slug = SLUG_OPTIONS.find(([k]) => !used.has(k))?.[0] ?? SLUG_OPTIONS[0][0];
          return { id: newId(), on: true, name: THEME_NAMES[slug] ?? "", slug, demo: `/${slug}`, tier: "lengkap" as const, category: "minimalis" as const, style: "", image: "" };
        }}
        render={(_, __, base) => (
          <>
            <Row>
              <Text path={`${base}.name`} label="Nama tema" max={24} />
              <Select path={`${base}.slug`} label="Slug" chip="sys" className={width.md} options={SLUG_OPTIONS} help="Kode tema yang sudah dibuat pengembang." />
              <Text path={`${base}.demo`} label="Tautan demo" placeholder="/andi-rina" help="Kosong berarti kartu membuka WhatsApp." />
              <Select
                path={`${base}.tier`}
                label="Tersedia di paket"
                chip="sys"
                className={width.md}
                options={Object.entries(THEME_TIERS)}
                disabled={!limited}
                help={limited ? undefined : "Tidak dipakai, semua paket bebas memilih."}
              />
            </Row>
            <Row>
              <Select path={`${base}.category`} label="Kategori" chip="view" className={width.md} options={Object.entries(THEME_CATEGORIES)} help="Untuk filter di section Tema." />
              <Text path={`${base}.style`} label="Deskripsi satu baris" max={90} placeholder="film / urban" />
              <ImagePicker path={`${base}.image`} label="Gambar sampul" purpose="cover" className={width.md} tall help="Tangkapan layar ponsel, rasio 390 x 844." />
            </Row>
          </>
        )}
      />
    </Card>
  );
}

// Tema yang tampil di section tema beranda: diurutkan, dihapus, dan ditambah dari daftar tema aktif.
function HomeThemesCard() {
  const { s, update } = useSettings();
  const ids = s.homeThemes;
  const write = (next: string[]) => update((d) => setIn(d, "homeThemes", next));
  const byId = (id: string) => s.themes.find((t) => t.id === id);
  const options = s.themes.filter((t) => t.on && !ids.includes(t.id)).map((t) => ({ value: t.id, label: t.name }));
  const move = (i: number, to: number) => {
    const next = [...ids];
    const [x] = next.splice(i, 1);
    next.splice(to, 0, x);
    write(next);
  };
  return (
    <Card title="Tema di beranda" hint={`Paling banyak ${HOME_THEMES} tema, tampil sesuai urutan di sini. Tema lainnya bisa dilihat pengunjung di halaman /tema. Kosong berarti beranda menampilkan ${HOME_THEMES} tema aktif pertama.`}>
      <div className="flex flex-col gap-2">
        {ids.map((id, i) => {
          const t = byId(id);
          return (
            <div key={id} className="flex items-center gap-3 rounded-[9px] border border-[#E8E0D6] bg-[#FCFAF7] px-3 py-2.5">
              <span className="w-5 text-center font-serif text-[15px] text-wine">{i + 1}</span>
              <div className="relative h-14 w-[26px] flex-none overflow-hidden rounded-[4px] bg-blush">{t?.image && <Image src={mediaUrl(t.image)} alt="" fill sizes="26px" className="object-cover object-top" />}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium text-[#2A2320]">{t?.name ?? "Tema dihapus"}</p>
                <p className="truncate text-[12px] text-ink-mute">{t ? (t.on ? t.style || t.slug : "Tema ini sedang disembunyikan, tidak tampil di beranda.") : "Hapus dari daftar ini."}</p>
              </div>
              <div className="flex flex-none items-center gap-1.5">
                <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label={`Naikkan ${t?.name ?? "tema"}`} className="size-[26px] rounded-[5px] border border-[#E8E0D6] bg-white text-ink-mute disabled:opacity-40">&uarr;</button>
                <button type="button" onClick={() => move(i, i + 1)} disabled={i === ids.length - 1} aria-label={`Turunkan ${t?.name ?? "tema"}`} className="size-[26px] rounded-[5px] border border-[#E8E0D6] bg-white text-ink-mute disabled:opacity-40">&darr;</button>
                <DeleteButton label={`Keluarkan ${t?.name ?? "tema"} dari beranda`} onClick={() => write(ids.filter((x) => x !== id))} />
              </div>
            </div>
          );
        })}
        {ids.length === 0 && <p className="rounded-[9px] border border-dashed border-[#E8E0D6] px-3 py-4 text-center text-[13px] text-ink-mute">Belum ada tema dipilih.</p>}
      </div>
      {ids.length < HOME_THEMES && options.length > 0 && (
        <Dropdown label="Tambah tema ke beranda" placeholder="+ Tambah tema ke beranda" value="" options={options} onChange={(v) => write([...ids, v])} className="mt-3 w-full sm:w-[320px]" />
      )}
    </Card>
  );
}

export function TanyaPanel() {
  return (
    <>
      <VarsNote keys={["harga", "harga_dasar", "harga_lengkap", "harga_istimewa", "pengerjaan", "dp", "kota", "jam", "wa_link"]} />
      <Card title="Tanya jawab" hint="Urutkan dari yang paling sering ditanya. Jawaban soal waktu pengerjaan, masa aktif, dan cara bayar sebaiknya memakai kata pengganti, bukan diketik ulang di sini.">
        <Text path="sections.faq.cta" label="Label tautan WhatsApp" chip="view" max={40} help="Tampil di bawah judul tanya jawab. Kosongkan untuk menyembunyikan." />
        <RepList
          path="faq"
          noun="pertanyaan"
          max={30}
          blank={() => ({ id: newId(), on: true, q: "", a: "" })}
          render={(_, __, base) => (
            <>
              <Text path={`${base}.q`} label="Pertanyaan" max={80} />
              <Text path={`${base}.a`} label="Jawaban" max={600} rows={3} />
            </>
          )}
        />
      </Card>
      <Card title="Tanya jawab halaman tema" hint="Tampil di bawah daftar tema di halaman /tema. Fokus ke pertanyaan seputar pilihan tema, warna, dan foto.">
        <RepList
          path="themeFaq"
          noun="pertanyaan"
          max={20}
          blank={() => ({ id: newId(), on: true, q: "", a: "" })}
          render={(_, __, base) => (
            <>
              <Text path={`${base}.q`} label="Pertanyaan" max={80} />
              <Text path={`${base}.a`} label="Jawaban" max={600} rows={3} />
            </>
          )}
        />
      </Card>
    </>
  );
}

export function KetentuanPanel() {
  return (
    <>
      <VarsNote rich keys={["dp", "jam", "wa", "wa_link", "rekening_nama", "bank", "instagram", "masa_aktif", "pengerjaan"]} />
      <Card title="Halaman ketentuan">
        <Row>
          <Text path="terms.date" label="Tanggal berlaku" chip="view" max={40} className={width.md} />
          <Text path="terms.title" label="Judul halaman" chip="view" max={50} />
        </Row>
        <RichField path="terms.intro" label="Paragraf pembuka" chip="view" height={110} />
      </Card>
      <Card title="Pasal" hint="Nomor pasal dibuat otomatis dari urutan. Di toolbar, pilih Kutipan untuk kotak catatan dan Judul 3 untuk subjudul. Format yang ditempel dari Word atau situs lain dibersihkan saat disimpan.">
        <RepList
          path="terms.articles"
          noun="pasal"
          max={40}
          blank={() => ({ id: newId(), on: true, title: "", body: "" })}
          render={(_, __, base) => (
            <>
              <Text path={`${base}.title`} label="Judul pasal" max={60} />
              <RichField path={`${base}.body`} label="Isi" />
            </>
          )}
        />
      </Card>
    </>
  );
}
