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

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeCheck, BarChart3, BarChartHorizontal, BellRing, Cake, ClipboardList, Crown, Flame, FlaskConical, Gift, Inbox, LayoutDashboard, LayoutGrid, Lightbulb, Lock, MessageSquareQuote, Palette, PartyPopper, ScrollText, Share2, Smile, Star, Swords, Tag, Trash2, TrendingUp, UserPlus, Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  ShieldCheck, 
  Ticket, 
  BarChart4, 
  FileText, 
  Settings,
  Layers,
  Sword,
  Activity,
  SmilePlus,
  Rocket,
  Shield,
  MessageSquare,
  Sparkles,
  Link as LinkIcon,
  Bot,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Link2,
  Zap,
  Mic,
  Mail,
  ShieldAlert,
  UserCog
} from "lucide-react";

interface Tab {
  name: string;
  href: string;
  icon: any;
}

export function GuildTabs({ guildId }: { guildId: string }) {
  const pathname = usePathname();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const tabs: Tab[] = [
    { name: "Overview", href: `/dashboard/guild/${guildId}`, icon: LayoutDashboard },
    { name: "Anti-Nuke", href: `/dashboard/guild/${guildId}/antinuke`, icon: Swords },
    { name: "Automod", href: `/dashboard/guild/${guildId}/automod`, icon: ShieldCheck },
    { name: "Tickets", href: `/dashboard/guild/${guildId}/tickets`, icon: Ticket },
    { name: "Applications", href: `/dashboard/guild/${guildId}/applications`, icon: ClipboardList },
    { name: "App Panels", href: `/dashboard/guild/${guildId}/application-panels`, icon: LayoutGrid },
    { name: "Submissions", href: `/dashboard/guild/${guildId}/submissions`, icon: Inbox },
    { name: "Boost Message", href: `/dashboard/guild/${guildId}/boost`, icon: Rocket },
    { name: "Server Tag", href: `/dashboard/guild/${guildId}/servertag`, icon: Tag },
    { name: "Birthdays", href: `/dashboard/guild/${guildId}/birthdays`, icon: Cake },
    { name: "Welcome Streaks", href: `/dashboard/guild/${guildId}/streaks`, icon: Flame },
    { name: "Suggestions", href: `/dashboard/guild/${guildId}/suggestions`, icon: Lightbulb },
    { name: "Starboard", href: `/dashboard/guild/${guildId}/starboard`, icon: Star },
    { name: "Role Reminders", href: `/dashboard/guild/${guildId}/role-reminders`, icon: BellRing },
    { name: "Giveaways", href: `/dashboard/guild/${guildId}/giveaways`, icon: Gift },
    { name: "Polls", href: `/dashboard/guild/${guildId}/polls`, icon: BarChart3 },
    { name: "Mod Log", href: `/dashboard/guild/${guildId}/modlog`, icon: ScrollText },
    { name: "Auto Delete", href: `/dashboard/guild/${guildId}/autodelete`, icon: Trash2 },
    { name: "Stats Channels", href: `/dashboard/guild/${guildId}/serverstats`, icon: BarChartHorizontal },
    { name: "Welcome", href: `/dashboard/guild/${guildId}/welcome`, icon: PartyPopper },
    { name: "Autoresponder", href: `/dashboard/guild/${guildId}/autoresponder`, icon: MessageSquareQuote },
    { name: "Invites", href: `/dashboard/guild/${guildId}/invites`, icon: Share2 },
    { name: "Auto Role", href: `/dashboard/guild/${guildId}/autorole`, icon: UserPlus },
    { name: "Voice Role", href: `/dashboard/guild/${guildId}/invcrole`, icon: Volume2 },
    { name: "Join DM", href: `/dashboard/guild/${guildId}/joindm`, icon: Mail },
    { name: "Custom Roles", href: `/dashboard/guild/${guildId}/customroles`, icon: Palette },
    { name: "Verification", href: `/dashboard/guild/${guildId}/verification`, icon: BadgeCheck },
    { name: "Leveling", href: `/dashboard/guild/${guildId}/leveling`, icon: TrendingUp },
    { name: "Anti-Betray", href: `/dashboard/guild/${guildId}/antibetray`, icon: ShieldAlert },
    { name: "Jail", href: `/dashboard/guild/${guildId}/jail`, icon: Lock },
    { name: "Tag Supporter", href: `/dashboard/guild/${guildId}/tagsupporter`, icon: Crown },
    { name: "Honeypot", href: `/dashboard/guild/${guildId}/honeypot`, icon: FlaskConical },
    { name: "UPI", href: `/dashboard/guild/${guildId}/upi`, icon: Wallet },
    { name: "AI Chat", href: `/dashboard/guild/${guildId}/aichat`, icon: Sparkles },
    { name: "Bot Profile", href: `/dashboard/guild/${guildId}/botprofile`, icon: Bot },
    { name: "Reaction Roles", href: `/dashboard/guild/${guildId}/reactionroles`, icon: Smile },
    { name: "Join to Create", href: `/dashboard/guild/${guildId}/j2c`, icon: Mic },
    { name: "Vanity Roles", href: `/dashboard/guild/${guildId}/vanityroles`, icon: Link2 },
    { name: "Auto React", href: `/dashboard/guild/${guildId}/autoreact`, icon: SmilePlus },
    { name: "Logging", href: `/dashboard/guild/${guildId}/logging`, icon: FileText },
    { name: "Settings", href: `/dashboard/guild/${guildId}/settings`, icon: Settings },
  ].filter(tab => tab.href); // Filter out any undefined hrefs

  return (
    <div className="relative group/tabs flex items-center w-full mb-8 sticky top-[64px] z-20 transition-all duration-300">
      {/* Scroll Arrows */}
      <button 
        onClick={() => scroll("left")}
        className="absolute left-[-16px] z-30 p-2 rounded-full bg-site-ink/10 border border-site-ink/15 text-site-bg shadow-xl opacity-0 group-hover/tabs:opacity-100 transition-opacity hover:bg-primary"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Left Fade */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-site-card to-transparent z-10 pointer-events-none opacity-0 group-hover/tabs:opacity-100 transition-opacity" />
      
      <div 
        ref={scrollContainerRef}
        className="flex gap-2 p-1.5 bg-site-card/40 border border-site-ink/[0.04] rounded-[20px] overflow-x-auto no-scrollbar w-full scroll-smooth shadow-2xl shadow-black/20"
      >
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className="shrink-0"
            >
              <div className={cn(
                "flex items-center gap-2.5 px-6 py-2.5 rounded-[14px] text-[11px] font-black uppercase tracking-wider transition-all duration-500 whitespace-nowrap",
                "hover:bg-site-ink/[0.06] hover:text-site-ink",
                isActive 
                  ? "bg-primary text-site-bg shadow-lg shadow-primary/30 ring-1 ring-site-ink/10" 
                  : "text-site-muted bg-site-card/40 border border-site-ink/[0.03] hover:border-site-ink/[0.075]"
              )}>
                <tab.icon className={cn("h-3.5 w-3.5", isActive ? "animate-pulse" : "opacity-50")} />
                {tab.name}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Right Fade */}
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-site-card to-transparent z-10 pointer-events-none opacity-0 group-hover/tabs:opacity-100 transition-opacity" />

      <button 
        onClick={() => scroll("right")}
        className="absolute right-[-16px] z-30 p-2 rounded-full bg-site-ink/10 border border-site-ink/15 text-site-bg shadow-xl opacity-0 group-hover/tabs:opacity-100 transition-opacity hover:bg-primary"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
