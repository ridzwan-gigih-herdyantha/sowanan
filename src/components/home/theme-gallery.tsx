"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { cx, reveal } from "@/components/ui";

export type GalleryTheme = {
  id: string;
  name: string;
  style: string;
  image: string;
  bg: string;
  label: string;
  // Tautan per paket. Tanpa isi berarti satu tautan untuk semua paket, misalnya demo di luar situs atau WhatsApp.
  links: Record<string, { href: string; note?: string }>;
  href: string;
};

const Arrow = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5 fill-none stroke-current stroke-[1.6]">
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

// Satu pilihan paket untuk semua kartu, supaya kartu cukup berisi gambar, nama, dan gaya.
export function ThemeGallery({ header, themes, packages, initial }: { header: ReactNode; themes: GalleryTheme[]; packages: { id: string; name: string }[]; initial: string }) {
  const [pkg, setPkg] = useState(initial);
  const pkgName = packages.find((p) => p.id === pkg)?.name ?? "";
  const perPackage = packages.length > 1 && themes.some((t) => t.links[pkg]);
  return (
    <>
      <div className="mb-9 flex flex-col gap-5 md:mb-11 md:flex-row md:items-end md:justify-between md:gap-10">
        <div className="min-w-0">{header}</div>
        {perPackage && (
          <div className="flex flex-none flex-col gap-2" {...reveal()}>
            <p className="text-[13px] text-ink-mute">Lihat contoh untuk paket</p>
            <div role="group" aria-label="Paket untuk contoh undangan" className="inline-flex self-start rounded-full border border-line bg-white/60 p-1">
              {packages.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={p.id === pkg}
                  onClick={() => setPkg(p.id)}
                  className={cx(
                    "rounded-full px-4 py-1.5 text-[14px] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine",
                    p.id === pkg ? "bg-wine text-white" : "text-ink-soft hover:text-wine",
                  )}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-5">
        {themes.map((t, i) => {
          const link = t.links[pkg];
          return (
            <a
              key={t.id}
              href={link?.href ?? t.href}
              aria-label={link ? `${t.label}, paket ${pkgName}` : t.label}
              className="group block text-ink no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-wine"
              {...reveal(i)}
            >
              <div className={cx("relative flex h-64 items-center justify-center overflow-hidden rounded-sm border border-line text-sm tracking-[1px] text-wine transition-colors duration-200 group-hover:border-wine sm:h-[400px]", t.bg)}>
                {t.image ? (
                  <div className="aspect-[390/844] h-[88%] rounded-[22px] bg-ink p-[5px] shadow-[0_14px_30px_rgba(31,26,23,.22)] transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transform-none">
                    <div className="relative size-full overflow-hidden rounded-[17px]">
                      <Image src={t.image} alt={`Contoh undangan tema ${t.name}`} fill loading="eager" sizes="(min-width: 640px) 170px, 30vw" className="object-cover object-top" />
                    </div>
                  </div>
                ) : (
                  <span>{t.name}</span>
                )}
                {link?.note && <span className="absolute inset-x-2 top-2 rounded-full bg-paper/90 px-2.5 py-1 text-center text-[11px] text-wine">{link.note}</span>}
              </div>
              <div className="mt-3.5 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-serif text-xl leading-tight transition-colors duration-200 group-hover:text-wine sm:text-2xl">{t.name}</p>
                  {t.style && <p className="mt-1 text-[13px] text-ink-mute sm:text-[15px]">{t.style}</p>}
                </div>
                <span aria-hidden="true" className="mt-0.5 grid size-8 flex-none place-items-center rounded-full border border-wine/35 text-wine transition-colors duration-200 group-hover:border-wine group-hover:bg-wine group-hover:text-white sm:size-9">
                  <Arrow />
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </>
  );
}
