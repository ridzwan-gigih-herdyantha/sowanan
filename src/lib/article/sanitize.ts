import "server-only";
import sanitizeHtml from "sanitize-html";
import { isEmptyHtml } from "@/lib/settings/html";

// Lebih longgar dari ketentuan karena artikel boleh punya gambar, tabel, warna, dan perataan. Gaya hanya yang dipakai
// toolbar, supaya gaya tempelan dari Word atau situs lain tetap terbuang. Isi dari editor kode juga lewat sini.
const COLOR = [/^#[0-9a-f]{3,8}$/i, /^rgba?\([\d\s.,%]+\)$/i, /^[a-z]+$/i];
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "strong", "em", "u", "s", "span", "ul", "ol", "li", "h2", "h3", "blockquote", "a", "img", "hr", "table", "thead", "tbody", "tr", "th", "td"],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "style", "loading"],
    th: ["colspan", "rowspan", "style"],
    td: ["colspan", "rowspan", "style"],
    span: ["style"],
    p: ["style"],
    h2: ["style"],
    h3: ["style"],
    li: ["style"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https"] },
  allowProtocolRelative: false,
  allowedStyles: {
    "*": { color: COLOR, "background-color": COLOR, "text-align": [/^(?:left|right|center|justify)$/] },
    img: { width: [/^\d+(?:\.\d+)?(?:px|%)$/], float: [/^(?:left|right|none)$/] },
  },
  transformTags: {
    b: "strong",
    i: "em",
    strike: "s",
    h1: "h2",
    h4: "h3",
    h5: "h3",
    h6: "h3",
    // Warna dari toolbar disimpan browser sebagai <font color>.
    font: (_, attribs) => ({ tagName: "span", attribs: { style: [attribs.color && `color:${attribs.color}`, attribs.style].filter(Boolean).join(";") } }),
    a: (tag, attribs) => ({ tagName: tag, attribs: attribs.target === "_blank" ? { ...attribs, rel: "noopener" } : attribs }),
    img: (tag, attribs) => ({ tagName: tag, attribs: { ...attribs, loading: "lazy" } }),
  },
  exclusiveFilter: (frame) => frame.tag === "p" && !frame.text.trim() && !frame.mediaChildren.length,
};

// isEmptyHtml hanya mengenal <p> dan <br>, jadi isi yang berupa gambar saja tidak dianggap kosong.
export const cleanArticleHtml = (html: string) => (isEmptyHtml(html) ? "" : sanitizeHtml(html, OPTIONS));

// Cuplikan untuk daftar artikel dan deskripsi halaman, dipotong di batas kata.
export function excerptOf(html: string, max = 170) {
  const text = sanitizeHtml(html.replace(/<\/(?:p|h2|h3|li|td|th|blockquote)>/gi, " "), { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  return `${text.slice(0, text.lastIndexOf(" ", max))}...`;
}
