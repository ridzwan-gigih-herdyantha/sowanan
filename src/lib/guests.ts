export type GuestInput = { name: string; phone: string | null };

export const MAX_GUESTS = 2000;

export function normalizePhone(raw: string): string | null {
  let d = raw.replace(/[^\d+]/g, "");
  if (d.startsWith("+")) d = d.slice(1);
  if (d.startsWith("0")) d = `62${d.slice(1)}`;
  else if (d.startsWith("8")) d = `62${d}`;
  return /^62\d{7,13}$/.test(d) ? d : null;
}

const cleanName = (s: string) => s.replace(/\s+/g, " ").trim().slice(0, 80);
const PHONE_TAIL = /[\s:;|-]*(\+?\d[\d\s-]{7,}\d)\s*$/;

// Tiap baris atau koma satu tamu. Nomor HP di akhir entri ikut terbaca, misal "Budi 0812 3456 789".
export function parseGuestText(text: string): GuestInput[] {
  return text
    .split(/[\n,]+/)
    .map((entry) => {
      const m = PHONE_TAIL.exec(entry);
      const phone = m ? normalizePhone(m[1]) : null;
      return { name: cleanName(phone && m ? entry.slice(0, m.index) : entry), phone };
    })
    .filter((g) => g.name);
}

const NAME_HEADER = /nama|name|tamu|guest/i;
const PHONE_HEADER = /hp|wa|whatsapp|telp|telepon|phone|nomor|no\.?\s*hp/i;

// Baris dari Excel atau CSV. Kolom nama dan nomor ditebak dari judul kolom, kalau tidak ada pakai kolom 1 dan 2.
export function parseGuestRows(rows: unknown[][]): GuestInput[] {
  const cells = rows.map((r) => r.map((c) => (c == null ? "" : String(c).trim())));
  const head = cells[0] ?? [];
  const hasHeader = head.some((c) => NAME_HEADER.test(c) || PHONE_HEADER.test(c));
  let nameCol = hasHeader ? head.findIndex((c) => NAME_HEADER.test(c)) : 0;
  let phoneCol = hasHeader ? head.findIndex((c) => PHONE_HEADER.test(c)) : 1;
  if (nameCol < 0) nameCol = 0;
  if (phoneCol === nameCol) phoneCol = -1;

  return cells
    .slice(hasHeader ? 1 : 0)
    .map((r) => ({ name: cleanName(r[nameCol] ?? ""), phone: phoneCol >= 0 ? normalizePhone(r[phoneCol] ?? "") : null }))
    .filter((g) => g.name);
}

export function parseCsv(text: string): string[][] {
  const sep = (text.split("\n")[0].match(/;/g)?.length ?? 0) > (text.split("\n")[0].match(/,/g)?.length ?? 0) ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === sep) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell || row.length) rows.push([...row, cell]);
  return rows;
}

export const DEFAULT_GUEST_MESSAGE = `Kepada Yth.
{nama}

Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan kami.

Detail acara:
{link}

Merupakan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.

Terima kasih.
{mempelai}`;

export function guestLink(origin: string, slug: string, name: string) {
  return `${origin}/${slug}?to=${encodeURIComponent(name).replace(/%20/g, "+")}`;
}

export function fillGuestMessage(template: string, vars: { nama: string; link: string; mempelai: string; tanggal: string }) {
  return template.replace(/\{(nama|link|mempelai|tanggal)\}/g, (_, k: keyof typeof vars) => vars[k]);
}
