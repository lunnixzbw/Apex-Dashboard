"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Plus, Trash2, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { PremiumGate } from "@/components/premium-gate";
import type { AIChatConfig } from "@/types/api";

export default function AIChatPage({ params }: { params: { guildId: string } }) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [config, setConfig] = useState<AIChatConfig | null>(null);
  const [channels, setChannels] = useState<any[]>([]);
  const [pick, setPick] = useState("none");

  const load = async () => {
    try {
      const [c, ch] = await Promise.all([api.getAIChat(params.guildId), api.getChannels(params.guildId)]);
      setConfig(c);
      setChannels(ch);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load AI Chat");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [params.guildId]);

  const run = async (data: { enable_channel?: string; disable_channel?: string }, ok: string) => {
    setBusy(true);
    try {
      await api.updateAIChat(params.guildId, data);
      toast.success(ok);
      setPick("none");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><RefreshCcw className="w-8 h-8 animate-spin text-primary" /></div>;
  }
  if (!config) return null;
  if (!config.premium) return <PremiumGate feature="AI Chat" />;

  const enabledIds = new Set(config.channels.map((c) => c.id));
  const options = channels
    .filter((c) => (c.type === "0" || c.type === "5") && !enabledIds.has(c.id.toString()))
    .map((c) => ({ value: c.id.toString(), label: `#${c.name}` }));

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" /> AI Chat
        </h2>
        <p className="text-slate-400 mt-1">Apex answers every message in the channels you enable here.</p>
      </div>

      <Card className="border-white/5 bg-black/40">
        <CardHeader>
          <CardTitle>Add a channel</CardTitle>
          <CardDescription>Pick a text channel where Apex should chat with members.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row">
          <div className="flex-1">
            <Select value={pick} onValueChange={setPick} options={[{ value: "none", label: "Select a channel" }, ...options]} />
          </div>
          <Button disabled={busy || pick === "none"} onClick={() => run({ enable_channel: pick }, "AI Chat enabled")} className="gap-2">
            <Plus className="w-4 h-4" /> Enable
          </Button>
        </CardContent>
      </Card>

      <Card className="border-white/5 bg-black/40">
        <CardHeader>
          <CardTitle>Active channels</CardTitle>
          <CardDescription>{config.channels.length ? `${config.channels.length} channel(s) enabled` : "No AI channels yet."}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {config.channels.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-xl border border-white/5 px-4 py-3">
              <span className="text-white">#{c.name}</span>
              <Button variant="ghost" size="sm" disabled={busy} onClick={() => run({ disable_channel: c.id }, "AI Chat disabled")} className="text-red-400 hover:text-red-300 gap-2">
                <Trash2 className="w-4 h-4" /> Disable
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
