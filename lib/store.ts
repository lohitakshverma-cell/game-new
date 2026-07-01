// Thin storage layer. Uses Vercel KV (Upstash Redis) when its env vars are
// present; otherwise falls back to an in-memory map so `next dev` works locally
// without provisioning KV. The in-memory store is NOT persistent — restart
// clears it. Production on Vercel always uses KV.

type Entry = { value: unknown; expiresAt: number | null };

const hasKV = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

// Lazy import so local dev never needs @vercel/kv configured.
let kvClient: typeof import("@vercel/kv").kv | null = null;
async function getKV() {
  if (!kvClient) {
    const mod = await import("@vercel/kv");
    kvClient = mod.kv;
  }
  return kvClient;
}

declare global {
  // eslint-disable-next-line no-var
  var __ff_mem_store: Map<string, Entry> | undefined;
}
const mem: Map<string, Entry> = globalThis.__ff_mem_store ?? new Map();
globalThis.__ff_mem_store = mem;

function memGet<T>(key: string): T | null {
  const e = mem.get(key);
  if (!e) return null;
  if (e.expiresAt !== null && Date.now() > e.expiresAt) {
    mem.delete(key);
    return null;
  }
  return e.value as T;
}

export async function getJSON<T>(key: string): Promise<T | null> {
  if (hasKV) {
    const kv = await getKV();
    return (await kv.get<T>(key)) ?? null;
  }
  return memGet<T>(key);
}

export async function setJSON<T>(
  key: string,
  value: T,
  ttlSeconds?: number
): Promise<void> {
  if (hasKV) {
    const kv = await getKV();
    if (ttlSeconds) await kv.set(key, value, { ex: ttlSeconds });
    else await kv.set(key, value);
    return;
  }
  mem.set(key, {
    value,
    expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
  });
}

export async function del(key: string): Promise<void> {
  if (hasKV) {
    const kv = await getKV();
    await kv.del(key);
    return;
  }
  mem.delete(key);
}

export const usingKV = hasKV;
