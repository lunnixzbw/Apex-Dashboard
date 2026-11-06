import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal";
import { BRAND } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `What data ${BRAND} collects, why, who it is shared with and how to have it deleted.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      intro={`This page explains what ${BRAND} stores, why, and the choices you have. We collect only what the features you use need.`}
      sections={[
        { title: "What we collect", paras: ["Depending on which features are used, the bot and website handle:"], list: [
          "Discord identifiers: user, server, channel, role and message IDs, and usernames and avatars shown in the dashboard.",
          "Server settings you configure: prefix, welcome and farewell messages, verification, tickets, logging, antinuke and whitelists, autoresponders, reaction roles and similar.",
          "Activity data for features you enable: warnings and moderation cases, levels and XP, invites, giveaways entries, AFK status, ticket transcripts and saved UPI IDs.",
          "Message content only where a feature needs it, for example commands, autoresponder triggers, logs you enable and AI chat.",
          "Website sign-in: your Discord user ID, name, avatar and server list (Discord scopes \"identify\" and \"guilds\"). We do not receive your email or password.",
          "Payments: the plan, amount, time and Razorpay payment and order IDs for Premium purchases. Card, UPI and bank details go directly to Razorpay and never reach us.",
          "Support: the name, email and message you send in a ticket.",
        ] },
        { title: "Why we use it", list: [
          "To run the features you turn on and show them in the dashboard.",
          "To protect servers, prevent abuse and enforce our Terms.",
          "To process Premium purchases, apply Premium to your account and prevent duplicate or fraudulent payments.",
          "To answer support requests and keep the Service working.",
        ] },
        { title: "Who we share it with", paras: ["We do not sell your data. We use a small number of service providers who process data for us:"], list: [
          "Discord, which provides the platform the bot runs on.",
          "Razorpay, which processes payments.",
          "Cloudflare, which protects the website and runs the security check used by website verification. The check may use your IP address and browser details.",
          "Vercel and our hosting and database providers, which host the website and bot.",
          "An AI provider, which receives the text you send to the AI chat and AI commands (Premium) to produce a reply.",
        ], after: ["We may also disclose data when the law requires it or to protect people from harm."] },
        { title: "How long we keep it", paras: [
          "Server data is kept while the bot is in the server. When the bot is removed from a server, its data is deleted after a period of time or on request. Payment records are kept as long as needed for accounting, tax and fraud prevention. Support tickets are kept as long as needed to resolve them.",
        ] },
        { title: "Your choices", list: [
          "Turn any feature off in the dashboard, or remove the bot from your server at any time.",
          "Ask what we hold about you, or ask us to correct or delete it, through the contact form or the support server.",
          "You can revoke the website's access to your Discord account in Discord under Settings, then Authorised Apps.",
        ] },
        { title: "Cookies", paras: [
          "The website uses a sign-in cookie so the dashboard knows who you are, and your browser's local storage to remember your light or dark theme. We do not use advertising cookies.",
        ] },
        { title: "Security", paras: [
          "We protect data with access controls, encrypted connections and restricted keys. No system is perfectly secure, so we cannot guarantee absolute security.",
        ] },
        { title: "Children", paras: [
          `${BRAND} is not meant for anyone below Discord's minimum age. If you believe a child's data was collected, contact us and we will remove it.`,
        ] },
        { title: "Changes", paras: ["We may update this policy. The date at the top shows when it last changed."] },
      ]}
    />
  );
}
