import type { Cell, Row, SheetData, SheetOptions } from "write-excel-file/browser";

export type RsvpRow = { name: string; attending: boolean; guests: number; time: string; invited: boolean };

const BORDER = { borderStyle: "thin", borderColor: "#000000" } as const;
const RED = "#FF0000";

type Box = { title: string; formula: string; color?: string };

// Kotak ringkasan: judul 3 baris, angka 4 baris, masing-masing 3 kolom digabung.
function boxCells(box: Box, row: number): Cell[] {
  const base = { ...BORDER, align: "center", alignVertical: "center", fontWeight: "bold", textColor: box.color ?? "#000000", wrap: true } as const;
  if (row === 0) return [{ ...base, value: box.title, fontSize: 16, columnSpan: 3, rowSpan: 3 }, null, null];
  if (row === 3) return [{ ...base, value: box.formula, type: "Formula", fontSize: 24, columnSpan: 3, rowSpan: 4 }, null, null];
  return [null, null, null];
}

export function rsvpSheet(rows: RsvpRow[]): { data: SheetData; options: SheetOptions<Blob> } {
  const last = Math.max(rows.length + 1, 2);
  const range = (c: string) => `${c}2:${c}${last}`;
  const boxes: Box[] = [
    { title: "TOTAL HADIR", formula: `=COUNTIF(${range("B")},"Hadir")` },
    { title: "TOTAL TIDAK HADIR", formula: `=COUNTIF(${range("B")},"Tidak hadir")`, color: RED },
    { title: "JUMLAH ORANG HADIR", formula: `=SUMIF(${range("B")},"Hadir",${range("C")})` },
  ];

  const head = (value: string): Cell => ({ value, fontWeight: "bold", backgroundColor: "#F2F2F2", ...BORDER });
  const body = (value: string | number, extra: object = {}): Cell => ({ value, ...BORDER, ...extra });

  const table: Row[] = [
    [head("Nama"), head("Kehadiran"), head("Jumlah orang"), head("Waktu"), head("Ada di daftar tamu")],
    ...rows.map((r) => [
      body(r.name),
      body(r.attending ? "Hadir" : "Tidak hadir", r.attending ? {} : { textColor: RED }),
      body(r.guests, { type: Number, align: "right" }),
      body(r.time),
      body(r.invited ? "Ya" : ""),
    ]),
  ];

  const height = Math.max(table.length, 7);
  const data: SheetData = Array.from({ length: height }, (_, i) => {
    const left: Row = table[i] ?? [null, null, null, null, null];
    return [...left, null, ...boxes.flatMap((b, n) => [...boxCells(b, i), ...(n < boxes.length - 1 ? [null] : [])])];
  });

  const options: SheetOptions<Blob> = {
    sheet: "RSVP",
    columns: [{ width: 28 }, { width: 14 }, { width: 14 }, { width: 20 }, { width: 18 }, { width: 3 }, { width: 8 }, { width: 8 }, { width: 8 }, { width: 3 }, { width: 8 }, { width: 8 }, { width: 8 }, { width: 3 }, { width: 8 }, { width: 8 }, { width: 8 }],
    stickyRowsCount: 1,
  };
  return { data, options };
}
