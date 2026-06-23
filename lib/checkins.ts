import { promises as fs } from "fs";
import path from "path";
import {
  createServerSupabase,
  hasSupabase,
  type CheckInRow,
} from "./supabase";
import type { CheckIn, DayLog, Member } from "./types";
import { todayKey } from "./types";

const LOCAL_FILE = path.join(process.cwd(), ".data", "checkins.json");

type Store = Record<string, Partial<Record<Member, CheckIn>>>;

export class AlreadyCheckedInError extends Error {
  constructor() {
    super("Already checked in today");
    this.name = "AlreadyCheckedInError";
  }
}

function rowToCheckIn(row: CheckInRow): CheckIn {
  return {
    member: row.member as Member,
    time: row.timestamp,
    timestamp: row.timestamp,
    ...(row.note ? { note: row.note } : {}),
    ...(row.doing_today ? { doingToday: row.doing_today } : {}),
    ...(row.gym_session ? { gymSession: row.gym_session } : {}),
  };
}

function rowsToStore(rows: CheckInRow[]): Store {
  const store: Store = {};
  for (const row of rows) {
    const member = row.member as Member;
    if (!store[row.date]) store[row.date] = {};
    store[row.date]![member] = rowToCheckIn(row);
  }
  return store;
}

async function readLocal(): Promise<Store> {
  try {
    const raw = await fs.readFile(LOCAL_FILE, "utf-8");
    return JSON.parse(raw) as Store;
  } catch {
    return {};
  }
}

async function writeLocal(data: Store): Promise<void> {
  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await fs.writeFile(LOCAL_FILE, JSON.stringify(data, null, 2));
}

async function readStore(): Promise<Store> {
  if (!hasSupabase()) return readLocal();

  const supabase = createServerSupabase();
  if (!supabase) return readLocal();

  const { data, error } = await supabase
    .from("check_ins")
    .select("date, member, timestamp, note, doing_today, gym_session")
    .order("date", { ascending: false });

  if (error) throw error;
  return rowsToStore((data ?? []) as CheckInRow[]);
}

async function insertCheckIn(
  date: string,
  member: Member,
  entry: CheckIn,
): Promise<void> {
  if (!hasSupabase()) {
    const store = await readLocal();
    if (store[date]?.[member]) throw new AlreadyCheckedInError();
    store[date] = { ...(store[date] ?? {}), [member]: entry };
    await writeLocal(store);
    return;
  }

  const supabase = createServerSupabase();
  if (!supabase) {
    const store = await readLocal();
    if (store[date]?.[member]) throw new AlreadyCheckedInError();
    store[date] = { ...(store[date] ?? {}), [member]: entry };
    await writeLocal(store);
    return;
  }

  const { error } = await supabase.from("check_ins").insert({
    date,
    member,
    timestamp: entry.timestamp,
    note: entry.note ?? null,
    doing_today: entry.doingToday ?? null,
    gym_session: entry.gymSession ?? null,
  });

  if (error?.code === "23505") throw new AlreadyCheckedInError();
  if (error) throw error;
}

export async function getTodayLog(): Promise<DayLog> {
  const date = todayKey();
  const store = await readStore();
  return { date, checkIns: store[date] ?? {} };
}

export async function checkIn(
  member: Member,
  notes?: { note?: string },
): Promise<DayLog> {
  const date = todayKey();
  const now = new Date();
  const note = notes?.note?.trim() || undefined;

  const entry: CheckIn = {
    member,
    time: now.toISOString(),
    timestamp: now.toISOString(),
    ...(note ? { note } : {}),
  };

  await insertCheckIn(date, member, entry);

  const store = await readStore();
  return { date, checkIns: store[date] ?? { [member]: entry } };
}

export async function getRecentLogs(days = 7): Promise<DayLog[]> {
  const store = await readStore();
  const dates = Object.keys(store).sort().reverse().slice(0, days);
  return dates.map((date) => ({ date, checkIns: store[date] ?? {} }));
}
