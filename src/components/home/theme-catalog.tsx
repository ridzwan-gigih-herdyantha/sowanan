"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ComponentProps } from "react";
import { ThemeFilter } from "./theme-filter";

// Filter tema yang membaca dan menulis kategori di alamat halaman (?kategori=floral), jadi tautan dari beranda
// bisa langsung membuka kategori tertentu dan filter yang dipilih bisa dibagikan.
export function ThemeCatalog(props: Omit<ComponentProps<typeof ThemeFilter>, "initial" | "onPick">) {
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const asked = params.get("kategori") ?? "";
  const initial = props.categories.some(([k]) => k === asked) ? asked : "";
  const onPick = (k: string) => router.replace(k ? `${path}?kategori=${k}` : path, { scroll: false });
  return <ThemeFilter key={initial} {...props} initial={initial} onPick={onPick} />;
}
