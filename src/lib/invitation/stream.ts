// Kenali platform siaran dari tautannya. Video YouTube dengan id yang jelas bisa diputar langsung di undangan,
// sedangkan tautan saluran, Zoom, Instagram, dan lainnya dibuka di tab baru.
export function streamOf(url: string, time: string, timezone: string) {
  let link: URL;
  try {
    link = new URL(url);
  } catch {
    return null;
  }
  if (link.protocol !== "https:" && link.protocol !== "http:") return null;
  const host = link.hostname.replace(/^(www|m)\./, "");
  const isYoutube = host === "youtu.be" || host === "youtube.com" || host.endsWith(".youtube.com");
  const id = !isYoutube ? "" : host === "youtu.be" ? link.pathname.split("/")[1] : link.searchParams.get("v") || (link.pathname.match(/^\/(?:live|embed|shorts)\/([^/]+)/)?.[1] ?? "");
  const platforms: [string, (h: string) => boolean][] = [
    ["Zoom", (h) => h === "zoom.us" || h.endsWith(".zoom.us")],
    ["Instagram", (h) => h === "instagram.com"],
    ["TikTok", (h) => h === "tiktok.com" || h.endsWith(".tiktok.com")],
    ["Facebook", (h) => h === "facebook.com" || h === "fb.watch"],
  ];
  const platform = isYoutube ? "YouTube" : (platforms.find(([, test]) => test(host))?.[0] ?? "");
  return { url, youtube: /^[\w-]{11}$/.test(id) ? id : "", platform, time: time ? `${time} ${timezone}` : "" };
}
