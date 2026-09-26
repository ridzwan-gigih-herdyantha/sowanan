import type { ComponentType } from "react";
import type { InvitationView } from "@/lib/invitation/view";
import { AndiRina } from "./andi-rina";
import { BagasSekar } from "./bagas-sekar";
import { HendrawanLarasati } from "./hendrawan-larasati";

export type Theme = { name: string; Component: ComponentType<{ inv: InvitationView }>; themeColor: string };

export const THEMES: Record<string, Theme> = {
  "andi-rina": { name: "Senja Kota", Component: AndiRina, themeColor: "#F6EEE3" },
  "bagas-sekar": { name: "Ruang", Component: BagasSekar, themeColor: "#E8E5E0" },
  "hendrawan-larasati": { name: "Herbarium", Component: HendrawanLarasati, themeColor: "#F4EFE6" },
};
