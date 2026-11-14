import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/utils";
import { ClonerForm } from "@/components/dashboard/cloner-form";

export const dynamic = "force-dynamic";

// Full admins always get in. Someone who was only delegated the "Server Cloner" permission from
// Team Center isn't in NEXT_PUBLIC_ADMIN_IDS, so check the bot's own record of their permissions too.
async function hasClonePermission(userId: string) {
  const API = process.env.BOT_API_URL || "http://127.0.0.1:8000/api/v1";
  const KEY = process.env.DASHBOARD_API_KEY;
  if (!KEY) return false;
  try {
    const res = await fetch(`${API}/me/permissions`, {
      headers: { Authorization: `Bearer ${KEY}`, "X-Dashboard-User": userId, "X-Dashboard-Admin": isAdmin(userId) ? "1" : "0" },
      cache: "no-store",
    });
    if (!res.ok) return false;
    const d = await res.json();
    return !!d.is_owner || (Array.isArray(d.permissions) && d.permissions.includes("clone"));
  } catch { return false; }
}

export default async function ClonerPage() {
  const session = await getServerSession(authOptions);
  const userId: string | undefined = (session as any)?.user?.id;
  if (!session || !userId) redirect("/dashboard");
  if (!isAdmin(userId) && !(await hasClonePermission(userId))) redirect("/dashboard");
  return <ClonerForm />;
}
