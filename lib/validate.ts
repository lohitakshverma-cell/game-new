// Lightweight email checks. There is no OTP/verification anymore — the email is
// self-asserted and used only to identify a player (record, one-play-per-email,
// like attribution). Domain restriction is a soft gate on the typed string.

export function allowedDomain(): string {
  const v = process.env.ALLOWED_EMAIL_DOMAIN;
  if (v === undefined) return "beminimalist.co"; // default: company only
  const t = v.trim().toLowerCase();
  if (t === "" || t === "any" || t === "*") return ""; // allow any email
  return t;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isAllowedEmail(email: string): boolean {
  const d = allowedDomain();
  if (!d) return true;
  return email.toLowerCase().endsWith(`@${d}`);
}
