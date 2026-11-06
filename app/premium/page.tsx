import type { Metadata } from "next";
import { SiteShell, PageHeader } from "@/components/site/shell";
import { PremiumClient } from "@/components/site/premium-client";
import { BRAND } from "@/lib/site";

export const metadata: Metadata = {
  title: "Premium",
  description: `${BRAND} Premium: AI chat, Anti-Betray, a custom bot profile, bigger giveaway, ticket and application limits. Pay securely on the website.`,
  alternates: { canonical: "/premium" },
};

export default function PremiumPage() {
  return (
    <SiteShell>
      <PageHeader eyebrow="Premium" title={`${BRAND} Premium`}>
        Higher limits and extra features for your servers. Pay once for a fixed time, with no subscription and no surprise charges.
      </PageHeader>
      <PremiumClient />
    </SiteShell>
  );
}
