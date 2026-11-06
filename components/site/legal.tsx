import React from "react";
import { SiteShell, PageHeader } from "./shell";
import { CONTACT_EMAIL, LAST_UPDATED } from "@/lib/site";

export type LegalSection = { title: string; paras?: string[]; list?: string[]; after?: string[] };

export function LegalPage({ eyebrow, title, intro, sections }: { eyebrow: string; title: string; intro: string; sections: LegalSection[] }) {
  return (
    <SiteShell>
      <PageHeader eyebrow={eyebrow} title={title}>{intro}</PageHeader>
      <article className="mx-auto max-w-3xl px-5 pb-24">
        <p className="mb-8 text-xs text-site-faint">Last updated: {LAST_UPDATED}</p>
        <div className="space-y-10">
          {sections.map((s, i) => (
            <section key={s.title}>
              <h2 className="font-outfit text-xl font-semibold text-site-ink">{i + 1}. {s.title}</h2>
              {s.paras?.map((p) => <p key={p} className="mt-3 text-sm leading-relaxed text-site-muted">{p}</p>)}
              {s.list && (
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-site-muted marker:text-site-faint">
                  {s.list.map((l) => <li key={l}>{l}</li>)}
                </ul>
              )}
              {s.after?.map((p) => <p key={p} className="mt-3 text-sm leading-relaxed text-site-muted">{p}</p>)}
            </section>
          ))}
          <section>
            <h2 className="font-outfit text-xl font-semibold text-site-ink">{sections.length + 1}. Contact</h2>
            <p className="mt-3 text-sm leading-relaxed text-site-muted">
              Questions about this page? Use the <a href="/contact" className="text-site-ink underline underline-offset-4">contact form</a>, join the{" "}
              <a href="/support" className="text-site-ink underline underline-offset-4">support server</a>
              {CONTACT_EMAIL && <>, or email <a href={`mailto:${CONTACT_EMAIL}`} className="text-site-ink underline underline-offset-4">{CONTACT_EMAIL}</a></>}.
            </p>
          </section>
        </div>
      </article>
    </SiteShell>
  );
}

