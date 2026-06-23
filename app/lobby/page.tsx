"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  formatDate,
  formatTime,
  MEMBERS,
  type DayLog,
  type Member,
} from "@/lib/types";

export default function LobbyPage() {
  const [today, setToday] = useState<DayLog | null>(null);
  const [recent, setRecent] = useState<DayLog[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    const res = await fetch("/api/checkin");
    if (!res.ok) throw new Error("Failed to load");
    const data = (await res.json()) as { today: DayLog; recent: DayLog[] };
    setToday(data.today);
    setRecent(data.recent);
  }, []);

  useEffect(() => {
    fetchLogs().catch(() => setError("Could not load check-ins"));
  }, [fetchLogs]);

  async function handleCheckIn(member: Member) {
    setLoading(member);
    setError(null);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member }),
      });
      if (!res.ok) throw new Error("Check-in failed");
      const data = (await res.json()) as { today: DayLog };
      setToday(data.today);
      await fetchLogs();
    } catch {
      setError("Check-in failed. Try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="relative min-h-dvh px-6 py-12 sm:py-16 overflow-hidden">
      <div className="ambient-glow" />
      <div className="grid-overlay" />

      <div className="relative z-10 max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <div>
            <p className="text-[11px] tracking-[0.35em] uppercase text-gold-dim mb-2">
              Portal
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl text-gold-gradient">
              Lobby
            </h1>
          </div>
          <Link
            href="/"
            className="btn-ghost px-5 py-2.5 text-xs rounded-sm tracking-[0.08em] uppercase"
          >
            Back
          </Link>
        </header>

        {today && (
          <section className="glass rounded-sm p-8 sm:p-10 mb-8">
            <p className="text-xs tracking-[0.2em] uppercase text-white/40 mb-1">
              Today
            </p>
            <p className="font-[family-name:var(--font-display)] text-2xl text-white/90 mb-8">
              {formatDate(today.date)}
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {MEMBERS.map(({ id, name, initial }) => {
                const checkIn = today.checkIns[id];
                const isLoading = loading === id;

                return (
                  <div
                    key={id}
                    className="rounded-sm border border-white/6 bg-black/30 p-6 flex flex-col gap-5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center font-[family-name:var(--font-display)] text-xl text-gold">
                        {initial}
                      </div>
                      <div>
                        <p className="text-lg font-medium">{name}</p>
                        {checkIn ? (
                          <p className="text-sm text-gold">
                            Checked in at {formatTime(checkIn.timestamp)}
                          </p>
                        ) : (
                          <p className="text-sm text-white/35">Not checked in</p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleCheckIn(id)}
                      disabled={Boolean(loading)}
                      className="btn-gold py-3 text-xs rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading
                        ? "Recording..."
                        : checkIn
                          ? "Check In Again"
                          : "Check In"}
                    </button>
                  </div>
                );
              })}
            </div>

            {error && (
              <p className="mt-6 text-sm text-red-400/90 text-center">{error}</p>
            )}
          </section>
        )}

        {recent.length > 0 && (
          <section className="glass rounded-sm p-8 sm:p-10">
            <p className="text-xs tracking-[0.2em] uppercase text-white/40 mb-6">
              Recent Activity
            </p>
            <div className="space-y-4">
              {recent.map((log) => (
                <div
                  key={log.date}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 border-b border-white/5 last:border-0"
                >
                  <p className="text-sm text-white/50">{formatDate(log.date)}</p>
                  <div className="flex gap-6 text-sm">
                    {MEMBERS.map(({ id, name }) => {
                      const checkIn = log.checkIns[id];
                      return (
                        <span key={id} className="text-white/70">
                          <span className="text-white/35">{name}: </span>
                          {checkIn ? (
                            <span className="text-gold">
                              {formatTime(checkIn.timestamp)}
                            </span>
                          ) : (
                            <span className="text-white/25">—</span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
