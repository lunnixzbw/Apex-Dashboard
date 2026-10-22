"use client";

import React, { useEffect, useState } from "react";
import { Save, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { card, field, lbl, hint, ToggleRow, PageTitle, ChannelSelect, RoleSelect, textChannels } from "@/components/dashboard/ui-bits";

export default function StreaksPage({ params }: { params: { guildId: string } }) {
  const gid = params.guildId;
  const [cfg, setCfg] = useState<any>(null);
  const [channels, setChannels] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api.getStreaks(gid), api.getChannels(gid), api.getRoles(gid)])
      .then(([s, c, r]) => { setCfg(s); setChannels(textChannels(c)); setRoles(r); })
      .catch(() => toast.error("Failed to load streaks"));
  }, [gid]);
  if (!cfg) return <div className="p-10 text-slate-400">Loading…</div>;
  const set = (p: any) => setCfg((c: any) => ({ ...c, ...p }));
  const setTier = (i: number, p: any) => set({ tiers: cfg.tiers.map((t: any, j: number) => (j === i ? { ...t, ...p } : t)) });

  const save = async () => {
    setSaving(true);
    try {
      await api.updateStreaks(gid, {
        enabled: cfg.enabled, remove_previous: cfg.remove_previous, channel_id: cfg.channel_id || null, message: cfg.message,
        tiers: cfg.tiers.filter((t: any) => t.role_id).map((t: any) => ({ days: Number(t.days), role_id: t.role_id })),
      });
      toast.success("Welcome streaks saved");
    } catch (e: any) { toast.error(e?.message || "Failed to save"); } finally { setSaving(false); }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageTitle title="Welcome Streaks" sub="Reward members with roles for staying in your server (for example 7, 30 and 90 days). Roles are checked every few hours." />
      <div className={card + " space-y-5"}>
        <ToggleRow title="Enabled" checked={cfg.enabled} onChange={(v) => set({ enabled: v })} />
        <ToggleRow title="Keep only the highest tier" help="When a member reaches a new tier, the older tier role is removed." checked={cfg.remove_previous} onChange={(v) => set({ remove_previous: v })} />
        <div>
          <label className={lbl}>Tiers</label>
          <p className={hint}>Up to 15 tiers. The bot&apos;s role must be above these roles.</p>
          <div className="space-y-2">
            {cfg.tiers.map((t: any, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <input type="number" min={1} className={field + " !w-28"} value={t.days} onChange={(e) => setTier(i, { days: e.target.value })} />
                <span className="text-sm text-slate-400">days →</span>
                <div className="flex-1"><RoleSelect value={t.role_id} onChange={(v) => setTier(i, { role_id: v })} roles={roles} placeholder="Select a role" /></div>
                <button onClick={() => set({ tiers: cfg.tiers.filter((_: any, j: number) => j !== i) })} className="p-2 text-slate-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
          <button onClick={() => set({ tiers: [...cfg.tiers, { days: 7, role_id: "" }] })} disabled={cfg.tiers.length >= 15} className="mt-3 flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-white disabled:opacity-40"><Plus className="h-4 w-4" />Add tier</button>
        </div>
        <div><label className={lbl}>Announcement channel (optional)</label><ChannelSelect value={cfg.channel_id} onChange={(v) => set({ channel_id: v })} channels={channels} placeholder="No announcements" /></div>
        <div><label className={lbl}>Announcement message</label><p className={hint}>Variables: {"{user} {username} {server} {days} {role}"}</p>
          <textarea rows={3} className={field} value={cfg.message} onChange={(e) => set({ message: e.target.value })} /></div>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black disabled:opacity-50"><Save className="h-4 w-4" />{saving ? "Saving…" : "Save"}</button>
      </div>
    </div>
  );
}
