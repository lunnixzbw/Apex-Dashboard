"use client";

import React, { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { card, field, lbl, hint, ToggleRow, PageTitle, ChannelSelect, textChannels } from "@/components/dashboard/ui-bits";

export default function ModLogPage({ params }: { params: { guildId: string } }) {
  const gid = params.guildId;
  const [cfg, setCfg] = useState<any>(null);
  const [channels, setChannels] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const load = () => api.getModLog(gid).then(setCfg).catch(() => toast.error("Failed to load mod log"));
  useEffect(() => { load(); api.getChannels(gid).then((c) => setChannels(textChannels(c))); }, [gid]);
  if (!cfg) return <div className="p-10 text-slate-400">Loading…</div>;
  const setW = (p: any) => setCfg((c: any) => ({ ...c, warn: { ...c.warn, ...p } }));

  const save = async () => {
    setSaving(true);
    try {
      await api.updateModLog(gid, { enabled: cfg.enabled, channel_id: cfg.channel_id || null });
      await api.updateWarnConfig(gid, { kick_at: Number(cfg.warn.kick_at), ban_at: Number(cfg.warn.ban_at), timeout_at: Number(cfg.warn.timeout_at), timeout_minutes: Number(cfg.warn.timeout_minutes) });
      toast.success("Saved");
    } catch (e: any) { toast.error(e?.message || "Failed to save"); } finally { setSaving(false); }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageTitle title="Mod Log & Warn Thresholds" sub="Every warn, mute, kick and ban gets a case number. Warns can trigger automatic actions." />
      <div className={card + " space-y-5"}>
        <ToggleRow title="Post cases in a channel" checked={cfg.enabled} onChange={(v) => setCfg({ ...cfg, enabled: v })} />
        <div><label className={lbl}>Mod log channel</label><ChannelSelect value={cfg.channel_id} onChange={(v) => setCfg({ ...cfg, channel_id: v })} channels={channels} /></div>
        <h3 className="pt-2 font-bold text-white">Warn thresholds</h3>
        <p className={hint}>When a member reaches this many warnings, Apex acts automatically. 0 turns an action off.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={lbl}>Timeout at (warns)</label><input type="number" min={0} max={100} className={field} value={cfg.warn.timeout_at} onChange={(e) => setW({ timeout_at: e.target.value })} /></div>
          <div><label className={lbl}>Timeout length (minutes)</label><input type="number" min={1} max={40320} className={field} value={cfg.warn.timeout_minutes} onChange={(e) => setW({ timeout_minutes: e.target.value })} /></div>
          <div><label className={lbl}>Kick at (warns)</label><input type="number" min={0} max={100} className={field} value={cfg.warn.kick_at} onChange={(e) => setW({ kick_at: e.target.value })} /></div>
          <div><label className={lbl}>Ban at (warns)</label><input type="number" min={0} max={100} className={field} value={cfg.warn.ban_at} onChange={(e) => setW({ ban_at: e.target.value })} /></div>
        </div>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black disabled:opacity-50"><Save className="h-4 w-4" />{saving ? "Saving…" : "Save"}</button>
      </div>

      <div className={card + " space-y-3"}>
        <h3 className="font-bold text-white">Latest cases</h3>
        {cfg.cases.length === 0 && <p className="text-sm text-slate-500">No cases yet.</p>}
        {cfg.cases.map((c: any) => (
          <div key={c.number ?? `${c.at}-${c.target_id}`} className="rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
            <p className="text-sm font-bold text-slate-100">Case #{c.number ?? "?"} | {String(c.action).toUpperCase()} <span className="font-normal text-slate-500">{new Date(c.at).toLocaleString()}</span></p>
            <p className="text-xs text-slate-400">{c.target_tag} ({c.target_id}) by {c.moderator_tag}{c.source && c.source !== "manual" ? ` [${c.source}]` : ""}</p>
            <p className="mt-1 text-xs text-slate-300">{c.reason || "No reason provided"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
