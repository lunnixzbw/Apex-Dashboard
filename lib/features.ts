import type { LucideIcon } from "lucide-react";
import {
  Bot, Gavel, Gift, Image as ImageIcon, MessageSquareReply, MousePointerClick, ScrollText, ShieldCheck, Sparkles, Ticket, UserCheck, Music2, Wallet, TrendingUp,
} from "lucide-react";

export type Feature = { icon: LucideIcon; title: string; text: string; bullets: string[] };

export const FEATURES: Feature[] = [
  { icon: ShieldCheck, title: "Antinuke & Anti-Betray", text: "Stops mass bans, channel wipes and rogue admins before they do damage.",
    bullets: ["Limits on bans, kicks, channel and role changes", "Whitelist for people you trust", "Automatic punishment and recovery", "Anti-Betray protects against trusted staff turning on you (Premium)"] },
  { icon: Gavel, title: "Moderation & Jail", text: "Warn, mute, kick and ban, plus a jail that hides every channel except one.",
    bullets: ["Warnings, timeouts, kicks and bans", "Jail that locks a member into one channel", "Lock, hide and ignore tools for channels", "Honeypot channel that catches raiders and selfbots"] },
  { icon: UserCheck, title: "Verification", text: "Keep bots out with a button, an image captcha or a Cloudflare check on our website.",
    bullets: ["Button, captcha or website verification", "Cloudflare security check blocks bots", "Members get a DM when they are verified", "Verified role and log channel of your choice"] },
  { icon: ImageIcon, title: "Welcome & Farewell", text: "Greet new members with cards, messages and auto roles.",
    bullets: ["20 themed welcome card backgrounds", "Custom header, footer and message", "Join roles for new members", "Farewell messages when people leave"] },
  { icon: Ticket, title: "Tickets", text: "Support panels with categories, staff roles and transcripts.",
    bullets: ["Panels with buttons and categories", "Staff roles and claim system", "Transcripts when a ticket closes", "Manage everything from the dashboard"] },
  { icon: Gift, title: "Giveaways", text: "Run giveaways with requirements, extra entries and rerolls.",
    bullets: ["Role and server requirements", "Extra entries for chosen roles", "Reroll and end early", "Higher limits with Premium"] },
  { icon: Music2, title: "Music & Voice", text: "Play music in voice channels and manage join-to-create rooms.",
    bullets: ["Music commands for voice channels", "Join-to-create private voice rooms", "Text to speech", "Voice controls for moderators"] },
  { icon: TrendingUp, title: "Levels & Community", text: "Reward activity with XP, level roles, polls, starboard and invite tracking.",
    bullets: ["XP, ranks and leaderboards", "Level roles", "Polls, counting and birthdays", "Invite tracking and boost announcements"] },
  { icon: MousePointerClick, title: "Reaction roles", text: "Let members pick roles with emoji, set up from the browser.",
    bullets: ["Pick the channel and message", "Emoji and role pairs", "Join roles and role-all tools", "Custom roles for members"] },
  { icon: MessageSquareReply, title: "Automation", text: "Autoresponders, auto reactions, auto delete, auto post and more.",
    bullets: ["Trigger words with instant replies", "Auto delete and auto react", "Scheduled auto posts and bumps", "Managed from the dashboard"] },
  { icon: ScrollText, title: "Logging", text: "Every action in your server, sorted into channels you control.",
    bullets: ["Message, member, role and channel logs", "Choose a channel for each type", "Moderation action history", "Turn each log on or off"] },
  { icon: Bot, title: "AI assistant", text: "Chat with Zevion and analyse images with AI (Premium).",
    bullets: ["Ask questions and chat in a channel", "Image analysis", "Enable or disable per channel", "Part of Zevion Premium"] },
  { icon: Sparkles, title: "Tag Supporter", text: "Equip your server tag, get the role. Remove it and the role goes.",
    bullets: ["Role follows the server tag", "Fully logged", "Zero upkeep"] },
  { icon: Wallet, title: "UPI slots", text: "Save UPI IDs with a QR code and show them in one command.",
    bullets: ["Multiple saved UPI IDs", "QR code generated automatically", "Share in one command"] },
];
