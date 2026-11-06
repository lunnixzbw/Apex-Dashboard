import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// 1) Sends docs.<domain> and auth.<domain> traffic to the right pages (one Vercel project serves all three hosts).
// 2) Guards every /dashboard page: signed in, and allowed to manage the guild in the URL.
const API = process.env.BOT_API_URL || "http://127.0.0.1:8000/api/v1";
const KEY = process.env.DASHBOARD_API_KEY;

const ADMIN_IDS = (process.env.NEXT_PUBLIC_ADMIN_IDS || "").split(",").map((x) => x.trim()).filter(Boolean);

const cache = new Map<string, { ok: boolean; ts: number }>();
const TTL = 20_000;

async function allowed(path: string, userId: string): Promise<boolean> {
  const k = `${userId}:${path}`;
  const hit = cache.get(k);
  if (hit && Date.now() - hit.ts < TTL) return hit.ok;
  let ok = false;
  try {
    const r = await fetch(`${API}${path}`, {
      headers: { Authorization: `Bearer ${KEY}`, "X-Dashboard-User": userId, "X-Dashboard-Admin": ADMIN_IDS.includes(userId) ? "1" : "0" },
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

const hostOf = (u: string) => {
  try { return new URL(u).host.toLowerCase(); } catch { return ""; }
};
const DOCS_URL = (process.env.NEXT_PUBLIC_DOCS_URL || "").replace(/\/$/, "");
const AUTH_URL = (process.env.NEXT_PUBLIC_AUTH_URL || "").replace(/\/$/, "");
const DOCS_HOST = hostOf(DOCS_URL);
const AUTH_HOST = hostOf(AUTH_URL);
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://zevion.bond").replace(/\/$/, "");

const isDocsHost = (h: string) => (!!DOCS_HOST && h === DOCS_HOST) || h.startsWith("docs.");
const isAuthHost = (h: string) => (!!AUTH_HOST && h === AUTH_HOST) || h.startsWith("auth.");
const isAsset = (p: string) => p.startsWith("/_next") || p.startsWith("/api/") || /\.[a-z0-9]+$/i.test(p);

export async function middleware(req: NextRequest) {
  const host = (req.headers.get("x-forwarded-host") || req.headers.get("host") || "").toLowerCase();
  const url = req.nextUrl;
  const p = url.pathname;

  // auth.zevion.bond: only the verification page (shown at "/") and its API.
  if (isAuthHost(host)) {
    if (p === "/" || p === "") {
      const to = url.clone();
      to.pathname = "/verify";
      return NextResponse.rewrite(to);
    }
    if (p.startsWith("/verify") || p.startsWith("/api/verify") || isAsset(p)) return NextResponse.next();
    return NextResponse.redirect(`${SITE_URL}${p}${url.search}`);
  }

  // docs.zevion.bond: serve the /docs pages at the root of the docs host.
  if (isDocsHost(host)) {
    if (p === "/docs" || p.startsWith("/docs/")) {
      const to = url.clone();
      to.pathname = p.slice(5) || "/";
      return NextResponse.redirect(to, 308);
    }
    if (isAsset(p)) return NextResponse.next();
    const to = url.clone();
    to.pathname = `/docs${p === "/" ? "" : p}`;
    return NextResponse.rewrite(to);
  }

  // Main site: /docs lives on the docs domain once it is configured.
  if (DOCS_URL && (p === "/docs" || p.startsWith("/docs/"))) {
    return NextResponse.redirect(`${DOCS_URL}${p.slice(5)}${url.search}`, 308);
  }
  // Main site: the verification page lives on the auth domain once it is configured.
  if (AUTH_URL && (p === "/verify" || p.startsWith("/verify/"))) {
    return NextResponse.redirect(`${AUTH_URL}/${url.search}`, 307);
  }

  if (!p.startsWith("/dashboard")) return NextResponse.next();

  const token = await readToken(req);
  const hasCookie = COOKIES.some((c) => req.cookies.has(c) || req.cookies.has(`${c}.0`));

  if (!token?.sub) {
    // No session cookie at all: go sign in. A cookie we simply couldn't decode is let through:
    // the bot API still checks who you are on every request, so nothing is exposed.
    if (!hasCookie) return NextResponse.redirect(new URL("/", req.nextUrl.origin));
    return NextResponse.next();
  }

  const pathname = p;
  const guild = pathname.match(/^\/dashboard\/guild\/(\d+)/);
  if (guild && !(await allowed(`/access/guild/${guild[1]}`, token.sub))) {
    return NextResponse.redirect(new URL("/dashboard/guilds", req.nextUrl.origin));
  }
  if (pathname.startsWith("/dashboard/admin") && !(await allowed("/access/admin", token.sub))) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.png).*)"] };
