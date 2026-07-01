# Formula Finder

An in-house team microsite for **Minimalist** (beminimalist.co). Each teammate
verifies their `@beminimalist.co` email, answers **four** tap-to-select questions,
and gets a personalized "skin persona" card — a playful mashup of a fake signature
formula, a persona title, and one honest one-liner. Every card lands in a shared
team gallery where people can heart their favorites. At the end, the most-hearted
card wins.

- **No AI at runtime.** All 256 (4×4×4×4) results are composed deterministically
  from a pre-written content bank (`lib/content.ts`).
- **No accounts / passwords.** Email is used only for one-time OTP verification.
- **Built to deploy on Vercel's free tier.**

---

## Stack

- Next.js 14 (App Router) + React + TypeScript
- Tailwind CSS (tokenized to the official Minimalist palette + Montserrat/Inter)
- Vercel KV (Upstash Redis) for shared storage
- Resend (free tier) for OTP emails
- `html-to-image` for card download, `canvas-confetti` for the reveal moment

---

## How it works

**Flow:** `/` (name + email → 6-digit OTP) → `/play` (4 questions) →
`/result` (card reveal, auto-saved, download) → `/gallery` (everyone's cards).

**Key rules baked in:**

- **256 combinations** via 4 questions, so cards rarely repeat in the gallery.
  Same answers always produce the same card (deterministic, no AI).
- **OTP only to `@beminimalist.co`** (set by `ALLOWED_EMAIL_DOMAIN`, defaults to
  `beminimalist.co`).
- **One play per email.** Replays return the person's existing card, not an error.
- **Reacting requires verification.** Viewing the gallery is open to anyone;
  hearting a card requires a verified session. This is what makes the winner
  mechanic honest.
- **No self-likes.** You can't heart your own card.
- **Hidden counts.** No one can see how many hearts any card has in the gallery.
- **Winner = most hearts,** visible only to you on the private `/admin` page.

---

## Local development

```bash
npm install
cp .env.example .env.local   # fill in values (see below)
npm run dev                  # http://localhost:3000
```

Without KV or Resend configured, the app still runs locally:

- Storage falls back to an in-memory store (not persistent across restarts).
- The OTP is **printed to the server console** instead of emailed, so you can
  test the full flow. Look for `[Formula Finder] OTP for … : 123456`.

---

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_URL` | Prod | Vercel KV connection (auto-added when you attach a KV store) |
| `RESEND_API_KEY` | Prod | Send OTP emails via Resend |
| `RESEND_FROM` | Recommended | Verified sender, e.g. `Formula Finder <noreply@beminimalist.co>` |
| `ALLOWED_EMAIL_DOMAIN` | Optional | Defaults to `beminimalist.co` |
| `SESSION_SECRET` | **Yes** | Long random string; signs the verified-session cookie |
| `ADMIN_SECRET` | **Yes** | Password for the `/admin` winner dashboard |

Generate secrets with e.g. `openssl rand -hex 32`.

---

## Provisioning (one-time)

**Vercel KV:** Vercel dashboard → your project → **Storage** → **Create → KV**.
Connect it to the project; Vercel injects the `KV_*` vars automatically.

**Resend:** create an account at [resend.com](https://resend.com), add + verify a
sending domain (or use the `onboarding@resend.dev` sandbox for testing), copy the
API key into `RESEND_API_KEY`, and set `RESEND_FROM` to a verified address.

---

## Deploy on Vercel

1. Push this repo to GitHub/GitLab.
2. Import it in Vercel (framework auto-detected as Next.js).
3. Attach a KV store (Storage tab) — adds the `KV_*` vars.
4. Add `RESEND_API_KEY`, `RESEND_FROM`, `SESSION_SECRET`, `ADMIN_SECRET`
   (and optionally `ALLOWED_EMAIL_DOMAIN`) in **Settings → Environment Variables**.
5. Deploy. Share the URL with the team.

---

## Picking the winner

Go to `/admin`, enter your `ADMIN_SECRET`. You'll see every player ranked by
hearts, with the top card (or a tie) called out as the winner. Players never see
these counts themselves.

---

## Editing the content

All copy lives in two files:

- `lib/questions.ts` — the four questions and their options.
- `lib/content.ts` — the fragment banks that compose all 256 cards. Edit the
  `MOOD` / `SIN` / `INGREDIENT` / `SHELF` banks to change tone or wording. Keep it
  witty and honest — never mean, never body-shaming, never medical advice.

---

## Non-goals

- No AI/LLM calls at runtime.
- No user accounts or passwords (OTP is one-time verification, not login).
- No scoring beyond the hearts-based winner.
- Collected emails are used only to gate one play per person — never for marketing.
