import { NextResponse } from "next/server";
import { verifyOtp, isValidEmail } from "@/lib/otp";
import { createToken, SESSION_COOKIE } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { email?: string; otp?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = (body.email || "").trim().toLowerCase();
  const otp = (body.otp || "").trim();

  if (!isValidEmail(email) || !/^\d{6}$/.test(otp)) {
    return NextResponse.json({ error: "Enter the 6-digit code." }, { status: 400 });
  }

  const result = await verifyOtp(email, otp);
  if (!result.ok) {
    const msg =
      result.reason === "expired"
        ? "That code expired. Please request a new one."
        : result.reason === "too_many"
        ? "Too many attempts. Please request a new code."
        : "That code isn't right. Try again.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, createToken(email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 2 * 60 * 60,
  });
  return res;
}
