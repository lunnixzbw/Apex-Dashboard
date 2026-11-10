"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface Props {
  initial: any;
  guildId: string;
  roles: any[];
  channels: any[];
}

const label = "text-xs font-black uppercase text-site-faint tracking-widest";
const selectCls = "w-full rounded-xl bg-site-card border border-site-ink/10 text-site-ink py-3 px-4 font-bold";

export function YoutubeForm({ initial, guildId, roles, channels }: Props) {
  const [subs, setSubs] = useState<any[]>(initial.subs || []);
  const [busy, setBusy] = useState<number | "add" | null>(null);
  const [draft, setDraft] = useState({ channel: "", channel_id: "", role_id: "" });

  const textChannels = channels.filter((ch: any) => ch.type === "0" || ch.type === 0 || ch.type === "text" || ch.type === "5" || ch.type === 5 || !ch.type);
  const pickRoles = roles.filter((r: any) => r.name !== "@everyone");
  const err = (e: any) => (e?.message && e.message !== "An unknown error occurred" ? e.message : "Something went wrong");

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.channel.trim() || !draft.channel_id) { toast.error("Enter a YouTube channel and pick a Discord channel."); return; }
    setBusy("add");
    try {
      const row = await api.addYoutube(guildId, { channel: draft.channel.trim(), channel_id: draft.channel_id, role_id: draft.role_id || null });
      setSubs([...subs, row]);
      setDraft({ channel: "", channel_id: "", role_id: "" });
      toast.success(`Following ${row.name}.`);
    } catch (e2: any) { toast.error(err(e2)); } finally { setBusy(null); }
  };

  const patchLocal = (id: number, p: any) => setSubs(subs.map((s) => (s.id === id ? { ...s, ...p } : s)));

  const save = async (s: any) => {
    setBusy(s.id);
    try {
      await api.updateYoutube(guildId, s.id, {
        channel_id: s.channel_id, role_id: s.role_id || "", message: s.message || "",
        notify_videos: s.notify_videos, notify_shorts: s.notify_shorts, notify_live: s.notify_live,
      });
      toast.success("Saved!");
    } catch (e: any) { toast.error(err(e)); } finally { setBusy(null); }
  };

  const remove = async (s: any) => {
    setBusy(s.id);
    try { await api.deleteYoutube(guildId, s.id); setSubs(subs.filter((x) => x.id !== s.id)); toast.success("Removed."); }
    catch (e: any) { toast.error(err(e)); } finally { setBusy(null); }
  };

  return (
    <div className="space-y-6 pb-20">
      <form onSubmit={add} className="bg-site-card border border-site-ink/10 rounded-3xl p-8 space-y-6 shadow-xl shadow-black/20">
        <div>
          <span className="text-sm font-bold text-site-body">Follow a channel</span>
          <p className="text-xs text-site-muted mt-1">{subs.length} / {initial.max} used. Paste a channel link or @handle.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={label}>YouTube channel</label>
            <Input value={draft.channel} onChange={(e) => setDraft({ ...draft, channel: e.target.value })} placeholder="@handle or link" className="py-6 font-bold" />
          </div>
          <div className="space-y-2">
            <label className={label}>Post in</label>
            <select value={draft.channel_id} onChange={(e) => setDraft({ ...draft, channel_id: e.target.value })} className={selectCls}>
              <option value="">Select a channel...</option>
              {textChannels.map((ch: any) => <option key={ch.id} value={String(ch.id)}># {ch.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className={label}>Ping role (optional)</label>
            <select value={draft.role_id} onChange={(e) => setDraft({ ...draft, role_id: e.target.value })} className={selectCls}>
              <option value="">No ping</option>
              {pickRoles.map((r: any) => <option key={r.id} value={String(r.id)}>@{r.name}</option>)}
            </select>
          </div>
        </div>
        <Button type="submit" disabled={busy === "add" || subs.length >= initial.max} className="px-8 py-6 font-bold">{busy === "add" ? "Adding..." : "Add Channel"}</Button>
      </form>

      {subs.map((s) => (
        <div key={s.id} className="bg-site-card border border-site-ink/10 rounded-3xl p-8 space-y-6 shadow-xl shadow-black/20">
          <div className="flex items-center justify-between border-b border-site-ink/10 pb-4">
            <span className="text-lg font-bold text-site-ink">{s.name}</span>
            <Button type="button" variant="outline" disabled={busy === s.id} onClick={() => remove(s)} className="font-bold">Remove</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={label}>Post in</label>
              <select value={s.channel_id} onChange={(e) => patchLocal(s.id, { channel_id: e.target.value })} className={selectCls}>
                {textChannels.map((ch: any) => <option key={ch.id} value={String(ch.id)}># {ch.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className={label}>Ping role</label>
              <select value={s.role_id || ""} onChange={(e) => patchLocal(s.id, { role_id: e.target.value })} className={selectCls}>
                <option value="">No ping</option>
                {pickRoles.map((r: any) => <option key={r.id} value={String(r.id)}>@{r.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {([["notify_videos", "Videos"], ["notify_shorts", "Shorts"], ["notify_live", "Live streams"]] as const).map(([k, n]) => (
              <div key={k} className="flex items-center justify-between rounded-xl border border-site-ink/10 px-4 py-3">
                <span className="text-sm font-bold text-site-body">{n}</span>
                <Switch checked={!!s[k]} onCheckedChange={() => patchLocal(s.id, { [k]: !s[k] })} />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <label className={label}>Message</label>
            <textarea
              value={s.message || ""} maxLength={1500} rows={4}
              onChange={(e) => patchLocal(s.id, { message: e.target.value })}
              placeholder={initial.default_message}
              className="w-full rounded-xl bg-site-card border border-site-ink/10 text-site-ink p-4 font-mono text-sm"
            />
            <p className="text-xs text-site-muted">Placeholders: {"{role}"} {"{channel}"} {"{title}"} {"{type}"} {"{url}"}. Leave empty for the default.</p>
          </div>
          <Button type="button" disabled={busy === s.id} onClick={() => save(s)} className="px-8 py-6 font-bold">{busy === s.id ? "Saving..." : "Save Changes"}</Button>
        </div>
      ))}
    </div>
  );
}
