"use client";

import React, { useState, useEffect } from "react";
import { Bug, Save, RefreshCcw, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { HoneypotConfig } from "@/types/api";

export default function HoneypotPage({ params }: { params: { guildId: string } }) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [config, setConfig] = useState<HoneypotConfig | null>(null);
  const [channels, setChannels] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [punishment, setPunishment] = useState("softban");
  const [logChannel, setLogChannel] = useState("none");

  const load = async () => {
    try {
      const [c, ch] = await Promise.all([api.getHoneypot(params.guildId), api.getChannels(params.guildId)]);
      setConfig(c);
      setChannels(ch);
      setMessage(c.message || "");
      setPunishment(c.punishment || "softban");
      setLogChannel(c.log_channel || "none");
    } catch (e: any) {
      toast.error(e?.message || "Failed to load Honeypot");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [params.guildId]);

  const act = async (fn: () => Promise<any>, ok: string) => {
    setBusy(true);
    try { await fn(); toast.success(ok); await load(); }
    catch (e: any) { toast.error(e?.message || "Something went wrong"); }
    finally { setBusy(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><RefreshCcw className="w-8 h-8 animate-spin text-primary" /></div>;
  }
  if (!config) return null;

  const textChannels = channels
    .filter((c) => c.type === "0" || c.type === "5")
    .map((c) => ({ value: c.id.toString(), label: `#${c.name}` }));

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bug className="h-6 w-6 text-primary" /> Honeypot
        </h2>
        <p className="text-slate-400 mt-1">A trap channel. Anyone who talks in it is punished automatically, which catches spam bots and raiders.</p>
      </div>

      {!config.configured ? (
        <Card className="border-white/5 bg-black/40">
          <CardHeader>
            <CardTitle>Not set up</CardTitle>
            <CardDescription>Apex will create a #honeypot channel and post the warning panel in it. It needs Manage Channels and Ban Members.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled={busy} onClick={() => act(() => api.createHoneypot(params.guildId), "Honeypot created")} className="gap-2">
              {busy ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create honeypot
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-white/5 bg-black/40">
          <CardHeader>
            <CardTitle>#{config.channel_name || "honeypot"}</CardTitle>
            <CardDescription>{config.kicks} user(s) caught so far. Members with a role above Apex are never punished or deleted.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Punishment</Label>
              <Select value={punishment} onValueChange={setPunishment} options={[
                { value: "softban", label: "Softban (ban + unban, clears their messages)" },
                { value: "ban", label: "Ban" },
              ]} />
            </div>
            <div className="space-y-2">
              <Label>Log channel</Label>
              <Select value={logChannel} onValueChange={setLogChannel} options={[{ value: "none", label: "No log channel" }, ...textChannels]} />
            </div>
            <div className="space-y-2">
              <Label>Panel message <span className="text-slate-500">({message.length}/4000)</span></Label>
              <Textarea value={message} maxLength={4000} rows={4} onChange={(e) => setMessage(e.target.value)} />
            </div>
            <div className="flex flex-wrap justify-between gap-3">
              <Button variant="outline" disabled={busy} className="gap-2"
                onClick={() => { if (confirm("Remove the honeypot and delete its channel?")) act(() => api.removeHoneypot(params.guildId), "Honeypot removed"); }}>
                <Trash2 className="w-4 h-4" /> Remove
              </Button>
              <Button disabled={busy || !message.trim()} className="gap-2"
                onClick={() => act(() => api.updateHoneypot(params.guildId, { message, punishment, log_channel: logChannel === "none" ? null : logChannel }), "Honeypot updated")}>
                {busy ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
