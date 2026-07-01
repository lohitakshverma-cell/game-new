"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Landing() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function start() {
    setError("");
    if (!name.trim()) return setError("Please add your name.");
    setBusy(true);
    try {
      const res = await fetch("/api/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      sessionStorage.setItem("ff_name", name.trim());
      router.push("/play");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <p className="mb-3 font-mono text-[11px] tracking-label text-terracotta">
        MINIMALIST · TEAM ACTIVITY
      </p>
      <h1 className="font-heading text-4xl font-bold tracking-tight text-ink">
        Formula Finder
      </h1>
      <p className="mt-3 text-stone">
        Four taps. One personalized skin formula. One shared team gallery.
      </p>

      <div className="card-surface mt-8 rounded-2xl border border-bone p-6">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block font-mono text-[11px] tracking-label text-stone">
              NAME
            </label>
            <input
              className="field"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-[11px] tracking-label text-stone">
              EMAIL
            </label>
            <input
              className="field"
              type="email"
              placeholder="you@beminimalist.co"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && start()}
            />
          </div>
          {error && <p className="text-sm text-terracotta">{error}</p>}
          <button className="btn-primary w-full" onClick={start} disabled={busy}>
            {busy ? "Starting…" : "Start"}
          </button>
        </div>
      </div>

      <Link
        href="/gallery"
        className="mt-6 text-center text-sm text-stone underline underline-offset-4 hover:text-terracotta"
      >
        Just here to browse the gallery →
      </Link>
    </main>
  );
}
