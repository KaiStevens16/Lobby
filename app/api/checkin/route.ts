import { NextResponse } from "next/server";
import { AlreadyCheckedInError, checkIn, getRecentLogs, getTodayLog } from "@/lib/checkins";
import type { Member } from "@/lib/types";

export async function GET() {
  const [today, recent] = await Promise.all([getTodayLog(), getRecentLogs()]);
  return NextResponse.json({ today, recent });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    member?: string;
    note?: string;
  };

  if (body.member !== "roman" && body.member !== "kai") {
    return NextResponse.json({ error: "Invalid member" }, { status: 400 });
  }

  try {
    const today = await checkIn(body.member as Member, {
      note: body.note,
    });
    return NextResponse.json({ today });
  } catch (error) {
    if (error instanceof AlreadyCheckedInError) {
      return NextResponse.json(
        { error: "Already checked in today" },
        { status: 409 },
      );
    }
    throw error;
  }
}
