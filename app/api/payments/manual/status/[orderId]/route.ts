import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getManualOrderStatus, ManualPaymentError } from "@/lib/manualPayment";

export const dynamic = "force-dynamic";

// Lets the checkout page poll for approve/reject while staff review the order.
export async function GET(req: NextRequest, { params }: { params: { orderId: string } }) {
  const session = await getServerSession(authOptions);
  // @ts-ignore - id is added in lib/auth.ts (Discord user ID)
  const userId: string | undefined = session?.user?.id;
  if (!userId) return NextResponse.json({ detail: "Sign in with Discord first." }, { status: 401 });

  try {
    const data = await getManualOrderStatus(userId, params.orderId);
    return NextResponse.json(data);
  } catch (e: any) {
    const status = e instanceof ManualPaymentError ? e.status : 502;
    return NextResponse.json({ detail: e?.message || "Could not check the order." }, { status });
  }
}
