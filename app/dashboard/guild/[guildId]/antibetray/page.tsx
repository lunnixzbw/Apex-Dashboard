"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert, Save, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PremiumGate } from "@/components/premium-gate";
import type { AntiBetrayConfig } from "@/types/api";

const RULES = [
  { key: "ban", label: "Mass bans", hint: "A moderator bans too many members" },
  { key: "kick", label: "Mass kicks", hint: "A moderator kicks too many members" },
  { key: "everyone", label: "@everyone spam", hint: "A moderator pings @everyone/@here too often" },
] as const;

export default function AntiBetrayPage({ params }: { params: { guildId: string } }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<AntiBetrayConfig | null>(null);
  const [channels, setChannels] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [c, ch] = await Promise.all([api.getAntiBetray(params.guildId), api.getChannels(params.guildId)]);
        setConfig(c);
        setChannels(ch);
      } catch (e: any) {
        toast.error(e?.message || "Failed to load Anti-Betray");
      } finally {
        setLoading(false);
      }
    })();
  }, [params.guildId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCcw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!config) return null;
  if (!config.premium) return <PremiumGate feature="Anti-Betray" />;

  const set = (patch: Partial<AntiBetrayConfig>) => setConfig({ ...config, ...patch });
  const num = (v: string, fallback: number) => (Number.isFinite(Number(v)) && v !== "" ? Number(v) : fallback);

  const save = async () => {
    setSaving(true);
    try {
      const { guild_id, premium, ...data } = config;
      await api.updateAntiBetray(params.guildId, data);
      toast.success("Anti-Betray saved");
    } catch (e: any) {
      toast.error(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-primary" /> Anti-Betray
        </h2>
        <p className="text-slate-400 mt-1">
          Punishes staff who abuse their power. Only the server owner or an Extra Owner can change these settings.
        </p>
      </div>

      <Card className="border-white/5 bg-black/40">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Protection</CardTitle>
              <CardDescription>Turn Anti-Betray on or off for this server.</CardDescription>
            </div>
            <Switch checked={config.enabled} onCheckedChange={(v) => set({ enabled: v })} />
          </div>
        </CardHeader>
        <CardContent className={`space-y-6 ${!config.enabled ? "opacity-50" : ""}`}>
          {RULES.map((r) => (
            <div key={r.key} className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end rounded-2xl border border-white/5 p-4">
              <div>
                <p className="font-semibold text-white">{r.label}</p>
                <p className="text-sm text-slate-500">{r.hint}</p>
              </div>
              <div className="space-y-1">
                <Label>Actions allowed</Label>
                <Input
                  type="number" min={1} max={50} className="w-28"
                  value={(config as any)[`${r.key}_threshold`]}
                  onChange={(e) => set({ [`${r.key}_threshold`]: num(e.target.value, 1) } as any)}
                />
              </div>
              <div className="space-y-1">
                <Label>Within (seconds)</Label>
                <Input
                  type="number" min={30} max={86400} className="w-32"
                  value={(config as any)[`${r.key}_window`]}
                  onChange={(e) => set({ [`${r.key}_window`]: num(e.target.value, 600) } as any)}
                />
              </div>
            </div>
          ))}

          <div className="space-y-2">
            <Label>Log channel</Label>
            <Select
              value={config.log_channel?.toString() || "none"}
              onValueChange={(val) => set({ log_channel: val === "none" ? null : val })}
              options={[
                { value: "none", label: "No log channel" },
                ...channels.filter((c) => c.type === "0" || c.type === "5").map((c) => ({ value: c.id.toString(), label: `#${c.name}` })),
              ]}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={save} disabled={saving} className="gap-2">
              {saving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
