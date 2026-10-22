"use client";

import React, { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { card, field, lbl, hint, ToggleRow, PageTitle, ChannelSelect, textChannels } from "@/components/dashboard/ui-bits";

export default function StarboardPage({ params }: { params: { guildId: string } }) {
  const gid = params.guildId;
  const [cfg, setCfg] = useState<any>(null);
  const [channels, setChannels] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api.getStarboard(gid), api.getChannels(gid)])
      .then(([s, c]) => { setCfg(s); setChannels(textChannels(c)); })
      .catch(() => toast.error("Failed to load starboard"));
  }, [gid]);
  if (!cfg) return <div className="p-10 text-slate-400">Loading…</div>;
  const set = (p: any) => setCfg((c: any) => ({ ...c, ...p }));

  const save = async () => {
    setSaving(true);
    try {
      await api.updateStarboard(gid, { enabled: cfg.enabled, channel_id: cfg.channel_id || null, threshold: Number(cfg.threshold), emoji: cfg.emoji, self_star: cfg.self_star, ignore_nsfw: cfg.ignore_nsfw });
      toast.success("Starboard saved");
    } catch (e: any) { toast.error(e?.message || "Failed to save"); } finally { setSaving(false); }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageTitle title="Starboard" sub="Messages that collect enough reactions are reposted in a highlights channel." />
      <div className={card + " space-y-5"}>
        <ToggleRow title="Enabled" checked={cfg.enabled} onChange={(v) => set({ enabled: v })} />
        <div><label className={lbl}>Starboard channel</label><ChannelSelect value={cfg.channel_id} onChange={(v) => set({ channel_id: v })} channels={channels} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={lbl}>Reactions needed</label><input type="number" min={1} max={50} className={field} value={cfg.threshold} onChange={(e) => set({ threshold: e.target.value })} /></div>
          <div><label className={lbl}>Reaction emoji</label><p className={hint}>A normal emoji or a custom one like {"<:name:123456789>"}.</p>
            <input className={field} value={cfg.emoji} onChange={(e) => set({ emoji: e.target.value })} /></div>
        </div>
        <ToggleRow title="Allow self-starring" help="Count the author's own reaction." checked={cfg.self_star} onChange={(v) => set({ self_star: v })} />
        <ToggleRow title="Ignore NSFW channels" checked={cfg.ignore_nsfw} onChange={(v) => set({ ignore_nsfw: v })} />
        <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black disabled:opacity-50"><Save className="h-4 w-4" />{saving ? "Saving…" : "Save"}</button>
      </div>
    </div>
  );
}
