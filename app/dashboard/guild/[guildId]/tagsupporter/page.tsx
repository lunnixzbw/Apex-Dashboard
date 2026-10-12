"use client";

import React, { useState, useEffect } from "react";
import { BadgeCheck, Save, RefreshCcw, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { TagSupporterConfig } from "@/types/api";

export default function TagSupporterPage({ params }: { params: { guildId: string } }) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [config, setConfig] = useState<TagSupporterConfig | null>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [enabled, setEnabled] = useState(false);
  const [role, setRole] = useState("none");
  const [log, setLog] = useState("none");

  const load = async () => {
    try {
      const [c, r, ch] = await Promise.all([api.getTagSupporter(params.guildId), api.getRoles(params.guildId), api.getChannels(params.guildId)]);
      setConfig(c); setRoles(r); setChannels(ch);
      setEnabled(c.enabled); setRole(c.role_id || "none"); setLog(c.log_channel || "none");
    } catch (e: any) { toast.error(e?.message || "Failed to load Tag Supporter"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [params.guildId]);

  const save = async () => {
    setBusy(true);
    try {
      await api.updateTagSupporter(params.guildId, { enabled, role_id: role === "none" ? null : role, log_channel: log === "none" ? null : log });
      toast.success("Tag supporter settings saved");
      await load();
    } catch (e: any) { toast.error(e?.message || "Failed to save"); }
    finally { setBusy(false); }
  };

  const sync = async () => {
    setBusy(true);
    try { const r = await api.syncTagSupporter(params.guildId); toast.success(`Checked ${r.checked} members`); }
    catch (e: any) { toast.error(e?.message || "Sync failed"); }
    finally { setBusy(false); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><RefreshCcw className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!config) return null;

  const roleOptions = roles.filter((r) => r.name !== "@everyone" && !r.managed).map((r) => ({ value: r.id.toString(), label: r.name }));
  const channelOptions = channels.filter((c) => c.type === "0" || c.type === "5").map((c) => ({ value: c.id.toString(), label: `#${c.name}` }));

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2"><BadgeCheck className="h-6 w-6 text-primary" /> Tag Supporter</h2>
        <p className="text-slate-400 mt-1">Members who equip this server&apos;s tag get a role automatically, and lose it when they remove the tag.</p>
      </div>

      <Card className="border-white/5 bg-black/40">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Apex only takes back roles it gave out itself.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <label className="flex items-center justify-between gap-3 text-sm text-slate-300">
            Enabled <Switch checked={enabled} onCheckedChange={setEnabled} />
          </label>
          <div className="space-y-2">
            <Label>Supporter role</Label>
            <Select value={role} onValueChange={setRole} options={[{ value: "none", label: "No role selected" }, ...roleOptions]} />
          </div>
          <div className="space-y-2">
            <Label>Log channel</Label>
            <Select value={log} onValueChange={setLog} options={[{ value: "none", label: "No logging" }, ...channelOptions]} />
          </div>
          <div className="flex flex-wrap justify-between gap-3">
            <Button variant="outline" disabled={busy || !config.role_id} onClick={sync} className="gap-2"><RotateCw className="w-4 h-4" /> Check everyone now</Button>
            <Button disabled={busy} onClick={save} className="gap-2">
              {busy ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
