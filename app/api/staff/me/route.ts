import { NextResponse } from "next/server";
import { isSupportStaff, sessionUserId } from "@/lib/staff";

export const dynamic = "force-dynamic";

// Lets the dashboard know whether to show the Support tickets link.
export async function GET() {
  return NextResponse.json({ support: isSupportStaff(await sessionUserId()) });
}
