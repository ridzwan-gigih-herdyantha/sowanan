// Pilihan filter daftar undangan. Dipakai komponen filter dan halaman daftar di server.
export const FILTERS = {
  paket: { label: "Paket", options: { dasar: "Dasar", lengkap: "Lengkap", istimewa: "Istimewa", kosong: "Belum dipilih" } },
  bayar: { label: "Bayar", options: { lunas: "Lunas", belum: "Belum lunas" } },
  status: { label: "Status", options: { tayang: "Tayang", draf: "Draf", contoh: "Undangan contoh" } },
  arsip: { label: "Arsip", options: { aktif: "Belum diarsipkan", segera: "Perlu diberi tahu", beku: "Sudah diarsipkan" } },
} as const;

export type FilterKey = keyof typeof FILTERS;
