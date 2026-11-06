import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// /invite sends people to the Discord "Add bot" screen. Set NEXT_PUBLIC_INVITE_URL to use your own link,
// otherwise it is built from DISCORD_CLIENT_ID (already set for the dashboard login).
export function GET(req: Request) {
  const custom = process.env.NEXT_PUBLIC_INVITE_URL;
  if (custom) return NextResponse.redirect(custom, 307);
  const id = process.env.DISCORD_CLIENT_ID;
  if (!id) {
    const home = new URL("/", req.url);
    return NextResponse.redirect(home, 307);
  }
  const perms = process.env.INVITE_PERMISSIONS || "8";
  const url =
    `https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(id)}` +
    `&permissions=${encodeURIComponent(perms)}&scope=bot%20applications.commands`;
  return NextResponse.redirect(url, 307);
}
