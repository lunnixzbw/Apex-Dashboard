import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/utils";
import { TeamCenter } from "@/components/dashboard/team-center";

export const dynamic = "force-dynamic";

export default async function TeamCenterPage() {
  const session = await getServerSession(authOptions);
  // @ts-ignore - id is added in lib/auth.ts session callback
  if (!session || !isAdmin(session.user?.id)) redirect("/dashboard");
  return <TeamCenter />;
}
