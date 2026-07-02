/**
 * Rate limiter en memoria (sliding window).
 *
 * Nota: en Vercel cada instancia serverless tiene su propia memoria, por lo
 * que el límite es "por instancia". Es suficiente para frenar el abuso casual
 * de las APIs de IA sin añadir infraestructura. Si el tráfico crece, migrar
 * a @upstash/ratelimit con Redis.
 */

type WindowEntry = {
  timestamps: number[];
};

const store = new Map<string, WindowEntry>();

const MAX_STORE_SIZE = 10_000;

export function rateLimit(
  key: string,
  { limit = 10, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {}
): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = store.get(key) ?? { timestamps: [] };

  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= limit) {
    store.set(key, entry);
    return { success: false, remaining: 0 };
  }

  entry.timestamps.push(now);
  store.set(key, entry);

  // Evitar crecimiento sin límite de la memoria
  if (store.size > MAX_STORE_SIZE) {
    const oldest = store.keys().next().value;
    if (oldest) store.delete(oldest);
  }

  return { success: true, remaining: limit - entry.timestamps.length };
}
