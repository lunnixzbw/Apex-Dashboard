import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getPlan } from "@/lib/plans";
import { createManualOrder, ManualPaymentError, manualPaymentEnabled } from "@/lib/manualPayment";

export const dynamic = "force-dynamic";

// Starts a manual (personal UPI VPA) order: no webhook exists for a personal UPI ID, so this
// just records the order and hands back a QR code to scan. See /api/payments/manual/submit for
// the UTR step, and the bot's admin/manual-payments routes for the human approval step.
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
  const plan = getPlan(String(body.planId || ""));
  if (!plan) return NextResponse.json({ detail: "Unknown plan." }, { status: 400 });

  try {
    const order = await createManualOrder({
      userId,
      username: session?.user?.name || undefined,
      product: plan.product,
      planId: plan.id,
      days: plan.days,
      lifetime: !!plan.lifetime,
      guildLimit: plan.servers,
      amount: plan.amount,
      currency: "INR",
    });
    return NextResponse.json(order);
  } catch (e: any) {
    const status = e instanceof ManualPaymentError ? e.status : 502;
    return NextResponse.json({ detail: e?.message || "Could not start the payment." }, { status });
  }
}
