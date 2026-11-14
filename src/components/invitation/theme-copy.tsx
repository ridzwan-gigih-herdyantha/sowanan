"use client";

import { createContext, useContext, type ReactNode } from "react";
import { THEME_TEXTS } from "@/themes/texts";

export type ThemeCopyValue = {
  defaults: Record<string, Record<string, string>>;
  values: Record<string, Record<string, string>>;
};

const ThemeCopyContext = createContext<ThemeCopyValue>({ defaults: {}, values: {} });

export function ThemeCopyProvider({ theme, values, children }: { theme: string; values: Record<string, Record<string, string>>; children: ReactNode }) {
  const defaults = Object.fromEntries(
    Object.entries(THEME_TEXTS[theme] ?? {}).map(([group, slots]) => [group, Object.fromEntries(Object.entries(slots).map(([slot, [, value]]) => [slot, value]))]),
  );
  return <ThemeCopyContext.Provider value={{ defaults, values }}>{children}</ThemeCopyContext.Provider>;
}

export const useThemeCopy = () => useContext(ThemeCopyContext);
