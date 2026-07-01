export type Option = { key: string; label: string };
export type Question = { id: "q1" | "q2" | "q3" | "q4"; prompt: string; options: Option[] };

export const QUESTIONS: Question[] = [
  {
    id: "q1",
    prompt: "What's your skin's mood today?",
    options: [
      { key: "dramatic", label: "Dramatic" },
      { key: "chill", label: "Chill" },
      { key: "chaotic", label: "Chaotic" },
      { key: "glowing", label: "Glowing" },
    ],
  },
  {
    id: "q2",
    prompt: "Your biggest skincare sin?",
    options: [
      { key: "skipsSPF", label: "Skips SPF" },
      { key: "sleepsInMakeup", label: "Sleeps in makeup" },
      { key: "popsPimples", label: "Pops pimples" },
      { key: "serumHoarder", label: "Serum hoarder" },
    ],
  },
  {
    id: "q3",
    prompt: "Pick your dream ingredient superpower.",
    options: [
      { key: "niacinamide", label: "Niacinamide" },
      { key: "retinol", label: "Retinol" },
      { key: "caffeine", label: "Caffeine" },
      { key: "spf", label: "SPF" },
    ],
  },
  {
    id: "q4",
    prompt: "Your bathroom shelf, honestly?",
    options: [
      { key: "minimalist", label: "3-step minimalist" },
      { key: "curated", label: "Curated edit" },
      { key: "overflowing", label: "Overflowing" },
      { key: "chaos", label: "Beautiful chaos" },
    ],
  },
];

const VALID: Record<string, Set<string>> = Object.fromEntries(
  QUESTIONS.map((q) => [q.id, new Set(q.options.map((o) => o.key))])
);

export function isValidAnswer(id: "q1" | "q2" | "q3" | "q4", key: string): boolean {
  return VALID[id]?.has(key) ?? false;
}
