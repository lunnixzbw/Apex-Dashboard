import { NextRequest, NextResponse } from "next/server";
import { botCall } from "@/lib/botServer";
import { isSupportStaff, sessionUserId } from "@/lib/staff";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { code: string } }) {
  const uid = await sessionUserId();
  if (!isSupportStaff(uid)) return NextResponse.json({ detail: "Not allowed" }, { status: 403 });
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.headers.get("host")) return NextResponse.json({ detail: "Bad origin" }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const r = await botCall("PATCH", `/support/tickets/${encodeURIComponent(params.code)}`, { status: body.status, by: uid });
  return NextResponse.json(r.data, { status: r.status });
}
