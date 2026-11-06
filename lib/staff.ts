import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const ids = (v?: string) => (v || "").split(",").map((x) => x.trim()).filter(Boolean);

// Who may read website support tickets: SUPPORT_USER_IDS (comma separated Discord user IDs) plus everyone in NEXT_PUBLIC_ADMIN_IDS.
export function isSupportStaff(userId?: string | null) {
  if (!userId) return false;
  return ids(process.env.SUPPORT_USER_IDS).includes(userId) || ids(process.env.NEXT_PUBLIC_ADMIN_IDS).includes(userId);
}

export async function sessionUserId(): Promise<string | undefined> {
  const session = await getServerSession(authOptions);
  // @ts-ignore - id is added in lib/auth.ts session callback (Discord user ID)
  return session?.user?.id;
}
