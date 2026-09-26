import type { InvitationData } from "./schema";
import { fieldPatterns, patternOf } from "./spec.ts";

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

// Isian kosong di draf diisi contoh dari undangan demo tema supaya preview tetap utuh. Path yang diisi dicatat.
export function fillPreview(draft: InvitationData, sample: InvitationData | null): { data: InvitationData; filled: string[] } {
  const filled: string[] = [];
  if (!sample) return { data: draft, filled };
  const fields = fieldPatterns();

  function walk(d: unknown, s: unknown, path: string): unknown {
    if (Array.isArray(d)) {
      const ref = Array.isArray(s) ? s : [];
      return d.map((item, i) => walk(item, ref[i] ?? ref[0], `${path}${i}.`));
    }
    if (isObj(d)) {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(d)) out[k] = k === "enabled" ? v : walk(v, isObj(s) ? s[k] : undefined, `${path}${k}.`);
      return out;
    }
    const empty = d === "" || d == null || (d === 0 && /\.(w|h)\.$/.test(path));
    if (empty && fields.get(patternOf(path.slice(0, -1)))?.required === false) return d;
    if (empty && s !== undefined && s !== "" && s !== 0) {
      if (typeof s === "string") filled.push(path.slice(0, -1));
      return s;
    }
    return d;
  }

  const data = walk(draft, sample, "") as InvitationData;
  if (Number.isNaN(Date.parse(data.event.start))) data.event.start = sample.event.start;
  if (Number.isNaN(Date.parse(data.event.end))) data.event.end = sample.event.end;
  return { data, filled };
}

// Peta untuk edit langsung di preview: teks per path dan URL media ke path.
export function editableMap(data: InvitationData, resolve: (v: string) => string) {
  const fields = fieldPatterns();
  const texts: Record<string, string> = {};
  const media: Record<string, string> = {};
  const walk = (v: unknown, path: string) => {
    if (Array.isArray(v)) v.forEach((x, i) => walk(x, path ? `${path}.${i}` : String(i)));
    else if (isObj(v)) for (const [k, x] of Object.entries(v)) walk(x, path ? `${path}.${k}` : k);
    else if (typeof v === "string" && v) {
      const f = fields.get(patternOf(path));
      if (f?.kind === "text" || f?.kind === "textarea") texts[path] = v;
      else if (f?.kind === "media") media[resolve(v)] = path;
    }
  };
  walk(data, "");
  return { texts, media };
}
