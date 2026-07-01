import type { Answers, Persona } from "./types";

// ── Content banks ────────────────────────────────────────────────────────────
// 4 × 4 × 4 × 4 = 256 combinations. Each card is composed deterministically from
// these pre-written fragments — no AI at runtime, fully static and repeatable.
// Same answers always produce the same card; the four questions keep collisions
// rare across a real team gallery.
//
// Tone rules (brand-safe): witty + honest, never mean, never body-shaming,
// never medical advice, never astrology/woo.

const MOOD: Record<string, { adj: string; lead: string }> = {
  dramatic: { adj: "Dramatic", lead: "Big feelings, and a barrier doing its best." },
  chill: { adj: "Unbothered", lead: "Low effort, low drama, quietly decent glow." },
  chaotic: { adj: "Chaotic", lead: "A routine held together mostly by vibes." },
  glowing: { adj: "Glowing", lead: "The glow is real — now protect the investment." },
};

const SIN: Record<string, { noun: string; trait: string; jab: string }> = {
  skipsSPF: {
    noun: "SPF Skipper",
    trait: "Denial",
    jab: "Your future self is quietly filing a complaint about the sunscreen.",
  },
  sleepsInMakeup: {
    noun: "Pillow Artist",
    trait: "Last Night's Face",
    jab: "Your pillowcase has witnessed things it did not sign up for.",
  },
  popsPimples: {
    noun: "Pop Star",
    trait: "Impatience",
    jab: "Hands off — that spot did not consent to the magnifying mirror.",
  },
  serumHoarder: {
    noun: "Serum Hoarder",
    trait: "Unopened Bottles",
    jab: "Half your shelf is still shrink-wrapped and full of hope.",
  },
};

const INGREDIENT: Record<string, { name: string; base: number; nudge: string }> = {
  niacinamide: {
    name: "Niacinamide",
    base: 60,
    nudge: "Niacinamide is quietly doing the heavy lifting for you.",
  },
  retinol: {
    name: "Retinol",
    base: 55,
    nudge: "Retinol says go slow — respect the purge, reap the smooth.",
  },
  caffeine: {
    name: "Caffeine",
    base: 65,
    nudge: "Caffeine's on de-puff duty; your under-eyes send thanks.",
  },
  spf: {
    name: "SPF",
    base: 70,
    nudge: "SPF is the whole personality now, and honestly — correct.",
  },
};

const SHELF: Record<string, { note: string }> = {
  minimalist: { note: "A tidy three-step shelf, not one product too many." },
  curated: { note: "Everything on the shelf earns its exact spot." },
  overflowing: { note: "The shelf is full, the cabinet fuller, regrets few." },
  chaos: { note: "Half the caps are missing and somehow it still works." },
};

// Stable FNV-1a hash so the same answers always yield the same numbers.
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function getPersona(a: Answers): Persona {
  const m = MOOD[a.q1];
  const s = SIN[a.q2];
  const ing = INGREDIENT[a.q3];
  const sh = SHELF[a.q4];
  const id = `${a.q1}-${a.q2}-${a.q3}-${a.q4}`;
  const h = hash(id);

  // Percentage varies per full combination for a science-label feel.
  const pct = Math.max(45, Math.min(90, ing.base + ((h % 21) - 10)));

  const personaTitle = `The ${m.adj} ${s.noun}`;
  const formula = `${ing.name} ${pct}%, ${s.trait} ${100 - pct}%`;

  const fragments = [s.jab, ing.nudge, sh.note];
  const read = `${m.lead} ${fragments[h % fragments.length]}`;

  return { id, personaTitle, formula, read };
}
