import QRCode from "qrcode";
import { requirements } from "@/lib/invitation/requirements";
import type { InvitationData } from "@/lib/invitation/schema";
import type { PackageRules } from "@/lib/settings/text";
import { FONT_PRESETS, NAME_FONTS } from "@/themes/fonts";
import { PALETTES } from "@/themes/palettes";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

const CSS = `
@page { size: A4; margin: 16mm 14mm 18mm; }
* { box-sizing: border-box; }
html { background: #fff; }
body { margin: 0; font: 10.5pt/1.45 "Helvetica Neue", Arial, sans-serif; color: #2a2420; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.brand { font-size: 9pt; letter-spacing: 3px; color: #7a1f34; }
h1 { margin: 6px 0 2px; font: 600 22pt/1.15 Georgia, "Times New Roman", serif; }
.sub { color: #6b625b; }
.top { display: flex; gap: 18px; align-items: flex-start; justify-content: space-between; border-bottom: 1px solid #e8e0d6; padding-bottom: 14px; }
.demo { display: flex; gap: 10px; align-items: center; font-size: 9pt; color: #6b625b; max-width: 260px; }
.demo img { width: 84px; height: 84px; }
.demo b { display: block; color: #2a2420; font-size: 10pt; }
.legend { margin: 12px 0 4px; display: flex; flex-wrap: wrap; gap: 6px 16px; font-size: 9pt; color: #6b625b; }
.tips { margin: 10px 0 0; padding: 10px 12px; background: #f7efe9; border-radius: 4px; font-size: 9.5pt; }
.tips ul { margin: 4px 0 0; padding-left: 16px; }
h2 { margin: 22px 0 2px; font: 600 14pt/1.2 Georgia, "Times New Roman", serif; break-after: avoid; }
.note { margin: 0 0 6px; color: #6b625b; font-size: 9pt; }
table { width: 100%; border-collapse: collapse; }
td { padding: 5px 6px; border-bottom: 1px solid #efe8df; vertical-align: top; }
tr { break-inside: avoid; }
.box { width: 18px; }
.box span { display: inline-block; width: 11px; height: 11px; border: 1.2px solid #8a7f76; border-radius: 2px; margin-top: 3px; }
.label { width: 34%; font-weight: 600; }
.head .label { color: #7a1f34; }
.type { color: #4a423c; }
.type small { display: block; color: #8a7f76; font-size: 8.5pt; margin-top: 1px; }
.tag { width: 64px; text-align: right; font-size: 8pt; white-space: nowrap; }
.wajib { color: #fff; background: #7a1f34; padding: 1px 6px; border-radius: 99px; }
.opsional { color: #6b625b; border: 1px solid #cfc5bb; padding: 0 6px; border-radius: 99px; }
.auto { margin-top: 18px; font-size: 9.5pt; color: #6b625b; }
.pals { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 6px; }
.pal { display: flex; align-items: center; gap: 8px; padding: 7px 8px; border: 1px solid #e8e0d6; border-radius: 4px; break-inside: avoid; }
.pal .sw { display: flex; flex-shrink: 0; }
.pal .sw i { width: 16px; height: 16px; border-radius: 99px; margin-left: -4px; border: 1.5px solid #fff; box-shadow: 0 0 0 1px #e8e0d6; }
.pal .sw i:first-child { margin-left: 0; }
.pal b { font-weight: 600; font-size: 9.5pt; }
h3 { margin: 14px 0 2px; font-size: 10.5pt; }
.font td { vertical-align: middle; }
.font .sample { font-size: 15pt; line-height: 1.2; }
.font .body { font-size: 9.5pt; color: #6b625b; }
footer { margin-top: 22px; font-size: 8.5pt; color: #8a7f76; }
`;

type Input = { theme: string; themeName: string; pkgName: string; rules: PackageRules; data: InvitationData; skip: ReadonlySet<string>; demoUrl: string; couple: string };

