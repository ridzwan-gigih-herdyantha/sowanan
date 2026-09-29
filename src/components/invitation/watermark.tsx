import { WatermarkGuard } from "./watermark-guard";

const TEXT = "BELUM AKTIF";

const tile = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100"><text x="100" y="58" text-anchor="middle" font-family="system-ui,-apple-system,Segoe UI,sans-serif" font-weight="700" font-size="21" letter-spacing="1.5" fill="rgba(17,17,17,.14)" stroke="rgba(255,255,255,.22)" stroke-width=".6">${TEXT}</text></svg>`,
);

// Satu lapisan pola. Ukuran tile mengikuti layar supaya sekitar 10 teks terlihat, separuh dari tiap lapisan.
const layer = (offset: string) =>
  `content:"";position:fixed;top:-50%;left:-50%;width:200%;height:200%;z-index:2147483647;pointer-events:none;` +
  `--sw:max(340px,calc(34vw + 23vh));background:url("data:image/svg+xml,${tile}") ${offset}/var(--sw) calc(var(--sw)/2) repeat;` +
  `transform:rotate(-30deg);display:block;visibility:visible;opacity:0.2`;

export const LAYER_A = layer("0 0");
export const LAYER_B = layer("calc(var(--sw)/2) calc(var(--sw)/4)");

// Dua lapisan dari dua tag style terpisah, tetap jalan walau JavaScript mati.
// Menghapus satu tag atau mematikan satu aturan hanya menghilangkan separuh pola.
export function Watermark() {
  return (
    <>
      <style data-sw="a" dangerouslySetInnerHTML={{ __html: `html::before{${LAYER_A}}` }} />
      <WatermarkGuard text={TEXT} a={LAYER_A} b={LAYER_B} />
      <style data-sw="b" dangerouslySetInnerHTML={{ __html: `body::after{${LAYER_B}}` }} />
    </>
  );
}
