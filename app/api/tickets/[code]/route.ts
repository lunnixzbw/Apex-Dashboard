import { NextRequest, NextResponse } from "next/server";
import { botCall, limited } from "@/lib/botServer";
import { isSupportStaff, sessionUserId } from "@/lib/staff";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

// One ticket with its replies. Allowed for the ticket's owner and for support staff.
async function load(code: string, uid: string | undefined) {
  if (!uid) return { status: 401, data: { detail: "Sign in first." } } as const;
  const r = await botCall("GET", `/support/tickets/${encodeURIComponent(code)}`);
  if (!r.ok) return { status: r.status, data: r.data } as const;
  const staff = isSupportStaff(uid);
  if (!staff && r.data.user_id !== uid) return { status: 404, data: { detail: "Ticket not found." } } as const; // same answer as "missing" so codes cannot be probed
  return { status: 200, data: { ...r.data, viewer_staff: staff } } as const;
}

export async function GET(_req: NextRequest, { params }: { params: { code: string } }) {
  const r = await load(params.code, await sessionUserId());
  return NextResponse.json(r.data, { status: r.status });
}

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.headers.get("host")) return NextResponse.json({ detail: "Bad origin" }, { status: 403 });
  const uid = await sessionUserId();
  const t = await load(params.code, uid);
  if (t.status !== 200) return NextResponse.json(t.data, { status: t.status });
  if (limited(`reply:${uid}`, 12, 60_000)) return NextResponse.json({ detail: "Slow down a little." }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const session = await getServerSession(authOptions);
  const staff = isSupportStaff(uid);
  // A staff member replying to their own ticket is just a normal user reply.
  const asStaff = staff && (t.data as any).user_id !== uid;
  const r = await botCall("POST", `/support/tickets/${encodeURIComponent(params.code)}/replies`, {
    body: String(body.body ?? "").slice(0, 1800),
    author_id: uid,
    author_name: asStaff ? "Zevion Support" : String(session?.user?.name || "User").slice(0, 80),
    staff: asStaff,
  });
  return NextResponse.json(r.data, { status: r.status });
}

// Close or reopen. The owner and staff may do it.
export async function PATCH(req: NextRequest, { params }: { params: { code: string } }) {
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.headers.get("host")) return NextResponse.json({ detail: "Bad origin" }, { status: 403 });
  const uid = await sessionUserId();
  const t = await load(params.code, uid);
  if (t.status !== 200) return NextResponse.json(t.data, { status: t.status });
  const body = await req.json().catch(() => ({}));
  const r = await botCall("PATCH", `/support/tickets/${encodeURIComponent(params.code)}`, { status: body.status, by: uid });
  return NextResponse.json(r.data, { status: r.status });
}
