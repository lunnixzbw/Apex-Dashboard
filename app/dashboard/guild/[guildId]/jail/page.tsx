"use client";

import React, { useState, useEffect } from "react";
import { Lock, Save, RefreshCcw, Wand2, Unlock, Gavel } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { JailConfig, JailRecordItem } from "@/types/api";

const when = (d: string) => new Date(d).toLocaleString();

export default function JailPage({ params }: { params: { guildId: string } }) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [config, setConfig] = useState<JailConfig | null>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [role, setRole] = useState("none");
  const [chan, setChan] = useState("none");
  const [log, setLog] = useState("none");
  const [userId, setUserId] = useState("");
  const [reason, setReason] = useState("");

  const load = async () => {
    try {
      const [c, r, ch] = await Promise.all([api.getJail(params.guildId), api.getRoles(params.guildId), api.getChannels(params.guildId)]);
      setConfig(c); setRoles(r); setChannels(ch);
      setRole(c.role_id || "none"); setChan(c.channel_id || "none"); setLog(c.log_channel || "none");
    } catch (e: any) { toast.error(e?.message || "Failed to load Jail"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [params.guildId]);

  const run = async (fn: () => Promise<any>, ok: string | ((r: any) => string)) => {
    setBusy(true);
    try { const r = await fn(); toast.success(typeof ok === "function" ? ok(r) : ok); await load(); }
    catch (e: any) { toast.error(e?.message || "Something went wrong"); }
    finally { setBusy(false); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><RefreshCcw className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!config) return null;

  const roleOptions = roles.filter((r) => r.name !== "@everyone" && !r.managed).map((r) => ({ value: r.id.toString(), label: r.name }));
  const channelOptions = channels.filter((c) => c.type === "0" || c.type === "5").map((c) => ({ value: c.id.toString(), label: `#${c.name}` }));

  const row = (r: JailRecordItem, active: boolean) => (
    <div key={`${active ? "a" : "h"}${r.id}`} className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-[#0f0f0f] p-4 md:flex-row md:items-center">
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-white">{r.username || r.user_id}</p>
        <p className="text-sm text-slate-400">{r.reason || "No reason"}</p>
        <p className="mt-1 text-[11px] text-slate-500">
          Jailed {when(r.jailed_at)} by {r.moderator || "unknown"}
          {r.released_at ? ` · Released ${when(r.released_at)} by ${r.released_by || "unknown"}` : ""}
        </p>
      </div>
      {active && (
        <Button variant="outline" size="sm" disabled={busy} className="gap-2" onClick={() => run(() => api.releaseJail(params.guildId, r.user_id), "Member released")}>
          <Unlock className="w-4 h-4" /> Release
        </Button>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Lock className="h-6 w-6 text-primary" /> Jail</h2>
        <p className="text-slate-400 mt-1">Jailed members lose their roles and can only see the jail channel. Their roles come back when released.</p>
      </div>

      <Card className="border-white/5 bg-black/40">
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>{config.ready ? "Jail is ready to use." : "Jail isn't set up yet. Use auto setup, or pick a role and channel."}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2"><Label>Jail role</Label><Select value={role} onValueChange={setRole} options={[{ value: "none", label: "Not set" }, ...roleOptions]} /></div>
          <div className="space-y-2"><Label>Jail channel</Label><Select value={chan} onValueChange={setChan} options={[{ value: "none", label: "Not set" }, ...channelOptions]} /></div>
          <div className="space-y-2"><Label>Log channel</Label><Select value={log} onValueChange={setLog} options={[{ value: "none", label: "No logging" }, ...channelOptions]} /></div>
          <div className="flex flex-wrap justify-between gap-3">
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" disabled={busy} className="gap-2" onClick={() => run(() => api.setupJail(params.guildId), (r) => `Jail ready. Locked ${r.locked} channels`)}>
                <Wand2 className="w-4 h-4" /> Auto setup
              </Button>
              <Button variant="outline" disabled={busy || !config.ready} className="gap-2" onClick={() => run(() => api.syncJail(params.guildId), (r) => `Updated ${r.locked} channels`)}>
                <RefreshCcw className="w-4 h-4" /> Re-sync channels
              </Button>
            </div>
            <Button disabled={busy} className="gap-2" onClick={() => run(() => api.updateJail(params.guildId, {
              role_id: role === "none" ? null : role, channel_id: chan === "none" ? null : chan, log_channel: log === "none" ? null : log,
            }), "Jail settings saved")}>
              <Save className="w-4 h-4" /> Save Changes
            </Button>
          </div>
          <p className="text-[11px] text-slate-500">After changing the role or channel, press Re-sync so every channel hides from the jail role.</p>
        </CardContent>
      </Card>

      <Card className="border-white/5 bg-black/40">
        <CardHeader><CardTitle>Jail a member</CardTitle><CardDescription>Use their Discord user ID.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <Input value={userId} placeholder="User ID" onChange={(e) => setUserId(e.target.value.replace(/\D/g, ""))} />
          <Input value={reason} placeholder="Reason (optional)" maxLength={300} onChange={(e) => setReason(e.target.value)} />
          <Button disabled={busy || !config.ready || userId.length < 15} className="gap-2"
            onClick={() => run(async () => { await api.jailUser(params.guildId, { user_id: userId, reason: reason || undefined }); setUserId(""); setReason(""); }, "Member jailed")}>
            <Gavel className="w-4 h-4" /> Jail
          </Button>
        </CardContent>
      </Card>

      <Card className="border-white/5 bg-black/40">
        <CardHeader><CardTitle>Currently jailed ({config.active.length})</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {config.active.length ? config.active.map((r) => row(r, true)) : <p className="text-sm text-slate-500">Nobody is jailed right now.</p>}
        </CardContent>
      </Card>

      <Card className="border-white/5 bg-black/40">
        <CardHeader><CardTitle>History</CardTitle><CardDescription>Latest 40 entries.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          {config.history.length ? config.history.map((r) => row(r, false)) : <p className="text-sm text-slate-500">No history yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
