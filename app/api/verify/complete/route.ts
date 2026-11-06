import { NextRequest, NextResponse } from "next/server";
import { botPost, clientIp, limited } from "@/lib/botServer";

export const dynamic = "force-dynamic";

const SECRET = process.env.TURNSTILE_SECRET_KEY || "";

// 1) Cloudflare Turnstile proves it is a real browser, checked here with our secret.
// 2) Only then the bot gives the verified role and DMs the member.
export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (limited(`vc:${ip}`, 12, 60_000)) {
    return NextResponse.json({ detail: "Too many attempts. Wait a minute and try again.", code: "RATE" }, { status: 429 });
  }
  if (!SECRET) {
    return NextResponse.json({ detail: "Verification is not fully set up yet (missing Turnstile key). Please tell a server admin.", code: "SETUP" }, { status: 503 });
  }
  const body = await req.json().catch(() => ({}));
  const token = typeof body?.token === "string" ? body.token.slice(0, 400) : "";
  const cf = typeof body?.cf_token === "string" ? body.cf_token.slice(0, 2100) : "";
  if (!token) return NextResponse.json({ detail: "This verification link is not valid.", code: "INVALID" }, { status: 400 });
  if (!cf) return NextResponse.json({ detail: "Please finish the security check first.", code: "CHALLENGE" }, { status: 400 });

  let passed = false;
  try {
    const form = new URLSearchParams({ secret: SECRET, response: cf });
    if (ip !== "unknown") form.set("remoteip", ip);
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    const d = await r.json().catch(() => ({}));
    passed = !!d.success;
  } catch {
    return NextResponse.json({ detail: "Could not reach the security check. Please try again.", code: "CHALLENGE" }, { status: 503 });
  }
  if (!passed) {
    return NextResponse.json({ detail: "The security check failed or expired. Please try again.", code: "CHALLENGE" }, { status: 400 });
  }

  const r = await botPost("/verification/complete", { token });
  return NextResponse.json(r.data, { status: r.status });
}
