import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, SESSION_COOKIE } from "@/lib/session";
import { getJSON } from "@/lib/store";
import type { Submission, PublicCard } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUBMISSIONS_KEY = "wrapped:submissions";

export async function GET() {
  const viewer = verifyToken(cookies().get(SESSION_COOKIE)?.value); // may be null

  const submissions = (await getJSON<Submission[]>(SUBMISSIONS_KEY)) ?? [];

  // IMPORTANT: never expose the like count or the likedBy list publicly.
  const cards: PublicCard[] = submissions
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((s) => ({
      id: s.id,
      name: s.name,
      personaTitle: s.personaTitle,
      formula: s.formula,
      read: s.read,
      createdAt: s.createdAt,
      likedByMe: viewer ? s.likedBy.includes(viewer) : false,
      isMine: viewer ? s.email === viewer : false,
    }));

  return NextResponse.json({ cards, verified: Boolean(viewer) });
}
