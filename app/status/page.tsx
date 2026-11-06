import type { Metadata } from "next";
import { SiteShell, PageHeader } from "@/components/site/shell";
import { StatusBoard } from "@/components/site/status-board";
import { BRAND } from "@/lib/site";

export const metadata: Metadata = {
  title: "Status",
  description: `Live status of ${BRAND}: whether the bot is online, how many servers it is in and its latency.`,
  alternates: { canonical: "/status" },
};

export default function StatusPage() {
  return (
    <SiteShell>
      <PageHeader eyebrow="Status" title={`${BRAND} status`}>Live numbers straight from the bot. This page refreshes by itself.</PageHeader>
      <section className="mx-auto max-w-3xl px-5 pb-24"><StatusBoard /></section>
    </SiteShell>
  );
}
