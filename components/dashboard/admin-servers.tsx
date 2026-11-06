"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Search, Server, Users, LogOut, Ban, ExternalLink, RefreshCw, Crown } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { AdminGuild } from "@/types/api";

/** Every server the bot is in, for bot owners. Access is enforced by the bot API as well as by the page. */
export function AdminServers() {
  const [guilds, setGuilds] = useState<AdminGuild[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await api.getAdminGuilds(q);
      setGuilds(res.guilds);
      setTotal(res.total);
    } catch {
      toast.error("Could not load the server list");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(query), 300);
    return () => clearTimeout(t);
  }, [query, load]);

  const leave = async (g: AdminGuild) => {
    if (!window.confirm(`Make the bot leave "${g.name}"?`)) return;
    setBusy(g.id);
    try {
      await api.adminLeaveGuild(g.id);
      toast.success(`Left ${g.name}`);
      await load(query);
    } catch {
      toast.error("Could not leave that server");
    } finally {
      setBusy(null);
    }
  };

  const toggleBlock = async (g: AdminGuild) => {
    const next = !g.blacklisted;
    if (next && !window.confirm(`Blacklist "${g.name}"? The bot will leave and refuse to be added back.`)) return;
    setBusy(g.id);
    try {
      await api.adminBlacklistGuild(g.id, next);
      toast.success(next ? `Blacklisted ${g.name}` : `Removed ${g.name} from the blacklist`);
      await load(query);
    } catch {
      toast.error("Could not update the blacklist");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="bg-site-card border border-site-ink/10 rounded-3xl p-6 lg:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Server className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-site-ink tracking-tight">All Servers</h2>
            <p className="text-site-muted text-sm font-medium">{total.toLocaleString("en-US")} servers · showing the biggest {guilds.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="h-4 w-4 text-site-faint absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, server ID or owner ID"
              className="w-72 max-w-full bg-site-ink/[0.03] border border-site-ink/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-site-ink placeholder:text-site-faint focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
            />
          </div>
          <button onClick={() => load(query)} className="p-2.5 rounded-xl border border-site-ink/10 hover:bg-site-ink/5 transition-colors" aria-label="Refresh">
            <RefreshCw className={cn("h-4 w-4 text-site-body", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {guilds.map((g) => (
          <div key={g.id} className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-2xl bg-site-ink/[0.02] border border-site-ink/5">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              {g.icon_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={g.icon_url} alt="" className="h-12 w-12 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="h-12 w-12 rounded-xl bg-site-ink/10 flex items-center justify-center text-site-muted font-black shrink-0">
                  {g.name.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-site-ink truncate">{g.name}</p>
                  {g.blacklisted && <span className="text-[10px] font-black uppercase tracking-wider text-site-ink bg-site-ink/10 border border-site-ink/20 rounded-md px-1.5 py-0.5">Blacklisted</span>}
                </div>
                <p className="text-[11px] text-site-faint font-mono truncate">{g.id}</p>
                <div className="flex items-center gap-4 mt-1 text-[11px] text-site-muted font-medium">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{g.member_count.toLocaleString("en-US")}</span>
                  <span className="flex items-center gap-1"><Crown className="h-3 w-3" />{g.owner_id}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href={`/dashboard/guild/${g.id}`} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[11px] font-black uppercase tracking-wider hover:bg-primary/20 transition-colors">
                <ExternalLink className="h-3.5 w-3.5" /> Manage
              </Link>
              <button disabled={busy === g.id} onClick={() => toggleBlock(g)} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400 text-[11px] font-black uppercase tracking-wider hover:bg-amber-500/20 transition-colors disabled:opacity-50">
                <Ban className="h-3.5 w-3.5" /> {g.blacklisted ? "Unblock" : "Blacklist"}
              </button>
              <button disabled={busy === g.id} onClick={() => leave(g)} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-site-ink/20 bg-site-ink/10 text-site-ink text-[11px] font-black uppercase tracking-wider hover:bg-site-ink/20 transition-colors disabled:opacity-50">
                <LogOut className="h-3.5 w-3.5" /> Leave
              </button>
            </div>
          </div>
        ))}
        {!loading && guilds.length === 0 && <p className="text-center text-site-faint text-sm py-8">No servers match your search.</p>}
      </div>
    </div>
  );
}
