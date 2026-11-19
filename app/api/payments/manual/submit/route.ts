import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { submitManualUtr, ManualPaymentError, manualPaymentEnabled } from "@/lib/manualPayment";

export const dynamic = "force-dynamic";

// Records the UTR the user typed in after paying the QR and notifies staff for review
// (see src/lib/manualPayments.js on the bot — this never auto-grants).
export async function POST(req: NextRequest) {
  if (!manualPaymentEnabled()) {
    return NextResponse.json({ detail: "Payments are not open yet. Please contact support." }, { status: 503 });
  }
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.headers.get("host")) {
    return NextResponse.json({ detail: "Bad origin" }, { status: 403 });
  }
  const session = await getServerSession(authOptions);
  // @ts-ignore - id is added in lib/auth.ts (Discord user ID)
  const userId: string | undefined = session?.user?.id;
  if (!userId) return NextResponse.json({ detail: "Sign in with Discord first." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const orderId = String(body.order_id || body.orderId || "").trim();
  const utr = String(body.utr || "").trim();
  if (!orderId) return NextResponse.json({ detail: "Missing order_id." }, { status: 400 });
  if (!/^\d{12}$/.test(utr)) return NextResponse.json({ detail: "Enter the 12-digit UTR / reference number from your payment." }, { status: 400 });

  try {
    const data = await submitManualUtr(userId, orderId, utr);
    return NextResponse.json(data);
  } catch (e: any) {
    const status = e instanceof ManualPaymentError ? e.status : 502;
    return NextResponse.json({ detail: e?.message || "Could not submit the payment." }, { status });
  }
}
