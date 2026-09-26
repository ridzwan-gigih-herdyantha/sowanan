// Tempo goyang tiap label dibedakan supaya tidak bergerak serempak.
export const sway = (i: number) => ({
  "--sway-dur": `${(4 + ((i * 7) % 5) * 0.45).toFixed(2)}s`,
  "--sway-delay": `${(-((i * 1.37) % 4)).toFixed(2)}s`,
});
