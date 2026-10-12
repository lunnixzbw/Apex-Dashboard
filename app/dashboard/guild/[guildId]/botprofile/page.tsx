"use client";

import React, { useState, useEffect } from "react";
import { UserCog, Save, RefreshCcw, RotateCcw, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PremiumGate } from "@/components/premium-gate";
import type { BotProfileConfig } from "@/types/api";

const MAX_BYTES = 2.5 * 1024 * 1024; // Vercel limits request bodies to ~4.5 MB; base64 adds a third

const readImage = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    if (!/^image\/(png|jpeg|gif|webp)$/.test(file.type)) return reject(new Error("Use a PNG, JPG, GIF or WEBP image."));
    if (file.size > MAX_BYTES) return reject(new Error("Image is too large (max 2.5 MB)."));
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Could not read the file."));
    r.readAsDataURL(file);
  });

export default function BotProfilePage({ params }: { params: { guildId: string } }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<BotProfileConfig | null>(null);
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  const load = async () => {
    try {
      const c = await api.getBotProfile(params.guildId);
      setConfig(c);
      setBio(c.bio || "");
      setAvatar(null);
      setBanner(null);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load Bot Profile");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [params.guildId]);

  const pickFile = async (e: React.ChangeEvent<HTMLInputElement>, set: (v: string) => void) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try { set(await readImage(f)); } catch (err: any) { toast.error(err.message); }
    e.target.value = "";
  };

  const save = async () => {
    if (!config) return;
    const data: { avatar?: string; banner?: string; bio?: string } = {};
    if (avatar) data.avatar = avatar;
    if (banner) data.banner = banner;
    if (bio !== (config.bio || "")) data.bio = bio;
    if (!Object.keys(data).length) return toast.info("Nothing to save yet.");
    setSaving(true);
    try {
      await api.updateBotProfile(params.guildId, data);
      toast.success("Bot profile updated for this server");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    setSaving(true);
    try {
      await api.updateBotProfile(params.guildId, { reset: true });
      toast.success("Bot profile reset to default");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Failed to reset");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><RefreshCcw className="w-8 h-8 animate-spin text-primary" /></div>;
  }
  if (!config) return null;
  if (!config.premium) return <PremiumGate feature="Bot Profile" />;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <UserCog className="h-6 w-6 text-primary" /> Bot Profile
        </h2>
        <p className="text-slate-400 mt-1">Change how Apex looks in this server only. Other servers are not affected.</p>
      </div>

      <Card className="border-white/5 bg-black/40">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>PNG, JPG, GIF or WEBP, up to 2.5 MB each.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-3">
            <Label>Banner</Label>
            <div className="relative h-36 w-full overflow-hidden rounded-2xl border border-white/5 bg-[#0f0f0f]">
              {(banner || config.banner_url) && <img src={banner || config.banner_url || ""} alt="Banner" className="h-full w-full object-cover" />}
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/5">
              <ImagePlus className="h-4 w-4" /> Choose banner
              <input type="file" accept="image/png,image/jpeg,image/gif,image/webp" className="hidden" onChange={(e) => pickFile(e, setBanner)} />
            </label>
          </div>

          <div className="space-y-3">
            <Label>Avatar</Label>
            <div className="flex items-center gap-4">
              <img src={avatar || config.avatar_url} alt="Avatar" className="h-24 w-24 rounded-full border border-white/10 object-cover" />
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/5">
                <ImagePlus className="h-4 w-4" /> Choose avatar
                <input type="file" accept="image/png,image/jpeg,image/gif,image/webp" className="hidden" onChange={(e) => pickFile(e, setAvatar)} />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Bio <span className="text-slate-500">({bio.length}/190)</span></Label>
            <Textarea value={bio} maxLength={190} onChange={(e) => setBio(e.target.value)} placeholder="Apex, your server's multipurpose bot" rows={3} />
          </div>

          <div className="flex flex-wrap justify-between gap-3">
            <Button variant="outline" onClick={reset} disabled={saving} className="gap-2">
              <RotateCcw className="w-4 h-4" /> Reset to default
            </Button>
            <Button onClick={save} disabled={saving} className="gap-2">
              {saving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
