import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type CheckInRow = {
  date: string;
  member: string;
  timestamp: string;
  note: string | null;
  doing_today: string | null;
  gym_session: string | null;
};

export function hasSupabase(): boolean {
  return Boolean(supabaseUrl() && supabaseServiceKey());
}

function normalizeSupabaseUrl(raw: string): string | undefined {
  const value = raw.trim().replace(/\/+$/, "");
  if (!value) return undefined;

  if (/^[a-z0-9-]+$/i.test(value)) {
    return `https://${value}.supabase.co`;
  }

  if (/^[a-z0-9-]+\.supabase\.co$/i.test(value)) {
    return `https://${value}`;
  }

  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return parsed.origin;
      }
    } catch {
      return undefined;
    }
  }

  return undefined;
}

function supabaseUrl(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return undefined;
  return normalizeSupabaseUrl(raw);
}

function supabaseServiceKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || undefined;
}

export function createServerSupabase(): SupabaseClient | null {
  const url = supabaseUrl();
  const key = supabaseServiceKey();
  if (!url || !key) return null;

  try {
    return createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  } catch {
    return null;
  }
}
