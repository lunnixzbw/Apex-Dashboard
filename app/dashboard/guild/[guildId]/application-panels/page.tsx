"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2, Save, ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { MultiPick } from "@/components/dashboard/multi-pick";

const card = "rounded-3xl border border-slate-800 bg-[#141B2D] p-6";
const field = "w-full rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2.5 text-sm text-white outline-none focus:border-slate-600";
const lbl = "mb-1.5 block text-sm font-bold text-slate-200";

const toHex = (c: any) => (typeof c === "number" ? `#${c.toString(16).padStart(6, "0")}` : typeof c === "string" && c ? (c.startsWith("#") ? c : `#${c}`) : "#5865f2");

export default function ApplicationPanelsPage({ params }: { params: { guildId: string } }) {
  const gid = params.guildId;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [limits, setLimits] = useState({ panels: 3 });
  const [premium, setPremium] = useState(false);
  const [panels, setPanels] = useState<any[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [edit, setEdit] = useState<any | null>(null);

  const load = async () => {
    try {
      const [p, f, c] = await Promise.all([api.getAppPanels(gid), api.getApplications(gid), api.getChannels(gid)]);
      setPanels(p.items); setLimits(p.limits); setPremium(!!p.premium); setForms(f.items);
      setChannels(c.filter((x: any) => x.type === "0" || x.type === "5"));
    } catch { toast.error("Failed to load panels"); } finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [gid]);

  const save = async (publish = false) => {
    if (!edit.name.trim()) return toast.error("Give the panel a name.");
    if (publish && !edit.channel_id) return toast.error("Pick a channel to post the panel in.");
    setSaving(true);
    try {
      const body = { name: edit.name, title: edit.title, description: edit.description, style: edit.style, color: toHex(edit.color), channel_id: edit.channel_id || null, form_ids: edit.form_ids, thumbnail_url: edit.thumbnail_url || null, image_url: edit.image_url || null };
      const saved = edit.id ? await api.updateAppPanel(gid, edit.id, body) : await api.createAppPanel(gid, body);
      if (publish) await api.publishAppPanel(gid, saved.id);
      toast.success(publish ? "Panel saved and posted" : "Panel saved");
      setEdit(null); await load();
    } catch (e: any) { toast.error(e?.message || "Failed to save"); } finally { setSaving(false); }
  };
  const del = async (p: any) => {
    if (!confirm(`Delete panel "${p.name}"?`)) return;
    try { await api.deleteAppPanel(gid, p.id); toast.success("Deleted"); load(); } catch (e: any) { toast.error(e?.message || "Failed"); }
  };

  if (loading) return <div className="p-10 text-slate-400">Loading…</div>;

  if (!edit) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h1 className="text-2xl font-extrabold text-white">Application Panels</h1><p className="text-sm text-slate-400">{panels.length}/{limits.panels} panels. Members click a panel to apply.</p></div>
          <button disabled={panels.length >= limits.panels} onClick={() => setEdit({ id: 0, name: "", title: "Applications", description: "Click below to apply.", style: "buttons", color: "#5865f2", channel_id: "", form_ids: [], thumbnail_url: "", image_url: "" })}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-black disabled:opacity-40"><Plus className="h-4 w-4" />Create panel</button>
        </div>
        {forms.length === 0 && <div className={card + " text-slate-400"}>Create an application first in the <b>Applications</b> tab.</div>}
        <div className="grid gap-4 md:grid-cols-2">
          {panels.map((p) => (
            <div key={p.id} className={card}>
              <h3 className="text-lg font-bold text-white">{p.name}</h3>
              <p className="text-xs text-slate-500">{p.form_ids.length} application(s) · {p.message_id ? "Posted" : "Not posted yet"}</p>
              <div className="mt-4 flex gap-2">
                <button onClick={() => setEdit({ ...p, color: toHex(p.color), channel_id: p.channel_id || "" })} className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700">Edit</button>
                <button onClick={() => del(p)} className="rounded-xl bg-red-500/10 px-3 py-2 text-red-400 hover:bg-red-500/20"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const set = (patch: any) => setEdit((e: any) => ({ ...e, ...patch }));
  const formItems = forms.map((f) => ({ id: String(f.id), name: f.name }));
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => setEdit(null)} className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" />Back</button>
        <div className="flex gap-2">
          <button onClick={() => save(false)} disabled={saving} className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"><Save className="h-4 w-4" />Save</button>
          <button onClick={() => save(true)} disabled={saving} className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-black disabled:opacity-50"><Send className="h-4 w-4" />Save &amp; post</button>
        </div>
      </div>
      <div className={card + " space-y-4"}>
        <div><label className={lbl}>Panel name (dashboard only)</label><input className={field} maxLength={60} value={edit.name} onChange={(e) => set({ name: e.target.value })} /></div>
        <div><label className={lbl}>Applications on this panel</label>
          <MultiPick items={formItems} value={edit.form_ids.map(String)} onChange={(v) => set({ form_ids: v.map(Number) })} placeholder="Add application" max={25} /></div>
        <div><label className={lbl}>Channel to post in</label>
          <select className={field} value={edit.channel_id} onChange={(e) => set({ channel_id: e.target.value })}>
            <option value="">Select a channel…</option>{channels.map((c: any) => <option key={c.id} value={c.id}>#{c.name}</option>)}
          </select></div>
        <div><label className={lbl}>Embed title</label><input className={field} maxLength={100} value={edit.title} onChange={(e) => set({ title: e.target.value })} /></div>
        <div><label className={lbl}>Embed description</label><textarea rows={4} className={field} maxLength={1500} value={edit.description} onChange={(e) => set({ description: e.target.value })} /></div>
        <div><label className={lbl}>Thumbnail URL</label><input className={field} placeholder="Leave empty to use the server icon" value={edit.thumbnail_url || ""} onChange={(e) => set({ thumbnail_url: e.target.value })} /></div>
        <div><label className={lbl}>Large image URL{!premium && <span className="ml-2 rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-400">Premium</span>}</label>
          <input disabled={!premium} className={field + (premium ? "" : " opacity-50")} placeholder={premium ? "https://…" : "Requires Apex Premium"} value={edit.image_url || ""} onChange={(e) => set({ image_url: e.target.value })} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={lbl}>Style</label>
            <select className={field} value={edit.style} onChange={(e) => set({ style: e.target.value })}>
              <option value="buttons">Buttons (up to 5 applications)</option><option value="dropdown">Dropdown</option>
            </select></div>
          <div><label className={lbl}>Colour</label><input type="color" className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900/40" value={toHex(edit.color)} onChange={(e) => set({ color: e.target.value })} /></div>
        </div>
      </div>
      <div className={card}>
        <p className="mb-3 text-xs font-bold uppercase text-slate-500">Preview</p>
        <div className="rounded-lg border-l-4 bg-[#2b2d31] p-4" style={{ borderColor: toHex(edit.color) }}>
          <p className="font-bold text-white">{edit.title}</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-300">{edit.description}</p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {edit.form_ids.map((id: number) => <span key={id} className="rounded-md bg-[#5865f2] px-4 py-1.5 text-sm font-semibold text-white">{forms.find((f) => f.id === id)?.name || id}</span>)}
        </div>
      </div>
    </div>
  );
}
