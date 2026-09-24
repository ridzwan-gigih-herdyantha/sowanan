import type { Metadata } from "next";
import type { ComponentType } from "react";
import { AndiRina, andiRinaData, calendarEvent as andiRinaEvent } from "./andi-rina";

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
};
