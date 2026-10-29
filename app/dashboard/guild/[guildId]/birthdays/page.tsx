"use client";

import React, { useEffect, useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { card, field, lbl, hint, ToggleRow, PageTitle, ChannelSelect, RoleSelect, textChannels } from "@/components/dashboard/ui-bits";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function BirthdaysPage({ params }: { params: { guildId: string } }) {
  const gid = params.guildId;
  const [cfg, setCfg] = useState<any>(null);
  const [channels, setChannels] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const load = () => Promise.all([api.getBirthdays(gid), api.getChannels(gid), api.getRoles(gid)])
    .then(([b, c, r]) => { setCfg(b); setChannels(textChannels(c)); setRoles(r); })
    .catch(() => toast.error("Failed to load birthdays"));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [gid]);
  if (!cfg) return <div className="p-10 text-slate-400">Loading…</div>;
  const set = (p: any) => setCfg((c: any) => ({ ...c, ...p }));

  const save = async () => {
    setSaving(true);
    try {
      await api.updateBirthdays(gid, { enabled: cfg.enabled, channel_id: cfg.channel_id || null, role_id: cfg.role_id || null, message: cfg.message, timezone: cfg.timezone });
      toast.success("Birthday settings saved");
    } catch (e: any) { toast.error(e?.message || "Failed to save"); } finally { setSaving(false); }
  };
  const remove = async (id: string) => {
    try { await api.deleteBirthday(gid, id); toast.success("Removed"); load(); } catch (e: any) { toast.error(e?.message || "Failed"); }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageTitle title="Birthdays" sub="Members set their birthday with /birthday set. Apex announces it and can give a role for the day." />
      <div className={card + " space-y-5"}>
        <ToggleRow title="Enabled" help="Announce birthdays and give the birthday role." checked={cfg.enabled} onChange={(v) => set({ enabled: v })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={lbl}>Announcement channel</label><ChannelSelect value={cfg.channel_id} onChange={(v) => set({ channel_id: v })} channels={channels} /></div>
          <div><label className={lbl}>Birthday role (optional)</label><RoleSelect value={cfg.role_id} onChange={(v) => set({ role_id: v })} roles={roles} /></div>
        </div>
        <div><label className={lbl}>Server timezone (UTC offset)</label><p className={hint}>A birthday starts at midnight in this timezone. Example: +5:30, -4, 0.</p>
          <input className={field} value={cfg.timezone} onChange={(e) => set({ timezone: e.target.value })} /></div>
        <div><label className={lbl}>Message</label><p className={hint}>Variables: {"{user} {username} {server} {age}"}</p>
          <textarea rows={3} className={field} value={cfg.message} onChange={(e) => set({ message: e.target.value })} /></div>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black disabled:opacity-50"><Save className="h-4 w-4" />{saving ? "Saving…" : "Save"}</button>
      </div>

      <div className={card}>
        <h2 className="mb-4 text-lg font-bold text-white">Saved birthdays ({cfg.items.length})</h2>
        {cfg.items.length === 0 && <p className="text-sm text-slate-400">Nobody has set a birthday yet.</p>}
        <div className="divide-y divide-slate-800">
          {cfg.items.map((b: any) => (
            <div key={b.user_id} className="flex items-center justify-between py-2.5 text-sm">
              <span className="text-slate-200">{b.name || b.user_id}</span>
              <span className="flex items-center gap-4"><span className="text-slate-400">{b.day} {MONTHS[b.month - 1]}{b.year ? ` ${b.year}` : ""}</span>
                <button onClick={() => remove(b.user_id)} className="text-slate-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
