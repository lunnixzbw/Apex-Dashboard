// Frequently asked questions, shown on the home page and in the docs. Plain text so it also works in search results.
export type Faq = { q: string; a: string; group: "Getting started" | "Using Zevion" | "Premium & payments" | "Safety & support" };

export const FAQS: Faq[] = [
  {
    group: "Getting started",
    q: "What is Zevion?",
    a: "Zevion is an all-in-one Discord bot for security, moderation, community and fun. It has antinuke protection, moderation and jail, welcome cards, tickets, giveaways, music, levels, reaction roles, logging, verification and more, plus a web dashboard where you can set everything up without memorising commands.",
  },
  {
    group: "Getting started",
    q: "How do I add Zevion to my server?",
    a: "Press Add to Discord on this site, pick your server and approve. You need the Manage Server permission in that server. For antinuke and moderation to work fully, give Zevion the permissions it asks for and keep its role near the top of your role list.",
  },
  {
    group: "Getting started",
    q: "What is the default prefix? Can I change it?",
    a: "The default prefix is , (a comma), so the help command is ,help. Most commands also work as slash commands, like /help. To set your own prefix for your server use ,setprefix followed by the new prefix.",
  },
  {
    group: "Getting started",
    q: "How do I open the dashboard?",
    a: "Press Login on this site and sign in with Discord. You will see every server where you have Manage Server and Zevion is added. Pick one and change its settings. Changes apply to the bot straight away.",
  },
  {
    group: "Using Zevion",
    q: "Zevion says it can't give a role or can't do something. Why?",
    a: "Almost always it is a role position problem. Discord only lets a bot manage roles that sit below its own highest role. Open Server Settings, then Roles, and drag the Zevion role above the roles it should give, remove or protect. Also make sure it has the permission for the action (Manage Roles, Ban Members and so on).",
  },
  {
    group: "Using Zevion",
    q: "How does website verification work?",
    a: "Turn on the Website verification method in the dashboard and Zevion posts a panel in your verification channel. A member presses Verify, Zevion sends them a private link to auth.zevion.bond, they pass a quick Cloudflare security check that blocks bots, press Verify, and they get your verified role. Zevion then sends them a DM confirming they were verified in your server. The link is personal, works once and expires after 15 minutes.",
  },
  {
    group: "Using Zevion",
    q: "Where can I see all the commands?",
    a: "Use ,help or /help in Discord, or open the Commands page in the docs for a searchable list with descriptions and aliases.",
  },
  {
    group: "Using Zevion",
    q: "Can I set Zevion up without using commands?",
    a: "Yes. The dashboard has a page for each feature: antinuke, moderation, welcome, tickets, giveaways, reaction roles, logging, verification, autoresponders and more. Most settings can be changed from the browser.",
  },
  {
    group: "Premium & payments",
    q: "Is Zevion free?",
    a: "Yes. Every core feature is free to use. Zevion Premium is optional and unlocks higher limits and extra features such as AI chat, Anti-Betray, a custom bot profile per server, and bigger giveaway, ticket and application limits.",
  },
  {
    group: "Premium & payments",
    q: "Does Premium apply to my account or my server?",
    a: "Premium belongs to your account and you choose where it works. Each plan includes a number of server slots. After buying, activate it on a server from the Premium page or with /premium activate in that server. You can remove it from one server and use the slot on another.",
  },
  {
    group: "Premium & payments",
    q: "How do I pay and is it safe?",
    a: "Sign in, open the Premium page, pick a plan and pay through Razorpay with UPI, cards, net banking or wallets. Your payment details go straight to Razorpay and never touch our servers. Premium is added to your account automatically within moments of a successful payment.",
  },
  {
    group: "Premium & payments",
    q: "Does Premium renew automatically?",
    a: "No. Each plan is a one-time payment for a fixed period and never charges you again on its own. When it runs out, your servers go back to the free limits and nothing is deleted. Buy again before it ends and the new time is added on top of what you have left.",
  },
  {
    group: "Premium & payments",
    q: "Can I get a refund?",
    a: "Premium is a digital service that is activated immediately, so purchases are generally not refundable. If you were charged but did not receive Premium, or charged twice, contact us and we will fix it. Read the full Refund & Cancellation Policy for details.",
  },
  {
    group: "Safety & support",
    q: "What data does Zevion store?",
    a: "Only what the features you turn on need, such as server settings, role and channel IDs, warnings and levels. Zevion does not sell your data. The Privacy Policy lists exactly what is stored and how to ask for it to be deleted.",
  },
  {
    group: "Safety & support",
    q: "How do I get help or report a bug?",
    a: "Go to zevion.bond/support to join the support server and open a ticket there, or send a ticket from the Contact page. Include your server ID and what you expected to happen.",
  },
  {
    group: "Safety & support",
    q: "Is Zevion affiliated with Discord?",
    a: "No. Zevion is an independent bot and is not affiliated with or endorsed by Discord Inc.",
  },
];
