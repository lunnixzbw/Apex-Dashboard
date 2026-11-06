import React from "react";
import Link from "next/link";
import { ArrowRight, Check, Crown, Lock, Plus } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { FaqList, faqJsonLd } from "@/components/site/faq";
import { AuthEffects, LiveStats } from "@/components/site/home-bits";
import { LoginButton } from "@/components/site/login-button";
import { FEATURES } from "@/lib/features";
import { PREMIUM_BENEFITS } from "@/lib/plans";
import { BRAND, INVITE, docsHref } from "@/lib/site";
import commands from "@/data/commands.json";

const COMMAND_COUNT = (commands as { commands: unknown[] }[]).reduce((n, c) => n + c.commands.length, 0);

export default function HomePage() {
  return (
    <SiteShell>
      <AuthEffects />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()) }} />

      {/* Hero */}
      <header className="px-5 pb-20 pt-20 text-center sm:pt-28">
        <div className="mx-auto max-w-3xl">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-site-ink/10 bg-site-ink/[0.04] px-3.5 py-1.5 text-xs text-site-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-site-ink" /> Security, community and utility in one bot
          </span>
          <h1 className="font-outfit text-5xl font-bold leading-[1.05] tracking-tight text-site-ink sm:text-7xl">
            Run your server<br />without the busywork.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-site-muted sm:text-lg">
            {BRAND} protects your community, welcomes your members and automates the boring parts. Set everything up from your browser, no commands to memorise.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href={INVITE} className="inline-flex h-12 items-center gap-2 rounded-xl bg-site-ink px-7 text-sm font-semibold text-site-bg transition hover:opacity-85">
              <Plus className="h-4 w-4" /> Add to Discord
            </a>
            <LoginButton className="inline-flex h-12 items-center gap-2 rounded-xl border border-site-ink/20 px-7 text-sm font-semibold text-site-ink transition hover:bg-site-ink/10">
              Login with Discord
            </LoginButton>
          </div>
        </div>
        <LiveStats />
      </header>

      {/* What is Zevion */}
      <section id="about" className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-24">
        <div className="grid items-center gap-10 rounded-3xl border border-site-ink/10 bg-site-card/60 p-8 sm:p-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-site-faint">What is {BRAND}</p>
            <h2 className="mt-3 font-outfit text-3xl font-bold tracking-tight text-site-ink sm:text-4xl">One bot instead of ten.</h2>
            <p className="mt-4 leading-relaxed text-site-muted">
              {BRAND} is an all-in-one Discord bot. It guards your server against raids and nukes, handles moderation, verifies new members,
              greets them, runs tickets and giveaways, plays music and rewards your most active members, all from a single bot and a single dashboard.
            </p>
            <p className="mt-3 leading-relaxed text-site-muted">
              Everything is free to use. {BRAND} Premium and No-Prefix are optional upgrades.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/features" className="inline-flex h-10 items-center gap-2 rounded-lg bg-site-ink px-4 text-sm font-semibold text-site-bg transition hover:opacity-85">
                See all features <ArrowRight className="h-4 w-4" />
              </Link>
              <a href={docsHref()} className="inline-flex h-10 items-center rounded-lg border border-site-ink/20 px-4 text-sm font-semibold text-site-ink transition hover:bg-site-ink/10">
                Read the docs
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              [`${COMMAND_COUNT}+`, "Commands"],
              ["Hybrid", "Prefix and slash"],
              ["Web", "Full dashboard"],
              ["24/7", "Always online"],
            ].map(([a, b]) => (
              <div key={b} className="rounded-2xl border border-site-ink/10 bg-site-bg/60 p-5">
                <div className="font-outfit text-3xl font-bold text-site-ink">{a}</div>
                <div className="mt-1 text-sm text-site-faint">{b}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-24">
        <h2 className="font-outfit text-3xl font-bold tracking-tight text-site-ink sm:text-4xl">Everything you manage, in one place</h2>
        <p className="mt-3 max-w-xl text-site-muted">Each feature has its own page in the dashboard. Change a setting and the bot picks it up straight away.</p>
        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-site-ink/10 bg-site-ink/10 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.slice(0, 9).map(({ icon: Icon, title, text }) => (
            <div key={title} className="group bg-site-bg p-6 transition-colors hover:bg-site-card">
              <Icon className="h-5 w-5 text-site-ink" />
              <h3 className="mt-4 font-semibold text-site-ink">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-site-faint group-hover:text-site-muted">{text}</p>
            </div>
          ))}
        </div>
        <Link href="/features" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-site-ink hover:opacity-70">
          Explore every feature <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-24">
        <h2 className="font-outfit text-3xl font-bold tracking-tight text-site-ink sm:text-4xl">Up and running in three steps</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ["1", "Add the bot", `Press Add to Discord and pick your server.`],
            ["2", "Log in", "Sign in with Discord. We only show the servers you manage."],
            ["3", "Configure", "Turn features on, tweak them and save. Done."],
          ].map(([n, t, d]) => (
            <div key={n} className="rounded-2xl border border-site-ink/10 bg-site-card/70 p-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-site-ink text-sm font-bold text-site-bg">{n}</div>
              <h3 className="mt-4 font-semibold text-site-ink">{t}</h3>
              <p className="mt-1.5 text-sm text-site-faint">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Premium */}
      <section id="premium" className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-24">
        <div className="rounded-3xl border border-site-ink/10 bg-site-card/60 p-8 sm:p-12">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-site-faint"><Crown className="h-4 w-4" /> {BRAND} Premium</p>
              <h2 className="mt-3 font-outfit text-3xl font-bold tracking-tight text-site-ink sm:text-4xl">Unlock more for your server</h2>
            </div>
            <Link href="/premium" className="inline-flex h-11 items-center gap-2 self-start rounded-xl bg-site-ink px-6 text-sm font-semibold text-site-bg transition hover:opacity-85 sm:self-auto">
              See plans <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {PREMIUM_BENEFITS.map((b) => (
              <li key={b.title} className="flex gap-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-site-ink" />
                <div>
                  <div className="text-sm font-semibold text-site-ink">{b.title}</div>
                  <div className="mt-0.5 text-sm text-site-faint">{b.text}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-5 pb-24">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-site-faint">FAQ</p>
        <h2 className="mt-3 text-center font-outfit text-3xl font-bold tracking-tight text-site-ink sm:text-4xl">Frequently asked questions</h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-site-muted">
          Can&apos;t find your answer? <a href="/support" className="text-site-ink underline underline-offset-4">Join the support server</a>.
        </p>
        <div className="mt-10"><FaqList /></div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-site-ink/15 bg-site-card/70 p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="font-outfit text-2xl font-bold text-site-ink">Ready to take control?</h2>
            <p className="mt-1 flex items-center gap-2 text-sm text-site-muted"><Lock className="h-3.5 w-3.5" /> Only server admins can change settings.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={INVITE} className="inline-flex h-11 items-center gap-2 rounded-xl bg-site-ink px-6 text-sm font-semibold text-site-bg transition hover:opacity-85">
              <Plus className="h-4 w-4" /> Add to Discord
            </a>
            <LoginButton signedInLabel="Open the dashboard" className="inline-flex h-11 items-center gap-2 rounded-xl border border-site-ink/20 px-6 text-sm font-semibold text-site-ink transition hover:bg-site-ink/10">
              Open the dashboard
            </LoginButton>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
