import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const API = process.env.BOT_API_URL || "http://127.0.0.1:8000/api/v1";
const KEY = process.env.DASHBOARD_API_KEY;

// Public, read-only numbers for the home and status pages. The bot API key never leaves the server.
export async function GET() {
  const checked_at = Date.now();
  if (!KEY) return NextResponse.json({ online: false, checked_at });
  try {
    const r = await fetch(`${API}/public/stats`, {
      headers: { Authorization: `Bearer ${KEY}` },
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    if (!r.ok) return NextResponse.json({ online: false, checked_at });
    const d = await r.json();
    return NextResponse.json(
      { online: !!d.online, servers: d.servers, users: d.users, ping: d.ping, uptime_seconds: d.uptime_seconds, checked_at },
      { headers: { "Cache-Control": "public, s-maxage=20, stale-while-revalidate=40" } }
    );
  } catch {
    return NextResponse.json({ online: false, checked_at });
  }
}
