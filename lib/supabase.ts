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

function supabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || undefined;
}

function supabaseServiceKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || undefined;
}

export function createServerSupabase(): SupabaseClient | null {
  const url = supabaseUrl();
  const key = supabaseServiceKey();
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
