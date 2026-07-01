import { Resend } from "resend";

const FROM = process.env.RESEND_FROM || "Formula Finder <onboarding@resend.dev>";

export async function sendOtpEmail(email: string, otp: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  // Local-dev convenience: without a key, print the code to the server console
  // so you can test the full flow without sending real mail.
  if (!apiKey) {
    // eslint-disable-next-line no-console
    console.log(`\n[Formula Finder] OTP for ${email}: ${otp}\n`);
    return;
  }

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Your Formula Finder code",
    html: `
      <div style="font-family:Inter,Arial,sans-serif;color:#1A1A18;max-width:440px;margin:0 auto;padding:24px">
        <p style="font-family:'Courier New',monospace;letter-spacing:.08em;color:#B96E4F;font-size:12px;margin:0 0 4px">MINIMALIST · FORMULA FINDER</p>
        <h1 style="font-size:22px;margin:0 0 16px">Your verification code</h1>
        <p style="color:#6B6862;margin:0 0 16px">Enter this code to find your skin formula. It expires in 10 minutes.</p>
        <div style="font-size:34px;font-weight:700;letter-spacing:.35em;background:#F7F3EC;border:1px solid #E5DDD3;border-radius:12px;padding:16px;text-align:center">${otp}</div>
        <p style="color:#6B6862;font-size:12px;margin:20px 0 0">If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  });
}
