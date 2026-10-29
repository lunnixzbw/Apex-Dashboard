"use client";

import React, { useEffect, useState } from "react";
import { Gift, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { card, field, lbl, hint, ToggleRow, PageTitle, ChannelSelect, textChannels } from "@/components/dashboard/ui-bits";
import { MultiPick } from "@/components/dashboard/multi-pick";

const UNITS: [string, number][] = [["seconds", 1], ["minutes", 60], ["hours", 3600], ["days", 86400]];

function Premium() {
  return <span className="ml-2 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">PREMIUM</span>;
}

// value in seconds, 0 = off
function Duration({ value, onChange, disabled }: { value: number; onChange: (s: number) => void; disabled?: boolean }) {
  const unit = [...UNITS].reverse().find(([, m]) => value > 0 && value % m === 0)?.[1] || 60;
  const amount = value ? value / unit : "";
  return (
    <div className="flex gap-2">
      <input type="number" min={0} disabled={disabled} className={field} value={amount} placeholder="Off"
        onChange={(e) => onChange(e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)) * unit)} />
      <select disabled={disabled} className={field + " max-w-[130px]"} value={unit} onChange={(e) => onChange((Number(amount) || 1) * Number(e.target.value))}>
        {UNITS.map(([n, m]) => <option key={n} value={m}>{n}</option>)}
      </select>
    </div>
  );
}

const Num = ({ value, onChange, max = 1000000000, disabled }: { value: number; onChange: (n: number) => void; max?: number; disabled?: boolean }) => (
  <input type="number" min={0} max={max} disabled={disabled} className={field} placeholder="Off" value={value || ""} onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))} />
);

function ColorField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2">
      <input type="color" className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-slate-800 bg-transparent" value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#2b2d31"} onChange={(e) => onChange(e.target.value)} />
      <input className={field} placeholder="#2B2D31 (default)" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

const blank = () => ({
  channel_id: "", prize: "", winners: 1, duration_sec: 3600,
  extraEntries: [] as { roleId: string; entries: number }[], stackEntries: false, drop: false,
  requiredRoles: [] as string[], requiredBoosts: 0, requireTag: false, requiredLevel: 0,
  msgDaily: 0, msgWeekly: 0, msgMonthly: 0, msgTotal: 0, requiredInvites: 0, minAccountAgeSec: 0, minServerTimeSec: 0,
  bypassRoles: [] as string[], blacklistRoles: [] as string[],
  embedImage: "", embedThumbnail: "", embedColor: "", embedEndColor: "",
  winnerDm: "", winnerRoleId: "", winnerRoleRemoveSec: 0, claimSec: 0,
  msgConfirm: "", msgDeny: "", msgRemove: "", persistEntries: false,
});

