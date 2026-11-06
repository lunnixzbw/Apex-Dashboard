import type { Metadata } from "next";
import { SiteShell, PageHeader } from "@/components/site/shell";
import { TicketCenter } from "@/components/site/ticket-center";

export const metadata: Metadata = { title: "My tickets", robots: { index: false } };

export default function TicketsPage() {
  return (
    <SiteShell>
      <PageHeader eyebrow="Support" title="My tickets">Read replies from the Zevion team and continue the conversation.</PageHeader>
      <section className="mx-auto max-w-6xl px-5 pb-24"><TicketCenter /></section>
    </SiteShell>
  );
}
