// Judul jadi alamat artikel: huruf beraksen dinormalkan, selain huruf dan angka menjadi tanda hubung.
export function slugify(title: string) {
  return title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

const dateFmt = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });

export const formatArticleDate = (iso: string) => dateFmt.format(new Date(iso));

// Keterangan diperbarui hanya berarti kalau jatuh di hari yang berbeda dari tanggal dibuat.
export const updatedLater = (createdAt: string, updatedAt: string) => formatArticleDate(createdAt) !== formatArticleDate(updatedAt);
