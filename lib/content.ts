import type { Answers, Persona } from "./types";

// ── Content banks ────────────────────────────────────────────────────────────
// Each answer now carries 4 interchangeable variants of its copy, so a single
// answer combination can render many distinct cards instead of one fixed card.
//
// Selection is handled by pickNoRepeat (a shuffle-bag): every variant in a slot
// is shown once before any repeat, so the same answers won't hand you the same
// line back-to-back. State lives for the page session; see the note at the
// bottom if you want it to survive reloads.
//
// Tone rules (brand-safe): witty + honest, never mean, never body-shaming,
// never medical advice, never astrology/woo.

const MOOD: Record<string, { adj: string; leads: string[] }> = {
  dramatic: {
    adj: "Dramatic",
    leads: [
      "Big feelings, and a barrier doing its best.",
      "Every skincare night is a season finale.",
      "High stakes, high hopes, medium hydration.",
      "Main-character energy, supporting-cast consistency.",
    ],
  },
  chill: {
    adj: "Unbothered",
    leads: [
      "Low effort, low drama, quietly decent glow.",
      "The bare minimum, and getting away with it.",
      "Calm shelf, calm face, no notes.",
      "Not chasing perfect — comfortably cruising at fine.",
    ],
  },
  chaotic: {
    adj: "Chaotic",
    leads: [
      "A routine held together mostly by vibes.",
      "Three steps some nights, zero on others.",
      "The plan changes nightly; so do the results.",
      "Consistency is a rumor you've heard about.",
    ],
  },
  glowing: {
    adj: "Glowing",
    leads: [
      "The glow is real — now protect the investment.",
      "Whatever you're doing, keep doing it.",
      "Peak form. Stay humble, stay consistent.",
      "Results are in, and they're flattering.",
    ],
  },
};

const SIN: Record<string, { noun: string; trait: string; jabs: string[] }> = {
  skipsSPF: {
    noun: "SPF Skipper",
    trait: "Denial",
    jabs: [
      "Your future self is quietly filing a complaint about the sunscreen.",
      "The sun is undefeated and you keep declining the umbrella.",
      "SPF is free real estate and you're leaving it vacant.",
      "Every skipped morning is a tiny loan against later.",
    ],
  },
  sleepsInMakeup: {
    noun: "Pillow Artist",
    trait: "Last Night's Face",
    jabs: [
      "Your pillowcase has witnessed things it did not sign up for.",
      "Last night's face is still clocked in this morning.",
      "The makeup wipe misses you. Deeply.",
      "Beauty sleep, technically — the makeup stayed awake.",
    ],
  },
  popsPimples: {
    noun: "Pop Star",
    trait: "Impatience",
    jabs: [
      "Hands off — that spot did not consent to the magnifying mirror.",
      "The mirror leans in, the willpower leans out.",
      "One squeeze today, one grudge held by your skin tomorrow.",
      "Patience would've healed that faster than your thumbs.",
    ],
  },
  serumHoarder: {
    noun: "Serum Hoarder",
    trait: "Unopened Bottles",
    jabs: [
      "Half your shelf is still shrink-wrapped and full of hope.",
      "You collect serums the way others collect browser tabs.",
      "So many bottles, so few actually opened.",
      "The cart said 'treat yourself'; the routine never got the memo.",
    ],
  },
};

const INGREDIENT: Record<string, { name: string; base: number; nudges: string[] }> = {
  niacinamide: {
    name: "Niacinamide",
    base: 60,
    nudges: [
      "Niacinamide is quietly doing the heavy lifting for you.",
      "Niacinamide: unglamorous, unbothered, undefeated.",
      "The niacinamide is working overtime and asking for nothing.",
      "Barrier support, no drama — that's the niacinamide talking.",
    ],
  },
  retinol: {
    name: "Retinol",
    base: 55,
    nudges: [
      "Retinol says go slow — respect the purge, reap the smooth.",
      "Retinol rewards patience and punishes enthusiasm.",
      "Pea-sized, buffer up, and let the retinol cook.",
      "Retinol is the long game; your future skin RSVPs yes.",
    ],
  },
  caffeine: {
    name: "Caffeine",
    base: 65,
    nudges: [
      "Caffeine's on de-puff duty; your under-eyes send thanks.",
      "Caffeine: espresso for your eye area.",
      "The morning puff doesn't stand a chance against caffeine.",
      "Caffeine tightens the situation before your coffee even brews.",
    ],
  },
  spf: {
    name: "SPF",
    base: 70,
    nudges: [
      "SPF is the whole personality now, and honestly — correct.",
      "SPF: the one step your dermatologist would high-five.",
      "Reapply is a love language and SPF speaks it fluently.",
      "Everything else is optional; the SPF is not.",
    ],
  },
};

const SHELF: Record<string, { notes: string[] }> = {
  minimalist: {
    notes: [
      "A tidy three-step shelf, not one product too many.",
      "Fewer bottles, fewer decisions, zero regrets.",
      "Minimal shelf, maximal restraint.",
      "Three products, no drama, all business.",
    ],
  },
  curated: {
    notes: [
      "Everything on the shelf earns its exact spot.",
      "No filler — every bottle passed the interview.",
      "A curated lineup with no bench-warmers.",
      "Nothing decorative here; it all works for a living.",
    ],
  },
  overflowing: {
    notes: [
      "The shelf is full, the cabinet fuller, regrets few.",
      "More product than counter, and no plans to slow down.",
      "A shelf that laughs at the phrase 'holy grail.'",
      "Backups for the backups, and proud of it.",
    ],
  },
  chaos: {
    notes: [
      "Half the caps are missing and somehow it still works.",
      "An archaeological dig with a decent success rate.",
      "No system, no labels, occasional miracles.",
      "Chaos on the shelf, luck on your side.",
    ],
  },
};

// ── Randomness helpers ───────────────────────────────────────────────────────

// Random int in [min, max], inclusive.
function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Shuffle-bag: returns a random item from `items`, guaranteeing every item is
// handed out once before any repeat. State is kept per `key`, so each slot
// (e.g. a given combo's lead vs. its fragment) cycles independently.
const bags = new Map<string, number[]>();
function pickNoRepeat<T>(key: string, items: T[]): T {
  let bag = bags.get(key);
  if (!bag || bag.length === 0) {
    bag = items.map((_, i) => i);
    // Fisher–Yates shuffle
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    bags.set(key, bag);
  }
  return items[bag.pop()!];
}

// ── Generator ────────────────────────────────────────────────────────────────

export function getPersona(a: Answers): Persona {
  const m = MOOD[a.q1];
  const s = SIN[a.q2];
  const ing = INGREDIENT[a.q3];
  const sh = SHELF[a.q4];
  const id = `${a.q1}-${a.q2}-${a.q3}-${a.q4}`;

  // Percentage now varies per generation for a fresh science-label feel.
  const pct = Math.max(45, Math.min(90, ing.base + rand(-10, 10)));

  const personaTitle = `The ${m.adj} ${s.noun}`;
  const formula = `${ing.name} ${pct}%, ${s.trait} ${100 - pct}%`;

  // Read = a non-repeating lead + a non-repeating supporting line, drawn from
  // the combined pool of jabs, nudges, and notes. Keyed by `id` so each answer
  // combination keeps its own rotation.
  const lead = pickNoRepeat(`${id}:lead`, m.leads);
  const fragments = [...s.jabs, ...ing.nudges, ...sh.notes];
  const line = pickNoRepeat(`${id}:frag`, fragments);
  const read = `${lead} ${line}`;

  return { id, personaTitle, formula, read };
}
