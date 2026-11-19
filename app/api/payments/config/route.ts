import { NextResponse } from "next/server";
import { razorpayEnabled } from "@/lib/razorpay";
import { manualPaymentEnabled } from "@/lib/manualPayment";

export const dynamic = "force-dynamic";

export async function GET() {
  const razorpay = razorpayEnabled();
  const manual = manualPaymentEnabled();
  return NextResponse.json({ enabled: razorpay || manual, razorpay, manual });
}
