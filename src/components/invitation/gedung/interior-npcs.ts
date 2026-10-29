import type { Area, Point } from "./world";

// Tamu lain di aula supaya suasananya hidup. Tiap tamu memakai salah satu lembar sprite NPC, dan tint (filter
// warna) membedakan tamu yang memakai lembar yang sama. Ada yang berjalan bolak-balik, ada yang berdiri mengobrol
// dengan gelembung percakapan bergantian.
export type Npc = {
  id: string;
  sheet: NpcSheet;
  tint?: string;
  // Titik-titik yang dilalui berulang. Satu titik berarti diam di tempat.
  path: Point[];
  // Arah hadap saat diam: 0 bawah, 1 samping, 2 atas. flip menghadap ke kiri.
  face?: 0 | 1 | 2;
  flip?: boolean;
  // Kelompok obrolan dan kalimatnya. Anggota satu kelompok bicara bergantian.
  chat?: string;
  lines?: string[];
};

export const NPC_SHEETS = { pria: "/img/rafi-kayla/npc-1.png?v=2", wanita: "/img/rafi-kayla/npc-2.png?v=2", jas: "/img/rafi-kayla/npc-3.png?v=2" };
export type NpcSheet = keyof typeof NPC_SHEETS;
export const NPC_CELL = { w: 120, h: 220 };

export const NPC_SPEED = 55;
// Lama berhenti di tiap titik jalan, dalam detik.
export const NPC_PAUSE = 1.6;

export const NPCS: Npc[] = [
  // Berjalan pelan di karpet merah, dari dekat pintu ke tangga pelaminan dan kembali.
  { id: "w1", sheet: "wanita", path: [{ x: 540, y: 655 }, { x: 1030, y: 410 }] },
  // Berjalan di lantai kanan bawah, di depan kotak angpao.
  { id: "w2", sheet: "jas", path: [{ x: 900, y: 770 }, { x: 1120, y: 740 }] },
  // Dua tamu mengobrol di lantai kanan.
  { id: "a1", sheet: "wanita", tint: "hue-rotate(-40deg)", path: [{ x: 1170, y: 660 }], face: 1, chat: "a", lines: ["Dekorasinya cantik ya!", "Sudah foto di galeri?", "Pengantinnya serasi sekali."] },
  { id: "a2", sheet: "pria", path: [{ x: 1222, y: 660 }], face: 1, flip: true, chat: "a", lines: ["Iya, hangat sekali suasananya.", "Nanti, habis ini.", "Betul, ikut bahagia."] },
  // Dua tamu mengobrol dekat pintu masuk.
  { id: "b1", sheet: "jas", tint: "brightness(1.1) sepia(.2)", path: [{ x: 280, y: 640 }], face: 1, chat: "b", lines: ["Sudah isi buku tamu?", "Ayo ke pelaminan!", "Jangan lupa amplopnya."] },
  { id: "b2", sheet: "wanita", tint: "brightness(1.08) saturate(.9)", path: [{ x: 330, y: 640 }], face: 1, flip: true, chat: "b", lines: ["Sudah, barusan.", "Yuk, foto bareng.", "Aman, sudah siap."] },
  // Melihat-lihat foto di dinding kanan.
  { id: "v1", sheet: "pria", tint: "sepia(.25) brightness(.95)", path: [{ x: 1430, y: 640 }], face: 2, chat: "v", lines: ["Fotonya bagus-bagus...", "Ini waktu lamaran ya?"] },
];

// Tamu yang diam menjadi rintangan kecil supaya pemain berjalan memutarinya.
export const npcObstacles = (): Area[] =>
  NPCS.filter((n) => n.path.length === 1).map(({ path: [p] }) => [
    [p.x - 14, p.y - 8],
    [p.x + 14, p.y - 8],
    [p.x + 14, p.y + 4],
    [p.x - 14, p.y + 4],
  ]);

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
