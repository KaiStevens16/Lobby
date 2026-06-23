import { kv } from "@vercel/kv";
import { promises as fs } from "fs";
import path from "path";
import type { CheckIn, DayLog, Member } from "./types";
import { todayKey } from "./types";

const KV_KEY = "lobby:checkins";
const LOCAL_FILE = path.join(process.cwd(), ".data", "checkins.json");

type Store = Record<string, Partial<Record<Member, CheckIn>>>;

function hasKv(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
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
  if (hasKv()) {
    const data = await kv.get<Store>(KV_KEY);
    return data ?? {};
  }
  return readLocal();
}

async function writeStore(data: Store): Promise<void> {
  if (hasKv()) {
    await kv.set(KV_KEY, data);
    return;
  }
  await writeLocal(data);
}

export async function getTodayLog(): Promise<DayLog> {
  const date = todayKey();
  const store = await readStore();
  return { date, checkIns: store[date] ?? {} };
}

export async function checkIn(member: Member): Promise<DayLog> {
  const date = todayKey();
  const now = new Date();
  const store = await readStore();

  const entry: CheckIn = {
    member,
    time: now.toISOString(),
    timestamp: now.toISOString(),
  };

  store[date] = { ...(store[date] ?? {}), [member]: entry };
  await writeStore(store);

  return { date, checkIns: store[date] };
}

export async function getRecentLogs(days = 7): Promise<DayLog[]> {
  const store = await readStore();
  const dates = Object.keys(store).sort().reverse().slice(0, days);
  return dates.map((date) => ({ date, checkIns: store[date] ?? {} }));
}
