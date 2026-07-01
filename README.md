# Formula Finder

An in-house team microsite for **Minimalist** (beminimalist.co). Each teammate
enters their name + email, answers **four** tap-to-select questions, and gets a
personalized "skin persona" card — a playful mashup of a fake signature formula,
a persona title, and one honest one-liner. Every card lands in a shared team
gallery where people can heart their favorites. At the end, the most-hearted
card wins.

- **No email verification / OTP.** Name + email -> straight into the game.
- **No AI at runtime.** All 256 (4x4x4x4) results are composed deterministically
  from a pre-written content bank (`lib/content.ts`).
- **No accounts / passwords.** The email just identifies a player and their record.
- **No email service needed.** No Resend, no domain setup.

---

## Stack

- Next.js 14 (App Router) + React + TypeScript
- Tailwind CSS (tokenized to the official Minimalist palette + Montserrat/Inter)
- Vercel KV (Upstash Redis) for shared storage
- `html-to-image` for card download, `canvas-confetti` for the reveal moment

---

## How it works

**Flow:** `/` (name + email) -> `/play` (4 questions) -> `/result` (card reveal,
auto-saved, download) -> `/gallery` (everyone's cards).

**Key rules baked in:**

- **256 combinations** via 4 questions, so cards rarely repeat in the gallery.
  Same answers always produce the same card (deterministic, no AI).
- **Name + email + answers are recorded** for every completed play.
- **One play per email.** Replays return the person's existing card, not an error.
- **Reacting needs an email.** Viewing the gallery is open to anyone; hearting a
  card requires having entered an email (so likes can be attributed).
- **No self-likes.** You can't heart your own card.
- **Hidden counts.** No one can see how many hearts any card has in the gallery.
- **Winner = most hearts,** visible only to you on the private `/admin` page.

> Note: because there's no email verification, identity is self-asserted - fine
> for an internal, trust-based team activity. Someone determined could re-enter a
> different email to play/like again; the cookie prevents casual duplicates.

---

## Local development

```bash
npm install
cp .env.example .env.local   # fill in the secrets (see below)
npm run dev                  # http://localhost:3000
```

Without KV configured, the app still runs locally - storage falls back to an
in-memory store (not persistent across restarts).

---

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_URL` | Prod | Vercel KV connection (auto-added when you attach a KV store) |
| `ALLOWED_EMAIL_DOMAIN` | Optional | Defaults to `beminimalist.co`. Set to `any` (or `*`) to allow ANY email. |
| `SESSION_SECRET` | Yes | Long random string; signs the player session cookie |
| `ADMIN_SECRET` | Yes | Password for the `/admin` winner dashboard |

Generate the two secrets with e.g. `openssl rand -hex 32`.

---

## Deploy on Vercel

1. Push this repo to GitHub/GitLab.
2. Import it in Vercel (framework auto-detected as Next.js).
3. Attach a KV store: **Storage -> Create Database -> Redis/KV** -> Connect to the
   project. This injects the `KV_*` vars automatically.
4. Add `SESSION_SECRET` and `ADMIN_SECRET` (and optionally `ALLOWED_EMAIL_DOMAIN`)
   in **Settings -> Environment Variables**.
5. **Redeploy** (env vars only apply to new deployments).
6. Share the URL with the team.

---

## Picking the winner

Go to `/admin`, enter your `ADMIN_SECRET`. You'll see every player ranked by
hearts, with the top card (or a tie) called out as the winner. Players never see
these counts themselves.

---

## Editing the content

- `lib/questions.ts` - the four questions and their options.
- `lib/content.ts` - the fragment banks that compose all 256 cards. Keep it witty
  and honest - never mean, never body-shaming, never medical advice.

---

## Non-goals

- No AI/LLM calls at runtime.
- No email verification, accounts, or passwords.
- No scoring beyond the hearts-based winner.
- Collected emails are used only to identify a player - never for marketing.
