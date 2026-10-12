"use client";

import React, { useState, useEffect } from "react";
import { QrCode, Save, RefreshCcw, Trash2, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UpiConfig } from "@/types/api";

const MAX_BYTES = 2.5 * 1024 * 1024;
const SLOTS = [1, 2, 3, 4, 5];

const readImage = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    if (!/^image\/(png|jpeg|gif|webp)$/.test(file.type)) return reject(new Error("Use a PNG, JPG, GIF or WEBP image."));
    if (file.size > MAX_BYTES) return reject(new Error("Image is too large (max 2.5 MB)."));
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Could not read the file."));
    r.readAsDataURL(file);
  });

export default function UpiPage({ params }: { params: { guildId: string } }) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [config, setConfig] = useState<UpiConfig | null>(null);
  const [ids, setIds] = useState<Record<number, string>>({});
  const [qrs, setQrs] = useState<Record<number, string>>({});

  const load = async () => {
    try {
      const c = await api.getUpi(params.guildId);
      setConfig(c);
      const next: Record<number, string> = {};
      c.slots.forEach((s) => (next[s.slot] = s.upi_id));
      setIds(next);
      setQrs({});
    } catch (e: any) {
      toast.error(e?.message || "Failed to load UPI");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [params.guildId]);

  const run = async (slot: number, fn: () => Promise<any>, ok: string) => {
    setBusy(slot);
    try { await fn(); toast.success(ok); await load(); }
    catch (e: any) { toast.error(e?.message || "Something went wrong"); }
    finally { setBusy(null); }
  };

  const pick = async (e: React.ChangeEvent<HTMLInputElement>, slot: number) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try { const d = await readImage(f); setQrs((q) => ({ ...q, [slot]: d })); }
    catch (err: any) { toast.error(err.message); }
    e.target.value = "";
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><RefreshCcw className="w-8 h-8 animate-spin text-primary" /></div>;
  }
  if (!config) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <QrCode className="h-6 w-6 text-primary" /> UPI
        </h2>
        <p className="text-slate-400 mt-1">Up to 5 UPI IDs, each with an optional QR code. Members see them with the show UPI command.</p>
      </div>

      {SLOTS.map((slot) => {
        const saved = config.slots.find((s) => s.slot === slot);
        const qr = qrs[slot] || saved?.qr || null;
        const id = ids[slot] || "";
        const dirty = id !== (saved?.upi_id || "") || !!qrs[slot];
        return (
          <Card key={slot} className="border-white/5 bg-black/40">
            <CardHeader>
              <CardTitle>Slot {slot}</CardTitle>
              <CardDescription>{saved ? "Configured" : "Empty"}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6 md:flex-row">
              <div className="flex-1 space-y-3">
                <Label>UPI ID</Label>
                <Input value={id} placeholder="name@bank" maxLength={160} onChange={(e) => setIds((p) => ({ ...p, [slot]: e.target.value }))} />
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button disabled={busy === slot || !dirty || !id.trim()} className="gap-2"
                    onClick={() => run(slot, () => api.updateUpi(params.guildId, { slot, upi_id: id.trim(), ...(qrs[slot] ? { qr: qrs[slot] } : {}) }), "Saved")}>
                    {busy === slot ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                  </Button>
                  {saved && (
                    <Button variant="outline" disabled={busy === slot} className="gap-2"
                      onClick={() => run(slot, () => api.updateUpi(params.guildId, { remove_slot: slot }), "Slot removed")}>
                      <Trash2 className="w-4 h-4" /> Remove slot
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <Label>QR code</Label>
                <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-[#0f0f0f]">
                  {qr ? <img src={qr} alt={`QR ${slot}`} className="h-full w-full object-contain bg-white" /> : <span className="text-xs text-slate-500">No QR</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/5">
                    <ImagePlus className="h-4 w-4" /> {qr ? "Replace" : "Upload"}
                    <input type="file" accept="image/png,image/jpeg,image/gif,image/webp" className="hidden" onChange={(e) => pick(e, slot)} />
                  </label>
                  {saved?.qr && !qrs[slot] && (
                    <Button variant="outline" size="sm" disabled={busy === slot} onClick={() => run(slot, () => api.updateUpi(params.guildId, { slot, qr: null }), "QR removed")}>
                      Remove QR
                    </Button>
                  )}
                </div>
                {qrs[slot] && <p className="text-xs text-slate-500">Press Save to apply the new QR.</p>}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
