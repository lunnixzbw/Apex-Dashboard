import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { CURRENCY, getPlan } from "@/lib/plans";
import { BRAND } from "@/lib/site";
import { razorpayEnabled, razorpayKeyId, rzp } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!razorpayEnabled()) {
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
    const order = await rzp("/orders", {
      method: "POST",
      body: JSON.stringify({
        amount: plan.amount,
        currency: CURRENCY,
        receipt: `zv_${Date.now().toString(36)}`,
        notes: { user_id: userId, plan_id: plan.id },
      }),
    });
    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: razorpayKeyId,
      name: BRAND,
      description: `${BRAND} ${plan.product === "noprefix" ? "No-Prefix" : "Premium"} - ${plan.name}`,
      prefill_name: session?.user?.name || "",
    });
  } catch (e: any) {
    return NextResponse.json({ detail: e?.message || "Could not start the payment." }, { status: 502 });
  }
}
