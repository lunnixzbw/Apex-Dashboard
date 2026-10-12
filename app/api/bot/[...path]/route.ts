import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

const API = process.env.BOT_API_URL || "http://127.0.0.1:8000/api/v1";
const KEY = process.env.DASHBOARD_API_KEY;
const ALLOWED_ROOTS = new Set(["bot", "guilds", "admin"]);

async function forward(req: NextRequest, { params }: { params: { path: string[] } }) {
  if (!KEY) {
    return NextResponse.json({ detail: "DASHBOARD_API_KEY is not configured" }, { status: 500 });
  }

  const session = await getServerSession(authOptions);
  // @ts-ignore - id is added in lib/auth.ts session callback (Discord user ID)
  const userId: string | undefined = session?.user?.id;
  if (!userId) return NextResponse.json({ detail: "Not signed in" }, { status: 401 });

  const segments = params.path;
  if (!ALLOWED_ROOTS.has(segments[0]) || segments.some((s) => s === "." || s === "..")) {
    return NextResponse.json({ detail: "Not found" }, { status: 404 });
  }

  // Basic CSRF guard for writes: the browser must be talking to us from our own origin.
  if (req.method !== "GET") {
    const origin = req.headers.get("origin");
    if (origin && new URL(origin).host !== req.headers.get("host")) {
      return NextResponse.json({ detail: "Bad origin" }, { status: 403 });
    }
  }

  const url = `${API}/${segments.map(encodeURIComponent).join("/")}${req.nextUrl.search}`;
  try {
    const upstream = await fetch(url, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${KEY}`,
        "X-Dashboard-User": userId,
      },
      body: req.method === "GET" || req.method === "HEAD" ? undefined : await req.text(),
      cache: "no-store",
    });
    return new NextResponse(await upstream.text(), {
      status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("content-type") || "application/json" },
    });
  } catch {
    return NextResponse.json({ detail: "Bot API is unreachable" }, { status: 502 });
  }
}

export { forward as GET, forward as POST, forward as PATCH, forward as DELETE };
