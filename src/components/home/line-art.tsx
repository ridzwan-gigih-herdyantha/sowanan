import { cx } from "@/components/ui";

// Ornamen garis bersambung di atas bidang warna lembut, bertema undangan pernikahan. Selalu dekoratif dan tidak
// bisa diklik. Bidang dan garisnya memakai warna brand: blush, wine pucat, dan wine.
const ART = {
  amplop: {
    box: "0 0 170 150",
    blob: { d: "M58 22 C96 6 150 22 156 66 C162 108 128 140 86 138 C44 136 14 108 16 72 C18 46 34 32 58 22 Z", fill: "#f4eae6" },
    dot: { cx: 150, cy: 132, r: 9, fill: "#c5a3aa" },
    line: [
      "M22 56 L22 120 L134 120 L134 56 L78 96 L22 56 L78 30 L134 56",
      "M130 46 C114 36 112 24 119 19 C124 15 130 19 130 25 C130 19 136 15 141 19 C148 24 146 36 130 46 Z",
    ],
  },
  cincin: {
    box: "0 0 170 150",
    blob: { d: "M40 40 C70 12 128 16 150 52 C170 86 150 130 108 138 C66 146 22 124 18 88 C16 68 24 54 40 40 Z", fill: "#ecdde0" },
    dot: { cx: 28, cy: 128, r: 8, fill: "#b08a92" },
    line: [
      "M66 100 C42 100 30 82 34 66 C38 50 56 42 72 46 C90 50 98 68 92 84 C88 96 78 102 66 100 Z",
      "M108 96 C86 100 70 86 70 70 C70 54 86 42 102 44 C120 46 132 62 128 78 C125 90 118 94 108 96 Z",
      "M96 44 L102 32 L110 44 L102 50 Z M102 32 L102 22 M114 30 L120 24 M90 30 L84 24",
    ],
  },
  mawar: {
    box: "0 0 130 230",
    blob: { d: "M74 40 C100 36 116 60 112 90 C108 118 86 136 66 128 C46 120 44 92 50 70 C54 52 60 42 74 40 Z", fill: "#ead7da" },
    dot: { cx: 50, cy: 212, r: 10, fill: "#c5a3aa" },
    line: [
      "M64 222 C64 190 62 150 64 120 C48 116 36 96 38 72 C40 64 46 60 52 64 C56 56 66 52 74 58 C80 52 92 54 92 64 C96 88 84 112 64 120",
      "M50 66 C50 86 58 98 66 100 C78 98 84 84 82 66",
      "M60 66 C58 74 68 78 72 72 C76 64 66 60 62 64",
      "M64 120 C54 124 46 132 46 140 C54 136 60 128 64 120 C68 128 76 136 84 138 C82 130 74 124 64 120",
      "M64 176 C56 162 42 156 30 160 C38 174 52 180 64 176 C54 170 42 166 34 163",
    ],
  },
} as const;

// Garis coretan bersambung yang masuk dari satu tepi bagian dan keluar di tepi lain, sebagai hiasan samar di latar.
// "atas" dari tepi kanan naik ke tepi atas, "bawah" dari tepi kiri turun ke tepi bawah.
const SCRIBBLE = {
  atas: "M400 240 C340 250 300 222 310 182 C318 150 362 152 356 180 C350 208 300 200 270 170 C240 140 262 92 222 72 C190 56 160 80 176 100 C192 120 222 92 202 60 C187 36 162 20 150 0",
  bawah: "M0 60 C60 50 102 80 94 120 C88 150 46 148 52 122 C58 96 112 104 142 136 C172 168 150 210 190 230 C222 246 252 222 234 204 C216 190 196 226 220 252 C236 270 252 284 260 300",
};

export function Scribble({ kind, className }: { kind: keyof typeof SCRIBBLE; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 400 300" fill="none" className={cx("pointer-events-none absolute", className)}>
      <path d={SCRIBBLE[kind]} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function LineArt({ kind, className }: { kind: keyof typeof ART; className?: string }) {
  const a = ART[kind];
  return (
    <svg aria-hidden="true" viewBox={a.box} className={cx("pointer-events-none absolute", className)}>
      <path d={a.blob.d} fill={a.blob.fill} opacity="0.85" />
      <circle cx={a.dot.cx} cy={a.dot.cy} r={a.dot.r} fill={a.dot.fill} opacity="0.8" />
      <g fill="none" stroke="#7c2b3e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8">
        {a.line.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}
