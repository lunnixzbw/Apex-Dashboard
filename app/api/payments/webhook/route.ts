import { NextRequest, NextResponse } from "next/server";
import { PaymentError, settlePayment, verifyWebhookSignature } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

// Razorpay -> us. Safety net for people who pay and then close the tab before the browser callback runs.
// Set this URL in the Razorpay dashboard: https://<your site>/api/payments/webhook (events: payment.captured, order.paid).
export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!verifyWebhookSignature(raw, req.headers.get("x-razorpay-signature") || "")) {
    return NextResponse.json({ detail: "Bad signature" }, { status: 400 });
  }
  let event: any;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ detail: "Bad payload" }, { status: 400 });
  }
  if (event.event !== "payment.captured" && event.event !== "order.paid") return NextResponse.json({ ok: true, ignored: true });

  const paymentId: string | undefined = event.payload?.payment?.entity?.id;
  if (!paymentId) return NextResponse.json({ ok: true, ignored: true });
  try {
    await settlePayment(paymentId);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    // Temporary problems (bot offline, Razorpay hiccup): answer 5xx so Razorpay retries later. Real mismatches: stop retrying.
    if (e instanceof PaymentError && !e.retryable) return NextResponse.json({ ok: false, detail: e.message });
    return NextResponse.json({ detail: e?.message || "retry" }, { status: 500 });
  }
}
