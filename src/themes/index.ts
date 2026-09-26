import type { ComponentType } from "react";
import type { InvitationView } from "@/lib/invitation/view";
import { AndiRina } from "./andi-rina";
import { BagasSekar } from "./bagas-sekar";
import { HendrawanLarasati } from "./hendrawan-larasati";
import { THEME_NAMES } from "./media";

export type Theme = { name: string; Component: ComponentType<{ inv: InvitationView }>; themeColor: string };

export const THEMES: Record<string, Theme> = {
  "andi-rina": { name: THEME_NAMES["andi-rina"], Component: AndiRina, themeColor: "#F6EEE3" },
  "bagas-sekar": { name: THEME_NAMES["bagas-sekar"], Component: BagasSekar, themeColor: "#E8E5E0" },
  "hendrawan-larasati": { name: THEME_NAMES["hendrawan-larasati"], Component: HendrawanLarasati, themeColor: "#F4EFE6" },
};
