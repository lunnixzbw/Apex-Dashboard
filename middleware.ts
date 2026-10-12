import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Guards every /dashboard page: signed in, and allowed to manage the guild in the URL.
const API = process.env.BOT_API_URL || "http://127.0.0.1:8000/api/v1";
const KEY = process.env.DASHBOARD_API_KEY;

const cache = new Map<string, { ok: boolean; ts: number }>();
const TTL = 20_000;

async function allowed(path: string, userId: string): Promise<boolean> {
  const k = `${userId}:${path}`;
  const hit = cache.get(k);
  if (hit && Date.now() - hit.ts < TTL) return hit.ok;
  let ok = false;
  try {
    const r = await fetch(`${API}${path}`, {
      headers: { Authorization: `Bearer ${KEY}`, "X-Dashboard-User": userId },
      cache: "no-store",
    });
    ok = r.ok && !!(await r.json()).allowed;
  } catch {
    ok = false;
  }
  if (cache.size > 500) cache.clear();
  cache.set(k, { ok, ts: Date.now() });
  return ok;
}

const SECRET = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
const COOKIES = ["__Secure-next-auth.session-token", "next-auth.session-token"];

// NextAuth names its cookie differently on https ("__Secure-" prefix). Try both so a mismatch can never lock people out.
async function readToken(req: NextRequest) {
  for (const secureCookie of [true, false]) {
    try {
      const t = await getToken({ req, secret: SECRET, secureCookie });
      if (t?.sub) return t;
    } catch {
      /* try the next cookie style */
    }
  }
  return null;
}

export async function middleware(req: NextRequest) {
  const token = await readToken(req);
  const hasCookie = COOKIES.some((c) => req.cookies.has(c) || req.cookies.has(`${c}.0`));

  if (!token?.sub) {
    // No session cookie at all: go sign in. A cookie we simply couldn't decode is let through:
    // the bot API still checks who you are on every request, so nothing is exposed.
    if (!hasCookie) return NextResponse.redirect(new URL("/", req.nextUrl.origin));
    return NextResponse.next();
  }

  const { pathname } = req.nextUrl;
  const guild = pathname.match(/^\/dashboard\/guild\/(\d+)/);
  if (guild && !(await allowed(`/access/guild/${guild[1]}`, token.sub))) {
    return NextResponse.redirect(new URL("/dashboard/guilds", req.nextUrl.origin));
  }
  if (pathname.startsWith("/dashboard/admin") && !(await allowed("/access/admin", token.sub))) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*"] };
