// Saran kategori di form diambil dari kategori yang sudah pernah dipakai.
export const uniqueCategories = (rows: { category: string }[]) => [...new Set(rows.map((r) => r.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, "id"));