const family = (f: { style: { fontFamily: string } }) => f.style.fontFamily.split(",")[0].replace(/['"]/g, "").trim();

// Pilihan palet dan font tema, hanya bila paket atau add-on membuka ganti palet dan font.
// Contoh tulisan memakai font asli dari Google Fonts supaya klien bisa membandingkan.
function styleChoices(theme: string, couple: string) {
  const palette = PALETTES[theme];
  const fonts = FONT_PRESETS[theme] ?? [];
  if (!palette) return { html: "", families: [] as string[] };
  const names = couple || "Budi & Ani";
  const pals = palette.presets
    .map((p) => `<div class="pal"><span class="sw">${palette.swatch.map((k) => `<i style="background:${esc(p.vars[k] ?? "#fff")}"></i>`).join("")}</span><b>${esc(p.name)}</b></div>`)
    .join("");
  const pairs = fonts
    .map((f, i) => `<tr class="font"><td class="box"><span></span></td><td class="label">${esc(f.name)}${i === 0 ? " <small>(bawaan)</small>" : ""}</td><td><div class="sample" style="font-family:'${esc(family(f.display))}'">${esc(names)}</div><div class="body" style="font-family:'${esc(family(f.body))}'">Dengan memohon rahmat Tuhan, kami mengundang Anda.</div></td></tr>`)
    .join("");
  const scripts = NAME_FONTS.map((f) => `<tr class="font"><td class="box"><span></span></td><td class="label">${esc(f.name)}</td><td><div class="sample" style="font-family:'${esc(family(f.font))}';font-size:20pt">${esc(names)}</div></td></tr>`).join("");
  const html = `<h2>Warna dan font</h2><p class="note">Pilih satu palet dan satu pasangan font. Kalau tidak memilih, tema memakai yang pertama.</p>
<h3>Palet warna</h3><div class="pals">${pals}<div class="pal"><span class="sw"><i style="background:#fff"></i><i style="background:#ddd"></i><i style="background:#999"></i></span><b>Warna sendiri: kirim tiga warna untuk latar, aksen, dan teks</b></div></div>
${pairs ? `<h3>Pasangan font</h3><table>${pairs}</table>` : ""}
<h3>Font khusus nama mempelai <small style="font-weight:400;color:#8a7f76">opsional</small></h3><table>${scripts}</table>`;
  const families = [...new Set([...fonts.flatMap((f) => [family(f.display), family(f.body)]), ...NAME_FONTS.map((f) => family(f.font))])];
  return { html, families };
}

export async function requirementsHtml({ theme, themeName, pkgName, rules, data, skip, demoUrl, couple }: Input) {
  const { sections, automatic } = requirements(theme, rules, data, skip);
  const style = rules.locked.warna_tema ? { html: "", families: [] } : styleChoices(theme, couple);
  const fontLink = style.families.length ? `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${style.families.map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}`).join("&")}&display=block">` : "";
  const qr = await QRCode.toDataURL(demoUrl, { margin: 0, width: 240, color: { dark: "#2a2420", light: "#ffffff" } });
  const title = `Kebutuhan data ${themeName}${couple ? ` - ${couple}` : ""}`;

  const rows = (s: (typeof sections)[number]) =>
    s.rows
      .map((r) => {
        const pad = `padding-left:${6 + r.depth * 16}px`;
        const tag = r.heading && !r.type.startsWith("Daftar") ? "" : `<span class="${r.required ? "wajib" : "opsional"}">${r.required ? "Wajib" : "Opsional"}</span>`;
        return `<tr class="${r.heading ? "head" : ""}"><td class="box">${r.heading ? "" : "<span></span>"}</td><td class="label" style="${pad}">${esc(r.label)}</td><td class="type">${esc(r.type)}${r.note ? `<small>${esc(r.note)}</small>` : ""}</td><td class="tag">${tag}</td></tr>`;
      })
      .join("");

  return `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>${esc(title)}</title>${fontLink}<style>${CSS}</style></head><body>
<div class="top">
  <div>
    <div class="brand">SOWANAN</div>
    <h1>Daftar Kebutuhan Data</h1>
    <div class="sub">Tema ${esc(themeName)}${pkgName ? ` · Paket ${esc(pkgName)}` : ""}${couple ? ` · ${esc(couple)}` : ""}</div>
  </div>
  <div class="demo"><img src="${qr}" alt=""><div><b>Lihat contoh tema</b>Pindai kode ini atau buka<br>${esc(demoUrl.replace(/^https?:\/\//, ""))}</div></div>
</div>
<div class="legend"><span><span class="wajib">Wajib</span> harus diisi</span><span><span class="opsional">Opsional</span> boleh dikosongkan</span><span>Centang kotak setelah datanya disiapkan.</span></div>
<div class="tips"><b>Tips menyiapkan foto</b><ul>
<li>Kirim foto dalam kualitas asli. Di WhatsApp, kirim sebagai dokumen supaya tidak terkompres.</li>
<li>Foto dengan cahaya cukup dan wajah tidak terpotong akan tampil paling bagus.</li>
<li>Posisi dan zoom foto bisa kami atur terpisah untuk tampilan HP dan desktop.</li>
</ul></div>
${sections.map((s) => `<h2>${esc(s.title)}</h2>${s.note ? `<p class="note">${esc(s.note)}</p>` : ""}<table>${rows(s)}</table>`).join("")}
${style.html}
${automatic.length ? `<p class="auto"><b>Tidak perlu data:</b> ${esc(automatic.join(", "))}. Bagian ini tampil otomatis.</p>` : ""}
<footer>Daftar kebutuhan data Sowanan untuk tema ${esc(themeName)}. Isian yang tidak tercantum tidak diperlukan.</footer>
</body></html>`;
}

// Daftar kebutuhan data dicetak lewat dialog cetak peramban lalu disimpan sebagai PDF.
// Tidak ada halaman untuk klien, isinya dibuat dari pilihan admin saat tombol ditekan.
export async function printRequirements(input: Input) {
  const html = await requirementsHtml(input);
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
  document.body.append(frame);
  const win = frame.contentWindow!;
  win.document.open();
  win.document.write(html);
  win.document.close();
  await new Promise((r) => (win.document.readyState === "complete" ? r(null) : win.addEventListener("load", r, { once: true })));
  // Contoh font baru terunduh setelah dipakai di halaman, jadi cetak menunggu semuanya siap.
  await win.document.fonts.ready;
  const remove = () => frame.remove();
  win.addEventListener("afterprint", remove, { once: true });
  window.setTimeout(remove, 60_000);
  win.focus();
  win.print();
}
