/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║                                                                  ║
 * ║   ░█▀▀░█▀█░█▀▄░█▀▀░█░█   ░█▀▄░█▀▀░█░█░█▀▀                     ║
 * ║   ░█░░░█░█░█░█░█▀▀░▄▀▄   ░█░█░█▀▀░▀▄▀░▀▀█                     ║
 * ║   ░▀▀▀░▀▀▀░▀▀░░▀▀▀░▀░▀   ░▀▀░░▀▀▀░░▀░░▀▀▀                     ║
 * ║                                                                  ║
 * ║           © 2026 CodeX Devs — All Rights Reserved               ║
 * ║                                                                  ║
 * ║   discord  ──  https://discord.gg/codexdev                      ║
 * ║   youtube  ──  https://youtube.com/@CodeXDevs                   ║
 * ║   github   ──  https://github.com/RayExo                        ║
 * ║                                                                  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { Server as ServerIcon, Users, Gauge, Terminal, Crown, LifeBuoy, BookOpen, MessageCircle, Plus, ArrowUpRight, CircleAlert } from "lucide-react";
import { api } from "@/lib/api";
import { authOptions } from "@/lib/auth";
import { SUPPORT, docsHref } from "@/lib/site";

export const dynamic = "force-dynamic";

const greeting = () => {
  const h = (new Date().getUTCHours() + 5.5) % 24; // India time, where most of the team is
  return h < 5 ? "Burning the midnight oil" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : h < 22 ? "Good evening" : "Good night";
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const first = String(session?.user?.name || "").split(" ")[0] || "there";

  let info: any = null;
  let error: string | null = null;
  try {
    info = await api.getBotInfo();
  } catch (e: any) {
    error = e?.message || "Could not reach the bot.";
  }
  const online = !!info && !error;

  const stats = [
    { name: "Servers", value: online ? Number(info.guilds || 0).toLocaleString() : "-", icon: ServerIcon },
    { name: "Members reached", value: online ? Number(info.users || 0).toLocaleString() : "-", icon: Users },
    { name: "Commands", value: online && info.commands ? Number(info.commands).toLocaleString() : "-", icon: Terminal },
    { name: "Latency", value: online ? String(info.latency || "-") : "-", icon: Gauge },
  ];

  const actions = [
    { title: "Manage servers", desc: "Open a server and configure modules.", icon: ServerIcon, href: "/dashboard/guilds", primary: true },
    { title: "Premium & No-Prefix", desc: "Plans, lifetime options and your status.", icon: Crown, href: "/premium" },
    { title: "Support tickets", desc: "See your tickets and replies.", icon: LifeBuoy, href: "/dashboard/support" },
    { title: "Documentation", desc: "Setup guides and the command list.", icon: BookOpen, href: docsHref() },
    { title: "Support server", desc: "Ask the community and the team.", icon: MessageCircle, href: SUPPORT, external: true },
    { title: "Invite Zevion", desc: "Add the bot to another server.", icon: Plus, href: "/invite" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Hero */}
      <section className="glass relative overflow-hidden rounded-[32px] border border-site-ink/10 p-8 md:p-10">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-site-ink/[0.06] blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-site-faint">{greeting()}</p>
            <h1 className="mt-2 font-outfit text-3xl font-bold tracking-tight text-site-ink md:text-5xl">Welcome back, {first}.</h1>
            <p className="mt-3 max-w-xl text-site-muted">Everything about Zevion in one place. Pick a server to configure, or jump to a tool below.</p>
          </div>
          <div className={`inline-flex items-center gap-2.5 self-start rounded-full border px-4 py-2 text-sm font-medium md:self-auto ${online ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500" : "border-site-ink/20 bg-site-ink/[0.05] text-site-body"}`}>
            <span className="relative flex h-2 w-2">
              {online && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />}
              <span className={`relative inline-flex h-2 w-2 rounded-full ${online ? "bg-emerald-500" : "bg-site-faint"}`} />
            </span>
            {online ? "Zevion is online" : "Bot unreachable"}
          </div>
        </div>
        {error && (
          <div className="relative mt-6 flex items-start gap-2.5 rounded-xl border border-site-ink/15 bg-site-ink/[0.04] p-3.5 text-sm text-site-body">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.name} className="group glass rounded-3xl border border-site-ink/10 p-5 transition-colors hover:border-site-ink/30 md:p-6">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-site-faint">{s.name}</p>
              <s.icon className="h-4 w-4 text-site-faint transition-colors group-hover:text-site-ink" />
            </div>
            <p className="mt-3 font-outfit text-3xl font-bold tracking-tight text-site-ink">{s.value}</p>
          </div>
        ))}
      </section>

      {/* Actions */}
      <section>
        <h2 className="mb-4 font-outfit text-xl font-bold text-site-ink">Quick actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {actions.map((a) => {
            const cls = `group flex items-center gap-4 rounded-2xl border p-5 transition-all hover:-translate-y-0.5 ${a.primary ? "border-site-ink bg-site-ink text-site-bg" : "border-site-ink/10 bg-site-card hover:border-site-ink/30"}`;
            const inner = (
              <>
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${a.primary ? "border-site-bg/20 bg-site-bg/10" : "border-site-ink/10 bg-site-ink/[0.05]"}`}>
                  <a.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`font-semibold ${a.primary ? "" : "text-site-ink"}`}>{a.title}</p>
                  <p className={`truncate text-sm ${a.primary ? "opacity-70" : "text-site-muted"}`}>{a.desc}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 opacity-50 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
              </>
            );
            return a.external
              ? <a key={a.title} href={a.href} target="_blank" rel="noreferrer" className={cls}>{inner}</a>
              : <Link key={a.title} href={a.href} className={cls}>{inner}</Link>;
          })}
        </div>
      </section>
    </div>
  );
}
