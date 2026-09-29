"use client";

import { useEffect } from "react";

const HOST_STYLE = "all:initial;position:fixed;inset:0;z-index:2147483647;pointer-events:none;display:block;visibility:visible;opacity:1;overflow:hidden";

type Props = { text: string; a: string; b: string };

// Saat JavaScript aktif: tag style yang dihapus dipasang lagi, dan kalau salah satu pseudo element disembunyikan,
// salinannya di shadow DOM tertutup (nama tag acak) yang tampil.
export function WatermarkGuard({ text, a, b }: Props) {
  useEffect(() => {
    const tag = `sw-${Math.random().toString(36).slice(2, 8)}`;
    const layers = [
      { key: "a", css: `html::before{${a}}`, target: () => document.documentElement, pseudo: "::before", rule: a },
      { key: "b", css: `body::after{${b}}`, target: () => document.body, pseudo: "::after", rule: b },
    ];
    const styles = new Map<string, HTMLStyleElement | null>(layers.map((l) => [l.key, document.querySelector<HTMLStyleElement>(`style[data-sw="${l.key}"]`)]));
    let host: HTMLElement | null = null;
    let copies: HTMLElement[] = [];

    const build = () => {
      host = document.createElement(tag);
      const root = host.attachShadow({ mode: "closed" });
      copies = layers.map(() => root.appendChild(document.createElement("div")));
      document.documentElement.append(host);
    };

    const setStyle = (el: HTMLElement, value: string) => {
      if (el.style.cssText !== value) el.style.cssText = value;
    };

    const check = () => {
      layers.forEach((l) => {
        const el = styles.get(l.key);
        if (!el || !el.isConnected || el.textContent !== l.css) {
          const fresh = document.createElement("style");
          fresh.textContent = l.css;
          document.head.append(fresh);
          styles.set(l.key, fresh);
        }
      });
      if (!host || !host.isConnected) build();
      setStyle(host!, HOST_STYLE);
      layers.forEach((l, i) => {
        const s = getComputedStyle(l.target(), l.pseudo);
        const expected = Number(/opacity:([\d.]+)/.exec(l.rule)?.[1] ?? 1);
        const ok = s.content !== "none" && s.display !== "none" && s.visibility !== "hidden" && Number(s.opacity) >= expected * 0.9 && s.backgroundImage.includes("svg");
        setStyle(copies[i], l.rule.replace('content:"";', "position:absolute;") + (ok ? ";visibility:hidden" : ""));
      });
    };

    let queued = 0;
    const schedule = () => {
      if (!queued)
        queued = requestAnimationFrame(() => {
          queued = 0;
          check();
        });
    };

    check();
    const mo = new MutationObserver(schedule);
    mo.observe(document.documentElement, { childList: true, attributes: true, attributeFilter: ["style", "class"] });
    mo.observe(document.head, { childList: true });
    mo.observe(document.body, { childList: true, attributes: true, attributeFilter: ["style", "class"] });
    const timer = window.setInterval(check, 1500);
    return () => {
      mo.disconnect();
      window.clearInterval(timer);
      cancelAnimationFrame(queued);
      host?.remove();
    };
  }, [text, a, b]);

  return null;
}
