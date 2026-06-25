export type Member = "roman" | "kai" | "grey";

export interface CheckIn {
  member: Member;
  time: string;
  timestamp: string;
  note?: string;
  doingToday?: string;
  gymSession?: string;
}

export interface DayLog {
  date: string;
  checkIns: Partial<Record<Member, CheckIn>>;
}

export const MEMBERS: { id: Member; name: string; initial: string }[] = [
  { id: "roman", name: "Roman", initial: "R" },
  { id: "kai", name: "Kai", initial: "K" },
  { id: "grey", name: "Grey", initial: "G" },
];

export function todayKey(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  });
}

export function formatDate(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const TZ = "America/New_York";

export function easternMinutesSinceMidnight(iso: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso));
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

export function formatShortDate(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "numeric",
    day: "numeric",
  });
}

export function formatAxisTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}

export function getCheckInNote(checkIn?: CheckIn): string {
  if (!checkIn) return "";
  if (checkIn.note) return checkIn.note;
  return [checkIn.doingToday, checkIn.gymSession].filter(Boolean).join("\n\n");
}
