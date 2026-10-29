"use client";

import React, { useEffect, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { card, field, lbl, hint, ToggleRow, PageTitle, ChannelSelect, textChannels } from "@/components/dashboard/ui-bits";

const UNITS: [string, number][] = [["minutes", 60], ["hours", 3600], ["days", 86400]];
const fmt = (s: number) => { const u = [...UNITS].reverse().find(([, m]) => s % m === 0) || UNITS[0]; return `${s / u[1]} ${u[0]}`; };

export default function AutoDeletePage({ params }: { params: { guildId: string } }) {
  const gid = params.guildId;
  const [items, setItems] = useState<any[] | null>(null);
  const [channels, setChannels] = useState<any[]>([]);
  const [channel, setChannel] = useState("");
  const [amount, setAmount] = useState("6");
  const [unit, setUnit] = useState(3600);
  const [keep, setKeep] = useState(true);

  const load = () => api.getAutoDelete(gid).then((r) => setItems(r.items)).catch(() => toast.error("Failed to load"));
  useEffect(() => { load(); api.getChannels(gid).then((c) => setChannels(textChannels(c))); }, [gid]);
  if (!items) return <div className="p-10 text-slate-400">Loading…</div>;

  const add = async () => {
    try { await api.saveAutoDelete(gid, { channel_id: channel, interval_sec: Math.round(Number(amount) * unit), keep_pinned: keep }); toast.success("Saved"); load(); }
    catch (e: any) { toast.error(e?.message || "Failed"); }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageTitle title="Auto Delete" sub="Clear every message in a channel on a timer. Handy for spam or temporary channels." />
      <div className={card + " space-y-4"}>
        <div><label className={lbl}>Channel</label><ChannelSelect value={channel} onChange={setChannel} channels={channels} /></div>
        <div><label className={lbl}>Clear every</label><p className={hint}>1 minute to 30 days. Needs Manage Messages and Read Message History in that channel.</p>
          <div className="flex gap-2">
            <input type="number" min={1} className={field} value={amount} onChange={(e) => setAmount(e.target.value)} />
            <select className={field + " max-w-[140px]"} value={unit} onChange={(e) => setUnit(Number(e.target.value))}>{UNITS.map(([n, m]) => <option key={n} value={m}>{n}</option>)}</select>
          </div></div>
        <ToggleRow title="Keep pinned messages" checked={keep} onChange={setKeep} />
        <button onClick={add} className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black"><Plus className="h-4 w-4" />Save channel</button>
      </div>
      <div className={card + " space-y-3"}>
        <h3 className="font-bold text-white">Active channels</h3>
        {items.length === 0 && <p className="text-sm text-slate-500">None yet.</p>}
        {items.map((i) => (
          <div key={i.channel_id} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
            <div><p className="font-bold text-slate-100">#{channels.find((c) => c.id === i.channel_id)?.name || i.channel_id}</p><p className="text-xs text-slate-500">every {fmt(i.interval_sec)}{i.keep_pinned ? " | pins kept" : ""}</p></div>
            <button onClick={async () => { await api.deleteAutoDelete(gid, i.channel_id); load(); }} className="rounded-lg p-2 text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
