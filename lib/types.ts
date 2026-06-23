export type Member = "roman" | "kai";

export interface CheckIn {
  member: Member;
  time: string;
  timestamp: string;
}

export interface DayLog {
  date: string;
  checkIns: Partial<Record<Member, CheckIn>>;
}

export const MEMBERS: { id: Member; name: string; initial: string }[] = [
  { id: "roman", name: "Roman", initial: "R" },
  { id: "kai", name: "Kai", initial: "K" },
];

export function todayKey(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Los_Angeles",
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
