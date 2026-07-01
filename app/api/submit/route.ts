import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, SESSION_COOKIE } from "@/lib/session";
import { isValidAnswer } from "@/lib/questions";
import { getPersona } from "@/lib/content";
import { getJSON, setJSON } from "@/lib/store";
import type { Submission } from "@/lib/types";

export const runtime = "nodejs";

const SUBMISSIONS_KEY = "wrapped:submissions";
const playedKey = (email: string) => `played:${email.toLowerCase()}`;

export async function POST(req: Request) {
  const email = verifyToken(cookies().get(SESSION_COOKIE)?.value);
  if (!email) {
    return NextResponse.json({ error: "Please verify your email first." }, { status: 401 });
  }

  let body: { name?: string; q1?: string; q2?: string; q3?: string; q4?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = (body.name || "").trim().slice(0, 60);
  const { q1 = "", q2 = "", q3 = "", q4 = "" } = body;

  if (!name) {
    return NextResponse.json({ error: "We need your name." }, { status: 400 });
  }
  if (
    !isValidAnswer("q1", q1) ||
    !isValidAnswer("q2", q2) ||
    !isValidAnswer("q3", q3) ||
    !isValidAnswer("q4", q4)
  ) {
    return NextResponse.json({ error: "Please answer all four questions." }, { status: 400 });
  }

  const submissions = (await getJSON<Submission[]>(SUBMISSIONS_KEY)) ?? [];

  // Block duplicate plays — return the existing card instead of erroring.
  const existingId = await getJSON<string>(playedKey(email));
  if (existingId) {
    const existing = submissions.find((s) => s.id === existingId);
    if (existing) {
      return NextResponse.json({
        alreadyPlayed: true,
        result: {
          personaTitle: existing.personaTitle,
          formula: existing.formula,
          read: existing.read,
        },
        submissionId: existing.id,
      });
    }
  }

  const persona = getPersona({ q1, q2, q3, q4 });
  const submission: Submission = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    email,
    q1,
    q2,
    q3,
    q4,
    resultId: persona.id,
    personaTitle: persona.personaTitle,
    formula: persona.formula,
    read: persona.read,
    createdAt: Date.now(),
    likedBy: [],
  };

  submissions.push(submission);
  await setJSON(SUBMISSIONS_KEY, submissions);
  await setJSON(playedKey(email), submission.id);

  return NextResponse.json({
    alreadyPlayed: false,
    result: {
      personaTitle: persona.personaTitle,
      formula: persona.formula,
      read: persona.read,
    },
    submissionId: submission.id,
  });
}
