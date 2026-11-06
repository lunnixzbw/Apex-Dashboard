import { NextRequest, NextResponse } from "next/server";
import { botPost, clientIp, limited } from "@/lib/botServer";

export const dynamic = "force-dynamic";

// Shows the person who they are verifying as, before they press Verify. Changes nothing.
export async function POST(req: NextRequest) {
  if (limited(`vs:${clientIp(req)}`, 40, 60_000)) {
    return NextResponse.json({ detail: "Too many requests. Wait a minute and try again.", code: "RATE" }, { status: 429 });
  }
  const body = await req.json().catch(() => ({}));
  const token = typeof body?.token === "string" ? body.token.slice(0, 400) : "";
  if (!token) return NextResponse.json({ detail: "This verification link is not valid.", code: "INVALID" }, { status: 400 });
  const r = await botPost("/verification/session", { token });
  return NextResponse.json(r.data, { status: r.status });
}
