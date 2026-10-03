import type { ReactNode } from "react";

// Teks pengaturan memakai format sederhana: baris kosong memisahkan paragraf, **tebal**, dan [teks](tautan).

const safeHref = (href: string) => (/^(#|\/|https?:\/\/|mailto:|tel:)/.test(href) ? href : null);

export function Inline({ text }: { text: string }) {
  return <>{inline(text, "i")}</>;
}

function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = `${key}-${m.index}`;
    if (m[1] !== undefined) {
      out.push(<strong key={k}>{inline(m[1], k)}</strong>);
    } else {
      const href = safeHref(m[3]);
      out.push(
        href ? (
          <a key={k} href={href} rel={/^https?:/.test(href) ? "noopener" : undefined}>
            {m[2]}
          </a>
        ) : (
          m[2]
        ),
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export const paragraphs = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

export function plain(text: string) {
  return text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\[([^\]]+)\]\([^)\s]+\)/g, "$1");
}
