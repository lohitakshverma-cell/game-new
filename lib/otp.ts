import { getJSON, setJSON, del } from "./store";

const OTP_TTL_SECONDS = 10 * 60; // 10 minutes
const MAX_ATTEMPTS = 5;

export type OtpRecord = { otp: string; expiresAt: number; attempts: number };

function key(email: string) {
  return `otp:${email.toLowerCase()}`;
}

export function allowedDomain(): string {
  // Per requirement: only @beminimalist.co e-mails may play. Overridable via env.
  return (process.env.ALLOWED_EMAIL_DOMAIN || "beminimalist.co").toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isAllowedEmail(email: string): boolean {
  const domain = allowedDomain();
  if (!domain) return true;
  return email.toLowerCase().endsWith(`@${domain}`);
}

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
}

export async function storeOtp(email: string, otp: string): Promise<void> {
  const rec: OtpRecord = {
    otp,
    expiresAt: Date.now() + OTP_TTL_SECONDS * 1000,
    attempts: 0,
  };
  await setJSON(key(email), rec, OTP_TTL_SECONDS);
}

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: "expired" | "too_many" | "mismatch" };

export async function verifyOtp(email: string, otp: string): Promise<VerifyResult> {
  const rec = await getJSON<OtpRecord>(key(email));
  if (!rec || Date.now() > rec.expiresAt) {
    await del(key(email));
    return { ok: false, reason: "expired" };
  }
  if (rec.attempts >= MAX_ATTEMPTS) {
    return { ok: false, reason: "too_many" };
  }
  if (rec.otp !== otp) {
    rec.attempts += 1;
    const remainingTtl = Math.max(
      1,
      Math.ceil((rec.expiresAt - Date.now()) / 1000)
    );
    await setJSON(key(email), rec, remainingTtl);
    return { ok: false, reason: "mismatch" };
  }
  await del(key(email)); // one-time use
  return { ok: true };
}
