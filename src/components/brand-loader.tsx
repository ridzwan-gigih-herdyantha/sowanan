import { MARK_VIEWBOX } from "@/lib/brand";

// Belahan kiri dan kanan logo Sowanan, dipisah supaya bisa membuka seperti daun pintu.
const LEFT = "M0 224V86A86 86 0 0 1 67 2.13V224Z";
const RIGHT = "M105 2.13A86 86 0 0 1 172 86V224H105Z";
const ARCH = "M0 224V86A86 86 0 0 1 172 86V224Z";

// Tampilan memuat halaman: dua daun pintu lengkung logo terbuka dari engselnya, cahaya hangat terlihat di
// baliknya, lalu menutup kembali. Muncul sedikit terlambat supaya perpindahan halaman yang cepat tidak berkedip.
export function BrandLoader() {
  return (
    <div role="status" aria-live="polite" className="sw-loader fixed inset-0 z-[90] grid place-items-center bg-ivory">
      <div className="flex flex-col items-center">
        <svg viewBox={MARK_VIEWBOX} aria-hidden="true" className="h-20 w-auto overflow-visible">
          <defs>
            <linearGradient id="sw-glow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f6dfc4" />
              <stop offset="1" stopColor="#f3e9e4" />
            </linearGradient>
          </defs>
          <path d={ARCH} fill="url(#sw-glow)" className="sw-light" />
          <path d={LEFT} className="sw-leaf sw-leaf-l fill-wine" />
          <path d={RIGHT} className="sw-leaf sw-leaf-r fill-wine" />
        </svg>
        <p className="mt-6 font-serif text-[26px] leading-none text-ink">Sowanan</p>
        <p className="mt-2 text-[12px] tracking-[0.22em] text-ink-mute uppercase">Membuka pintu</p>
      </div>
    </div>
  );
}
