import { NextRequest, NextResponse } from "next/server";
import { botPost } from "@/lib/botServer";
import { sessionUserId } from "@/lib/staff";

export const dynamic = "force-dynamic";

const WEBHOOK = process.env.SUPPORT_WEBHOOK_URL;
const hits = new Map<string, number[]>();

const clean = (v: unknown, max: number) => String(v ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);

// Support tickets from the website land in a private channel of your support server through a Discord webhook.
export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.headers.get("host")) {
    return NextResponse.json({ detail: "Bad origin" }, { status: 403 });
  }

  const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 3_600_000);
  if (recent.length >= 4) {
    return NextResponse.json({ detail: "Too many tickets from your network. Please try again in an hour." }, { status: 429 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ detail: "Invalid request" }, { status: 400 });
  }
  const name = clean(body.name, 80);
  const email = clean(body.email, 120);
  const category = clean(body.category, 40) || "General Support";
  const subject = clean(body.subject, 120);
  const message = String(body.message ?? "").trim().slice(0, 1800);
  if (!name || !subject || message.length < 10 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ detail: "Please fill in every field with a valid email and a message of at least 10 characters." }, { status: 400 });
  }

  // 1) Save it so staff can read it in the dashboard (SUPPORT_USER_IDS). 2) Also ping a Discord channel if a webhook is set.
  const saved = await botPost("/support/tickets", { name, email, category, subject, message, user_id: await sessionUserId() });
  const ticketId: string = saved.ok && saved.data?.code ? saved.data.code : Math.random().toString(36).slice(2, 8).toUpperCase();
  let notified = false;
  if (WEBHOOK) {
    try {
      const r = await fetch(WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "Website tickets",
          allowed_mentions: { parse: [] },
          embeds: [
            {
              title: `Ticket ${ticketId}: ${subject}`,
              description: message,
              color: 0xffffff,
              fields: [
                { name: "Name", value: name, inline: true },
                { name: "Email", value: email, inline: true },
                { name: "Category", value: category, inline: true },
              ],
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      });
      notified = r.ok;
    } catch { /* the ticket may still be saved */ }
  }
  if (!saved.ok && !notified) {
    return NextResponse.json({ detail: "Could not send your ticket right now. Please try again or join our support server." }, { status: 502 });
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 500) hits.clear();
  return NextResponse.json({ ok: true, ticket: ticketId });
}
