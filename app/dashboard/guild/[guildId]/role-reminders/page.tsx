"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { card, field, lbl, hint, PageTitle, ChannelSelect, RoleSelect, textChannels } from "@/components/dashboard/ui-bits";

export default function RoleRemindersPage({ params }: { params: { guildId: string } }) {
  const gid = params.guildId;
  const [items, setItems] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [form, setForm] = useState({ role_id: "", channel_id: "", time: "1h", message: "" });
  const [busy, setBusy] = useState(false);

  const load = () => Promise.all([api.getRoleReminders(gid), api.getChannels(gid), api.getRoles(gid)])
    .then(([i, c, r]) => { setItems(i); setChannels(textChannels(c)); setRoles(r); })
    .catch(() => toast.error("Failed to load role reminders"));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [gid]);

  const roleName = (id: string) => roles.find((r) => r.id === id)?.name || id;
  const chName = (id: string) => channels.find((c) => c.id === id)?.name || id;

  const create = async () => {
    setBusy(true);
    try { await api.createRoleReminder(gid, form); toast.success("Reminder scheduled"); setForm({ ...form, message: "" }); load(); }
    catch (e: any) { toast.error(e?.message || "Failed"); } finally { setBusy(false); }
  };
  const del = async (id: number) => { try { await api.deleteRoleReminder(gid, id); load(); } catch (e: any) { toast.error(e?.message || "Failed"); } };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageTitle title="Role Reminders" sub="Ping a whole role at a later time. Same as the remindrole command." />
      <div className={card + " space-y-4"}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={lbl}>Role to ping</label><RoleSelect value={form.role_id} onChange={(v) => setForm({ ...form, role_id: v })} roles={roles} placeholder="Select a role" /></div>
          <div><label className={lbl}>Channel</label><ChannelSelect value={form.channel_id} onChange={(v) => setForm({ ...form, channel_id: v })} channels={channels} /></div>
        </div>
        <div><label className={lbl}>In how long</label><p className={hint}>Examples: 30m, 2h, 1d, 1w (10 seconds to 90 days).</p>
          <input className={field} value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
        <div><label className={lbl}>Message</label><textarea rows={3} maxLength={1500} className={field} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
        <button onClick={create} disabled={busy || !form.role_id || !form.channel_id || !form.message.trim()} className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black disabled:opacity-40"><Plus className="h-4 w-4" />Schedule reminder</button>
      </div>
      <div className={card}>
        <h2 className="mb-4 text-lg font-bold text-white">Pending ({items.length})</h2>
        {items.length === 0 && <p className="text-sm text-slate-400">No pending role reminders.</p>}
        <div className="divide-y divide-slate-800">
          {items.map((r) => (
            <div key={r.id} className="flex items-start justify-between gap-3 py-3 text-sm">
              <div className="min-w-0">
                <p className="font-bold text-slate-200">@{roleName(r.role_id)} in #{chName(r.channel_id)}</p>
                <p className="text-xs text-slate-500">{new Date(r.trigger_at).toLocaleString()}</p>
                <p className="mt-1 whitespace-pre-wrap text-slate-300">{r.message}</p>
              </div>
              <button onClick={() => del(r.id)} className="shrink-0 p-2 text-slate-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
