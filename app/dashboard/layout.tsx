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

"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Server, ShieldCheck, Ticket, BarChart4, FileText, Settings,
  Menu, X, Bell, User, Search, ChevronRight, Star, Sparkles, LogOut,
  LifeBuoy, ChevronDown, Bot, Shield
} from "lucide-react";
import {
  BadgeCheck, BarChart3, BarChartHorizontal, BellRing, Cake, ClipboardList, Crown, Eye, Flame, FlaskConical, Gift, Inbox, LayoutGrid, Lightbulb, Link2, Lock, Mail, MessageSquareQuote, Mic, Palette, PartyPopper, Rocket, ScrollText, Share2, ShieldAlert, Smile, SmilePlus, Swords, Tag, Trash2, TrendingUp, UserPlus, Volume2, Wallet
} from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import { cn, isAdmin } from "@/lib/utils";
import { api } from "@/lib/api";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { AdminConfig } from "@/types/api";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isSupport, setIsSupport] = useState(false);
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/staff/me").then((r) => r.json()).then((d) => setIsSupport(!!d.support)).catch(() => {});
  }, [status]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [globalNotification, setGlobalNotification] = useState<string | null>(null);
  
  const bellRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (bellRef.current && !bellRef.current.contains(target)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-close sidebar on mobile when navigating
  React.useEffect(() => {
    setIsSidebarOpen(false);
    setIsProfileOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    // Never start a second Discord login here: it races the landing page login and breaks the OAuth state.
    if (status === "unauthenticated") {
      window.location.assign("/");
    }
    
    // Fetch global notification
    const fetchNotification = async () => {
      try {
        const config = await api.getAdminConfig();
        setGlobalNotification(config.global_notification);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };
    fetchNotification();
  }, [status]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-site-card flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <img src="/logo.png" alt="" className="site-logo h-14 w-14 object-contain" />
          <p className="text-site-muted font-bold tracking-widest uppercase text-xs">
            Authenticating...
          </p>
        </div>
      </div>
    );
  }

  const match = pathname.match(/\/dashboard\/guild\/([^\/]+)/);
  const currentGuildId = match ? match[1] : null;

  // Base sidebar items – will be filtered if we are inside a guild
  const allSidebarItems = currentGuildId
    ? [
        { name: "Overview", href: `/dashboard/guild/${currentGuildId}`, icon: LayoutDashboard },
        {
          name: "Security",
          items: [
            { name: "Anti-Nuke", href: `/dashboard/guild/${currentGuildId}/antinuke`, icon: Swords },
            { name: "Automod", href: `/dashboard/guild/${currentGuildId}/automod`, icon: ShieldCheck },
            { name: "Verification", href: `/dashboard/guild/${currentGuildId}/verification`, icon: BadgeCheck },
            { name: "Anti-Betray", href: `/dashboard/guild/${currentGuildId}/antibetray`, icon: ShieldAlert },
            { name: "Honeypot", href: `/dashboard/guild/${currentGuildId}/honeypot`, icon: FlaskConical },
            { name: "Jail", href: `/dashboard/guild/${currentGuildId}/jail`, icon: Lock },
          ],
        },
        {
          name: "Engagement",
          items: [
            { name: "Welcome", href: `/dashboard/guild/${currentGuildId}/welcome`, icon: PartyPopper },
            { name: "Tag Supporter", href: `/dashboard/guild/${currentGuildId}/tagsupporter`, icon: Crown },
            { name: "Autoresponder", href: `/dashboard/guild/${currentGuildId}/autoresponder`, icon: MessageSquareQuote },
            { name: "Leveling", href: `/dashboard/guild/${currentGuildId}/leveling`, icon: TrendingUp },
            { name: "Vanity Roles", href: `/dashboard/guild/${currentGuildId}/vanityroles`, icon: Link2 },
            { name: "Auto Role", href: `/dashboard/guild/${currentGuildId}/autorole`, icon: UserPlus },
            { name: "Auto React", href: `/dashboard/guild/${currentGuildId}/autoreact`, icon: SmilePlus },
            { name: "Reaction Roles", href: `/dashboard/guild/${currentGuildId}/reactionroles`, icon: Smile },
            { name: "Join DM", href: `/dashboard/guild/${currentGuildId}/joindm`, icon: Mail },
            { name: "Invites", href: `/dashboard/guild/${currentGuildId}/invites`, icon: Share2 },
            { name: "Tracking", href: `/dashboard/guild/${currentGuildId}/tracking`, icon: Eye },
          ],
        },
        {
          name: "Utility",
          items: [
            { name: "Tickets", href: `/dashboard/guild/${currentGuildId}/tickets`, icon: Ticket },
            { name: "Applications", href: `/dashboard/guild/${currentGuildId}/applications`, icon: ClipboardList },
            { name: "App Panels", href: `/dashboard/guild/${currentGuildId}/application-panels`, icon: LayoutGrid },
            { name: "Submissions", href: `/dashboard/guild/${currentGuildId}/submissions`, icon: Inbox },
            { name: "Boost Message", href: `/dashboard/guild/${currentGuildId}/boost`, icon: Rocket },
            { name: "Server Tag", href: `/dashboard/guild/${currentGuildId}/servertag`, icon: Tag },
            { name: "Birthdays", href: `/dashboard/guild/${currentGuildId}/birthdays`, icon: Cake },
            { name: "Welcome Streaks", href: `/dashboard/guild/${currentGuildId}/streaks`, icon: Flame },
            { name: "Suggestions", href: `/dashboard/guild/${currentGuildId}/suggestions`, icon: Lightbulb },
            { name: "Starboard", href: `/dashboard/guild/${currentGuildId}/starboard`, icon: Star },
            { name: "Role Reminders", href: `/dashboard/guild/${currentGuildId}/role-reminders`, icon: BellRing },
            { name: "Giveaways", href: `/dashboard/guild/${currentGuildId}/giveaways`, icon: Gift },
            { name: "Polls", href: `/dashboard/guild/${currentGuildId}/polls`, icon: BarChart3 },
            { name: "Mod Log", href: `/dashboard/guild/${currentGuildId}/modlog`, icon: ScrollText },
            { name: "Auto Delete", href: `/dashboard/guild/${currentGuildId}/autodelete`, icon: Trash2 },
            { name: "Stats Channels", href: `/dashboard/guild/${currentGuildId}/serverstats`, icon: BarChartHorizontal },
            { name: "Join to Create", href: `/dashboard/guild/${currentGuildId}/j2c`, icon: Mic },
            { name: "Custom Roles", href: `/dashboard/guild/${currentGuildId}/customroles`, icon: Palette },
            { name: "Voice Role", href: `/dashboard/guild/${currentGuildId}/invcrole`, icon: Volume2 },
            { name: "Logging", href: `/dashboard/guild/${currentGuildId}/logging`, icon: FileText },
            { name: "UPI", href: `/dashboard/guild/${currentGuildId}/upi`, icon: Wallet },
          ],
        },
        {
          name: "Premium",
          items: [
            { name: "AI Chat", href: `/dashboard/guild/${currentGuildId}/aichat`, icon: Sparkles },
            { name: "Bot Profile", href: `/dashboard/guild/${currentGuildId}/botprofile`, icon: Bot },
          ],
        },
        { name: "Settings", href: `/dashboard/guild/${currentGuildId}/settings`, icon: Settings },
        { name: "Back to Servers", href: "/dashboard/guilds", icon: Server },
      ]
    : [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Servers", href: "/dashboard/guilds", icon: Server },
        ...(isAdmin(session?.user?.id) 
            ? [{ name: "Admin Panel", href: "/dashboard/admin", icon: Shield }] 
            : []),
        { name: "Support Tickets", href: "/dashboard/support", icon: LifeBuoy },
      ];

  // Separate the "Back to Servers" item when inside a guild
  let mainSidebarItems = allSidebarItems;
  let backLinkItem: any = null;

  if (currentGuildId) {
    mainSidebarItems = allSidebarItems.filter(
      (item) => !(item.name === "Back to Servers")
    );
    backLinkItem = allSidebarItems.find((item) => item.name === "Back to Servers");
  }

  const BackLinkIcon = backLinkItem?.icon || Server;

  return (
    <div className="min-h-screen bg-site-bg text-site-ink">
      {/* Liquid Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-site-ink/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] left-[-5%] w-[30%] h-[30%] bg-site-ink/5 blur-[100px] rounded-full animate-pulse [animation-delay:2s]" />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-site-bg/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - now using flex column */}
      <aside
        className={cn(
          "fixed left-4 top-4 bottom-4 z-50 w-64 transform transition-all duration-500 ease-in-out lg:translate-x-0 glass border border-site-ink/10 rounded-[2.5rem] shadow-2xl shadow-black/40 overflow-hidden flex flex-col",
          isSidebarOpen ? "translate-x-0" : "-translate-x-[110%]"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center px-6 mt-4 flex-shrink-0">
          <div className="flex items-center gap-3 group">
            <img src="/logo.png" alt="" className="site-logo h-9 w-9 object-contain group-hover:scale-110 transition-transform" />
            <div className="flex flex-col">
              <h1 className="text-lg font-bold tracking-tight text-site-ink font-outfit leading-none">
                {process.env.NEXT_PUBLIC_BRAND_NAME || "Zevion"}
              </h1>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-site-ink/80 mt-1">
                Dashboard
              </span>
            </div>
          </div>
          <button
            className="ml-auto p-2 lg:hidden text-site-muted hover:text-site-ink"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <nav className="mt-8 px-4 space-y-6 overflow-y-auto flex-1 no-scrollbar relative z-10 pb-3">
          {mainSidebarItems.map((item: any) => {
            if (item.items) {
              return (
                <div key={item.name} className="space-y-2">
                  <p className="px-4 text-[10px] font-black uppercase tracking-[0.3em] text-site-faint mb-3">
                    {item.name}
                  </p>
                  <div className="space-y-1">
                    {item.items.map((subItem: any) => {
                      const isActive = pathname === subItem.href;
                      return (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group text-[13px] font-bold",
                            isActive
                              ? "bg-site-ink/10 text-site-ink border border-site-ink/20 shadow-[0_0_20px_rgb(var(--site-ink)/0.1)]"
                              : "text-site-muted hover:bg-site-ink/[0.03] hover:text-site-ink"
                          )}
                        >
                          <subItem.icon
                            className={cn(
                              "h-4 w-4 transition-all duration-300",
                              isActive
                                ? "text-site-ink scale-110"
                                : "text-site-faint group-hover:text-site-muted"
                            )}
                          />
                          {subItem.name}
                          {isActive && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-site-ink animate-pulse shadow-[0_0_10px_rgb(var(--site-ink)/0.5)]" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            }

            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group text-[14px] font-bold",
                  isActive
                    ? "bg-site-ink/10 text-site-ink border border-site-ink/20 shadow-[0_0_20px_rgb(var(--site-ink)/0.1)]"
                    : "text-site-muted hover:bg-site-ink/[0.03] hover:text-site-ink"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-all duration-300",
                    isActive ? "text-site-ink scale-110" : "text-site-faint group-hover:text-site-muted"
                  )}
                />
                {item.name}
                {isActive ? (
                  <ChevronRight className="ml-auto h-4 w-4 text-site-ink" />
                ) : (
                  <ChevronRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-30 transition-opacity" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Fixed "Back to Servers" link (only shown inside a guild) */}
        {backLinkItem && (
          <div className="px-4 py-2 flex-shrink-0">
            <div className="h-px bg-site-ink/5 w-3/4 mx-auto rounded-full mb-2" />
            <Link
              href={backLinkItem.href || "/dashboard/guilds"}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group text-[14px] font-bold",
                pathname === backLinkItem.href
                  ? "bg-site-ink/10 text-site-ink border border-site-ink/20 shadow-[0_0_20px_rgb(var(--site-ink)/0.1)]"
                  : "text-site-muted hover:bg-site-ink/[0.03] hover:text-site-ink"
              )}
            >
              <BackLinkIcon
                className={cn(
                  "h-5 w-5 transition-all duration-300",
                  pathname === backLinkItem.href
                    ? "text-site-ink scale-110"
                    : "text-site-faint group-hover:text-site-muted"
                )}
              />
              {backLinkItem.name}
              {pathname === backLinkItem.href ? (
                <ChevronRight className="ml-auto h-4 w-4 text-site-ink" />
              ) : (
                <ChevronRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-30 transition-opacity" />
              )}
            </Link>
          </div>
        )}

        {/* User Profile - now a normal flex child, no absolute positioning */}
        <div className="flex-shrink-0 p-4 border-t border-site-ink/5 glass-red bg-site-ink/[0.02]">
          <div className="flex items-center gap-3 p-2 bg-site-ink/[0.02] rounded-2xl border border-site-ink/[0.05]">
            <div className="h-10 w-10 rounded-full bg-site-ink/10 flex items-center justify-center ring-1 ring-site-ink/10 overflow-hidden border border-site-ink/20">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt="User Avatar"
                  className="h-full w-full object-cover opacity-80"
                />
              ) : (
                <User className="h-6 w-6 text-site-ink/50" />
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-site-ink truncate font-outfit">
                {session?.user?.name || "Administrator"}
              </p>
              <p className="text-[10px] font-black uppercase text-site-ink/60 truncate tracking-widest">
                User
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area (unchanged) */}
      <div className="lg:pl-72 flex flex-col min-h-screen relative z-10">
        {/* Top Navbar (unchanged) */}
        <header className="h-20 sticky top-4 z-30 mx-4 lg:mx-10 flex items-center justify-between border border-site-ink/10 glass bg-site-ink/[0.01] backdrop-blur-3xl px-8 rounded-[2rem] shadow-xl shadow-black/20 mb-6 mt-4">
          <button
            className="p-2 lg:hidden text-site-muted hover:bg-site-ink/5 rounded-xl transition-colors"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="hidden md:flex items-center w-96 max-w-full relative group">
            <Search className="absolute left-4 h-4 w-4 text-site-faint group-focus-within:text-site-ink transition-colors" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-site-ink/[0.03] border border-site-ink/5 rounded-2xl py-2.5 pl-12 pr-4 text-xs font-bold text-site-body focus:outline-none focus:ring-1 focus:ring-site-ink/30 focus:bg-site-ink/[0.05] transition-all placeholder:text-site-faint"
            />
          </div>

          <div className="flex items-center gap-6">
            <ThemeToggle className="h-10 w-10 rounded-xl" />
            <div className="relative" ref={bellRef}>
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2.5 text-site-muted hover:bg-site-ink/5 hover:text-site-ink rounded-xl transition-all group"
              >
                <Bell className="h-5 w-5" />
                {globalNotification && (
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-site-ink border-2 border-site-bg shadow-[0_0_10px_rgb(var(--site-ink)/0.5)]"></span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-site-card/90 backdrop-blur-3xl border border-site-ink/5 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-4 z-20 animate-in fade-in zoom-in-95 duration-300 origin-top-right">
                    <div className="flex items-center justify-between mb-4 border-b border-site-ink/5 pb-2">
                      <p className="text-[10px] font-black text-site-faint uppercase tracking-[0.2em]">Broadcast Metrics</p>
                      <button 
                        onClick={() => setGlobalNotification(null)}
                        className="text-[10px] font-bold text-site-ink/60 hover:text-site-ink transition-colors uppercase"
                      >
                        Clear
                      </button>
                    </div>
                    
                    {globalNotification ? (
                      <div className="bg-site-ink/5 border border-site-ink/10 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-3 w-3 text-site-ink" />
                          <span className="text-[10px] font-black uppercase text-site-ink tracking-widest">System Broadcast</span>
                        </div>
                        <p className="text-xs font-medium text-site-body leading-relaxed">
                          {globalNotification}
                        </p>
                      </div>
                    ) : (
                      <div className="py-8 flex flex-col items-center justify-center text-center">
                        <div className="h-10 w-10 rounded-full bg-site-ink/10 flex items-center justify-center mb-3">
                          <Bell className="h-5 w-5 text-site-faint" />
                        </div>
                        <p className="text-xs font-bold text-site-faint">No active broadcasts</p>
                        <p className="text-[10px] font-medium text-site-faint mt-1 uppercase tracking-widest">Everything is operating normally</p>
                      </div>
                    )}
                  </div>
              )}
            </div>
            <div className="h-8 w-[1px] bg-site-ink/5 hidden sm:block"></div>

            {/* Profile Dropdown (unchanged) */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3.5 p-1.5 rounded-2xl hover:bg-site-ink/5 transition-all group border border-transparent hover:border-site-ink/10"
              >
                <div className="h-9 w-9 rounded-full bg-site-ink/10 flex items-center justify-center overflow-hidden border border-site-ink/20 ring-2 ring-transparent group-hover:ring-site-ink/30 transition-all">
                  {session?.user?.image ? (
                    <img src={session.user.image} alt="User Avatar" className="h-full w-full object-cover opacity-80" />
                  ) : (
                    <User className="h-5 w-5 text-site-ink/50" />
                  )}
                </div>
                <div className="hidden sm:flex flex-col items-start leading-none gap-1">
                  <span className="text-xs font-bold text-site-ink group-hover:text-site-ink transition-colors">
                    {session?.user?.name?.split(' ')[0] || "Admin"}
                  </span>
                  <span className="text-[9px] font-black uppercase text-site-ink/60 tracking-widest">Active</span>
                </div>
                <ChevronDown
                  className={cn("h-4 w-4 text-site-faint transition-transform hidden sm:block", isProfileOpen && "rotate-180")}
                />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-site-card/90 backdrop-blur-3xl border border-site-ink/5 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-2 z-20 animate-in fade-in zoom-in-95 duration-300 origin-top-right">
                    <div className="px-4 py-3 border-b border-site-ink/5 mb-2">
                      <p className="text-[9px] font-black text-site-faint uppercase tracking-[0.2em] mb-1">Authenticated As</p>
                      <p className="text-sm font-bold text-site-ink truncate">{session?.user?.name || "Administrator"}</p>
                    </div>

                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-site-muted hover:bg-site-ink/5 hover:text-site-ink transition-all group/item">
                      <LifeBuoy className="h-4 w-4 text-site-faint group-hover/item:text-site-ink transition-colors" />
                      Support Matrix
                    </button>

                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-site-ink/80 hover:bg-site-ink/10 hover:text-site-ink transition-all group/item"
                    >
                      <LogOut className="h-4 w-4" />
                      Deauthorize
                    </button>
                  </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 lg:p-10 animate-in fade-in duration-700 relative z-10">
          <div className="max-w-[1600px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}