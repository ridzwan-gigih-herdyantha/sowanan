import type { Metadata } from "next";
import type { ComponentType } from "react";
import { AndiRina, andiRinaData, calendarEvent as andiRinaEvent } from "./andi-rina";
import { BagasSekar, bagasSekarData, calendarEvent as bagasSekarEvent } from "./bagas-sekar";
import { HendrawanLarasati, hendrawanLarasatiData, calendarEvent as hendrawanLarasatiEvent } from "./hendrawan-larasati";

type Theme = {
  Component: ComponentType;
  metadata: Metadata;
  themeColor: string;
  calendar: { title: string; start: string; end: string; location: string; details: string };
};

export const THEMES: Record<string, Theme> = {
  "andi-rina": {
    Component: AndiRina,
    themeColor: "#F6EEE3",
    calendar: andiRinaEvent,
    metadata: {
      title: { absolute: `Andi & Rina | ${andiRinaData.dateLong}` },
      description: `Dengan penuh sukacita, kami mengundangmu ke pernikahan Andi & Rina di ${andiRinaData.city}.`,
      openGraph: {
        title: `Andi & Rina | ${andiRinaData.dateLong}`,
        description: "Kabar bahagia dari kami. Buka undangannya di sini.",
        url: `/${andiRinaData.slug}`,
        images: [{ url: andiRinaData.images.og, width: 1200, height: 630, alt: "Andi dan Rina" }],
      },
    },
  },
  "bagas-sekar": {
    Component: BagasSekar,
    themeColor: "#E8E5E0",
    calendar: bagasSekarEvent,
    metadata: {
      title: { absolute: `Bagas & Sekar | ${bagasSekarData.dateLong}` },
      description: `Dengan penuh syukur, kami mengundangmu ke pernikahan Bagas & Sekar di ${bagasSekarData.city}.`,
      openGraph: {
        title: `Bagas & Sekar | ${bagasSekarData.dateLong}`,
        description: "Kami mengundangmu untuk hadir dan memberi doa restu.",
        url: `/${bagasSekarData.slug}`,
        images: [{ url: bagasSekarData.images.og, width: 1200, height: 630, alt: "Bagas dan Sekar" }],
      },
    },
  },
  "hendrawan-larasati": {
    Component: HendrawanLarasati,
    themeColor: "#F4EFE6",
    calendar: hendrawanLarasatiEvent,
    metadata: {
      title: { absolute: `Hendrawan & Larasati | ${hendrawanLarasatiData.dateLong}` },
      description: `Dengan penuh sukacita, kami mengundangmu ke pernikahan Hendrawan & Larasati di ${hendrawanLarasatiData.place}.`,
      openGraph: {
        title: `Hendrawan & Larasati | ${hendrawanLarasatiData.dateLong}`,
        description: "Satu lembar baru dalam koleksi kami. Buka undangannya di sini.",
        url: `/${hendrawanLarasatiData.slug}`,
        images: [{ url: hendrawanLarasatiData.images.og, width: 1200, height: 630, alt: "Hendrawan dan Larasati" }],
      },
    },
  },
};
