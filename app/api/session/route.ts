import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, SESSION_COOKIE } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  const email = verifyToken(cookies().get(SESSION_COOKIE)?.value);
  return NextResponse.json({ verified: Boolean(email), email: email ?? null });
}
