"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Stage = "entry" | "otp";

export default function Landing() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("entry");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  async function sendCode() {
    setError("");
    if (!name.trim()) return setError("Please add your name.");
    setBusy(true);
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStage("otp");
      setCooldown(30);
      setTimeout(() => inputs.current[0]?.focus(), 50);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function setDigit(i: number, v: string) {
    const clean = v.replace(/\D/g, "").slice(-1);
    setDigits((d) => {
      const next = [...d];
      next[i] = clean;
      return next;
    });
    if (clean && i < 5) inputs.current[i + 1]?.focus();
  }

  function onKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
  }

  function onPaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setDigits(next);
    inputs.current[Math.min(text.length, 5)]?.focus();
  }

  async function verify() {
    setError("");
    const otp = digits.join("");
    if (otp.length !== 6) return setError("Enter all 6 digits.");
    setBusy(true);
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't verify.");
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
        <span className="mt-1 block text-sm">
          Verify your <span className="text-ink">@beminimalist.co</span> email to play.
        </span>
      </p>

      <div className="card-surface mt-8 rounded-2xl border border-bone p-6">
        {stage === "entry" ? (
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
                WORK EMAIL
              </label>
              <input
                className="field"
                type="email"
                placeholder="you@beminimalist.co"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendCode()}
              />
            </div>
            {error && <p className="text-sm text-terracotta">{error}</p>}
            <button className="btn-primary w-full" onClick={sendCode} disabled={busy}>
              {busy ? "Sending…" : "Send code"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-stone">
              Enter the 6-digit code we sent to{" "}
              <span className="text-ink">{email}</span>.
            </p>
            <div className="flex justify-between gap-2" onPaste={onPaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputs.current[i] = el;
                  }}
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={(e) => onKey(i, e)}
                  className="h-14 w-full rounded-xl border border-bone bg-white text-center font-heading text-2xl font-semibold text-ink outline-none focus:border-terracotta"
                />
              ))}
            </div>
            {error && <p className="text-sm text-terracotta">{error}</p>}
            <button className="btn-primary w-full" onClick={verify} disabled={busy}>
              {busy ? "Verifying…" : "Verify & play"}
            </button>
            <div className="flex items-center justify-between text-sm">
              <button
                className="text-stone underline underline-offset-2 disabled:no-underline disabled:opacity-50"
                disabled={cooldown > 0 || busy}
                onClick={sendCode}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
              </button>
              <button
                className="text-stone hover:text-terracotta"
                onClick={() => {
                  setStage("entry");
                  setDigits(["", "", "", "", "", ""]);
                  setError("");
                }}
              >
                Change email
              </button>
            </div>
          </div>
        )}
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
