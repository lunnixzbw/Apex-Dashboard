import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { H1, Lead, H2, P, Code } from "@/components/docs/prose";
import { BRAND, INVITE, docsHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "Introduction",
  alternates: { canonical: docsHref() || "/docs" },
};

const CARDS = [
  { t: "Setup guide", d: "Add the bot and set it up in a few minutes.", p: "/setup" },
  { t: "Verification", d: "Keep bots out with the website security check.", p: "/verification" },
  { t: "Commands", d: "Search every command with descriptions and aliases.", p: "/commands" },
  { t: "FAQ", d: "Quick answers to common questions.", p: "/faq" },
];

export default function DocsHome() {
  return (
    <>
      <H1>{BRAND} documentation</H1>
      <Lead>Everything you need to add {BRAND}, set it up and get the most out of it.</Lead>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {CARDS.map((c) => (
          <a key={c.t} href={docsHref(c.p)} className="group rounded-2xl border border-site-ink/10 bg-site-card/70 p-5 transition hover:border-site-ink/30">
            <div className="flex items-center justify-between font-semibold text-site-ink">{c.t} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></div>
            <p className="mt-1 text-sm text-site-faint">{c.d}</p>
          </a>
        ))}
      </div>

      <H2>What is {BRAND}?</H2>
      <P>
        {BRAND} is an all-in-one Discord bot for security, moderation and community. It includes antinuke protection, moderation and jail, verification,
        welcome cards, tickets, giveaways, music, levels, reaction roles, logging and automation, and a web dashboard that lets you configure all of it from your browser.
      </P>

      <H2>The basics</H2>
      <P>The default prefix is <Code>,</Code> so the help command is <Code>,help</Code>. Most commands also work as slash commands such as <Code>/help</Code>. Change the prefix for your server with <Code>,setprefix</Code>.</P>
      <P>Everything works without Premium. {BRAND} Premium only adds higher limits and a few extras.</P>

      <H2>Quick links</H2>
      <P>
        <a href={INVITE} className="text-site-ink underline underline-offset-4">Add {BRAND} to your server</a>
        {" · "}
        <a href="/support" className="text-site-ink underline underline-offset-4">Support server</a>
      </P>
    </>
  );
}
