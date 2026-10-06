"use client";

import { ICONS, newId, PACKAGE_IDS, PACKAGE_NAMES, THEME_TIERS, type Settings } from "@/lib/settings/schema";
import { generalWaLink, themeCount, themesLimited, VARIABLES } from "@/lib/settings/text";
import { THEME_NAMES } from "@/themes/media";
import { useSettings } from "./form-context";
import { ImagePicker } from "./image-picker";
import { RichField } from "./rich-field";
import { Card, Note, RepList, Row, Select, Text, width } from "./ui";

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
        <Text path="sections.tema.foot" label="Kalimat di bawah daftar tema" chip="view" max={160} help="Contoh tautan ke WhatsApp: [Kirim contohnya lewat WhatsApp]({wa_link})" />
        <Text path="sections.harga.foot" label="Kalimat di bawah harga" chip="view" max={240} help="Tampil dalam kotak setelah daftar tambahan. Kosongkan untuk menyembunyikan." />
      </Card>

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
        <Row>
          <Text path="footer.line1" label="Baris footer" chip="view" max={80} help="Bisa memakai {kota}." />
          <Text path="footer.line2" label="Baris kedua footer" chip="view" max={60} />
        </Row>
      </Card>
    </>
  );
}

const SLUG_OPTIONS = Object.entries(THEME_NAMES).map(([slug, name]): [string, string] => [slug, `${slug} (${name})`]);

export function TemaPanel() {
  const { s } = useSettings();
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
          return { id: newId(), on: true, name: THEME_NAMES[slug] ?? "", slug, demo: `/${slug}`, tier: "lengkap" as const, style: "", image: "" };
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
              <Text path={`${base}.style`} label="Deskripsi satu baris" max={90} placeholder="film / urban" />
              <ImagePicker path={`${base}.image`} label="Gambar sampul" purpose="cover" className={width.md} tall help="Tangkapan layar ponsel, rasio 390 x 844." />
            </Row>
          </>
        )}
      />
    </Card>
  );
}

export function TanyaPanel() {
  return (
    <>
      <VarsNote keys={["harga", "harga_dasar", "harga_lengkap", "harga_istimewa", "pengerjaan", "dp", "kota", "jam", "wa_link"]} />
      <Card title="Tanya jawab" hint="Urutkan dari yang paling sering ditanya. Jawaban soal waktu pengerjaan, masa aktif, dan cara bayar sebaiknya memakai kata pengganti, bukan diketik ulang di sini.">
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
