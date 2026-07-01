"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS } from "@/lib/questions";

export default function Play() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Guard: must be verified to reach /play.
  useEffect(() => {
    fetch("/api/session")
      .then((r) => r.json())
      .then((d) => {
        if (!d.verified) router.replace("/");
        else setReady(true);
      })
      .catch(() => router.replace("/"));
  }, [router]);

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="font-mono text-sm tracking-label text-stone">LOADING…</p>
      </main>
    );
  }

  const q = QUESTIONS[step];

  function choose(key: string) {
    const next = { ...answers, [q.id]: key };
    setAnswers(next);
    if (step < QUESTIONS.length - 1) {
      setTimeout(() => setStep((s) => s + 1), 180);
    } else {
      const params = new URLSearchParams(next as Record<string, string>);
      setTimeout(() => router.push(`/result?${params.toString()}`), 180);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      {/* progress */}
      <div className="mb-8 flex items-center gap-2">
        {QUESTIONS.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= step ? "bg-terracotta" : "bg-bone"
            }`}
          />
        ))}
      </div>

      <p className="mb-2 font-mono text-[11px] tracking-label text-terracotta">
        QUESTION {step + 1} / {QUESTIONS.length}
      </p>
      <h2 className="font-heading text-2xl font-semibold text-ink">{q.prompt}</h2>

      <div className="mt-8 grid grid-cols-2 gap-3">
        {q.options.map((o) => {
          const active = answers[q.id] === o.key;
          return (
            <button
              key={o.key}
              onClick={() => choose(o.key)}
              className={`card-surface rounded-2xl border p-6 text-left font-heading text-lg font-medium transition ${
                active
                  ? "border-terracotta text-terracotta"
                  : "border-bone text-ink hover:border-terracotta/60"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>

      <p className="mt-8 text-center text-xs text-stone">
        No wrong answers. Tap to continue.
      </p>
    </main>
  );
}
