"use client";

import React, { useState, useEffect } from "react";
import { Reply, Plus, Trash2, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { AutoresponderList } from "@/types/api";

export default function AutoresponderPage({ params }: { params: { guildId: string } }) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<AutoresponderList | null>(null);
  const [trigger, setTrigger] = useState("");
  const [response, setResponse] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);

  const load = async () => {
    try { setData(await api.getAutoresponders(params.guildId)); }
    catch (e: any) { toast.error(e?.message || "Failed to load autoresponders"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [params.guildId]);

  const run = async (fn: () => Promise<any>, ok?: string) => {
    setBusy(true);
    try { await fn(); if (ok) toast.success(ok); await load(); }
    catch (e: any) { toast.error(e?.message || "Something went wrong"); }
    finally { setBusy(false); }
  };

  const add = () =>
    run(async () => {
      await api.createAutoresponder(params.guildId, { trigger, response, case_sensitive: caseSensitive });
      setTrigger(""); setResponse(""); setCaseSensitive(false);
    }, "Autoresponder added");

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><RefreshCcw className="w-8 h-8 animate-spin text-primary" /></div>;
  }
  if (!data) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Reply className="h-6 w-6 text-primary" /> Autoresponder
        </h2>
        <p className="text-slate-400 mt-1">When a member sends a message that is exactly the trigger, Apex replies with your response.</p>
      </div>

      <Card className="border-white/5 bg-black/40">
        <CardHeader>
          <CardTitle>Add autoresponder</CardTitle>
          <CardDescription>{data.items.length}/{data.limit} used</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Trigger</Label>
            <Input value={trigger} maxLength={200} placeholder="e.g. ip" onChange={(e) => setTrigger(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Response <span className="text-slate-500">({response.length}/2000)</span></Label>
            <Textarea value={response} maxLength={2000} rows={3} placeholder="What Apex should reply with" onChange={(e) => setResponse(e.target.value)} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-3 text-sm text-slate-300">
              <Switch checked={caseSensitive} onCheckedChange={setCaseSensitive} /> Case sensitive
            </label>
            <Button disabled={busy || !trigger.trim() || !response.trim()} onClick={add} className="gap-2">
              <Plus className="w-4 h-4" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/5 bg-black/40">
        <CardHeader>
          <CardTitle>Your autoresponders</CardTitle>
          <CardDescription>{data.items.length ? "Toggle or remove them below." : "Nothing here yet."}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.items.map((it) => (
            <div key={it.id} className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-[#0f0f0f] p-4 md:flex-row md:items-center">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-white">{it.trigger}</p>
                <p className="line-clamp-2 whitespace-pre-wrap text-sm text-slate-400">{it.response}</p>
                {it.case_sensitive && <p className="mt-1 text-[11px] uppercase tracking-widest text-slate-500">Case sensitive</p>}
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={it.enabled} disabled={busy} onCheckedChange={(v) => run(() => api.updateAutoresponder(params.guildId, it.id, { enabled: v }))} />
                <Button variant="outline" size="sm" disabled={busy} onClick={() => run(() => api.deleteAutoresponder(params.guildId, it.id), "Removed")}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
