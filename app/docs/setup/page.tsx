import type { Metadata } from "next";
import { H1, Lead, H2, P, Code, Steps, Note } from "@/components/docs/prose";
import { BRAND, INVITE, docsHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "Setup guide",
  description: `How to add ${BRAND} to your Discord server and set it up.`,
  alternates: { canonical: docsHref("/setup") },
};

export default function SetupDoc() {
  return (
    <>
      <H1>Setup guide</H1>
      <Lead>Get {BRAND} running in your server in about five minutes.</Lead>

      <Steps items={[
        { title: "Add the bot", body: <>Open <a href={INVITE} className="text-site-ink underline underline-offset-4">Add to Discord</a>, choose your server and approve. You need the <b>Manage Server</b> permission.</> },
        { title: "Move the role up", body: <>In <b>Server Settings, Roles</b>, drag the {BRAND} role above the roles it should manage or protect. Discord only lets a bot control roles below its own. Without this, role-based features and antinuke cannot work.</> },
        { title: "Log in to the dashboard", body: <>Press <b>Login</b> on the website and sign in with Discord. Pick your server from the list. Only servers where you have Manage Server are shown.</> },
        { title: "Turn on protection", body: <>Open <b>Antinuke</b> and enable it, then add the people you trust to the whitelist. Add a <b>Logging</b> channel so you can see what happens.</> },
        { title: "Greet and verify new members", body: <>Set up <b>Welcome</b> messages and a <b>Verification</b> panel. For the strongest protection choose the website method, see the <a href={docsHref("/verification")} className="text-site-ink underline underline-offset-4">Verification guide</a>.</> },
        { title: "Add the extras", body: <>Create ticket panels, giveaways, reaction roles, autoresponders and level roles from their dashboard pages whenever you need them.</> },
      ]} />

      <H2>Useful commands</H2>
      <P><Code>,help</Code> shows every command. <Code>,setprefix !</Code> changes the prefix. <Code>/premium status</Code> shows your Premium. <Code>/premium activate</Code> turns Premium on in the current server.</P>

      <H2>Permissions</H2>
      <P>The invite asks for the permissions the features need. If you removed some, features that rely on them (moderation, roles, logging, tickets) will tell you what is missing.</P>
      <Note>Stuck? Join the <a href="/support" className="text-site-ink underline underline-offset-4">support server</a> and open a ticket with your server ID.</Note>
    </>
  );
}
