"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PublicCard } from "@/lib/types";

export default function Gallery() {
  const [cards, setCards] = useState<PublicCard[]>([]);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");

  useEffect(() => {
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((d) => {
        setCards(d.cards || []);
        setVerified(Boolean(d.verified));
      })
      .finally(() => setLoading(false));
  }, []);

  async function toggleHeart(card: PublicCard) {
    setNote("");
    if (!verified) {
      setNote("Enter your email (by playing) to react to cards.");
      return;
    }
    if (card.isMine) {
      setNote("You can't heart your own card.");
      return;
    }
    // optimistic
    setCards((cs) =>
      cs.map((c) => (c.id === card.id ? { ...c, likedByMe: !c.likedByMe } : c))
    );
    const res = await fetch("/api/react", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId: card.id }),
    });
    if (!res.ok) {
      // revert on failure
      setCards((cs) =>
        cs.map((c) => (c.id === card.id ? { ...c, likedByMe: !c.likedByMe } : c))
      );
      const d = await res.json();
      setNote(d.error || "Couldn't react.");
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-label text-terracotta">
            MINIMALIST · TEAM GALLERY
          </p>
          <h1 className="mt-1 font-heading text-3xl font-bold text-ink">
            Everyone's Formulas
          </h1>
          <p className="mt-1 text-sm text-stone">
            Tap the heart on your favorites. Like counts are hidden, the most-loved
            card is revealed at the end.
          </p>
        </div>
        <Link href="/" className="btn-ghost">
          {verified ? "Home" : "Play"}
        </Link>
      </header>

      {note && (
        <p className="mb-6 rounded-xl border border-bone bg-cream px-4 py-3 text-sm text-stone">
          {note}
        </p>
      )}

      {loading ? (
        <p className="font-mono text-sm tracking-label text-stone">LOADING…</p>
      ) : cards.length === 0 ? (
        <p className="text-stone">
          No cards yet. Be the first —{" "}
          <Link href="/" className="text-terracotta underline underline-offset-2">
            play now
          </Link>
          .
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <article
              key={c.id}
              className="card-surface flex flex-col rounded-2xl border border-bone p-5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-label text-terracotta">
                  {c.name}
                  {c.isMine && " · you"}
                </span>
                <button
                  aria-label="heart"
                  onClick={() => toggleHeart(c)}
                  className={`text-xl transition ${
                    c.isMine
                      ? "cursor-not-allowed opacity-30"
                      : "hover:scale-110"
                  } ${c.likedByMe ? "text-terracotta" : "text-bone"}`}
                >
                  {c.likedByMe ? "♥" : "♡"}
                </button>
              </div>
              <h2 className="mt-4 font-heading text-xl font-semibold leading-tight text-ink">
                {c.personaTitle}
              </h2>
              <p className="mt-3 font-mono text-sm text-terracotta">{c.formula}</p>
              <p className="mt-3 text-sm text-ink/90">{c.read}</p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
