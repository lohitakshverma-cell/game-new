"use client";

import { useState } from "react";

type Row = {
  id: string;
  name: string;
  email: string;
  personaTitle: string;
  formula: string;
  hearts: number;
};
type Data = {
  totalPlayers: number;
  totalHearts: number;
  winners: Row[];
  rows: Row[];
};

export default function Admin() {
  const [secret, setSecret] = useState("");
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/results", {
        headers: { "x-admin-secret": secret },
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Unauthorized.");
      setData(d);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="font-mono text-[11px] tracking-label text-terracotta">
        MINIMALIST · ORGANIZER
      </p>
      <h1 className="mt-1 font-heading text-3xl font-bold text-ink">
        Winner Dashboard
      </h1>
      <p className="mt-1 text-sm text-stone">
        Private. Ranks every card by hearts — the count nobody else can see.
      </p>

      {!data ? (
        <div className="card-surface mt-8 max-w-sm rounded-2xl border border-bone p-6">
          <label className="mb-1 block font-mono text-[11px] tracking-label text-stone">
            ADMIN PASSWORD
          </label>
          <input
            type="password"
            className="field"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
          />
          {error && <p className="mt-3 text-sm text-terracotta">{error}</p>}
          <button className="btn-primary mt-4 w-full" onClick={load} disabled={busy}>
            {busy ? "Loading…" : "Unlock"}
          </button>
        </div>
      ) : (
        <div className="mt-8">
          <div className="mb-6 flex gap-8 font-mono text-sm text-stone">
            <span>
              PLAYERS <span className="text-ink">{data.totalPlayers}</span>
            </span>
            <span>
              HEARTS <span className="text-ink">{data.totalHearts}</span>
            </span>
          </div>

          {data.winners.length > 0 && (
            <div className="mb-8 rounded-2xl border border-terracotta bg-cream p-6">
              <p className="font-mono text-[11px] tracking-label text-terracotta">
                {data.winners.length > 1 ? "WINNERS (TIE)" : "WINNER"}
              </p>
              {data.winners.map((w) => (
                <div key={w.id} className="mt-2">
                  <p className="font-heading text-2xl font-bold text-ink">
                    {w.name} — {w.hearts} ♥
                  </p>
                  <p className="text-sm text-stone">
                    {w.personaTitle} · {w.email}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-bone">
            <table className="w-full text-left text-sm">
              <thead className="bg-terracotta font-mono text-[11px] tracking-label text-white">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Persona</th>
                  <th className="px-4 py-3 text-right">Hearts</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((r, i) => (
                  <tr key={r.id} className="border-t border-bone">
                    <td className="px-4 py-3 text-stone">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="text-ink">{r.name}</div>
                      <div className="text-xs text-stone">{r.email}</div>
                    </td>
                    <td className="px-4 py-3 text-ink">{r.personaTitle}</td>
                    <td className="px-4 py-3 text-right font-mono text-terracotta">
                      {r.hearts}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
