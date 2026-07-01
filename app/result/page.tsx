"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import { toPng } from "html-to-image";

type Result = { personaTitle: string; formula: string; read: string };

function ResultInner() {
  const params = useSearchParams();
  const [result, setResult] = useState<Result | null>(null);
  const [name, setName] = useState("");
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [error, setError] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);
  const firedConfetti = useRef(false);

  useEffect(() => {
    const q1 = params.get("q1") || "";
    const q2 = params.get("q2") || "";
    const q3 = params.get("q3") || "";
    const q4 = params.get("q4") || "";
    const storedName =
      typeof window !== "undefined" ? sessionStorage.getItem("ff_name") || "" : "";
    setName(storedName);

    fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: storedName, q1, q2, q3, q4 }),
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Couldn't reveal your card.");
        setResult(data.result);
        setAlreadyPlayed(Boolean(data.alreadyPlayed));
      })
      .catch((e) => setError((e as Error).message));
  }, [params]);

  useEffect(() => {
    if (result && !firedConfetti.current) {
      firedConfetti.current = true;
      confetti({
        particleCount: 70,
        spread: 65,
        startVelocity: 32,
        origin: { y: 0.35 },
        colors: ["#B96E4F", "#7B8C6E", "#92400E", "#E5DDD3"],
        scalar: 0.9,
      });
    }
  }, [result]);

  async function download() {
    if (!cardRef.current) return;
    const dataUrl = await toPng(cardRef.current, {
      pixelRatio: 2,
      backgroundColor: "#ffffff",
    });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "my-formula.png";
    a.click();
  }

  if (error) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
        <p className="text-terracotta">{error}</p>
        <Link href="/" className="btn-ghost mt-6">
          Back to start
        </Link>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="font-mono text-sm tracking-label text-stone">
          MIXING YOUR FORMULA…
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      {alreadyPlayed && (
        <p className="mb-4 rounded-xl border border-bone bg-cream px-4 py-3 text-center text-sm text-stone">
          You've already got your card — here it is again.
        </p>
      )}

      {/* Persona card */}
      <div
        ref={cardRef}
        className="card-surface overflow-hidden rounded-3xl border border-bone p-8"
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-label text-terracotta">
            MINIMALIST · FORMULA FINDER
          </span>
          <span className="chip">EST. 2020</span>
        </div>

        <h1 className="mt-8 font-heading text-3xl font-bold leading-tight text-ink">
          {result.personaTitle}
        </h1>
        {name && <p className="mt-1 text-sm text-stone">for {name}</p>}

        <div className="mt-8 border-t border-bone pt-5">
          <p className="font-mono text-[10px] tracking-label text-stone">
            SIGNATURE FORMULA
          </p>
          <p className="mt-1 font-mono text-lg text-terracotta">{result.formula}</p>
        </div>

        <div className="mt-5 border-t border-bone pt-5">
          <p className="font-mono text-[10px] tracking-label text-stone">
            THE HONEST READ
          </p>
          <p className="mt-1 text-ink">{result.read}</p>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button className="btn-primary flex-1" onClick={download}>
          Download card
        </button>
        <Link href="/gallery" className="btn-ghost flex-1">
          View gallery
        </Link>
      </div>
      <p className="mt-4 text-center text-xs text-stone">
        Your card is saved to the team gallery. Screenshot or download to share.
      </p>
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <p className="font-mono text-sm tracking-label text-stone">LOADING…</p>
        </main>
      }
    >
      <ResultInner />
    </Suspense>
  );
}
