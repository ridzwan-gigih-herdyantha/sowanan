import { hallAt } from "./interior-world";
import type { Point } from "./world";

// Tamu lain di aula supaya suasananya hidup. Tiap lembar sprite orang yang berbeda: anak-anak, kakek berkacamata,
// ibu bersanggul, tamu berhijab, bapak berpeci, dan seterusnya. Ada yang berjalan bolak-balik, ada yang
// berdiri mengobrol dengan gelembung percakapan bergantian. Semua tamu bisa ditembus pemain.
export type Npc = {
  id: string;
  sheet: NpcSheet;
  // Titik-titik yang dilalui berulang. Satu titik berarti diam di tempat.
  path: Point[];
  // Arah hadap saat diam: 0 bawah, 1 samping, 2 atas. flip menghadap ke kiri.
  face?: 0 | 1 | 2;
  flip?: boolean;
  // Kelompok obrolan dan kalimatnya. Anggota satu kelompok bicara bergantian.
  chat?: string;
  lines?: string[];
};

const sheet = (name: string) => `/img/rafi-kayla/npc-${name}.png`;
export const NPC_SHEETS = { pria: sheet("pria"), hijau: sheet("pria-hijau"), bapak: sheet("bapak"), kakek: sheet("kakek"), anak: sheet("anak"), wanita: sheet("wanita"), gadis: sheet("gadis"), ibu: sheet("ibu"), kebaya: sheet("kebaya") };
export type NpcSheet = keyof typeof NPC_SHEETS;

export const NPC_SPEED = 55;
// Lama berhenti di tiap titik jalan, dalam detik.
export const NPC_PAUSE = 1.6;

export const NPCS: Npc[] = [
  // Berjalan pelan di karpet merah, dari dekat pintu ke tangga pelaminan dan kembali.
  { id: "w1", sheet: "kebaya", path: [hallAt(130, 12), hallAt(780, 12)] },
  // Anak yang berlarian kecil di lantai kanan bawah, dan ibunya yang berjalan di sisi kiri.
  { id: "w2", sheet: "anak", path: [hallAt(120, 215), hallAt(420, 215)] },
  { id: "w3", sheet: "ibu", path: [hallAt(350, -210), hallAt(740, -210)] },
  // Dua tamu mengobrol di lantai kanan.
  { id: "a1", sheet: "gadis", path: [hallAt(690, 212)], face: 1, chat: "a", lines: ["Dekorasinya cantik ya!", "Sudah foto di galeri?", "Pengantinnya serasi sekali."] },
  { id: "a2", sheet: "pria", path: [hallAt(740, 212)], face: 1, flip: true, chat: "a", lines: ["Iya, hangat sekali suasananya.", "Nanti, habis ini.", "Betul, ikut bahagia."] },
  // Dua tamu mengobrol dekat pintu masuk.
  { id: "b1", sheet: "bapak", path: [hallAt(120, -190)], face: 1, chat: "b", lines: ["Sudah isi buku tamu?", "Ayo ke pelaminan!", "Jangan lupa amplopnya."] },
  { id: "b2", sheet: "wanita", path: [hallAt(170, -190)], face: 1, flip: true, chat: "b", lines: ["Sudah, barusan.", "Yuk, foto bareng.", "Aman, sudah siap."] },
  // Melihat-lihat dinding foto dari tepi karpet.
  { id: "v1", sheet: "kakek", path: [hallAt(690, -66)], face: 2, chat: "v", lines: ["Fotonya bagus-bagus...", "Ini waktu lamaran ya?"] },
  // Berdiri sendiri di samping panggung.
  { id: "v2", sheet: "hijau", path: [hallAt(880, 226)], face: 0 },
];

export type NpcState = { p: Point; next: number; wait: number; walked: number };

export const npcStart = (n: Npc): NpcState => ({ p: { ...n.path[0] }, next: n.path.length > 1 ? 1 : 0, wait: 0, walked: 0 });

// Satu langkah gerak tamu yang berjalan. Mengembalikan arah gerak (dx, dy) atau null bila sedang diam.
export function stepNpc(n: Npc, s: NpcState, dt: number): Point | null {
  if (n.path.length < 2) return null;
  if (s.wait > 0) {
    s.wait -= dt;
    return null;
  }
  const to = n.path[s.next];
  const dx = to.x - s.p.x;
  const dy = to.y - s.p.y;
  const d = Math.hypot(dx, dy);
  const step = NPC_SPEED * dt;
  if (d <= step) {
    s.p = { ...to };
    s.next = (s.next + 1) % n.path.length;
    s.wait = NPC_PAUSE;
    return null;
  }
  s.p.x += (dx / d) * step;
  s.p.y += (dy / d) * step;
  return { x: dx, y: dy };
}
