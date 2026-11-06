import React from "react";
import { ChevronDown } from "lucide-react";
import { FAQS } from "@/lib/faq";

// Native <details> so it works without JavaScript and is readable by search engines.
export function FaqList({ groups = true }: { groups?: boolean }) {
  const order = Array.from(new Set(FAQS.map((f) => f.group)));
  const item = (f: (typeof FAQS)[number]) => (
    <details key={f.q} className="group border-b border-site-ink/[0.08] py-1 last:border-0">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-[15px] font-medium text-site-ink transition-colors hover:text-site-ink [&::-webkit-details-marker]:hidden">
        {f.q}
        <ChevronDown className="h-4 w-4 shrink-0 text-site-faint transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <p className="pb-5 pr-8 text-sm leading-relaxed text-site-muted">{f.a}</p>
    </details>
  );
  if (!groups) return <div className="rounded-2xl border border-site-ink/[0.08] bg-site-card/70 px-6">{FAQS.map(item)}</div>;
  return (
    <div className="space-y-8">
      {order.map((g) => (
        <div key={g}>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-site-faint">{g}</h3>
          <div className="rounded-2xl border border-site-ink/[0.08] bg-site-card/70 px-6">{FAQS.filter((f) => f.group === g).map(item)}</div>
        </div>
      ))}
    </div>
  );
}

export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}
