import Link from "next/link";
import { BRAND, CONTACT_EMAIL, docsHref } from "@/lib/site";

export function SiteFooter({ base = "" }: { base?: string }) {
  const h = (p: string) => `${base}${p}`;
  const cols: { title: string; links: { label: string; href: string }[] }[] = [
    { title: "Product", links: [
      { label: "Features", href: h("/features") },
      { label: "Premium", href: h("/premium") },
      { label: "Status", href: h("/status") },
      { label: "Announcements", href: h("/announcements") },
    ] },
    { title: "Resources", links: [
      { label: "Documentation", href: docsHref() },
      { label: "Commands", href: docsHref("/commands") },
      { label: "FAQ", href: h("/#faq") },
      { label: "Support server", href: h("/support") },
    ] },
    { title: "Legal", links: [
      { label: "Terms of Service", href: h("/terms") },
      { label: "Privacy Policy", href: h("/privacy") },
      { label: "Refund Policy", href: h("/refund") },
      { label: "Contact", href: h("/contact") },
      { label: "My tickets", href: h("/tickets") },
    ] },
  ];
  return (
    <footer className="relative z-10 border-t border-site-ink/[0.07] bg-site-bg/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Link href={h("/")} className="flex items-center gap-2.5">
            <img src="/logo.png" alt="" className="site-logo h-9 w-9 object-contain" />
            <span className="font-outfit text-lg font-semibold text-site-ink">{BRAND}</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-site-faint">
            Security, moderation and community tools for your Discord server, all managed from one dashboard.
          </p>
          {CONTACT_EMAIL && <a href={`mailto:${CONTACT_EMAIL}`} className="mt-4 inline-block text-sm text-site-muted hover:text-site-ink">{CONTACT_EMAIL}</a>}
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-site-faint">{c.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {c.links.map((l) => (
                <li key={l.label}><a href={l.href} className="text-sm text-site-muted transition-colors hover:text-site-ink">{l.label}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-site-ink/[0.07] px-5 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 text-xs text-site-faint sm:flex-row">
          <span>© {new Date().getFullYear()} {BRAND}. All rights reserved.</span>
          <span>{BRAND} is not affiliated with or endorsed by Discord Inc.</span>
        </div>
      </div>
    </footer>
  );
}
