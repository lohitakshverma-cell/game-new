import { NextResponse } from "next/server";
import { getJSON } from "@/lib/store";
import type { Submission } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUBMISSIONS_KEY = "wrapped:submissions";

export async function GET(req: Request) {
  const provided = req.headers.get("x-admin-secret") || "";
  const expected = process.env.ADMIN_SECRET || "";

  if (!expected || provided !== expected) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const submissions = (await getJSON<Submission[]>(SUBMISSIONS_KEY)) ?? [];

  const rows = submissions
    .map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      personaTitle: s.personaTitle,
      formula: s.formula,
      read: s.read,
      hearts: s.likedBy.length,
      createdAt: s.createdAt,
    }))
    .sort((a, b) => b.hearts - a.hearts || a.createdAt - b.createdAt);

  const topHearts = rows.length ? rows[0].hearts : 0;
  const winners = topHearts > 0 ? rows.filter((r) => r.hearts === topHearts) : [];

  return NextResponse.json({
    totalPlayers: rows.length,
    totalHearts: rows.reduce((n, r) => n + r.hearts, 0),
    winners, // array in case of a tie
    rows,
  });
}
