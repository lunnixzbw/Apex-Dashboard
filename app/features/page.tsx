import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Plus } from "lucide-react";
import { SiteShell, PageHeader } from "@/components/site/shell";
import { FEATURES } from "@/lib/features";
import { BRAND, INVITE, docsHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "Features",
  description: `Everything ${BRAND} can do: antinuke security, moderation, verification, welcome cards, tickets, giveaways, music, levels, logging and more.`,
  alternates: { canonical: "/features" },
};

export default function FeaturesPage() {
  return (
    <SiteShell>
      <PageHeader eyebrow="Features" title={`Everything ${BRAND} can do`}>
        Security, community and utility tools in one bot. Every feature can be set up from the dashboard in your browser.
      </PageHeader>
      <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-16 md:grid-cols-2">
        {FEATURES.map(({ icon: Icon, title, text, bullets }) => (
          <article key={title} className="rounded-2xl border border-site-ink/10 bg-site-card/70 p-7">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-site-ink text-site-bg"><Icon className="h-5 w-5" /></div>
            <h2 className="mt-5 font-outfit text-xl font-semibold text-site-ink">{title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-site-muted">{text}</p>
            <ul className="mt-4 space-y-2">
              {bullets.map((b) => (
                <li key={b} className="flex gap-2.5 text-sm text-site-faint"><Check className="mt-0.5 h-4 w-4 shrink-0 text-site-ink" />{b}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-site-ink/15 bg-site-card/70 p-8 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-outfit text-2xl font-bold text-site-ink">Want the full list?</h2>
            <p className="mt-1 text-sm text-site-muted">Browse every command with descriptions and aliases in the docs.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={INVITE} className="inline-flex h-11 items-center gap-2 rounded-xl bg-site-ink px-6 text-sm font-semibold text-site-bg transition hover:opacity-85"><Plus className="h-4 w-4" /> Add to Discord</a>
            <a href={docsHref("/commands")} className="inline-flex h-11 items-center gap-2 rounded-xl border border-site-ink/20 px-6 text-sm font-semibold text-site-ink transition hover:bg-site-ink/10">Commands <ArrowRight className="h-4 w-4" /></a>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
