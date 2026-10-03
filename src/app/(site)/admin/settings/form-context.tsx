"use client";

import { createContext, useContext } from "react";
import type { Settings } from "@/lib/settings/schema";

type Ctx = {
  s: Settings;
  set: (path: string, value: unknown) => void;
  update: (fn: (s: Settings) => Settings) => void;
  errors: Record<string, string>;
};

export const FormCtx = createContext<Ctx | null>(null);

export function useSettings() {
  const ctx = useContext(FormCtx);
  if (!ctx) throw new Error("useSettings di luar SettingsForm");
  return ctx;
}

export function getIn(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o == null ? undefined : (o as Record<string, unknown>)[k]), obj);
}

export function setIn<T>(obj: T, path: string, value: unknown): T {
  const [head, ...rest] = path.split(".");
  const src = obj as Record<string, unknown> | unknown[];
  const copy = (Array.isArray(src) ? [...src] : { ...src }) as Record<string, unknown>;
  copy[head] = rest.length ? setIn(copy[head], rest.join("."), value) : value;
  return copy as T;
}
