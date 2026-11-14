"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Wallet, Crown, Zap, Trash2, RefreshCw, Plus, Server } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { SubscriptionEntry, SubscriptionList } from "@/types/api";

function formatExpiry(expiresAt: string | null) {
  if (!expiresAt) return "Never";
  return new Date(expiresAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

function GrantForm({ kind, onGranted }: { kind: "premium" | "noprefix"; onGranted: () => void }) {
  const [userId, setUserId] = useState("");
  const [duration, setDuration] = useState("30d");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!/^\d{15,22}$/.test(userId.trim())) return toast.error("Enter a valid Discord user ID");
    setBusy(true);
    try {
      if (kind === "premium") await api.grantPremium({ userId: userId.trim(), duration });
      else await api.grantNoPrefix({ userId: userId.trim(), duration });
      toast.success(`Granted ${kind === "premium" ? "Premium" : "No-Prefix"}`);
      setUserId("");
      onGranted();
    } catch (err) {
      toast.error((err as any)?.message || "Failed to grant");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <input
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        placeholder="User ID"
        className="flex-1 bg-site-ink/[0.03] border border-site-ink/10 rounded-xl px-3 py-2.5 text-xs text-site-ink placeholder:text-site-faint focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
      />
      <input
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        placeholder="30d, 1mo, permanent"
        className="w-40 bg-site-ink/[0.03] border border-site-ink/10 rounded-xl px-3 py-2.5 text-xs text-site-ink placeholder:text-site-faint focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
      />
      <button disabled={busy} onClick={submit} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-[11px] font-black uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50">
        <Plus className="h-3.5 w-3.5" /> Grant
      </button>
    </div>
  );
}

function SubscriptionTable({ title, icon: Icon, rows, onRevoke, showGuilds }: { title: string; icon: any; rows: SubscriptionEntry[]; onRevoke: (userId: string) => void; showGuilds?: boolean }) {
  const [busy, setBusy] = useState<string | null>(null);
  const revoke = async (userId: string) => {
    if (!window.confirm(`Revoke this for ${userId}?`)) return;
    setBusy(userId);
    try {
      await onRevoke(userId);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-black text-site-ink uppercase tracking-wider">{title}</h3>
        <span className="text-[11px] text-site-faint font-medium">{rows.length}</span>
      </div>
      <div className="grid gap-2">
        {rows.map((r) => (
          <div key={r.userId} className="flex flex-col gap-3 p-3 rounded-2xl bg-site-ink/[0.02] border border-site-ink/5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-site-ink text-sm truncate">{r.username}</p>
                <p className="text-[11px] text-site-faint font-mono truncate">{r.userId}</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-site-muted font-medium shrink-0">
                <span className={cn("px-2 py-1 rounded-lg border", r.expired ? "border-red-500/20 bg-red-500/10 text-red-400" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400")}>
                  {r.expired ? "Expired" : formatExpiry(r.expiresAt)}
                </span>
                <button disabled={busy === r.userId} onClick={() => revoke(r.userId)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-[11px] font-black uppercase tracking-wider hover:bg-red-500/20 transition-colors disabled:opacity-50">
                  <Trash2 className="h-3.5 w-3.5" /> Revoke
                </button>
              </div>
            </div>
            {showGuilds && (
              <div className="flex flex-wrap items-center gap-1.5 pl-0.5">
                <Server className="h-3 w-3 text-site-faint shrink-0" />
                {(r.activeGuilds?.length || 0) === 0 ? (
                  <span className="text-[11px] text-site-faint italic">Not activated on any server yet</span>
                ) : (
                  r.activeGuilds!.map((g) => (
                    <span key={g.guildId} className="px-2 py-0.5 rounded-md bg-site-ink/[0.05] border border-site-ink/10 text-[11px] text-site-muted font-medium">
                      {g.guildName}
                    </span>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
        {rows.length === 0 && <p className="text-center text-site-faint text-sm py-6">None active.</p>}
      </div>
    </div>
  );
}

export function SubscriptionsContent() {
  const [data, setData] = useState<SubscriptionList | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setData(await api.getSubscriptions());
    } catch {
      toast.error("Could not load subscriptions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="bg-site-card border border-site-ink/10 rounded-3xl p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Wallet className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-site-ink tracking-tight">Subscription Manager</h2>
            <p className="text-site-muted text-sm font-medium">Premium and No-Prefix plans, renewals and expirations</p>
          </div>
        </div>
        <button onClick={load} className="p-2.5 rounded-xl border border-site-ink/10 hover:bg-site-ink/5 transition-colors" aria-label="Refresh">
          <RefreshCw className={cn("h-4 w-4 text-site-body", loading && "animate-spin")} />
        </button>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-black text-site-muted uppercase tracking-wider">Grant Premium</p>
        <GrantForm kind="premium" onGranted={load} />
      </div>
      <div className="space-y-3">
        <p className="text-xs font-black text-site-muted uppercase tracking-wider">Grant No-Prefix</p>
        <GrantForm kind="noprefix" onGranted={load} />
      </div>

      {data && (
        <>
          <SubscriptionTable title="Premium" icon={Crown} rows={data.premium} showGuilds onRevoke={async (id) => { await api.revokePremium(id); toast.success("Revoked"); load(); }} />
          <SubscriptionTable title="No-Prefix" icon={Zap} rows={data.noPrefix} onRevoke={async (id) => { await api.revokeNoPrefix(id); toast.success("Revoked"); load(); }} />
        </>
      )}
    </div>
  );
}
