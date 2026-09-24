export const DEMO_INVITATIONS = {
  "andi-rina": { groom: "Andi", bride: "Rina", date: "2026-12-12T08:00:00+07:00" },
  "bagas-sekar": { groom: "Bagas", bride: "Sekar", date: "2027-02-14T09:00:00+07:00" },
  "hendrawan-larasati": { groom: "Hendrawan", bride: "Larasati", date: "2027-05-08T09:00:00+08:00" },
} as const;

export type DemoSlug = keyof typeof DEMO_INVITATIONS;
export const DEMO_SLUGS = Object.keys(DEMO_INVITATIONS) as DemoSlug[];

export function formatEventDate(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(iso));
}
