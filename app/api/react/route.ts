import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, SESSION_COOKIE } from "@/lib/session";
import { getJSON, setJSON } from "@/lib/store";
import type { Submission } from "@/lib/types";

export const runtime = "nodejs";

const SUBMISSIONS_KEY = "wrapped:submissions";

export async function POST(req: Request) {
  const email = verifyToken(cookies().get(SESSION_COOKIE)?.value);
  if (!email) {
    return NextResponse.json(
      { error: "Verify your email (by playing) to react." },
      { status: 401 }
    );
  }

  let body: { submissionId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const submissionId = body.submissionId || "";

  const submissions = (await getJSON<Submission[]>(SUBMISSIONS_KEY)) ?? [];
  const card = submissions.find((s) => s.id === submissionId);
  if (!card) {
    return NextResponse.json({ error: "Card not found." }, { status: 404 });
  }

  // No liking your own card.
  if (card.email.toLowerCase() === email) {
    return NextResponse.json(
      { error: "You can't heart your own card." },
      { status: 403 }
    );
  }

  // One heart per person — toggle on/off. Count is deliberately not returned.
  const idx = card.likedBy.indexOf(email);
  let likedByMe: boolean;
  if (idx >= 0) {
    card.likedBy.splice(idx, 1);
    likedByMe = false;
  } else {
    card.likedBy.push(email);
    likedByMe = true;
  }

  await setJSON(SUBMISSIONS_KEY, submissions);
  return NextResponse.json({ likedByMe });
}
