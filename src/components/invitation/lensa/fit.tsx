"use client";

import { useEffect, useRef } from "react";

// Teks satu baris yang ukurannya disetel sampai pas selebar wadahnya, apa pun panjangnya. max membatasi ukuran huruf.
export function FitText({ children, className = "", max = 240, ...rest }: { children: string; className?: string; max?: number } & Record<`data-${string}`, string>) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const box = el?.parentElement;
    if (!el || !box) return;
    const fit = () => {
      el.style.fontSize = "100px";
      const size = Math.min(max, (100 * box.clientWidth) / el.scrollWidth);
      el.style.fontSize = `${Math.floor(size * 10) / 10}px`;
    };
    fit();
    void document.fonts.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, [children, max]);

  return (
    <span ref={ref} {...rest} className={`inline-block whitespace-nowrap ${className}`}>
      {children}
    </span>
  );
}
