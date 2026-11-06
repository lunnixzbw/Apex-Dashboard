import { NextRequest, NextResponse } from "next/server";
import { botCall } from "@/lib/botServer";
import { isSupportStaff, sessionUserId } from "@/lib/staff";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isSupportStaff(await sessionUserId())) return NextResponse.json({ detail: "Not allowed" }, { status: 403 });
  const status = req.nextUrl.searchParams.get("status");
  const r = await botCall("GET", `/support/tickets${status === "open" || status === "closed" ? `?status=${status}` : ""}`);
  return NextResponse.json(r.data, { status: r.status });
}
