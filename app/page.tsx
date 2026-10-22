"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import {
  ShieldCheck, Gavel, Image as ImageIcon, MousePointer2, Ticket, Sparkles, Bug,
  Wallet, MessageSquareReply, ScrollText, Lock, ArrowRight, LayoutDashboard, Bot,
} from "lucide-react";

const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME || "Apex";
const INVITE = process.env.NEXT_PUBLIC_INVITE_URL || "";
const SUPPORT = process.env.NEXT_PUBLIC_SUPPORT_URL || "https://discord.gg/8wfT8SfB5Z";

const AUTH_ERRORS: Record<string, string> = {
  OAuthCallback: "Discord sign-in failed. If it worked before, Discord is probably rate limiting the login: wait a minute and try again. Otherwise check that the Discord redirect URL and client secret match this site.",
  OAuthSignin: "Could not start Discord sign-in. Check DISCORD_CLIENT_ID / DISCORD_CLIENT_SECRET.",
  Configuration: "The dashboard is missing a setting (NEXTAUTH_SECRET or NEXTAUTH_URL).",
  AccessDenied: "Discord denied the sign-in.",
  Callback: "Sign-in could not be completed. Try again.",
  SessionExpired: "Your session expired. Sign in again.",
};

const FEATURES = [
  { icon: ShieldCheck, title: "Antinuke & Anti-Betray", text: "Stops mass bans, channel wipes and rogue admins before they do damage." },
  { icon: Gavel, title: "Moderation & Jail", text: "Warns, mutes, bans, plus a jail that hides every channel except one you choose." },
  { icon: ImageIcon, title: "Welcome cards", text: "20 themed backgrounds, custom header, footer and a plain message above." },
  { icon: MousePointer2, title: "Reaction roles", text: "Pick the channel and message, add emoji and role pairs right from the browser." },
  { icon: Ticket, title: "Tickets", text: "Panels, categories, staff roles and transcripts without touching a command." },
  { icon: Sparkles, title: "Tag Supporter", text: "Equip your server tag, get the role. Remove it, the role goes. Fully logged." },
  { icon: Bug, title: "Honeypot", text: "A trap channel that catches raiders and selfbots the second they type." },
  { icon: Wallet, title: "UPI slots", text: "Save UPI IDs with a QR code and show them in one command." },
  { icon: MessageSquareReply, title: "Autoresponders", text: "Trigger words, instant replies, managed from the dashboard." },
  { icon: ScrollText, title: "Logging", text: "Every action in your server, sorted into channels you control." },
];

export default function LandingPage() {
  const { status } = useSession();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("error");
    if (code) setAuthError((AUTH_ERRORS[code] || "Sign-in problem.") + ` [${code}]`);
  }, []);

  // Already signed in: go straight to the dashboard instead of running Discord login again.
  const signingIn = React.useRef(false);
  const openDashboard = () => {
    if (signingIn.current) return; // a double click would start two logins and break the OAuth state
    if (status === "loading") return;
    if (status !== "authenticated") signingIn.current = true;
    if (status === "authenticated") window.location.assign("/dashboard");
    else signIn("discord", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-red-500/30 overflow-x-hidden">
      {authError && (
        <div className="fixed top-20 left-1/2 z-[60] w-[92%] max-w-xl -translate-x-1/2 rounded-xl border border-red-500/30 bg-red-950/90 px-5 py-4 text-sm text-red-100 shadow-2xl">
          {authError}
        </div>
      )}

      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/2 top-[-18%] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-red-600/[0.10] blur-[140px]" />
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      </div>

      <nav className="fixed top-0 z-50 w-full border-b border-white/[0.06] bg-black/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="font-outfit text-lg font-semibold tracking-tight text-white">{BRAND}</span>
          </div>
          <div className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
            <Link href="#features" className="transition-colors hover:text-white">Features</Link>
            <Link href="#how" className="transition-colors hover:text-white">How it works</Link>
            <a href={SUPPORT} target="_blank" rel="noreferrer" className="transition-colors hover:text-white">Support</a>
          </div>
          <button
            onClick={openDashboard}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            <LayoutDashboard className="h-4 w-4" />
            {status === "authenticated" ? "Open Dashboard" : "Login with Discord"}
          </button>
        </div>
      </nav>

      <header className="relative z-10 px-5 pb-24 pt-40 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Security, community and utility in one bot
          </span>
          <h1 className="font-outfit text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-7xl">
            Run your server<br /><span className="text-red-500">without the busywork.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            {BRAND} protects your community and automates the boring parts. Set everything up from your browser, no commands to memorise.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={openDashboard}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-red-600 px-7 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-500"
            >
              {status === "authenticated" ? "Open Dashboard" : "Login with Discord"} <ArrowRight className="h-4 w-4" />
            </button>
            {INVITE && (
              <a href={INVITE} target="_blank" rel="noreferrer"
                className="inline-flex h-12 items-center rounded-xl border border-white/15 px-7 text-sm font-semibold text-white transition hover:bg-white/5">
                Add to your server
              </a>
            )}
          </div>
        </div>
      </header>

      <section id="features" className="relative z-10 mx-auto max-w-6xl px-5 pb-24">
        <h2 className="font-outfit text-3xl font-bold tracking-tight text-white sm:text-4xl">Everything you manage, in one place</h2>
        <p className="mt-3 max-w-xl text-zinc-400">Each feature has its own page in the dashboard. Change a setting and the bot picks it up straight away.</p>
        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.07] sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="group bg-black p-6 transition-colors hover:bg-zinc-950">
              <Icon className="h-5 w-5 text-red-500" />
              <h3 className="mt-4 font-semibold text-white">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-500 group-hover:text-zinc-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="relative z-10 mx-auto max-w-6xl px-5 pb-24">
        <h2 className="font-outfit text-3xl font-bold tracking-tight text-white sm:text-4xl">Up and running in three steps</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ["1", "Log in", "Sign in with Discord. We only see the servers you manage."],
            ["2", "Pick a server", `Choose any server where ${BRAND} is already added.`],
            ["3", "Configure", "Turn features on, tweak them and save. Done."],
          ].map(([n, t, d]) => (
            <div key={n} className="rounded-2xl border border-white/[0.07] bg-zinc-950/60 p-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600/15 text-sm font-bold text-red-400">{n}</div>
              <h3 className="mt-4 font-semibold text-white">{t}</h3>
              <p className="mt-1.5 text-sm text-zinc-500">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-24">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-600/10 to-transparent p-8 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-outfit text-2xl font-bold text-white">Ready to take control?</h2>
            <p className="mt-1 flex items-center gap-2 text-sm text-zinc-400"><Lock className="h-3.5 w-3.5" /> Only server admins can change settings.</p>
          </div>
          <button onClick={openDashboard} className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-black transition hover:bg-zinc-200">
            Open the dashboard <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/[0.06] px-5 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-xs text-zinc-600 sm:flex-row">
          <span>© {new Date().getFullYear()} {BRAND}. Not affiliated with Discord.</span>
          <div className="flex gap-5">
            <Link href="/terms" className="hover:text-zinc-300">Terms</Link>
            <Link href="/privacy" className="hover:text-zinc-300">Privacy</Link>
            <a href={SUPPORT} target="_blank" rel="noreferrer" className="hover:text-zinc-300">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
