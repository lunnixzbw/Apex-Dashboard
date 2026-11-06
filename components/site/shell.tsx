import React from "react";
import { SiteNav } from "./nav";
import { SiteFooter } from "./footer";

// Black and white page frame used by every public page: nav, dragon watermark, footer.
export function SiteShell({ children, base = "" }: { children: React.ReactNode; base?: string }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-site-bg font-sans text-site-body selection:bg-site-ink/20">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div className="absolute left-1/2 top-[-18%] h-[520px] w-[860px] -translate-x-1/2 rounded-full bg-site-ink/[0.055] blur-[140px]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgb(var(--site-ink))_1px,transparent_1px),linear-gradient(90deg,rgb(var(--site-ink))_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <img src="/logo.png" alt="" className="site-logo absolute -right-24 top-24 hidden w-[640px] max-w-none select-none opacity-[0.035] lg:block" />
      </div>
      <SiteNav base={base} />
      <main className="relative z-10 pt-16">{children}</main>
      <SiteFooter base={base} />
    </div>
  );
}

export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-10 pt-16 sm:pt-20">
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-site-faint">{eyebrow}</p>}
      <h1 className="mt-3 font-outfit text-4xl font-bold tracking-tight text-site-ink sm:text-5xl">{title}</h1>
      {children && <div className="mt-4 max-w-2xl text-base leading-relaxed text-site-muted sm:text-lg">{children}</div>}
    </section>
  );
}
