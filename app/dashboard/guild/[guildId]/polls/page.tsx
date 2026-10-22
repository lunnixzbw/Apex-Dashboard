"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { card, field, lbl, hint, ToggleRow, PageTitle, ChannelSelect, textChannels } from "@/components/dashboard/ui-bits";

export default function PollsPage({ params }: { params: { guildId: string } }) {
  const gid = params.guildId;
  const [data, setData] = useState<any>(null);
  const [channels, setChannels] = useState<any[]>([]);
  const [channel, setChannel] = useState("");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [multi, setMulti] = useState(false);
  const [hours, setHours] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => api.getPolls(gid).then(setData).catch(() => toast.error("Failed to load polls"));
  useEffect(() => { load(); api.getChannels(gid).then((c) => setChannels(textChannels(c))); }, [gid]);
  if (!data) return <div className="p-10 text-slate-400">Loading…</div>;
  const max = data.max_options as number;

  const create = async () => {
    setBusy(true);
    try {
      await api.createPoll(gid, { channel_id: channel, question, options: options.filter((o) => o.trim()), multi, duration_sec: hours ? Math.round(Number(hours) * 3600) : 0 });
      toast.success("Poll posted");
      setQuestion(""); setOptions(["", ""]); setHours(""); load();
    } catch (e: any) { toast.error(e?.message || "Failed to create poll"); } finally { setBusy(false); }
  };
  const act = async (fn: () => Promise<any>, ok: string) => { try { await fn(); toast.success(ok); load(); } catch (e: any) { toast.error(e?.message || "Failed"); } };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageTitle title="Polls" sub={`Members vote with buttons. Any number of options, from 2 to ${max}.`} />
      <div className={card + " space-y-4"}>
        <div><label className={lbl}>Channel</label><ChannelSelect value={channel} onChange={setChannel} channels={channels} /></div>
        <div><label className={lbl}>Question</label><input className={field} maxLength={300} value={question} onChange={(e) => setQuestion(e.target.value)} /></div>
        <div className="space-y-2">
          <label className={lbl}>Options</label>
          {options.map((o, i) => (
            <div key={i} className="flex gap-2">
              <input className={field} maxLength={100} placeholder={`Option ${i + 1}`} value={o} onChange={(e) => setOptions(options.map((x, j) => (j === i ? e.target.value : x)))} />
              {options.length > 2 && <button onClick={() => setOptions(options.filter((_, j) => j !== i))} className="rounded-lg p-2 text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>}
            </div>
          ))}
          {options.length < max && <button onClick={() => setOptions([...options, ""])} className="flex items-center gap-1 text-sm font-semibold text-primary"><Plus className="h-4 w-4" />Add option</button>}
        </div>
        <div><label className={lbl}>Ends after (hours)</label><p className={hint}>Leave blank to keep it open until you end it.</p><input type="number" min={0} className={field} value={hours} onChange={(e) => setHours(e.target.value)} /></div>
        <ToggleRow title="Allow multiple choices" checked={multi} onChange={setMulti} />
        <button onClick={create} disabled={busy} className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black disabled:opacity-50"><BarChart3 className="h-4 w-4" />{busy ? "Posting…" : "Post poll"}</button>
      </div>

      <div className={card + " space-y-3"}>
        <h3 className="font-bold text-white">Recent polls</h3>
        {data.items.length === 0 && <p className="text-sm text-slate-500">None yet.</p>}
        {data.items.map((p: any) => {
          const total = p.options.reduce((a: number, o: any) => a + o.votes, 0);
          return (
            <div key={p.id} className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-bold text-slate-100">#{p.id} {p.question} <span className="text-xs font-normal text-slate-500">{p.ended ? "ended" : "open"} | {p.voters} voters</span></p>
                <div className="flex gap-2">
                  {!p.ended && <button onClick={() => act(() => api.endPoll(gid, p.id), "Poll ended")} className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-200">End</button>}
                  <button onClick={() => act(() => api.deletePoll(gid, p.id), "Deleted")} className="rounded-lg p-1.5 text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              {p.options.map((o: any, i: number) => (
                <div key={i}>
                  <div className="flex justify-between text-xs text-slate-300"><span>{o.text}</span><span>{o.votes} ({total ? Math.round((o.votes / total) * 100) : 0}%)</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full bg-primary" style={{ width: `${total ? (o.votes / total) * 100 : 0}%` }} /></div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
