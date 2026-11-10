"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const label = "text-xs font-black uppercase text-site-faint tracking-widest";
const selectCls = "w-full rounded-xl bg-site-card border border-site-ink/10 text-site-ink py-3 px-4 font-bold";

export function ClonerForm() {
  const [info, setInfo] = useState<any>(null);
  const [error, setError] = useState("");
  const [source, setSource] = useState("");
  const [target, setTarget] = useState("");
  const [confirm, setConfirm] = useState("");
  const [job, setJob] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => { if (timer.current) { clearInterval(timer.current); timer.current = null; } };

  const poll = useCallback((id: string) => {
    stop();
    timer.current = setInterval(async () => {
      try {
        const j = await api.getClonerJob(id);
        setJob(j);
        if (j.status !== "running") stop();
      } catch { stop(); }
    }, 2000);
  }, []);

  useEffect(() => {
    api.getCloner()
      .then((d) => { setInfo(d); if (d.job) { setJob(d.job); if (d.job.status === "running") poll(d.job.id); } })
      .catch((e: any) => setError(e?.message || "Could not load the cloner."));
    return stop;
  }, [poll]);

  const targetGuild = info?.guilds?.find((g: any) => g.id === target);
  const running = job?.status === "running";

  const go = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api.startCloner({ source: source.trim(), target_id: target, confirm_name: confirm });
      toast.success("Clone started.");
      const j = await api.getClonerJob(r.id);
      setJob(j); poll(r.id);
    } catch (err: any) { toast.error(err?.message || "Could not start the clone."); } finally { setBusy(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-site-ink flex items-center gap-2"><Copy className="h-6 w-6" />Server Cloner</h2>
        <p className="text-site-muted mt-1">Copy a server into another one: roles, channels, permissions, emojis, settings and onboarding.</p>
      </div>

      {error && <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-site-ink">{error}</div>}

      {info && (
        <form onSubmit={go} className="bg-site-card border border-site-ink/10 rounded-3xl p-8 space-y-6 shadow-xl shadow-black/20">
          <div className="space-y-2">
            <label className={label}>Copy from</label>
            <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="Server ID (bot must be in it) or a template link like discord.new/..."
              disabled={running} className="py-6 font-bold" />
            <p className="text-xs text-site-muted">A template link only needs the bot in the target server, not the source.</p>
          </div>
          <div className="space-y-2">
            <label className={label}>Copy into (target, gets wiped)</label>
            <select value={target} onChange={(e) => setTarget(e.target.value)} className={selectCls} disabled={running}>
              <option value="">Select a server...</option>
              {info.guilds.map((g: any) => (
                <option key={g.id} value={g.id}>{g.name}{g.bot_admin ? "" : " (bot needs Administrator)"}</option>
              ))}
            </select>
          </div>
          {targetGuild && (
            <div className="space-y-2">
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-site-ink">
                Every channel, role, emoji and sticker in <b>{targetGuild.name}</b> will be deleted first. This cannot be undone.
                Messages, members and bans are not copied.
              </div>
              <label className={label}>Type the target server name to confirm</label>
              <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder={targetGuild.name} className="py-6 font-bold" />
            </div>
          )}
          <Button type="submit" disabled={busy || running || !source.trim() || !target || confirm.trim() !== targetGuild?.name} className="px-8 py-6 font-bold">
            {running ? "Cloning..." : busy ? "Starting..." : "Start Clone"}
          </Button>
        </form>
      )}

      {job && (
        <div className="bg-site-card border border-site-ink/10 rounded-3xl p-8 space-y-4 shadow-xl shadow-black/20">
          <div className="flex items-center justify-between">
            <span className="font-bold text-site-ink">{job.source} → {job.target}</span>
            <span className="text-xs font-black uppercase tracking-widest text-site-faint">{job.status}</span>
          </div>
          <div className="h-3 rounded-full bg-site-ink/10 overflow-hidden">
            <div className="h-full bg-site-ink transition-all duration-500" style={{ width: `${job.percent}%` }} />
          </div>
          <p className="text-sm text-site-body">{job.step} ({job.percent}%)</p>
          {job.error && <p className="text-sm text-red-500">{job.error}</p>}
          {job.warnings?.length > 0 && (
            <details className="text-xs text-site-muted">
              <summary className="cursor-pointer font-bold">{job.warnings.length} skipped / warnings</summary>
              <ul className="mt-2 space-y-1 list-disc pl-5">{job.warnings.map((w: string, i: number) => <li key={i}>{w}</li>)}</ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
