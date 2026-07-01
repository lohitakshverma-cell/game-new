import crypto from "crypto";

export const SESSION_COOKIE = "ff_session";
const TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

function secret(): string {
  return process.env.SESSION_SECRET || "dev-insecure-secret-change-me";
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

// token = base64url(email) . expiry . signature
export function createToken(email: string): string {
  const exp = Date.now() + TTL_MS;
  const e = Buffer.from(email).toString("base64url");
  const payload = `${e}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string | undefined | null): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [e, exp, sig] = parts;
  const payload = `${e}.${exp}`;
  const expected = sign(payload);
  // constant-time compare
  if (
    sig.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  ) {
    return null;
  }
  if (Date.now() > Number(exp)) return null;
  try {
    return Buffer.from(e, "base64url").toString("utf8").toLowerCase();
  } catch {
    return null;
  }
}