export default function GiveawaysPage({ params }: { params: { guildId: string } }) {
  const gid = params.guildId;
  const [data, setData] = useState<any>(null);
  const [channels, setChannels] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [f, setF] = useState<any>(blank());
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  const load = () => api.getGiveaways(gid).then(setData).catch(() => toast.error("Failed to load giveaways"));
  useEffect(() => {
    load();
    Promise.all([api.getChannels(gid), api.getRoles(gid)]).then(([c, r]) => { setChannels(textChannels(c)); setRoles(r as any[]); });
  }, [gid]);
  if (!data) return <div className="p-10 text-slate-400">Loading…</div>;
  const premium = !!data.premium;
  const set = (p: any) => setF((x: any) => ({ ...x, ...p }));
  const roleItems = roles.filter((r: any) => r.name !== "@everyone").map((r: any) => ({ id: r.id, name: r.name, color: r.color }));
  const roleMax = premium ? 25 : 5;
  const msgMax = premium ? 300 : 150;

  const submit = async () => {
    if (!f.channel_id) return toast.error("Pick a channel");
    if (!f.prize.trim()) return toast.error("Enter a prize");
    const o: any = { ...f };
    delete o.channel_id; delete o.prize; delete o.winners; delete o.duration_sec;
    for (const k of ["embedImage", "embedThumbnail", "embedColor", "embedEndColor", "winnerDm", "winnerRoleId", "msgConfirm", "msgDeny", "msgRemove"]) if (!o[k]) o[k] = null;
    setBusy(true);
    try {
      await api.createGiveaway(gid, { channel_id: f.channel_id, prize: f.prize, winners: Number(f.winners), duration_sec: Number(f.duration_sec), options: o });
      toast.success("Giveaway started");
      setF(blank()); setOpen(false); load();
    } catch (e: any) { toast.error(e?.message || "Failed to start giveaway"); } finally { setBusy(false); }
  };

  const act = async (fn: () => Promise<any>, ok: string) => { try { await fn(); toast.success(ok); load(); } catch (e: any) { toast.error(e?.message || "Failed"); } };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageTitle title="Giveaways" sub="Start giveaways with requirements, extra entries, claim times and more." />

      {!open ? (
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black"><Plus className="h-4 w-4" />New giveaway</button>
      ) : (
        <div className="space-y-6">
          <div className={card + " space-y-4"}>
            <h3 className="font-bold text-white">Basics</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className={lbl}>Channel</label><ChannelSelect value={f.channel_id} onChange={(v) => set({ channel_id: v })} channels={channels} /></div>
              <div><label className={lbl}>Prize</label><input className={field} maxLength={200} value={f.prize} onChange={(e) => set({ prize: e.target.value })} /></div>
              <div><label className={lbl}>Winners</label><input type="number" min={1} max={50} className={field} value={f.winners} onChange={(e) => set({ winners: e.target.value })} /></div>
              <div><label className={lbl}>Duration</label><Duration value={f.duration_sec} onChange={(s) => set({ duration_sec: s })} /></div>
            </div>
            <ToggleRow title="Giveaway drop" help="Ends as soon as the winner count has entered. The first people in win." checked={f.drop} onChange={(v) => set({ drop: v })} />
            <ToggleRow title="Persist entries" help="Freeze entries when people join. Role changes won't remove them (a blacklisted role received later still does)." checked={f.persistEntries} onChange={(v) => set({ persistEntries: v })} />
          </div>

          <div className={card + " space-y-4"}>
            <h3 className="font-bold text-white">Extra entries</h3>
            <p className={hint}>Roles that get more entries (1 to {premium ? 250 : 100}{premium ? "" : ", 250 with Premium"}). Without stacking, only the highest one counts.</p>
            {f.extraEntries.map((x: any, i: number) => (
              <div key={i} className="flex gap-2">
                <select className={field} value={x.roleId} onChange={(e) => set({ extraEntries: f.extraEntries.map((y: any, j: number) => j === i ? { ...y, roleId: e.target.value } : y) })}>
                  <option value="">Role…</option>
                  {roleItems.map((r) => <option key={r.id} value={r.id}>@{r.name}</option>)}
                </select>
                <input type="number" min={1} max={premium ? 250 : 100} className={field + " max-w-[110px]"} value={x.entries} onChange={(e) => set({ extraEntries: f.extraEntries.map((y: any, j: number) => j === i ? { ...y, entries: Number(e.target.value) } : y) })} />
                <button onClick={() => set({ extraEntries: f.extraEntries.filter((_: any, j: number) => j !== i) })} className="rounded-lg p-2 text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
            <button onClick={() => set({ extraEntries: [...f.extraEntries, { roleId: "", entries: 2 }] })} className="text-sm font-semibold text-primary">+ Add role</button>
            <ToggleRow title="Stack entries" help="Add up the entries of every matching role." checked={f.stackEntries} onChange={(v) => set({ stackEntries: v })} />
          </div>

          <div className={card + " space-y-4"}>
            <h3 className="font-bold text-white">Requirements</h3>
            <div><label className={lbl}>Required roles <span className="font-normal text-slate-500">(max {roleMax})</span></label><MultiPick items={roleItems} value={f.requiredRoles} onChange={(v) => set({ requiredRoles: v })} prefix="@" max={roleMax} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className={lbl}>Required server boosts</label><p className={hint}>Discord only tells bots if someone is boosting, not how many times, so any value above 0 means &quot;must be boosting&quot;.</p><Num value={f.requiredBoosts} max={14} onChange={(n) => set({ requiredBoosts: n })} /></div>
              <div><label className={lbl}>Required level</label><p className={hint}>Apex leveling level.</p><Num value={f.requiredLevel} max={1000} onChange={(n) => set({ requiredLevel: n })} /></div>
              <div><label className={lbl}>Daily messages</label><Num value={f.msgDaily} onChange={(n) => set({ msgDaily: n })} /></div>
              <div><label className={lbl}>Weekly messages</label><Num value={f.msgWeekly} onChange={(n) => set({ msgWeekly: n })} /></div>
              <div><label className={lbl}>Monthly messages</label><Num value={f.msgMonthly} onChange={(n) => set({ msgMonthly: n })} /></div>
              <div><label className={lbl}>Total messages</label><Num value={f.msgTotal} onChange={(n) => set({ msgTotal: n })} /></div>
              <div><label className={lbl}>Required invites</label><Num value={f.requiredInvites} max={1000000} onChange={(n) => set({ requiredInvites: n })} /></div>
              <div />
              <div><label className={lbl}>Account age{!premium && <Premium />}</label><p className={hint}>Up to 10 years.</p><Duration disabled={!premium} value={f.minAccountAgeSec} onChange={(s) => set({ minAccountAgeSec: s })} /></div>
              <div><label className={lbl}>Time in server{!premium && <Premium />}</label><p className={hint}>Up to 10 years.</p><Duration disabled={!premium} value={f.minServerTimeSec} onChange={(s) => set({ minServerTimeSec: s })} /></div>
            </div>
            <p className={hint}>Message counters reset: daily at 00:00 UTC, weekly every Sunday 00:00 UTC, monthly on the 1st at 00:00 UTC. Total never resets. Counting starts once this version is live.</p>
            <ToggleRow title={`Require server tag${premium ? "" : " (Premium)"}`} help="Members must wear the Server Tag (set up on the Server Tag page) in their nickname." checked={f.requireTag} onChange={(v) => premium ? set({ requireTag: v }) : toast.error("Server tag requirement needs Premium")} />
            <div><label className={lbl}>Requirement bypass roles <span className="font-normal text-slate-500">(max {roleMax})</span></label><MultiPick items={roleItems} value={f.bypassRoles} onChange={(v) => set({ bypassRoles: v })} prefix="@" max={roleMax} /></div>
            <div><label className={lbl}>Blacklisted roles <span className="font-normal text-slate-500">(max {roleMax})</span></label><MultiPick items={roleItems} value={f.blacklistRoles} onChange={(v) => set({ blacklistRoles: v })} prefix="@" max={roleMax} /></div>
          </div>

          <div className={card + " space-y-4"}>
            <h3 className="font-bold text-white">Appearance</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className={lbl}>Embed image URL</label><input className={field} value={f.embedImage} onChange={(e) => set({ embedImage: e.target.value })} /></div>
              <div><label className={lbl}>Embed thumbnail URL</label><input className={field} value={f.embedThumbnail} onChange={(e) => set({ embedThumbnail: e.target.value })} /></div>
              <div><label className={lbl}>Embed colour</label><ColorField value={f.embedColor} onChange={(v) => set({ embedColor: v })} /></div>
              <div><label className={lbl}>Embed end colour</label><ColorField value={f.embedEndColor} onChange={(v) => set({ embedEndColor: v })} /></div>
            </div>
          </div>

          <div className={card + " space-y-4"}>
            <h3 className="font-bold text-white">Winners</h3>
            <div><label className={lbl}>Winner DM message <span className="font-normal text-slate-500">({f.winnerDm.length}/{msgMax})</span></label><p className={hint}>Placeholders: {"{user} {prize} {server}"}</p><textarea className={field} rows={2} maxLength={msgMax} value={f.winnerDm} onChange={(e) => set({ winnerDm: e.target.value })} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className={lbl}>Winner role</label>
                <select className={field} value={f.winnerRoleId} onChange={(e) => set({ winnerRoleId: e.target.value })}><option value="">None</option>{roleItems.map((r) => <option key={r.id} value={r.id}>@{r.name}</option>)}</select></div>
              <div><label className={lbl}>Remove winner role after</label><p className={hint}>15 minutes to {premium ? "1 year" : "7 days (1 year with Premium)"}. Blank keeps it.</p><Duration value={f.winnerRoleRemoveSec} onChange={(s) => set({ winnerRoleRemoveSec: s })} /></div>
              <div className="sm:col-span-2"><label className={lbl}>Claim time{!premium && <Premium />}</label><p className={hint}>Winners get a Claim button. 5 seconds to 30 days. Unclaimed prizes are rerolled and the new winner gets their own claim time.</p><Duration disabled={!premium} value={f.claimSec} onChange={(s) => set({ claimSec: s })} /></div>
            </div>
          </div>

          <div className={card + " space-y-4"}>
            <h3 className="font-bold text-white">Entry messages <span className="text-xs font-normal text-slate-500">({msgMax} characters{premium ? "" : ", 300 with Premium"})</span></h3>
            <div><label className={lbl}>Entry confirmation</label><textarea className={field} rows={2} maxLength={msgMax} value={f.msgConfirm} onChange={(e) => set({ msgConfirm: e.target.value })} /></div>
            <div><label className={lbl}>Entry denied</label><p className={hint}>Use {"{reasons}"} to show what is missing.</p><textarea className={field} rows={2} maxLength={msgMax} value={f.msgDeny} onChange={(e) => set({ msgDeny: e.target.value })} /></div>
            <div><label className={lbl}>Entry removed</label><textarea className={field} rows={2} maxLength={msgMax} value={f.msgRemove} onChange={(e) => set({ msgRemove: e.target.value })} /></div>
          </div>

          <div className="flex gap-3">
            <button onClick={submit} disabled={busy} className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black disabled:opacity-50"><Gift className="h-4 w-4" />{busy ? "Starting…" : "Start giveaway"}</button>
            <button onClick={() => setOpen(false)} className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm text-slate-300">Cancel</button>
          </div>
        </div>
      )}

      <div className={card + " space-y-3"}>
        <h3 className="font-bold text-white">Recent giveaways</h3>
        {data.items.length === 0 && <p className="text-sm text-slate-500">None yet.</p>}
        {data.items.map((g: any) => (
          <div key={g.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
            <div>
              <p className="font-bold text-slate-100">{g.prize}</p>
              <p className="text-xs text-slate-500">{g.entries} entries | {g.winners} winner{g.winners === 1 ? "" : "s"} | {g.ended ? "ended" : `ends ${new Date(g.end_time * 1000).toLocaleString()}`}</p>
            </div>
            <div className="flex gap-2">
              {!g.ended && <button onClick={() => act(() => api.endGiveaway(gid, g.id), "Giveaway ended")} className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-200">End now</button>}
              {g.ended && <button onClick={() => act(() => api.rerollGiveaway(gid, g.id), "Rerolled")} className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-200">Reroll</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
