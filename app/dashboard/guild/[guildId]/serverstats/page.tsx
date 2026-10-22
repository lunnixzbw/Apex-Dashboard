"use client";

import React, { useEffect, useState } from "react";
import { Trash2, Plus, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { card, field, lbl, hint, PageTitle } from "@/components/dashboard/ui-bits";

export default function ServerStatsPage({ params }: { params: { guildId: string } }) {
  const gid = params.guildId;
  const [data, setData] = useState<any>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [kind, setKind] = useState("voice");
  const [metric, setMetric] = useState("all_members");
  const [roleId, setRoleId] = useState("");
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => api.getServerStats(gid).then(setData).catch(() => toast.error("Failed to load"));
  useEffect(() => { load(); api.getRoles(gid).then((r) => setRoles(r as any[])); }, [gid]);
  if (!data) return <div className="p-10 text-slate-400">Loading…</div>;

  const run = async (fn: () => Promise<any>, ok: string) => {
    setBusy(true);
    try { const r = await fn(); toast.success(ok); if (r?.items) setData((d: any) => ({ ...d, items: r.items })); else load(); }
    catch (e: any) { toast.error(e?.message || "Failed"); } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageTitle title="Stats Channels" sub="Live counters shown as channel names. Voice channels can't be joined and text channels can't be written in." />
      <div className={card + " space-y-4"}>
        <div><label className={lbl}>Channel type</label>
          <select className={field} value={kind} onChange={(e) => setKind(e.target.value)}><option value="voice">Voice channel (recommended)</option><option value="text">Text channel</option></select></div>
        <button disabled={busy} onClick={() => run(() => api.addServerStat(gid, { defaults: true, kind }), "Default counters created")} className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black disabled:opacity-50"><Plus className="h-4 w-4" />Create defaults (All Members, Members, Bots)</button>
        <hr className="border-slate-800" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={lbl}>Counter</label>
            <select className={field} value={metric} onChange={(e) => setMetric(e.target.value)}>{data.metrics.map((m: any) => <option key={m.id} value={m.id}>{m.label}</option>)}</select></div>
          <div><label className={lbl}>Custom label (optional)</label><input className={field} maxLength={40} value={label} onChange={(e) => setLabel(e.target.value)} /></div>
          {metric === "role_members" && (
            <div className="sm:col-span-2"><label className={lbl}>Role to count</label>
              <select className={field} value={roleId} onChange={(e) => setRoleId(e.target.value)}><option value="">Pick a role…</option>{roles.filter((r: any) => r.name !== "@everyone").map((r: any) => <option key={r.id} value={r.id}>@{r.name}</option>)}</select></div>
          )}
        </div>
        <button disabled={busy} onClick={() => run(() => api.addServerStat(gid, { metric, kind, role_id: roleId || undefined, label: label || undefined }), "Counter added")} className="flex items-center gap-2 rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-200 disabled:opacity-50"><Plus className="h-4 w-4" />Add counter</button>
        <p className={hint}>Discord only lets a channel be renamed twice per 10 minutes, so numbers update every few minutes.</p>
      </div>
      <div className={card + " space-y-3"}>
        <div className="flex items-center justify-between"><h3 className="font-bold text-white">Counters</h3>
          <button disabled={busy} onClick={() => run(() => api.refreshServerStats(gid), "Refreshed")} className="flex items-center gap-1 text-xs font-semibold text-primary"><RefreshCcw className="h-3 w-3" />Refresh now</button></div>
        {data.items.length === 0 && <p className="text-sm text-slate-500">None yet.</p>}
        {data.items.map((i: any) => (
          <div key={i.id} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
            <div><p className="font-bold text-slate-100">{i.current || i.label}</p><p className="text-xs text-slate-500">{i.metric} | {i.kind}</p></div>
            <button disabled={busy} onClick={() => run(() => api.deleteServerStat(gid, i.id), "Removed")} className="rounded-lg p-2 text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
