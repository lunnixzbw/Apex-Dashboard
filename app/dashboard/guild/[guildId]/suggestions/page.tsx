"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Save, Check, X, Clock, Rocket, Trash2, ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { card, field, lbl, hint, ToggleRow, PageTitle, ChannelSelect, RoleSelect, textChannels } from "@/components/dashboard/ui-bits";

const badge: Record<string, string> = {
  pending: "bg-slate-500/20 text-slate-300", considering: "bg-amber-500/15 text-amber-400", approved: "bg-emerald-500/15 text-emerald-400",
  implemented: "bg-emerald-500/15 text-emerald-400", denied: "bg-red-500/15 text-red-400",
};

export default function SuggestionsPage({ params }: { params: { guildId: string } }) {
  const gid = params.guildId;
  const [cfg, setCfg] = useState<any>(null);
  const [channels, setChannels] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [data, setData] = useState<any>({ counts: { total: 0 }, items: [], total: 0 });
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState<number | null>(null);

  const loadList = useCallback(async () => {
    try {
      const qs = new URLSearchParams({ page: String(page), limit: "20" });
      if (status) qs.set("status", status);
      setData(await api.getSuggestions(gid, qs.toString()));
    } catch { toast.error("Failed to load suggestions"); }
  }, [gid, page, status]);

  useEffect(() => {
    Promise.all([api.getSuggestionSettings(gid), api.getChannels(gid), api.getRoles(gid)])
      .then(([s, c, r]) => { setCfg(s); setChannels(textChannels(c)); setRoles(r); })
      .catch(() => toast.error("Failed to load settings"));
  }, [gid]);
  useEffect(() => { loadList(); }, [loadList]);

  if (!cfg) return <div className="p-10 text-slate-400">Loading…</div>;
  const set = (p: any) => setCfg((c: any) => ({ ...c, ...p }));

  const save = async () => {
    setSaving(true);
    try {
      await api.updateSuggestionSettings(gid, { enabled: cfg.enabled, channel_id: cfg.channel_id || null, notify: cfg.notify, threads: cfg.threads, manager_role_id: cfg.manager_role_id || null });
      toast.success("Suggestion settings saved");
    } catch (e: any) { toast.error(e?.message || "Failed to save"); } finally { setSaving(false); }
  };
  const act = async (id: number, st: string) => {
    setBusy(id);
    try { await api.setSuggestionStatus(gid, id, st, notes[id] || ""); toast.success("Updated. The suggester was notified"); await loadList(); }
    catch (e: any) { toast.error(e?.message || "Failed"); } finally { setBusy(null); }
  };
  const del = async (id: number) => {
    if (!confirm("Delete this suggestion and its message?")) return;
    try { await api.deleteSuggestion(gid, id); await loadList(); } catch (e: any) { toast.error(e?.message || "Failed"); }
  };
  const pages = Math.max(1, Math.ceil(data.total / 20));
  const c = data.counts;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageTitle title="Suggestions" sub="Any message in the suggestion channel becomes an embed with upvote/downvote buttons and a thread." />

      <div className={card + " space-y-5"}>
        <ToggleRow title="Enabled" checked={cfg.enabled} onChange={(v) => set({ enabled: v })} />
        <div><label className={lbl}>Suggestion channel</label><p className={hint}>Apex needs View Channel, Send Messages, Embed Links, Manage Messages and Create Public Threads here.</p>
          <ChannelSelect value={cfg.channel_id} onChange={(v) => set({ channel_id: v })} channels={channels} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={lbl}>Tell the suggester about the result</label>
            <select className={field} value={cfg.notify} onChange={(e) => set({ notify: e.target.value })}>
              <option value="dm">In their DMs</option><option value="channel">In the suggestion channel</option><option value="both">Both</option>
            </select></div>
          <div><label className={lbl}>Review role (optional)</label><RoleSelect value={cfg.manager_role_id} onChange={(v) => set({ manager_role_id: v })} roles={roles} /></div>
        </div>
        <ToggleRow title="Create a thread for every suggestion" checked={cfg.threads} onChange={(v) => set({ threads: v })} />
        <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black disabled:opacity-50"><Save className="h-4 w-4" />{saving ? "Saving…" : "Save"}</button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-white">Review ({c.total || 0})</h2>
        <select className={field + " !w-auto"} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          {["pending", "considering", "approved", "implemented", "denied"].map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>
      {data.items.length === 0 && <div className={card + " text-center text-slate-400"}>No suggestions yet.</div>}
      <div className="space-y-3">
        {data.items.map((s: any) => (
          <div key={s.id} className={card + " !p-5 space-y-3"}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {s.avatar ? <img src={s.avatar} alt="" className="h-9 w-9 rounded-full" /> : <div className="h-9 w-9 rounded-full bg-slate-700" />}
                <div><p className="font-bold text-white">#{s.number} · {s.username || s.user_id}</p><p className="text-xs text-slate-500">{new Date(s.created_at).toLocaleString()}</p></div>
              </div>
              <span className={`rounded-lg px-2.5 py-1 text-xs font-bold capitalize ${badge[s.status]}`}>{s.status}</span>
            </div>
            <p className="whitespace-pre-wrap text-sm text-slate-300">{s.content}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {s.image_url && <img src={s.image_url} alt="" className="max-h-48 rounded-lg" />}
            <div className="flex items-center gap-4 text-sm text-slate-400"><span className="flex items-center gap-1"><ThumbsUp className="h-4 w-4 text-emerald-400" />{s.up}</span><span className="flex items-center gap-1"><ThumbsDown className="h-4 w-4 text-red-400" />{s.down}</span></div>
            {s.note && <p className="text-sm text-slate-400"><b>Staff response:</b> {s.note}</p>}
            <input className={field} placeholder="Note to the suggester (optional)" value={notes[s.id] || ""} onChange={(e) => setNotes({ ...notes, [s.id]: e.target.value })} />
            <div className="flex flex-wrap gap-2">
              <button disabled={busy === s.id} onClick={() => act(s.id, "implemented")} className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-sm font-bold text-white disabled:opacity-50"><Rocket className="h-4 w-4" />Implemented</button>
              <button disabled={busy === s.id} onClick={() => act(s.id, "approved")} className="flex items-center gap-1.5 rounded-xl bg-slate-700 px-3.5 py-2 text-sm font-bold text-white disabled:opacity-50"><Check className="h-4 w-4" />Approve</button>
              <button disabled={busy === s.id} onClick={() => act(s.id, "considering")} className="flex items-center gap-1.5 rounded-xl bg-amber-500/80 px-3.5 py-2 text-sm font-bold text-black disabled:opacity-50"><Clock className="h-4 w-4" />Consider</button>
              <button disabled={busy === s.id} onClick={() => act(s.id, "denied")} className="flex items-center gap-1.5 rounded-xl bg-red-500 px-3.5 py-2 text-sm font-bold text-white disabled:opacity-50"><X className="h-4 w-4" />Deny</button>
              <button onClick={() => del(s.id)} className="ml-auto rounded-xl bg-slate-800 px-3 py-2 text-slate-400 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
      {pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-white disabled:opacity-40">Prev</button>
          <span className="text-sm text-slate-400">Page {page} / {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-white disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
