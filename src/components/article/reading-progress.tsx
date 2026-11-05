"use client";

import { motion, useMotionValue, useReducedMotion } from "motion/react";
import { useEffect } from "react";

// Garis kemajuan baca di tepi bawah header. Dihitung dari isi artikel, bukan seluruh halaman, supaya penuh saat
// tulisannya habis dan bukan saat footer tercapai.
export function ReadingProgress({ targetId }: { targetId: string }) {
  const reduced = useReducedMotion();
  const progress = useMotionValue(0);

  useEffect(() => {
    if (reduced) return;
    const update = () => {
      const box = document.getElementById(targetId)?.getBoundingClientRect();
      if (!box) return;
      const distance = box.height - window.innerHeight;
      progress.set(distance <= 0 ? 1 : Math.min(1, Math.max(0, -box.top / distance)));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [reduced, targetId, progress]);

  if (reduced) return null;
  return <motion.div aria-hidden="true" style={{ scaleX: progress }} className="absolute inset-x-0 -bottom-px h-0.5 origin-left bg-wine" />;
}
