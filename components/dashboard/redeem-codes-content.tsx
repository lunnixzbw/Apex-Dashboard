"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Gift, Copy, Trash2, RefreshCw, Plus, Ban, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { RedeemCodeEntry, RedeemCodeList } from "@/types/api";

function formatExpiry(expiresAt: string | null) {
  if (!expiresAt) return "Never expires";
  return new Date(expiresAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

function GenerateForm({ onCreated }: { onCreated: () => void }) {
  const [perk, setPerk] = useState<"premium" | "noprefix" | "custom">("premium");
  const [duration, setDuration] = useState("permanent");
  const [maxUses, setMaxUses] = useState("1");
  const [customLabel, setCustomLabel] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (perk === "custom" && !customLabel.trim()) return toast.error("Give the custom perk a label");
    setBusy(true);
    try {
      const res = await api.createRedeemCode({
        perk,
        customLabel: perk === "custom" ? customLabel.trim() : undefined,
        duration,
        maxUses: parseInt(maxUses, 10) || 1,
        expiresInDays: expiresInDays ? parseInt(expiresInDays, 10) : undefined,
      });
      navigator.clipboard?.writeText(res.code).catch(() => {});
      toast.success(`Created ${res.code} (copied to clipboard)`);
      setCustomLabel("");
      onCreated();
    } catch (err) {
      toast.error((err as any)?.message || "Failed to create code");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-2">
      <select value={perk} onChange={(e) => setPerk(e.target.value as any)} className="bg-site-ink/[0.03] border border-site-ink/10 rounded-xl px-3 py-2.5 text-xs text-site-ink focus:outline-none focus:ring-1 focus:ring-indigo-500/40">
        <option value="premium">Premium</option>
        <option value="noprefix">No-Prefix</option>
        <option value="custom">Custom perk</option>
      </select>
      {perk === "custom" ? (
        <input value={customLabel} onChange={(e) => setCustomLabel(e.target.value)} placeholder="Label (e.g. Free Booster Role)" className="bg-site-ink/[0.03] border border-site-ink/10 rounded-xl px-3 py-2.5 text-xs text-site-ink placeholder:text-site-faint focus:outline-none focus:ring-1 focus:ring-indigo-500/40" />
      ) : (
        <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="30d, 1mo, permanent" className="bg-site-ink/[0.03] border border-site-ink/10 rounded-xl px-3 py-2.5 text-xs text-site-ink placeholder:text-site-faint focus:outline-none focus:ring-1 focus:ring-indigo-500/40" />
      )}
      <input value={maxUses} onChange={(e) => setMaxUses(e.target.value)} type="number" min={1} placeholder="Max uses" className="bg-site-ink/[0.03] border border-site-ink/10 rounded-xl px-3 py-2.5 text-xs text-site-ink placeholder:text-site-faint focus:outline-none focus:ring-1 focus:ring-indigo-500/40" />
      <input value={expiresInDays} onChange={(e) => setExpiresInDays(e.target.value)} type="number" min={1} placeholder="Code expires in days (optional)" className="bg-site-ink/[0.03] border border-site-ink/10 rounded-xl px-3 py-2.5 text-xs text-site-ink placeholder:text-site-faint focus:outline-none focus:ring-1 focus:ring-indigo-500/40" />
      <button disabled={busy} onClick={submit} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-[11px] font-black uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50">
        <Plus className="h-3.5 w-3.5" /> Generate
      </button>
    </div>
  );
}

function CodeRow({ row, onChanged }: { row: RedeemCodeEntry; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);

  const toggleDisabled = async () => {
    setBusy(true);
    try {
      await api.setRedeemCodeDisabled(row.id, !row.disabled);
      toast.success(row.disabled ? "Re-enabled" : "Disabled");
      onChanged();
    } catch {
      toast.error("Failed to update code");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete code ${row.code}? This can't be undone.`)) return;
    setBusy(true);
    try {
      await api.deleteRedeemCode(row.id);
      toast.success("Deleted");
      onChanged();
    } catch {
      toast.error("Failed to delete code");
    } finally {
      setBusy(false);
    }
  };

  const copy = () => {
    navigator.clipboard?.writeText(row.code).catch(() => {});
    toast.success("Copied");
  };

  const fullyUsed = row.uses >= row.maxUses;
  const expired = !!row.expiresAt && new Date(row.expiresAt).getTime() <= Date.now();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-2xl bg-site-ink/[0.02] border border-site-ink/5">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-mono font-bold text-site-ink text-sm truncate">{row.code}</p>
          <button onClick={copy} className="text-site-faint hover:text-site-ink transition-colors"><Copy className="h-3.5 w-3.5" /></button>
        </div>
        <p className="text-[11px] text-site-muted font-medium">
          {row.perk === "custom" ? row.customLabel : row.perk === "premium" ? "Premium" : "No-Prefix"} · {row.duration} · {row.uses}/{row.maxUses} used · {formatExpiry(row.expiresAt)}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {row.disabled && <span className="text-[10px] font-black uppercase tracking-wider text-site-ink bg-site-ink/10 border border-site-ink/20 rounded-md px-1.5 py-0.5">Disabled</span>}
        {!row.disabled && fullyUsed && <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-md px-1.5 py-0.5">Fully used</span>}
        {!row.disabled && expired && <span className="text-[10px] font-black uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-1.5 py-0.5">Expired</span>}
        <button disabled={busy} onClick={toggleDisabled} className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-colors disabled:opacity-50",
          row.disabled ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" : "border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20")}>
          {row.disabled ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />} {row.disabled ? "Enable" : "Disable"}
        </button>
        <button disabled={busy} onClick={remove} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-[11px] font-black uppercase tracking-wider hover:bg-red-500/20 transition-colors disabled:opacity-50">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function RedeemCodesContent() {
  const [data, setData] = useState<RedeemCodeList | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setData(await api.getRedeemCodes());
    } catch {
      toast.error("Could not load redeem codes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="bg-site-card border border-site-ink/10 rounded-3xl p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Gift className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-site-ink tracking-tight">Redeem Codes</h2>
            <p className="text-site-muted text-sm font-medium">Generate and manage promotional codes</p>
          </div>
        </div>
        <button onClick={load} className="p-2.5 rounded-xl border border-site-ink/10 hover:bg-site-ink/5 transition-colors" aria-label="Refresh">
          <RefreshCw className={cn("h-4 w-4 text-site-body", loading && "animate-spin")} />
        </button>
      </div>

      <GenerateForm onCreated={load} />

      <div className="grid gap-2">
        {data?.codes.map((row) => <CodeRow key={row.id} row={row} onChanged={load} />)}
        {data && data.codes.length === 0 && <p className="text-center text-site-faint text-sm py-8">No codes yet.</p>}
      </div>
    </div>
  );
}
