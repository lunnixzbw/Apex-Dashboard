import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { LoginCard } from "@/components/site/login-card";

export const metadata = { title: "Login", robots: { index: false } };
export const dynamic = "force-dynamic";

const safe = (v: unknown) => (typeof v === "string" && v.startsWith("/") && !v.startsWith("//") ? v : "/dashboard");

export default async function LoginPage({ searchParams }: { searchParams: { callbackUrl?: string; error?: string } }) {
  const to = safe(searchParams.callbackUrl);
  const session = await getServerSession(authOptions);
  if (session && !searchParams.error) redirect(to); // already signed in: straight to the dashboard
  return <LoginCard callbackUrl={to} error={searchParams.error} />;
}
