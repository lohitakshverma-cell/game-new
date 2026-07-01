import { NextResponse } from "next/server";
import { isValidEmail, isAllowedEmail, allowedDomain } from "@/lib/validate";
import { createToken, SESSION_COOKIE } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = (body.email || "").trim().toLowerCase();

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }
  if (!isAllowedEmail(email)) {
    return NextResponse.json(
      { error: `Only @${allowedDomain()} email addresses can play.` },
      { status: 403 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, createToken(email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 6 * 60 * 60, // 6 hours
  });
  return res;
}
