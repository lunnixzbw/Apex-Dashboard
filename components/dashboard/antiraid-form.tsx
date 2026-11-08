"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiPick } from "@/components/dashboard/multi-pick";

interface Props {
  initialConfig: any;
  guildId: string;
  roles: any[];
  channels: any[];
}

const label = "text-xs font-black uppercase text-site-faint tracking-widest";

export function AntiRaidForm({ initialConfig, guildId, roles, channels }: Props) {
  const [c, setC] = useState<any>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [raidBusy, setRaidBusy] = useState(false);

  const textChannels = channels.filter((ch: any) => ch.type === "0" || ch.type === 0 || ch.type === "text" || ch.type === "5" || ch.type === 5 || !ch.type);
  const pickRoles = roles.filter((r: any) => r.name !== "@everyone").map((r: any) => ({ id: String(r.id), name: r.name, color: r.color }));

  const num = (v: string) => (v === "" ? 0 : parseInt(v, 10) || 0);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const promise = api.updateAntiRaid(guildId, {
      enabled: c.enabled,
      join_threshold: c.join_threshold,
      join_window_sec: c.join_window_sec,
      min_account_age_days: c.min_account_age_days,
      action: c.action,
      lockdown: c.lockdown,
      lockdown_minutes: c.lockdown_minutes,
      log_channel_id: c.log_channel_id || "",
      whitelist_role_ids: c.whitelist_role_ids || [],
    });
    toast.promise(promise, {
      loading: "Saving anti-raid settings...",
      success: "Anti-raid settings saved!",
      error: (err: any) => (err?.message && err.message !== "An unknown error occurred" ? err.message : "Failed to save anti-raid settings"),
    });
    try { await promise; } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  const toggleRaid = async () => {
    setRaidBusy(true);
    try {
      await api.updateAntiRaid(guildId, { raid_mode: !c.raid_active });
      setC({ ...c, raid_active: !c.raid_active });
      toast.success(c.raid_active ? "Raid mode stopped." : "Raid mode started.");
    } catch (err: any) {
      toast.error(err?.message || "Could not change raid mode.");
    } finally { setRaidBusy(false); }
  };

  return (
    <form onSubmit={save} className="space-y-6 pb-20">
      <div className="bg-site-card border border-site-ink/10 rounded-3xl p-8 space-y-8 shadow-xl shadow-black/20">
        <div className="flex items-center justify-between border-b border-site-ink/10 pb-4">
          <div>
            <span className="text-sm font-bold text-site-body">Anti-Raid Protection</span>
            <p className="text-xs text-site-muted mt-1">When too many members join too fast, raid mode starts automatically.</p>
          </div>
          <Switch checked={!!c.enabled} onCheckedChange={() => setC({ ...c, enabled: !c.enabled })} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className={label}>Joins that trigger a raid</label>
            <Input type="number" min={3} max={100} value={c.join_threshold} disabled={!c.enabled}
              onChange={(e) => setC({ ...c, join_threshold: num(e.target.value) })} className="py-6 text-lg font-bold" />
          </div>
          <div className="space-y-2">
            <label className={label}>Within (seconds)</label>
            <Input type="number" min={3} max={120} value={c.join_window_sec} disabled={!c.enabled}
              onChange={(e) => setC({ ...c, join_window_sec: num(e.target.value) })} className="py-6 text-lg font-bold" />
          </div>
          <div className="space-y-2">
            <label className={label}>Block accounts younger than (days, 0 = off)</label>
            <Input type="number" min={0} max={365} value={c.min_account_age_days} disabled={!c.enabled}
              onChange={(e) => setC({ ...c, min_account_age_days: num(e.target.value) })} className="py-6 text-lg font-bold" />
          </div>
          <div className="space-y-2">
            <label className={label}>Action on raiders</label>
            <select
              value={c.action}
              disabled={!c.enabled}
              onChange={(e) => setC({ ...c, action: e.target.value })}
              className="w-full rounded-xl bg-site-card border border-site-ink/10 text-site-ink py-4 px-4 font-bold"
            >
              <option value="kick">Kick</option>
              <option value="ban">Ban</option>
              <option value="timeout">Timeout (1 hour)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className={label}>Server lockdown during a raid</label>
              <Switch checked={!!c.lockdown} disabled={!c.enabled} onCheckedChange={() => setC({ ...c, lockdown: !c.lockdown })} />
            </div>
            <p className="text-xs text-site-muted">Raises the verification level and pauses invites until the raid ends.</p>
          </div>
          <div className="space-y-2">
            <label className={label}>Raid mode length (minutes)</label>
            <Input type="number" min={1} max={120} value={c.lockdown_minutes} disabled={!c.enabled}
              onChange={(e) => setC({ ...c, lockdown_minutes: num(e.target.value) })} className="py-6 text-lg font-bold" />
          </div>
        </div>

        <div className="space-y-2">
          <label className={label}>Log channel</label>
          <Select value={c.log_channel_id || "none"} disabled={!c.enabled} onValueChange={(v) => setC({ ...c, log_channel_id: v === "none" ? null : v })}>
            <SelectTrigger className="w-full h-12 bg-site-card border-site-ink/10 text-left">
              <SelectValue placeholder="Select a log channel..." />
            </SelectTrigger>
            <SelectContent className="bg-site-card border-site-ink/10">
              <SelectItem value="none" className="focus:bg-site-ink/10">No logs</SelectItem>
              {textChannels.map((ch: any) => (
                <SelectItem key={ch.id} value={String(ch.id)} className="focus:bg-site-ink/10"># {ch.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className={label}>Exempt roles</label>
          <MultiPick items={pickRoles} value={c.whitelist_role_ids || []} onChange={(v) => setC({ ...c, whitelist_role_ids: v })}
            placeholder="Members with these roles are never removed" disabled={!c.enabled} prefix="@" />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={saving} className="px-8 py-6 font-bold">{saving ? "Saving..." : "Save Changes"}</Button>
        <Button type="button" variant="outline" disabled={raidBusy || !c.enabled} onClick={toggleRaid} className="px-8 py-6 font-bold">
          {c.raid_active ? "Stop Raid Mode" : "Start Raid Mode"}
        </Button>
      </div>
    </form>
  );
}
