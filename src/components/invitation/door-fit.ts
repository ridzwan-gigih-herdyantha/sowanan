import { useLayoutEffect, type RefObject } from "react";

// Ukuran awal dihitung oleh DOOR_FIT_SCRIPT (lib/door-fit-script.ts) sebelum halaman siap.
type Fit = { y: number; ySm?: number; x?: number };

// Atribut untuk elemen yang diskalakan. Ruang sisa y (dan ySm untuk layar di bawah 640 px) serta x dalam piksel.
export function doorFit({ y, ySm, x = 0 }: Fit) {
  return { "data-fit": "", "data-fit-y": y, "data-fit-y-sm": ySm, "data-fit-x": x || undefined, style: { transform: "scale(var(--door-fit, 1))" } };
}

// Menjaga --door-fit tetap benar saat ukuran layar atau isi berubah, misalnya setelah huruf selesai dimuat.
export function useDoorFit(ref: RefObject<HTMLElement | null>, { y, ySm, x = 0 }: Fit) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;
    const measure = () => {
      if (!el.offsetHeight) return;
      const room = window.innerHeight - (window.innerWidth < 640 && ySm !== undefined ? ySm : y);
      const s = Math.min(1, room / el.offsetHeight, x ? (window.innerWidth - x) / el.offsetWidth : 1);
      root.style.setProperty("--door-fit", String(s));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      root.style.removeProperty("--door-fit");
    };
  }, [ref, y, ySm, x]);
}
