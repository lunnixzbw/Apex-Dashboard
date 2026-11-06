import type { Metadata } from "next";
import { H1, Lead } from "@/components/docs/prose";
import { FaqList, faqJsonLd } from "@/components/site/faq";
import { BRAND, docsHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ",
  description: `Frequently asked questions about ${BRAND}.`,
  alternates: { canonical: docsHref("/faq") },
};

export default function FaqDoc() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()) }} />
      <H1>FAQ</H1>
      <Lead>Quick answers to the questions we get most.</Lead>
      <div className="mt-8"><FaqList /></div>
    </>
  );
}
