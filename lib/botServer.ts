// Server-to-server calls to the bot API. The key never reaches the browser.
const API = process.env.BOT_API_URL || "http://127.0.0.1:8000/api/v1";
const KEY = process.env.DASHBOARD_API_KEY || "";

export type BotResult<T = any> = { ok: boolean; status: number; data: T };

export const botPost = <T = any>(path: string, body: unknown, timeoutMs = 12000) => botCall<T>("POST", path, body, timeoutMs);

export async function botCall<T = any>(method: string, path: string, body?: unknown, timeoutMs = 12000): Promise<BotResult<T>> {
  if (!KEY) return { ok: false, status: 503, data: { detail: "The website is not connected to the bot yet." } as any };
  try {
    const r = await fetch(`${API}${path}`, {
      method,
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });
    const data = await r.json().catch(() => ({}));
    return { ok: r.ok, status: r.status, data };
  } catch {
    return { ok: false, status: 503, data: { detail: "Could not reach Zevion right now. Please try again in a moment." } as any };
  }
}

// Small in-memory limiter (per server instance). Enough to blunt hammering; Cloudflare/Vercel handle real floods.
const buckets = new Map<string, number[]>();
export function limited(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 2000) buckets.clear();
  return hits.length > max;
}

export const clientIp = (req: Request) => (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
