"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckInTimeSeries } from "@/components/CheckInTimeSeries";
import {
  formatDate,
  formatTime,
  getCheckInNote,
  MEMBERS,
  type CheckIn,
  type DayLog,
  type Member,
} from "@/lib/types";

function emptyNotes(): Record<Member, string> {
  return Object.fromEntries(MEMBERS.map(({ id }) => [id, ""])) as Record<
    Member,
    string
  >;
}

function notesFromToday(
  checkIns: Partial<Record<Member, CheckIn>>,
): Record<Member, string> {
  return Object.fromEntries(
    MEMBERS.map(({ id }) => [id, noteFromCheckIn(checkIns[id])]),
  ) as Record<Member, string>;
}

function noteFromCheckIn(checkIn?: CheckIn): string {
  return getCheckInNote(checkIn);
}

export default function LobbyPage() {
  const [today, setToday] = useState<DayLog | null>(null);
  const [recent, setRecent] = useState<DayLog[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [draftNotes, setDraftNotes] = useState(emptyNotes);

  const fetchLogs = useCallback(async () => {
    const res = await fetch("/api/checkin");
    if (!res.ok) throw new Error("Failed to load");
    const data = (await res.json()) as { today: DayLog; recent: DayLog[] };
    setToday(data.today);
    setRecent(data.recent);
    setDraftNotes(notesFromToday(data.today.checkIns));
  }, []);

  useEffect(() => {
    fetchLogs().catch(() => {});
  }, [fetchLogs]);

  const timeSeriesLogs = useMemo(() => {
    const byDate = new Map(recent.map((log) => [log.date, log]));
    if (today) byDate.set(today.date, today);
    return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
  }, [recent, today]);

  const todaysNotes = useMemo(
    () =>
      MEMBERS.map(({ id, name, initial }) => ({
        id,
        name,
        initial,
        checkIn: today?.checkIns[id],
      })).filter(({ checkIn }) => checkIn && getCheckInNote(checkIn)),
    [today],
  );

  function updateDraft(member: Member, value: string) {
    setDraftNotes((prev) => ({ ...prev, [member]: value }));
  }

  async function handleCheckIn(member: Member) {
    setLoading(member);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member,
          note: draftNotes[member],
        }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { today: DayLog };
      setToday(data.today);
      await fetchLogs().catch(() => {});
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
            <p className="text-xs tracking-[0.2em] uppercase text-black/40 mb-1">
              Today
            </p>
            <p className="font-[family-name:var(--font-display)] text-2xl text-black/85 mb-8">
              {formatDate(today.date)}
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MEMBERS.map(({ id, name, initial }) => {
                const checkIn = today.checkIns[id];
                const isLoading = loading === id;

                return (
                  <div
                    key={id}
                    className="rounded-sm border border-black/8 bg-black/[0.03] p-6 flex flex-col gap-5"
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
                          <p className="text-sm text-black/40">Not checked in</p>
                        )}
                      </div>
                    </div>

                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs tracking-[0.12em] uppercase text-black/50">
                        How we feelin today?
                      </span>
                      <textarea
                        value={draftNotes[id]}
                        onChange={(e) => updateDraft(id, e.target.value)}
                        readOnly={Boolean(checkIn)}
                        rows={4}
                        placeholder="What's the vibe..."
                        className="w-full rounded-sm border border-black/10 bg-white/80 px-3 py-2.5 text-sm text-black/80 placeholder:text-black/30 resize-none focus:outline-none focus:border-gold/50 disabled:opacity-80 read-only:opacity-80 read-only:cursor-default"
                      />
                    </label>

                    <button
                      onClick={() => handleCheckIn(id)}
                      disabled={Boolean(loading) || Boolean(checkIn)}
                      className={
                        checkIn
                          ? "py-3 text-xs rounded-sm border border-black/10 bg-black/[0.04] text-black/45 cursor-default"
                          : "btn-gold py-3 text-xs rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      }
                    >
                      {isLoading ? "Recording..." : checkIn ? "Checked in" : "Check In"}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {todaysNotes.length > 0 && (
          <section className="glass rounded-sm p-8 sm:p-10 mb-8">
            <p className="text-xs tracking-[0.2em] uppercase text-black/40 mb-1">
              Today&apos;s Notes
            </p>
            <p className="text-sm text-black/50 mb-6">Updates from check-in</p>
            <div className="space-y-4">
              {todaysNotes.map(({ id, name, initial, checkIn }) => (
                <div
                  key={id}
                  className="rounded-sm border border-black/8 bg-black/[0.03] p-5"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-full border border-gold/30 flex items-center justify-center font-[family-name:var(--font-display)] text-base text-gold">
                      {initial}
                    </div>
                    <div>
                      <p className="font-medium">{name}</p>
                      {checkIn && (
                        <p className="text-xs text-gold">
                          {formatTime(checkIn.timestamp)}
                        </p>
                      )}
                    </div>
                  </div>
                  {checkIn && getCheckInNote(checkIn) && (
                    <p className="text-sm text-black/75 leading-relaxed whitespace-pre-wrap">
                      {getCheckInNote(checkIn)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {timeSeriesLogs.length > 0 && (
          <CheckInTimeSeries logs={timeSeriesLogs} />
        )}

        {recent.length > 0 && (
          <section className="glass rounded-sm p-8 sm:p-10">
            <p className="text-xs tracking-[0.2em] uppercase text-black/40 mb-6">
              Recent Activity
            </p>
            <div className="space-y-4">
              {recent.map((log) => (
                <div
                  key={log.date}
                  className="py-3 border-b border-black/6 last:border-0"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <p className="text-sm text-black/50">{formatDate(log.date)}</p>
                    <div className="flex gap-6 text-sm">
                      {MEMBERS.map(({ id, name }) => {
                        const checkIn = log.checkIns[id];
                        return (
                          <span key={id} className="text-black/70">
                            <span className="text-black/40">{name}: </span>
                            {checkIn ? (
                              <span className="text-gold">
                                {formatTime(checkIn.timestamp)}
                              </span>
                            ) : (
                              <span className="text-black/25">—</span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                    {MEMBERS.map(({ id, name }) => {
                      const checkIn = log.checkIns[id];
                      const note = getCheckInNote(checkIn);
                      if (!note) return null;
                      return (
                        <div key={id} className="text-xs text-black/55">
                          <p className="font-medium text-black/65 mb-1">{name}</p>
                          <p className="line-clamp-2">{note}</p>
                        </div>
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
