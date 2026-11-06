import crypto from "crypto";
import { CURRENCY, getPlan } from "@/lib/plans";

// Minimal Razorpay client (no SDK needed). Keys live only in Vercel environment variables:
//   RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET
const KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
const BOT_API = process.env.BOT_API_URL || "http://127.0.0.1:8000/api/v1";
const BOT_KEY = process.env.DASHBOARD_API_KEY || "";

export const razorpayKeyId = KEY_ID;
export const razorpayEnabled = () => !!(KEY_ID && KEY_SECRET && BOT_KEY);

export async function rzp(path: string, init: RequestInit = {}) {
  const res = await fetch(`https://api.razorpay.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: "Basic " + Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64"),
      "Content-Type": "application/json",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.description || `Razorpay error ${res.status}`);
  return data;
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export function verifyCheckoutSignature(orderId: string, paymentId: string, signature: string) {
  const expected = crypto.createHmac("sha256", KEY_SECRET).update(`${orderId}|${paymentId}`).digest("hex");
  return safeEqual(expected, String(signature || ""));
}

export function verifyWebhookSignature(rawBody: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqual(expected, signature);
}

export class PaymentError extends Error {
  constructor(message: string, public status = 400, public retryable = false) {
    super(message);
  }
}

// Checks a payment with Razorpay itself (never trusts the browser), then tells the bot to grant Premium.
// The bot ignores a payment id it has already applied, so the browser callback and the webhook can both call this.
export async function settlePayment(paymentId: string, expectedUserId?: string) {
  if (!/^pay_[A-Za-z0-9]{6,40}$/.test(paymentId)) throw new PaymentError("Invalid payment id.");

  let payment = await rzp(`/payments/${paymentId}`).catch((e) => {
    throw new PaymentError(e.message, 502, true);
  });
  if (!payment.order_id) throw new PaymentError("This payment is not linked to an order.");
  if (payment.status === "authorized") {
    payment = await rzp(`/payments/${paymentId}/capture`, {
      method: "POST",
      body: JSON.stringify({ amount: payment.amount, currency: payment.currency }),
    }).catch((e) => {
      throw new PaymentError(e.message, 502, true);
    });
  }
  if (payment.status !== "captured") throw new PaymentError(`Payment is ${payment.status}, not completed.`, 409);

  const order = await rzp(`/orders/${payment.order_id}`).catch((e) => {
    throw new PaymentError(e.message, 502, true);
  });
  const userId = String(order.notes?.user_id || "");
  const plan = getPlan(String(order.notes?.plan_id || ""));
  if (!userId || !plan) throw new PaymentError("Order is missing its details.");
  if (expectedUserId && expectedUserId !== userId) throw new PaymentError("This payment belongs to another account.", 403);
  if (order.amount !== plan.amount || payment.amount !== plan.amount || payment.currency !== CURRENCY) {
    throw new PaymentError("Payment amount does not match the plan.");
  }

  let res: Response;
  try {
    res = await fetch(`${BOT_API}/payments/fulfil`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${BOT_KEY}` },
      body: JSON.stringify({
        user_id: userId,
        payment_id: payment.id,
        order_id: payment.order_id,
        plan_id: plan.id,
        product: plan.product,
        days: plan.days,
        guild_limit: plan.servers,
        amount: payment.amount,
        currency: payment.currency,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new PaymentError("The bot could not be reached. Your payment is safe and will be applied automatically.", 502, true);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new PaymentError(data?.detail || "The bot could not apply Premium.", 502, true);
  return { plan, userId, result: data };
}
