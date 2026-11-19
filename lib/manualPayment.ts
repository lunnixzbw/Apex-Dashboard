// The personal-UPI-VPA payment option alongside Razorpay. There is no webhook for a personal UPI
// ID, so this is review-gated: see src/dashboard/routes/manualPayments.js and
// src/lib/manualPayments.js on the bot for the order/approve/reject logic. This file is just the
// thin Next.js-side glue that calls the bot.
import QRCode from "qrcode";

const BOT_API = process.env.BOT_API_URL || "http://127.0.0.1:8000/api/v1";
const BOT_KEY = process.env.DASHBOARD_API_KEY || "";

export const manualPaymentEnabled = () => !!BOT_KEY;

async function callBot(path: string, init: RequestInit) {
  let res: Response;
  try {
    res = await fetch(`${BOT_API}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${BOT_KEY}`, ...(init.headers || {}) },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new ManualPaymentError("The bot could not be reached. Please try again in a moment.", 502);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ManualPaymentError(data?.detail || "The bot rejected the request.", res.status);
  return data;
}

export class ManualPaymentError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function createManualOrder(opts: {
  userId: string; username?: string; product: "premium" | "noprefix"; planId: string;
  days: number; lifetime: boolean; guildLimit: number; amount: number; currency: string;
}) {
  const data = await callBot("/payments/manual/order", {
    method: "POST",
    body: JSON.stringify({
      product: opts.product, plan_id: opts.planId, days: opts.days, lifetime: opts.lifetime,
      guild_limit: opts.guildLimit, amount: opts.amount, currency: opts.currency,
    }),
    headers: { "X-Dashboard-User": opts.userId },
  });
  const qrDataUrl = await QRCode.toDataURL(data.upi_uri, { margin: 1, width: 400 });
  return { ...data, qr: qrDataUrl };
}

export async function submitManualUtr(userId: string, orderId: string, utr: string) {
  return callBot("/payments/manual/submit", {
    method: "POST",
    body: JSON.stringify({ order_id: orderId, utr }),
    headers: { "X-Dashboard-User": userId },
  });
}

export async function getManualOrderStatus(userId: string, orderId: string) {
  return callBot(`/payments/manual/orders/${encodeURIComponent(orderId)}`, {
    method: "GET",
    headers: { "X-Dashboard-User": userId },
  });
}
