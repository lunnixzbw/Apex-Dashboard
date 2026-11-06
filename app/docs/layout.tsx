import type { Metadata } from "next";
import { SiteShell } from "@/components/site/shell";
import { DocsSidebar } from "@/components/docs/sidebar";
import { BRAND, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: { default: "Documentation", template: `%s | ${BRAND} Docs` },
  description: `${BRAND} documentation: setup guide, verification, every command and frequently asked questions.`,
};

// `base` makes the nav and footer links point at the main site, because on docs.<domain> a relative "/features" would not exist.
export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteShell base={SITE_URL}>
      <div className="mx-auto grid max-w-6xl gap-8 px-5 pb-24 pt-10 lg:grid-cols-[220px_1fr] lg:pt-14">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 hidden text-xs font-semibold uppercase tracking-[0.2em] text-site-faint lg:block">Documentation</p>
          <DocsSidebar />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </SiteShell>
  );
}
