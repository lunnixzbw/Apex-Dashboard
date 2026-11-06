import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PaymentError, settlePayment, verifyCheckoutSignature } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

// Called by the browser right after Razorpay's checkout succeeds. The signature proves the payment details were not forged;
// settlePayment() then re-checks everything with Razorpay directly before Premium is granted.
export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.headers.get("host")) {
    return NextResponse.json({ detail: "Bad origin" }, { status: 403 });
  }
  const session = await getServerSession(authOptions);
  // @ts-ignore
  const userId: string | undefined = session?.user?.id;
  if (!userId) return NextResponse.json({ detail: "Sign in with Discord first." }, { status: 401 });

  const b = await req.json().catch(() => ({}));
  const orderId = String(b.razorpay_order_id || "");
  const paymentId = String(b.razorpay_payment_id || "");
  if (!verifyCheckoutSignature(orderId, paymentId, String(b.razorpay_signature || ""))) {
    return NextResponse.json({ detail: "Payment signature check failed." }, { status: 400 });
  }
  try {
    const { plan, result } = await settlePayment(paymentId, userId);
    return NextResponse.json({ ok: true, plan: plan.name, expires_at: result.expires_at, guild_limit: result.guild_limit });
  } catch (e: any) {
    const status = e instanceof PaymentError ? e.status : 500;
    return NextResponse.json({ detail: e?.message || "Could not confirm the payment.", paymentId }, { status });
  }
}
