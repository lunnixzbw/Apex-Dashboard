import type { Metadata } from "next";
import { Inbox, LifeBuoy, Mail } from "lucide-react";
import { SiteShell, PageHeader } from "@/components/site/shell";
import { TicketForm } from "@/components/site/ticket-form";
import { BRAND, CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact the ${BRAND} team: open a support ticket or join the support server.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <SiteShell>
      <PageHeader eyebrow="Contact" title="Contact us">Questions, bug reports, payment problems or partnerships. Send a ticket and we will get back to you.</PageHeader>
      <section className="mx-auto grid max-w-6xl gap-6 px-5 pb-24 lg:grid-cols-[1fr_320px]">
        <TicketForm />
        <aside className="space-y-4">
          <a href="/support" className="block rounded-2xl border border-site-ink/10 bg-site-card/70 p-6 transition hover:border-site-ink/30">
            <LifeBuoy className="h-5 w-5 text-site-ink" />
            <h3 className="mt-3 font-semibold text-site-ink">Support server</h3>
            <p className="mt-1 text-sm text-site-muted">The fastest way to get help. Join and open a ticket.</p>
          </a>
          <a href="/tickets" className="block rounded-2xl border border-site-ink/10 bg-site-card/70 p-6 transition hover:border-site-ink/30">
            <Inbox className="h-5 w-5 text-site-ink" />
            <h3 className="mt-3 font-semibold text-site-ink">My tickets</h3>
            <p className="mt-1 text-sm text-site-muted">Read replies and continue a conversation. Sign in with Discord.</p>
          </a>
          {CONTACT_EMAIL && (
            <a href={`mailto:${CONTACT_EMAIL}`} className="block rounded-2xl border border-site-ink/10 bg-site-card/70 p-6 transition hover:border-site-ink/30">
              <Mail className="h-5 w-5 text-site-ink" />
              <h3 className="mt-3 font-semibold text-site-ink">Email</h3>
              <p className="mt-1 break-all text-sm text-site-muted">{CONTACT_EMAIL}</p>
            </a>
          )}
        </aside>
      </section>
    </SiteShell>
  );
}
