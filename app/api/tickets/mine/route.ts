import { NextResponse } from "next/server";
import { botCall } from "@/lib/botServer";
import { sessionUserId } from "@/lib/staff";

export const dynamic = "force-dynamic";

// The signed-in user's own tickets.
export async function GET() {
  const uid = await sessionUserId();
  if (!uid) return NextResponse.json({ detail: "Sign in to see your tickets." }, { status: 401 });
  const r = await botCall("GET", `/support/tickets?user_id=${uid}`);
  return NextResponse.json(r.data, { status: r.status });
}
