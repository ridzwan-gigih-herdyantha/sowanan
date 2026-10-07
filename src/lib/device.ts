// iPhone dan iPad. iPad modern mengaku Macintosh, jadi dikenali dari layar sentuhnya.
export const isAppleMobile = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 0);
