"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Pending } from "../pending";
import { DeleteButton } from "./delete-button";

type Item = { href: string; label: string };

// Menu aksi satu undangan di daftar admin. Undangan contoh tidak punya akses mempelai dan tidak bisa dihapus.
export function RowMenu({ slug, demo }: { slug: string; demo: boolean }) {
  const items: Item[] = [
    { href: "", label: "Isi undangan" },
    { href: "/tamu", label: "Tamu" },
    { href: "/respon", label: "RSVP & ucapan" },
    ...(demo ? [] : [{ href: "/akses", label: "Akses mempelai" }]),
  ];
  if (demo) return <Menu slug={slug} items={items} />;
  return <DeleteButton slug={slug}>{(open) => <Menu slug={slug} items={items} onDelete={open} />}</DeleteButton>;
}

function Menu({ slug, items, onDelete }: { slug: string; items: Item[]; onDelete?: () => void }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    list.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus();
    const close = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  function toggle() {
    if (open) return setOpen(false);
    const rect = button.current?.getBoundingClientRect();
    // Dibuka ke atas kalau ruang di bawah tidak cukup, misalnya di baris terakhir daftar.
    setUp(Boolean(rect && window.innerHeight - rect.bottom < 240 && rect.top > window.innerHeight - rect.bottom));
    setOpen(true);
  }

  function close(focus = true) {
    setOpen(false);
    if (focus) button.current?.focus();
  }

  function onKey(e: KeyboardEvent) {
    const entries = [...(list.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? [])];
    const at = entries.indexOf(document.activeElement as HTMLElement);
    const go = (i: number) => entries[(i + entries.length) % entries.length]?.focus();
    if (e.key === "ArrowDown") go(at + 1);
    else if (e.key === "ArrowUp") go(at - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(entries.length - 1);
    else if (e.key === "Escape") close();
    else if (e.key === "Tab") return close(false);
    else return;
    e.preventDefault();
  }

  const item = "flex w-full items-center gap-2 rounded-[3px] px-3 py-2 text-left text-[14px] whitespace-nowrap no-underline outline-none hover:bg-blush focus-visible:bg-blush has-[[data-pending]]:opacity-55";

  return (
    <div ref={root} className="relative">
      <button
        ref={button}
        type="button"
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            toggle();
          }
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-label={`Kelola ${slug}`}
        className={`flex items-center gap-2 rounded-sm border bg-white px-3 py-1.5 text-[14px] outline-none transition-colors duration-150 focus-visible:border-wine focus-visible:ring-2 focus-visible:ring-wine/15 ${open ? "border-wine" : "border-line hover:border-ink-mute"}`}
      >
        Kelola
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={`text-ink-mute transition-transform duration-150 ${open ? "rotate-180" : ""}`}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div
          ref={list}
          id={id}
          role="menu"
          aria-label={`Kelola ${slug}`}
          onKeyDown={onKey}
          className={`absolute right-0 z-50 min-w-48 rounded-sm border border-line bg-white p-1 shadow-[0_12px_32px_rgba(43,27,31,.14)] motion-safe:animate-[dropdown-in_.14s_ease-out] ${up ? "bottom-full mb-1.5 origin-bottom" : "top-full mt-1.5 origin-top"}`}
        >
          {items.map((it) => (
            <Link key={it.href} href={`/admin/undangan/${slug}${it.href}`} prefetch={false} role="menuitem" tabIndex={-1} className={`${item} text-ink`}>
              {it.label}
              <Pending />
            </Link>
          ))}
          {onDelete && (
            <>
              <div role="separator" className="mx-2 my-1 h-px bg-line" />
              <button
                type="button"
                role="menuitem"
                tabIndex={-1}
                onClick={() => {
                  close(false);
                  onDelete();
                }}
                className={`${item} text-wine`}
              >
                Hapus undangan
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
