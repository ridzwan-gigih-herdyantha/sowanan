"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

type Props = { texts: Record<string, string>; media: Record<string, string>; sample: string[] };

export type BridgeMessage =
  | { type: "sowanan:edit"; path: string; value: string }
  | { type: "sowanan:commit" }
  | { type: "sowanan:focus"; path: string }
  | { type: "sowanan:ready" };

const post = (m: BridgeMessage) => window.parent.postMessage(m, window.location.origin);

function imagePath(img: HTMLImageElement, media: Record<string, string>): string | undefined {
  const src = img.currentSrc || img.src;
  try {
    const u = new URL(src, window.location.href);
    const inner = u.pathname === "/_next/image" ? u.searchParams.get("url") : src;
    return inner ? media[new URL(inner, window.location.href).href] ?? media[inner] : undefined;
  } catch {
    return undefined;
  }
}

export function PreviewBridge({ texts, media, sample }: Props) {
  const router = useRouter();
  const editing = useRef<HTMLElement | null>(null);
  const nodes = useRef(new WeakMap<HTMLElement, Text>());
  const pending = useRef(false);
  const state = useRef({ texts, media, sample });

  useEffect(() => {
    state.current = { texts, media, sample };
  }, [texts, media, sample]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.data?.type !== "sowanan:refresh") return;
      if (editing.current) pending.current = true;
      else router.refresh();
    };
    window.addEventListener("message", onMessage);
    post({ type: "sowanan:ready" });
    return () => window.removeEventListener("message", onMessage);
  }, [router]);

  useEffect(() => {
    const byValue = new Map<string, string>();
    for (const [path, value] of Object.entries(texts)) if (value.trim().length > 1 && !byValue.has(value.trim())) byValue.set(value.trim(), path);
    const samples = new Set(sample);

    const scan = () => {
      document.querySelectorAll<HTMLElement>("[data-edit]").forEach((el) => {
        if (el === editing.current) return;
        const path = el.dataset.edit!;
        if (texts[path]?.trim() !== (nodes.current.get(el)?.data ?? el.textContent)?.trim()) {
          el.removeAttribute("data-edit");
          el.removeAttribute("data-sample");
        }
      });
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode() as Text | null; n; n = walker.nextNode() as Text | null) {
        const el = n.parentElement;
        if (!el || el.dataset.edit || el.closest("a,button,label,script,style,[data-no-edit]")) continue;
        const path = byValue.get(n.data.trim());
        if (!path) continue;
        const others = [...el.childNodes].some((c) => c !== n && c.nodeType === Node.TEXT_NODE && c.textContent?.trim());
        if (others) continue;
        nodes.current.set(el, n);
        el.dataset.edit = path;
        if (samples.has(path)) el.dataset.sample = "";
        else delete el.dataset.sample;
      }
    };

    scan();
    let t = 0;
    const mo = new MutationObserver(() => {
      window.clearTimeout(t);
      t = window.setTimeout(scan, 120);
    });
    mo.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => {
      mo.disconnect();
      window.clearTimeout(t);
    };
  }, [texts, sample]);

  useEffect(() => {
    const stop = () => {
      const el = editing.current;
      if (!el) return;
      el.removeAttribute("contenteditable");
      el.querySelectorAll("[data-lock]").forEach((c) => {
        c.removeAttribute("contenteditable");
        c.removeAttribute("data-lock");
      });
      editing.current = null;
      post({ type: "sowanan:commit" });
      if (pending.current) {
        pending.current = false;
        router.refresh();
      }
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const el = target.closest<HTMLElement>("[data-edit]");
      if (el) {
        e.preventDefault();
        e.stopPropagation();
        post({ type: "sowanan:focus", path: el.dataset.edit! });
        if (editing.current === el) return;
        stop();
        editing.current = el;
        el.setAttribute("contenteditable", "plaintext-only");
        [...el.children].forEach((c) => {
          c.setAttribute("contenteditable", "false");
          c.setAttribute("data-lock", "");
        });
        el.focus();
        return;
      }
      if (target instanceof HTMLImageElement) {
        const path = imagePath(target, state.current.media);
        if (path) post({ type: "sowanan:focus", path });
      }
    };
    const onInput = (e: Event) => {
      const el = e.target as HTMLElement;
      if (el !== editing.current) return;
      const node = nodes.current.get(el);
      const value = node && node.isConnected && node.parentElement === el ? node.data : [...el.childNodes].filter((c) => c.nodeType === Node.TEXT_NODE).map((c) => c.textContent).join("");
      post({ type: "sowanan:edit", path: el.dataset.edit!, value });
    };
    const onKey = (e: KeyboardEvent) => {
      if (!editing.current) return;
      if (e.key === "Escape" || (e.key === "Enter" && !e.shiftKey)) {
        e.preventDefault();
        editing.current.blur();
      }
    };
    const onBlur = (e: FocusEvent) => {
      if (e.target === editing.current) stop();
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("input", onInput, true);
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("blur", onBlur, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("input", onInput, true);
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("blur", onBlur, true);
    };
  }, [router]);

  return (
    <style>{`
      [data-edit]{cursor:text;border-radius:2px;transition:outline-color .15s}
      [data-edit]:hover{outline:1px dashed rgba(122,31,52,.7);outline-offset:3px}
      [data-edit][contenteditable]{outline:2px solid #7a1f34;outline-offset:3px;background:rgba(255,255,255,.12)}
      [data-sample]{outline:1px dashed rgba(200,140,20,.9);outline-offset:3px}
      img{cursor:pointer}
    `}</style>
  );
}
