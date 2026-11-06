import type { Metadata } from "next";
import { H1, Lead } from "@/components/docs/prose";
import { CommandBrowser } from "@/components/docs/command-browser";
import { BRAND, docsHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "Commands",
  description: `Every ${BRAND} command with descriptions, aliases and subcommands. Search and filter by category.`,
  alternates: { canonical: docsHref("/commands") },
};

export default function CommandsDoc() {
  return (
    <>
      <H1>Commands</H1>
      <Lead>Search every command. The default prefix is <code className="rounded bg-site-ink/10 px-1.5 py-0.5 font-mono text-sm text-site-ink">,</code> and most commands also work as slash commands.</Lead>
      <CommandBrowser />
    </>
  );
}
