import type { Point } from "./world";

// Sprite hanya punya tiga arah, jadi arah diagonal harus memilih salah satu. Arah lama dipertahankan selama
// komponen geraknya masih cukup besar, supaya sprite tidak berkedip bergantian antara dua arah saat jalan diagonal.
const HOLD = 0.5;

export type Facing = { row: 0 | 1 | 2; flip: boolean };

export function turn(f: Facing, vx: number, vy: number) {
  const ax = Math.abs(vx);
  const ay = Math.abs(vy);
  if (f.row === 1 ? ax >= ay * HOLD && vx < 0 === f.flip : ay >= ax * HOLD && vy < 0 === (f.row === 2)) return;
  if (ay > ax) f.row = vy < 0 ? 2 : 0;
  else {
    f.row = 1;
    f.flip = vx < 0;
  }
}

// Seberapa cepat kamera menyusul karakter (per detik).
const FOLLOW = 4;
// Jarak kaki karakter dari tepi atas joystick atau papan yang dihindari.
const CLEAR = 14;

export type Camera = { x: number; y: number; ready: boolean };

// Kamera menggeser satu lapisan utuh lewat transform, dibulatkan ke piksel layar, supaya isi peta (gapura dan
// papan namanya, kios) tidak ikut dibulatkan sendiri-sendiri tiap frame lalu terlihat bergetar. footY adalah
// posisi layar untuk kaki karakter. Tepi peta tidak pernah terlihat, kecuali kamera perlu turun melewati tepi
// bawah supaya karakter tidak tertutup avoid, yaitu joystick atau papan di bawah layar.
export function aimCamera(cam: Camera, el: HTMLElement, view: HTMLElement, focus: Point, footY: number, avoid: DOMRect | null | undefined, dt: number) {
  const vw = view.clientWidth;
  const vh = view.clientHeight;
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  const tx = Math.min(0, Math.max(vw - w, vw / 2 - w * focus.x));
  let ty = Math.max(vh - h, footY - h * focus.y);
  const sx = tx + w * focus.x;
  if (avoid && sx > avoid.left - CLEAR * 2 && sx < avoid.right + CLEAR * 2) ty = Math.min(ty, avoid.top - CLEAR - h * focus.y);
  ty = Math.min(0, ty);
  const k = cam.ready ? Math.min(1, dt * FOLLOW) : 1;
  cam.x += (tx - cam.x) * k;
  cam.y += (ty - cam.y) * k;
  cam.ready = true;
  const dpr = window.devicePixelRatio || 1;
  el.style.transform = `translate3d(${Math.round(cam.x * dpr) / dpr}px, ${Math.round(cam.y * dpr) / dpr}px, 0)`;
}

// Memindahkan karakter dari titik awalnya lewat transform, dengan alasan yang sama seperti kamera. k adalah piksel
// layar per piksel peta.
export function shift(el: HTMLElement, from: Point, to: Point, k: number) {
  const dpr = window.devicePixelRatio || 1;
  el.style.transform = `translate3d(${Math.round((to.x - from.x) * k * dpr) / dpr}px, ${Math.round((to.y - from.y) * k * dpr) / dpr}px, 0)`;
}

// Tanda tujuan di lantai saat tamu mengetuk peta. fresh memulai ulang animasinya; seretan hanya memindahkan tanda.
export function markTap(el: HTMLElement | null, at: Point, mapW: number, mapH: number, fresh: boolean) {
  if (!el) return;
  el.style.left = `${(at.x / mapW) * 100}%`;
  el.style.top = `${(at.y / mapH) * 100}%`;
  if (!fresh) return;
  el.dataset.on = "false";
  void el.offsetWidth;
  el.dataset.on = "true";
  shownAt.set(el, performance.now());
}

// Tanda hilang setelah karakter tiba, tapi tampil cukup lama walau tujuannya tepat di kaki karakter.
const TAP_MIN_MS = 450;
const shownAt = new WeakMap<HTMLElement, number>();
export function clearTap(el: HTMLElement | null, arrived: boolean, now: number) {
  if (el && arrived && el.dataset.on === "true" && now - (shownAt.get(el) ?? 0) > TAP_MIN_MS) el.dataset.on = "false";
}
