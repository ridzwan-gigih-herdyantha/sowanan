// Isi ketentuan disimpan sebagai HTML dari editor Summernote. Isi lama masih berformat teks sederhana
// (baris kosong, "- ", "### ", "> ", **tebal**, [teks](tautan)) dan diubah ke HTML saat dibaca.

export const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export const isHtml = (s: string) => /<\/?[a-z][^>]*>/i.test(s);

function inline(text: string) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
}

function textToHtml(text: string): string {
  return text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n").map((l) => l.trim());
      if (lines.every((l) => l.startsWith("- "))) return `<ul>${lines.map((l) => `<li>${inline(l.slice(2))}</li>`).join("")}</ul>`;
      if (lines.length === 1 && lines[0].startsWith("### ")) return `<h3>${inline(lines[0].slice(4))}</h3>`;
      if (lines.every((l) => l.startsWith(">"))) {
        const inner = lines.map((l) => l.replace(/^>\s?/, "")).join("\n");
        return `<blockquote>${textToHtml(inner)}</blockquote>`;
      }
      return `<p>${inline(lines.join(" "))}</p>`;
    })
    .join("");
}

export const toHtml = (s: string) => (!s.trim() ? "" : isHtml(s) ? s : textToHtml(s));

// Summernote menyimpan isian kosong sebagai <p><br></p>.
export const isEmptyHtml = (s: string) => !s.replace(/<br\s*\/?>|<\/?p>|&nbsp;|\s/gi, "");
