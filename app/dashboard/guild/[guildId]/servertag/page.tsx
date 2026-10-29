"use client";

import React, { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const card = "rounded-3xl border border-slate-800 bg-[#141B2D] p-6";
const field = "w-full rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2.5 text-sm text-white outline-none focus:border-slate-600";
const lbl = "mb-1.5 block text-sm font-bold text-slate-200";

export default function ServerTagPage({ params }: { params: { guildId: string } }) {
  const gid = params.guildId;
  const [cfg, setCfg] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { api.getServerTag(gid).then(setCfg).catch(() => toast.error("Failed to load")); }, [gid]);
  if (!cfg) return <div className="p-10 text-slate-400">Loading…</div>;

  const set = (patch: any) => setCfg((c: any) => ({ ...c, ...patch }));
  const save = async () => {
    if (!cfg.tag.trim()) return toast.error("Enter the tag text.");
    setSaving(true);
    try { await api.updateServerTag(gid, { tag: cfg.tag, position: cfg.position, enabled: cfg.enabled }); toast.success("Tag saved"); }
    catch (e: any) { toast.error(e?.message || "Failed to save"); } finally { setSaving(false); }
  };
  const base = "Username";
  const shown = cfg.position === "prefix" ? `${cfg.tag} ${base}` : `${base} ${cfg.tag}`;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div><h1 className="text-2xl font-extrabold text-white">Server Tag</h1>
        <p className="text-sm text-slate-400">Members type <b>tag</b> to add this tag to their nickname (type it again to remove). Only admins can set it up here or with <code>tagset</code>.</p></div>
      <div className={card + " space-y-5"}>
        <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
          <span className="text-sm font-bold text-slate-200">Enabled</span>
          <button type="button" onClick={() => set({ enabled: !cfg.enabled })} className={`relative h-6 w-11 rounded-full transition ${cfg.enabled ? "bg-emerald-500" : "bg-slate-700"}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${cfg.enabled ? "left-[22px]" : "left-0.5"}`} />
          </button>
        </div>
        <div><label className={lbl}>Tag</label><input className={field} maxLength={20} placeholder="〢 𝐁𝐋 ⌁" value={cfg.tag} onChange={(e) => set({ tag: e.target.value })} /></div>
        <div><label className={lbl}>Position</label>
          <select className={field} value={cfg.position} onChange={(e) => set({ position: e.target.value })}>
            <option value="prefix">Prefix (before the name)</option><option value="suffix">Suffix (after the name)</option>
          </select></div>
        <div className="rounded-xl bg-slate-900/50 p-3 text-sm text-slate-300"><span className="text-xs font-bold uppercase text-slate-500">Preview </span>{cfg.tag ? shown : "—"}</div>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black disabled:opacity-50"><Save className="h-4 w-4" />{saving ? "Saving…" : "Save"}</button>
      </div>
    </div>
  );
}
