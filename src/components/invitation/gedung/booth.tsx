export type BoothKind = "mempelai" | "galeri" | "cerita" | "acara" | "rsvp" | "angpao" | "slot" | "dresscode" | "rundown" | "denah" | "imbauan" | "siaran" | "video";

// Gambar kios digambar scripts/isometrik-assets.ts dalam satu bentuk yang sama, menghadap ke kanan bawah. w dan h
// ukuran tampil dalam piksel peta, (cx, cy) titik pada gambar yang menapak di pusat kios. halfL dan halfS jejak
// rintangannya, setengah panjang sejajar karpet dan setengah lebar melintang karpet.
export const BOOTH = { w: 216, h: 216, cx: 108, cy: 158, halfL: 58, halfS: 24, shiftS: -4 };
export const boothArt = (kind: BoothKind) => `/img/rafi-kayla/booth-${kind}.png`;
