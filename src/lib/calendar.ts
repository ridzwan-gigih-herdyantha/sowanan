type CalendarEvent = { title: string; start: string; end: string; location: string; details: string };

const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const escape = (s: string) => s.replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");

// Baris iCalendar maksimal 75 byte. Sisanya dilanjutkan di baris baru yang diawali spasi, tanpa memotong huruf multibyte.
const bytes = new TextEncoder();
function fold(line: string) {
  const out: string[] = [];
  let cur = "";
  for (const ch of line) {
    if (bytes.encode(cur + ch).length > (out.length ? 74 : 75)) {
      out.push(cur);
      cur = "";
    }
    cur += ch;
  }
  out.push(cur);
  return out.join("\r\n ");
}

export function googleCalendarUrl(e: CalendarEvent) {
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${stamp(e.start)}/${stamp(e.end)}`,
    location: e.location,
    details: e.details,
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}

export function icsFile(e: CalendarEvent, uid: string) {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Sowanan//Undangan//ID",
    "BEGIN:VEVENT",
    `UID:${uid}@sowanan.com`,
    `DTSTAMP:${stamp(e.start)}`,
    `DTSTART:${stamp(e.start)}`,
    `DTEND:${stamp(e.end)}`,
    `SUMMARY:${escape(e.title)}`,
    `LOCATION:${escape(e.location)}`,
    `DESCRIPTION:${escape(e.details)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .map(fold)
    .join("\r\n");
}
