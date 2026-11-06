import type { Metadata } from "next";
import { SiteShell, PageHeader } from "@/components/site/shell";
import { BRAND } from "@/lib/site";
import items from "@/data/announcements.json";

export const metadata: Metadata = {
  title: "Announcements",
  description: `News and updates from the ${BRAND} team.`,
  alternates: { canonical: "/announcements" },
};

const fmt = (d: string) => new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export default function AnnouncementsPage() {
  const list = [...(items as { date: string; title: string; body: string }[])].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <SiteShell>
      <PageHeader eyebrow="Announcements" title="What's new">News and updates from the {BRAND} team.</PageHeader>
      <section className="mx-auto max-w-3xl space-y-4 px-5 pb-24">
        {list.map((a) => (
          <article key={a.date + a.title} className="rounded-2xl border border-site-ink/10 bg-site-card/70 p-7">
            <time className="text-xs font-semibold uppercase tracking-wider text-site-faint">{fmt(a.date)}</time>
            <h2 className="mt-2 font-outfit text-xl font-semibold text-site-ink">{a.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-site-muted">{a.body}</p>
          </article>
        ))}
      </section>
    </SiteShell>
  );
}
