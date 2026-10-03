import "server-only";
import sanitizeHtml from "sanitize-html";
import { escapeHtml, isEmptyHtml, toHtml } from "./html";
import { fill } from "./text";

// Hanya tag yang dipakai toolbar ketentuan. Gaya tempelan dari Word atau situs lain dibuang.
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "strong", "em", "u", "s", "ul", "ol", "li", "h3", "blockquote", "a"],
  allowedAttributes: { a: ["href", "target", "rel"] },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  transformTags: {
    b: "strong",
    i: "em",
    h1: "h3",
    h2: "h3",
    h4: "h3",
    a: (tag, attribs) => ({ tagName: tag, attribs: attribs.target === "_blank" ? { ...attribs, rel: "noopener" } : attribs }),
  },
  exclusiveFilter: (frame) => frame.tag === "p" && !frame.text.trim() && !frame.mediaChildren.length,
};

export const cleanHtml = (html: string) => (isEmptyHtml(html) ? "" : sanitizeHtml(toHtml(html), OPTIONS));

// Kata pengganti diisi lebih dulu dengan nilai yang sudah di-escape, lalu hasilnya dibersihkan sekali lagi.
export function renderHtml(html: string, vars: Record<string, string>) {
  const safe = Object.fromEntries(Object.entries(vars).map(([k, v]) => [k, escapeHtml(v)]));
  return cleanHtml(fill(toHtml(html), safe));
}
