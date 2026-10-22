"use client";

import React, { useEffect, useState } from "react";
import { Save, Send } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const card = "rounded-3xl border border-slate-800 bg-[#141B2D] p-6";
const field = "w-full rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2.5 text-sm text-white outline-none focus:border-slate-600";
const lbl = "mb-1.5 block text-sm font-bold text-slate-200";
const hint = "mb-2 text-[11px] italic text-slate-500";

export default function BoostPage({ params }: { params: { guildId: string } }) {
  const gid = params.guildId;
  const [cfg, setCfg] = useState<any>(null);
  const [channels, setChannels] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api.getBoost(gid), api.getChannels(gid)])
      .then(([b, c]) => { setCfg(b); setChannels(c.filter((x: any) => x.type === "0" || x.type === "5")); })
      .catch(() => toast.error("Failed to load boost settings"));
  }, [gid]);

  const set = (patch: any) => setCfg((c: any) => ({ ...c, ...patch }));

  const save = async (test = false) => {
    setSaving(true);
    try {
      await api.updateBoost(gid, {
        enabled: cfg.enabled, channel_id: cfg.channel_id || null, title: cfg.title, message: cfg.message,
        color: cfg.color || null, thumbnail_url: cfg.thumbnail_url || null, image_url: cfg.image_url || null, footer: cfg.footer,
      });
      if (test) { await api.testBoost(gid); toast.success("Saved. Test message sent"); } else toast.success("Boost message saved");
    } catch (e: any) { toast.error(e?.message || "Failed to save"); } finally { setSaving(false); }
  };

  if (!cfg) return <div className="p-10 text-slate-400">Loading…</div>;

  const sample = (t: string) => (t || "").replace(/\{user\}|\{mention\}/gi, "@Booster").replace(/\{username\}/gi, "Booster").replace(/\{server\}/gi, "Your Server").replace(/\{boosts\}/gi, "14").replace(/\{level\}/gi, "3").replace(/\{boost\}/gi, "🚀");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div><h1 className="text-2xl font-extrabold text-white">Boost Message</h1><p className="text-sm text-slate-400">An embed Apex posts to thank members when they boost your server.</p></div>

      <div className={card + " space-y-5"}>
        <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
          <div><span className="text-sm font-bold text-slate-200">Enabled</span><p className="text-[11px] italic text-slate-500">Thank members whenever they boost.</p></div>
          <button type="button" onClick={() => set({ enabled: !cfg.enabled })} className={`relative h-6 w-11 rounded-full transition ${cfg.enabled ? "bg-emerald-500" : "bg-slate-700"}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${cfg.enabled ? "left-[22px]" : "left-0.5"}`} />
          </button>
        </div>
        <div><label className={lbl}>Channel</label>
          <select className={field} value={cfg.channel_id || ""} onChange={(e) => set({ channel_id: e.target.value })}>
            <option value="">Select a channel…</option>{channels.map((c: any) => <option key={c.id} value={c.id}>#{c.name}</option>)}
          </select></div>
        <p className={hint}>Variables: {"{user} {username} {server} {boosts} {level} {boost}"}. In image fields you can also use {"{user_avatar}"} and {"{server_icon}"}.</p>
        <div><label className={lbl}>Title</label><input className={field} maxLength={256} value={cfg.title} onChange={(e) => set({ title: e.target.value })} /></div>
        <div><label className={lbl}>Description</label><textarea rows={4} className={field} maxLength={2000} value={cfg.message} onChange={(e) => set({ message: e.target.value })} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={lbl}>Colour</label>
            <div className="flex gap-2"><input type="color" className="h-11 w-14 rounded-xl border border-slate-800 bg-slate-900/40" value={cfg.color || "#2b2d31"} onChange={(e) => set({ color: e.target.value })} />
              <input className={field} placeholder="#F47FFF" value={cfg.color || ""} onChange={(e) => set({ color: e.target.value })} /></div></div>
          <div><label className={lbl}>Footer</label><input className={field} maxLength={200} value={cfg.footer} onChange={(e) => set({ footer: e.target.value })} /></div>
        </div>
        <div><label className={lbl}>Thumbnail URL</label><p className={hint}>Small image on the right. Empty = the booster&apos;s avatar.</p>
          <input className={field} placeholder="https://… or {server_icon}" value={cfg.thumbnail_url || ""} onChange={(e) => set({ thumbnail_url: e.target.value })} /></div>
        <div><label className={lbl}>Large image URL</label><p className={hint}>Big image at the bottom of the embed.</p>
          <input className={field} placeholder="https://…" value={cfg.image_url || ""} onChange={(e) => set({ image_url: e.target.value })} /></div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => save(false)} disabled={saving} className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black disabled:opacity-50"><Save className="h-4 w-4" />Save</button>
          <button onClick={() => save(true)} disabled={saving || !cfg.channel_id} className="flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"><Send className="h-4 w-4" />Save &amp; send test</button>
        </div>
      </div>

      <div className={card}>
        <p className="mb-3 text-xs font-bold uppercase text-slate-500">Preview</p>
        <div className="rounded-lg border-l-4 bg-[#2b2d31] p-4" style={{ borderColor: cfg.color || "#2b2d31" }}>
          <div className="flex justify-between gap-4">
            <div className="min-w-0">
              {cfg.title && <p className="font-bold text-white">{sample(cfg.title)}</p>}
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-300">{sample(cfg.message)}</p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {cfg.thumbnail_url && /^https?:/.test(cfg.thumbnail_url) ? <img src={cfg.thumbnail_url} alt="" className="h-16 w-16 rounded-md object-cover" /> : <div className="h-16 w-16 shrink-0 rounded-md bg-slate-700" />}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {cfg.image_url && /^https?:/.test(cfg.image_url) && <img src={cfg.image_url} alt="" className="mt-3 max-h-56 rounded-md" />}
          {cfg.footer && <p className="mt-3 text-[11px] text-slate-400">{sample(cfg.footer)}</p>}
        </div>
      </div>
    </div>
  );
}
