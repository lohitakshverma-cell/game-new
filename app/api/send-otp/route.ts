import { NextResponse } from "next/server";
import { generateOtp, storeOtp, isValidEmail, isAllowedEmail, allowedDomain } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";

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

  const otp = generateOtp();
  await storeOtp(email, otp);

  try {
    await sendOtpEmail(email, otp);
  } catch {
    return NextResponse.json(
      { error: "Couldn't send the code. Try again in a moment." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
