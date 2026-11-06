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
import { 
  Plus, 
  Settings2, 
  Terminal, 
  Database,
  Search,
  Zap,
  ShieldCheck,
  Ticket,
  BarChart4,
  FileText,
  Activity
} from "lucide-react";

export default function GuildOverviewPage({ params }: { params: { guildId: string } }) {
  const modules = [
    { title: "Auto Moderation", desc: "Anti-spam, bad words, and links protection.", icon: ShieldCheck, status: "Active" },
    { title: "Ticket System", desc: "Helpdesk for user support and inquiries.", icon: Ticket, status: "Configured" },
    { title: "Leveling", desc: "Gamify your community with XP and ranks.", icon: BarChart4, status: "Active" },
    { title: "Event Logging", desc: "Detailed audit logs for every server event.", icon: FileText, status: "Active" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Quick Config Column */}
      <div className="space-y-8">
        <section>
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-xl font-bold text-site-ink tracking-tight">Active Modules</h2>
            <div className="h-[2px] flex-1 bg-site-ink/10" />
            <Plus className="h-4 w-4 text-site-faint cursor-pointer hover:text-site-ink transition-colors" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {modules.map((mod) => (
              <div key={mod.title} className="bg-site-card border border-site-ink/10 p-5 rounded-2xl group hover:border-site-ink/20 transition-all shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-10 w-10 bg-site-ink/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <mod.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {mod.status}
                  </span>
                </div>
                <h3 className="font-bold text-site-ink mb-1">{mod.title}</h3>
                <p className="text-xs text-site-faint leading-relaxed">{mod.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-xl font-bold text-site-ink tracking-tight">System Console</h2>
            <div className="h-[2px] flex-1 bg-site-ink/10" />
          </div>
          <div className="bg-site-card border border-site-ink/10 rounded-2xl p-4 font-mono text-xs overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 mb-3 border-b border-site-ink/10 pb-2">
              <Terminal className="h-4 w-4 text-primary" />
              <span className="text-site-muted">guild_event_stream_{params.guildId}</span>
            </div>
            <div className="space-y-1.5 opacity-80">
              <p className="text-site-faint">[{new Date().toLocaleTimeString()}] <span className="text-emerald-500">INIT</span> Dashboard connected to WebSocket pool...</p>
              <p className="text-site-faint">[{new Date().toLocaleTimeString()}] <span className="text-primary">INFO</span> Fetching guild_config from primary database...</p>
              <p className="text-site-faint">[{new Date().toLocaleTimeString()}] <span className="text-emerald-500">DONE</span> Cache synchronized successfully.</p>
              <p className="text-site-muted animate-pulse">_</p>
            </div>
          </div>
        </section>
      </div>

      {/* Integration Status Column */}
      <div className="space-y-8">
        <section className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform">
            <Database className="h-48 w-48 text-site-ink" />
          </div>
          <h2 className="text-2xl font-black text-site-ink mb-2 italic tracking-tighter">Database Status</h2>
          <p className="text-site-muted text-sm mb-8 max-w-[280px]">All guild data is encrypted and replicated across our high-performance edge network.</p>
          
          <div className="space-y-4 relative z-10">
            {[
              { label: 'Uptime', value: '99.98%', icon: Zap },
              { label: 'Sync Delay', value: '12ms', icon: Activity },
              { label: 'Region', value: 'Global Edges', icon: GlobalizationIcon }
            ].map((stat) => (stat.icon && 
              <div key={stat.label} className="flex items-center justify-between p-4 bg-site-bg/20 backdrop-blur-md rounded-2xl border border-site-ink/5">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-site-bg/40 rounded-lg flex items-center justify-center text-primary">
                    <stat.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-site-body">{stat.label}</span>
                </div>
                <span className="text-sm font-bold text-site-ink tracking-widest">{stat.value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-site-card border border-site-ink/10 rounded-3xl p-8">
           <h2 className="text-xl font-bold text-site-ink mb-6">Security Context</h2>
           <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-full border-4 border-emerald-500/20 flex items-center justify-center relative shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                <div className="h-16 w-16 rounded-full border-4 border-emerald-500 flex items-center justify-center text-emerald-500 font-black text-xl italic">
                  100%
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-site-ink">Trust Factor</h3>
                <p className="text-site-muted text-sm">Bot is fully authenticated with administrator privileges.</p>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
}

function GlobalizationIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
