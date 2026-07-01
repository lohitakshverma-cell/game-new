export type Answers = {
  q1: string; // mood
  q2: string; // sin
  q3: string; // ingredient
  q4: string; // shelf
};

export type Persona = {
  id: string; // resultId, e.g. "dramatic-skipsSPF-niacinamide-minimalist"
  personaTitle: string;
  formula: string;
  read: string;
};

export type Submission = {
  id: string; // unique submission id
  name: string;
  email: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  resultId: string;
  personaTitle: string;
  formula: string;
  read: string;
  createdAt: number;
  likedBy: string[]; // emails that hearted this card (hearts = likedBy.length)
};

// Public shape returned to the gallery — NEVER includes the like count.
export type PublicCard = {
  id: string;
  name: string;
  personaTitle: string;
  formula: string;
  read: string;
  createdAt: number;
  likedByMe: boolean; // whether the current verified viewer liked it
  isMine: boolean; // whether this card belongs to the current viewer
};
