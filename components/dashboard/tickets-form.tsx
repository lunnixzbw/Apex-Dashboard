/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║                                                                  ║
 * ║   ░█▀▀░█▀█░█▀▄░█▀▀░█░█   ░█▀▄░█▀▀░█░█░█▀▀                     ║
 * ║   ░█░░░█░█░█░█░█▀▀░▄▀▄   ░█░█░█▀▀░▀▄▀░▀▀█                     ║
 * ║   ░▀▀▀░▀▀▀░▀▀░░▀▀▀░▀░▀   ░▀▀░░▀▀▀░░▀░░▀▀▀                     ║
 * ║                                                                  ║
 * ║           © 2026 CodeX Devs — All Rights Reserved               ║
 * ║                                                                  ║
 * ║   discord  ──  https://discord.gg/codexdev                      ║
 * ║   youtube  ──  https://youtube.com/@CodeXDevs                   ║
 * ║   github   ──  https://github.com/RayExo                        ║
 * ║                                                                  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

"use client";

import React, { useEffect, useState } from "react";
import { 
  Plus, 
  ExternalLink,
  Mail,
  Zap,
  Tag,
  X,
  Save,
  Trash2,
  Settings2,
  Edit3,
  RefreshCcw,
  MessageSquare,
  Hash,
  Shield,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TicketConfig, TicketCategory, TicketEmbed, TicketQuestion } from "@/types/api";

interface TicketsFormProps {
  initialConfig: TicketConfig;
  guildId: string;
  channels?: any[];
  roles?: any[];
}

// Renders a Discord emoji: custom <:name:id> as an image, anything else as plain text.
export function EmojiView({ value, className = "h-6 w-6" }: { value?: string | null; className?: string }) {
  const m = /^<(a?):([\w]+):(\d{15,25})>$/.exec((value || "").trim());
  if (m) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={`https://cdn.discordapp.com/emojis/${m[3]}.${m[1] ? "gif" : "png"}?size=64`} alt={m[2]} className={`${className} object-contain`} />;
  }
  return <span className="text-xl leading-none">{value || "📩"}</span>;
}

// Dropdown of this server's channels (kinds: "0" text, "5" announcement, "4" category).
function ChannelPicker({ value, onChange, channels, kinds, placeholder }: {
  value: string | null | undefined; onChange: (v: string) => void; channels: any[]; kinds: string[]; placeholder: string;
}) {
  const list = channels.filter((c) => kinds.includes(String(c.type)));
  return (
    <Select value={value ? String(value) : ""} onValueChange={onChange}>
      <SelectTrigger className="bg-site-card/50 border-site-ink/10">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-site-card border-site-ink/10 max-h-72">
        {list.map((c) => (
          <SelectItem key={c.id} value={String(c.id)}>{String(c.type) === "4" ? c.name : `#${c.name}`}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Click roles to toggle them on/off.
function RolePicker({ value, onChange, roles }: { value: string[]; onChange: (v: string[]) => void; roles: any[] }) {
  const selected = new Set((value || []).map(String));
  if (!roles.length) return <p className="text-sm text-site-faint">No roles found.</p>;
  return (
    <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto rounded-2xl border border-site-ink/10 bg-site-card/40 p-3">
      {roles.map((r) => {
        const id = String(r.id);
        const on = selected.has(id);
        return (
          <button
            type="button"
            key={id}
            onClick={() => {
              const next = new Set(selected);
              if (on) next.delete(id); else next.add(id);
              onChange([...next]);
            }}
            className={`rounded-full border px-3 py-1 text-sm transition ${on ? "border-primary bg-primary/20 text-site-ink" : "border-site-ink/15 text-site-muted hover:border-site-ink/25"}`}
          >
            {r.name}
          </button>
        );
      })}
    </div>
  );
}

export function TicketsForm({ initialConfig, guildId, channels = [], roles = [] }: TicketsFormProps) {
  const [config, setConfig] = useState<TicketConfig>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{index: number, data: TicketCategory} | null>(null);
  const [editingEmbed, setEditingEmbed] = useState<TicketEmbed | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [panelId, setPanelId] = useState<number | null>(initialConfig.panel_id ?? null);
  const [presets, setPresets] = useState<{ key: string; name: string; description: string; emoji: string | null; questions: number; added: boolean }[]>([]);
  const [addingPreset, setAddingPreset] = useState<string | null>(null);
  const [welcome, setWelcome] = useState({ title: "", message: "", image_url: "" });
  const [savingWelcome, setSavingWelcome] = useState(false);

  useEffect(() => {
    if ((initialConfig as any).configured === false) return;
    api.getTicketWelcome(guildId).then((w) => setWelcome({ title: w.title || "", message: w.message || "", image_url: w.image_url || "" })).catch(() => {});
  }, [guildId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function saveWelcome() {
    setSavingWelcome(true);
    try {
      await api.updateTicketWelcome(guildId, welcome);
      toast.success("Opened ticket message saved");
    } catch (e: any) {
      toast.error(e?.message && e.message !== "An unknown error occurred" ? e.message : "Failed to save");
    } finally { setSavingWelcome(false); }
  }

  async function loadPresets() {
    try { const r = await api.getTicketPresets(guildId); setPresets(r.presets || []); } catch { /* optional section */ }
  }
  useEffect(() => { if ((initialConfig as any).configured !== false) loadPresets(); }, [guildId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function addPreset(keys: string[]) {
    setAddingPreset(keys.length === 1 ? keys[0] : "all");
    try {
      const r = await api.addTicketPresets(guildId, keys, panelId);
      toast.success(r.added.length ? `Added ${r.added.join(", ")}. Press Send Panel to update the dropdown.` : "Those presets already exist.");
      await fetchUpdatedConfig();
      await loadPresets();
    } catch (e: any) {
      toast.error(e?.message || "Failed to add presets");
    } finally { setAddingPreset(null); }
  }

  async function fetchUpdatedConfig(pid: number | null = panelId) {
    try {
      const data = await api.getTickets(guildId, pid);
      setPanelId(data.panel_id ?? null);
      setConfig(data);
    } catch (err) {
      console.error("Failed to fetch ticket config:", err);
    }
  }

  const handleUpdate = async (updateData: any) => {
    setSaving(true);
    const promise = api.updateTickets(guildId, updateData, panelId);

    toast.promise(promise, {
      loading: 'Updating ticket settings...',
      success: 'Settings updated successfully',
      error: (e: any) => (e?.message && e.message !== 'An unknown error occurred' ? e.message : 'Failed to update settings'),
    });

    try {
      await promise;
      await fetchUpdatedConfig();
      setIsAdding(false);
      setEditingCategory(null);
      setEditingEmbed(null);
    } catch (err) {
      console.error("Failed to update settings:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = () => {
    setEditingCategory({ 
      index: -1, 
      data: { name: "", emoji: "📩", description: "", staff_roles: [], button_style: 2, discord_category_id: "" } 
    });
    setIsAdding(true);
  };

  const handleRemoveCategory = (index: number) => {
    const newCategories = [...config.categories];
    newCategories.splice(index, 1);
    handleUpdate({ categories: newCategories });
  };

  const handleSaveCategory = () => {
    if (!editingCategory) return;
    const newCategories = [...config.categories];
    if (isAdding) {
      newCategories.push(editingCategory.data);
    } else {
      newCategories[editingCategory.index] = editingCategory.data;
    }
    handleUpdate({ categories: newCategories });
  };

  const handleSaveEmbed = () => {
    if (!editingEmbed) return;
    handleUpdate({
      embed_title: editingEmbed.title,
      embed_description: editingEmbed.description,
      embed_color: editingEmbed.color,
      embed_image_url: editingEmbed.image_url,
      embed_thumbnail_url: editingEmbed.thumbnail_url
    });
  };

  const configured = (config as any).configured !== false;
  const handleSaveGlobal = () => {
    if (!configured && (!config.panel_channel || !config.logging_channel || !(config.staff_roles || []).length || !config.default_category_id)) {
      toast.error("Pick a panel channel, logging channel, ticket category and at least one staff role.");
      return;
    }
    handleUpdate({
      default_category_id: config.default_category_id || undefined,
      panel_channel: config.panel_channel,
      logging_channel: config.logging_channel,
      panel_type: config.panel_type,
      staff_roles: config.staff_roles
    });
  };

  return (
    <>
      {/* Category Editor Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-site-bg/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-site-card border border-site-ink/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-site-ink/10 flex items-center justify-between bg-site-card/50">
                <h3 className="font-bold text-lg text-site-ink flex items-center gap-2">
                   {isAdding ? <Plus className="h-5 w-5 text-primary" /> : <Edit3 className="h-5 w-5 text-primary" />}
                   {isAdding ? "Add Category" : "Edit Category"}
                </h3>
                <button onClick={() => setEditingCategory(null)} className="text-site-faint hover:text-site-ink transition-colors">
                   <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                   <label className="text-xs font-black uppercase text-site-faint tracking-widest">Category Name</label>
                   <Input 
                      value={editingCategory.data.name} 
                      onChange={(e) => setEditingCategory({...editingCategory, data: {...editingCategory.data, name: e.target.value}})}
                      placeholder="e.g. Bug Reports"
                   />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-site-faint tracking-widest">Emoji Icon</label>
                    <Input 
                        value={editingCategory.data.emoji || ""} 
                        onChange={(e) => setEditingCategory({...editingCategory, data: {...editingCategory.data, emoji: e.target.value}})}
                        placeholder="🐛 or a custom emoji like <:name:123456789>"
                    />
                  </div>
                  <div className="flex items-end gap-3 pb-1"><EmojiView value={editingCategory.data.emoji} /><p className="text-xs text-site-faint">Preview</p></div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-site-faint tracking-widest">Description (shown under the name in the dropdown)</label>
                  <Input
                    maxLength={100}
                    value={editingCategory.data.description || ""}
                    onChange={(e) => setEditingCategory({...editingCategory, data: {...editingCategory.data, description: e.target.value}})}
                    placeholder="e.g. Get help with anything about the server"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-site-faint tracking-widest">Discord Category (optional)</label>
                  <ChannelPicker
                    value={editingCategory.data.discord_category_id}
                    onChange={(v) => setEditingCategory({...editingCategory, data: {...editingCategory.data, discord_category_id: v}})}
                    channels={channels}
                    kinds={["4"]}
                    placeholder="Defaults to the main ticket category"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase text-site-faint tracking-widest">Form questions (asked before the ticket opens, max 5)</label>
                    <Button
                      size="sm" variant="outline" className="h-7 text-xs"
                      disabled={(editingCategory.data.questions || []).length >= 5}
                      onClick={() => setEditingCategory({...editingCategory, data: {...editingCategory.data, questions: [...(editingCategory.data.questions || []), { label: "", placeholder: "", paragraph: false, required: true }]}})}
                    >
                      <Plus className="h-3 w-3" /> Add
                    </Button>
                  </div>
                  {(editingCategory.data.questions || []).length === 0 && <p className="text-xs text-site-faint">No questions: the ticket opens straight away.</p>}
                  {(editingCategory.data.questions || []).map((q: TicketQuestion, qi: number) => {
                    const setQ = (patch: Partial<TicketQuestion>) => {
                      const list = [...(editingCategory.data.questions || [])];
                      list[qi] = { ...list[qi], ...patch };
                      setEditingCategory({...editingCategory, data: {...editingCategory.data, questions: list}});
                    };
                    return (
                      <div key={qi} className="space-y-2 rounded-2xl border border-site-ink/10 bg-site-card/40 p-3">
                        <div className="flex gap-2">
                          <Input maxLength={45} value={q.label} onChange={(e) => setQ({ label: e.target.value })} placeholder={`Question ${qi + 1} (max 45 characters)`} />
                          <button
                            type="button"
                            onClick={() => setEditingCategory({...editingCategory, data: {...editingCategory.data, questions: (editingCategory.data.questions || []).filter((_: TicketQuestion, i: number) => i !== qi)}})}
                            className="rounded-lg p-2 text-site-muted hover:bg-site-ink/10 hover:text-site-ink"
                          ><Trash2 className="h-4 w-4" /></button>
                        </div>
                        <Input maxLength={100} value={q.placeholder || ""} onChange={(e) => setQ({ placeholder: e.target.value })} placeholder="Placeholder (optional)" />
                        <div className="flex gap-4 text-xs text-site-muted">
                          <label className="flex items-center gap-1.5"><input type="checkbox" checked={!!q.paragraph} onChange={(e) => setQ({ paragraph: e.target.checked })} /> Long answer</label>
                          <label className="flex items-center gap-1.5"><input type="checkbox" checked={q.required !== false} onChange={(e) => setQ({ required: e.target.checked })} /> Required</label>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 flex gap-3">
                   <Button variant="outline" className="flex-1" onClick={() => setEditingCategory(null)}>Cancel</Button>
                   <Button className="flex-1 gap-2" onClick={handleSaveCategory} disabled={saving || !editingCategory.data.name}>
                     {saving ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                     Save Category
                   </Button>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Embed Appearance Editor Modal */}
      {editingEmbed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-site-bg/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-site-card border border-site-ink/10 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-site-ink/10 flex items-center justify-between bg-site-card/50">
                <h3 className="font-bold text-lg text-site-ink flex items-center gap-2">
                   <Edit3 className="h-5 w-5 text-primary" />
                   Customize Panel Appearance
                </h3>
                <button onClick={() => setEditingEmbed(null)} className="text-site-faint hover:text-site-ink transition-colors">
                   <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                   <label className="text-xs font-black uppercase text-site-faint tracking-widest">Embed Title</label>
                   <Input 
                      value={editingEmbed.title || ""} 
                      onChange={(e) => setEditingEmbed({...editingEmbed, title: e.target.value})}
                      placeholder="e.g. Support Department"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-black uppercase text-site-faint tracking-widest">Embed Description</label>
                   <Textarea 
                      value={editingEmbed.description || ""} 
                      onChange={(e) => setEditingEmbed({...editingEmbed, description: e.target.value})}
                      placeholder="Open a ticket below to talk to our staff..."
                      className="h-24"
                   />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-site-faint tracking-widest">Color (Decimal)</label>
                    <Input 
                        value={editingEmbed.color || ""} 
                        onChange={(e) => setEditingEmbed({...editingEmbed, color: e.target.value ? parseInt(e.target.value) : null})}
                        placeholder="e.g. 16711680 for Red"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-site-faint tracking-widest">Thumbnail URL</label>
                    <Input 
                        value={editingEmbed.thumbnail_url || ""} 
                        onChange={(e) => setEditingEmbed({...editingEmbed, thumbnail_url: e.target.value})}
                        placeholder="Leave empty to use the server icon"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-black uppercase text-site-faint tracking-widest">
                     Large Image URL {!(config as any).premium && <span className="ml-1 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] text-amber-400">PREMIUM</span>}
                   </label>
                   <Input 
                      disabled={!(config as any).premium}
                      value={editingEmbed.image_url || ""} 
                      onChange={(e) => setEditingEmbed({...editingEmbed, image_url: e.target.value})}
                      placeholder={(config as any).premium ? "Large bottom image" : "Requires Zevion Premium"}
                   />
                </div>
                
                <div className="pt-4 flex gap-3">
                   <Button variant="outline" className="flex-1" onClick={() => setEditingEmbed(null)}>Cancel</Button>
                   <Button className="flex-1 gap-2" onClick={handleSaveEmbed} disabled={saving}>
                     {saving ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                     Save Appearance
                   </Button>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Panel tabs */}
      {configured && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {(config.panels || []).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => { setPanelId(p.id); fetchUpdatedConfig(p.id); }}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${p.id === panelId ? "border-primary bg-primary/20 text-site-ink" : "border-site-ink/15 text-site-muted hover:border-site-ink/25"}`}
            >
              {p.name}
            </button>
          ))}
          <Button
            size="sm" variant="outline" className="h-8 gap-1 text-xs border-primary/20 text-primary hover:bg-primary/10"
            disabled={saving}
            onClick={async () => {
              try {
                const r = await api.createTicketPanel(guildId);
                toast.success("Panel created");
                await fetchUpdatedConfig(r.id);
              } catch (e: any) { toast.error(e?.message || "Could not create panel"); }
            }}
          >
            <Plus className="h-3 w-3" /> New Panel ({(config.panels || []).length}/{config.panel_limit ?? 3})
          </Button>
          {(config.panels || []).length > 1 && panelId && (
            <Button
              size="sm" variant="outline" className="h-8 gap-1 text-xs border-site-ink/30 text-site-ink hover:bg-site-ink/10"
              onClick={async () => {
                if (!confirm("Delete this panel, its categories and its message?")) return;
                try { await api.deleteTicketPanel(guildId, panelId); toast.success("Panel deleted"); await fetchUpdatedConfig(null); }
                catch (e: any) { toast.error(e?.message || "Could not delete panel"); }
              }}
            >
              <Trash2 className="h-3 w-3" /> Delete This Panel
            </Button>
          )}
          <Button
            size="sm" variant="outline" className="h-8 gap-1 text-xs"
            onClick={async () => {
              try {
                const r = await api.shareTicketPanel(guildId, panelId);
                try { await navigator.clipboard.writeText(r.code); } catch { /* clipboard blocked */ }
                toast.success(`Panel ID ${r.code} copied`);
              } catch (e: any) { toast.error(e?.message || "Could not get the panel ID"); }
            }}
          >
            Copy Panel ID
          </Button>
          <Button
            size="sm" variant="outline" className="h-8 gap-1 text-xs"
            onClick={async () => {
              const code = window.prompt("Paste a panel ID (APX-XXXXXXXX) from any server:");
              if (!code) return;
              try {
                const r = await api.importTicketPanel(guildId, code.trim());
                toast.success(`Imported with ${r.categories} categories${r.image_skipped ? " (large image skipped, needs Premium)" : ""}`);
                await fetchUpdatedConfig(r.id);
              } catch (e: any) { toast.error(e?.message || "Import failed"); }
            }}
          >
            Import Panel
          </Button>
          {!(config as any).premium && <span className="text-xs text-site-faint">Free: 3 panels. Premium: 10.</span>}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Setup */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-site-card border border-site-ink/10 rounded-3xl p-8 shadow-xl space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary"><Settings2 className="h-5 w-5" /></div>
              <h3 className="text-xl font-bold text-site-ink">Global Configuration</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-site-faint tracking-widest">Panel Channel</label>
                <ChannelPicker
                  value={config.panel_channel}
                  onChange={(v) => setConfig({...config, panel_channel: v})}
                  channels={channels}
                  kinds={["0", "5"]}
                  placeholder="Where the ticket panel lives"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-site-faint tracking-widest">Logging Channel</label>
                <ChannelPicker
                  value={config.logging_channel}
                  onChange={(v) => setConfig({...config, logging_channel: v})}
                  channels={channels}
                  kinds={["0", "5"]}
                  placeholder="Where transcripts go"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-site-faint tracking-widest">Ticket Category (where tickets open)</label>
                <ChannelPicker
                  value={config.default_category_id}
                  onChange={(v) => setConfig({...config, default_category_id: v})}
                  channels={channels}
                  kinds={["4"]}
                  placeholder="Pick a Discord category"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-site-faint tracking-widest">Panel Interaction Type</label>
                <Select 
                  value={config.panel_type || "button"}
                  onValueChange={(val) => setConfig({...config, panel_type: val})}
                >
                  <SelectTrigger className="bg-site-card/50 border-site-ink/10">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-site-card border-site-ink/10">
                    <SelectItem value="button">Buttons</SelectItem>
                    <SelectItem value="dropdown">Dropdown Menu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-black uppercase text-site-faint tracking-widest">Support / Staff Roles</label>
                <RolePicker
                  value={config.staff_roles}
                  onChange={(v) => setConfig({...config, staff_roles: v})}
                  roles={roles}
                />
                <p className="text-xs text-site-faint">The first role you pick becomes the main support role. All selected roles can see every ticket.</p>
              </div>
            </div>

            <Button onClick={handleSaveGlobal} disabled={saving} className="w-full gap-2" variant="secondary">
              {saving ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {configured ? "Save Core Settings" : "Set Up Ticket System"}
            </Button>
            {configured && (
              <Button
                variant="outline"
                className="w-full gap-2"
                disabled={saving || config.categories.length === 0}
                onClick={async () => {
                  try { await api.publishTicketPanel(guildId, panelId); toast.success("Panel sent to the panel channel"); await fetchUpdatedConfig(); }
                  catch (e: any) { toast.error(e?.message || "Failed to send panel"); }
                }}
              >
                <Mail className="h-4 w-4" />
                {config.panel_message ? "Update / Resend Panel" : "Send Panel"}
              </Button>
            )}
          </div>

          {/* Categories Section */}
          <section className="bg-site-card border border-site-ink/10 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-site-ink/10 flex items-center justify-between bg-site-card/20">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-site-ink">Ticket Categories</h3>
              </div>
              <Button size="sm" variant="outline" disabled={!configured} className="h-8 gap-1 text-xs border-primary/20 text-primary hover:bg-primary/10" onClick={handleAddCategory}>
                 <Plus className="h-3 w-3" />
                 Add New
              </Button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {config.categories.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-site-card/50 rounded-2xl border border-site-ink/5 hover:border-primary/30 transition-all group">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-xl bg-site-ink/10 flex items-center justify-center shadow-inner overflow-hidden">
                        <EmojiView value={cat.emoji} />
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-bold text-site-ink group-hover:text-site-ink transition-colors">{cat.name}</span>
                        <span className="truncate text-[11px] text-site-faint">{cat.description || "No description"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => {
                         setEditingCategory({index: i, data: {...cat}});
                         setIsAdding(false);
                       }} className="p-2 hover:bg-site-ink/10 rounded-lg text-site-muted hover:text-primary transition-colors">
                         <Settings2 className="h-4 w-4" />
                       </button>
                       <button onClick={() => handleRemoveCategory(i)} className="p-2 hover:bg-site-ink/10 rounded-lg text-site-muted hover:text-site-ink transition-colors">
                         <Trash2 className="h-4 w-4" />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Presets Section */}
          {configured && presets.length > 0 && (
            <section className="bg-site-card border border-site-ink/10 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-site-ink/10 flex items-center justify-between bg-site-card/20">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-site-ink">Presets</h3>
                </div>
                <Button size="sm" variant="outline" disabled={saving || addingPreset !== null || presets.every((p) => p.added)} className="h-8 gap-1 text-xs border-primary/20 text-primary hover:bg-primary/10"
                  onClick={() => addPreset(presets.filter((p) => !p.added).map((p) => p.key))}>
                  <Plus className="h-3 w-3" />
                  Add All
                </Button>
              </div>
              <div className="p-6">
                <p className="mb-4 text-xs text-site-faint">Ready-made categories with an emoji and a short question form. Added to the panel you have selected.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {presets.map((p) => (
                    <div key={p.key} className="flex items-center justify-between gap-3 p-4 bg-site-card/50 rounded-2xl border border-site-ink/5">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-site-ink/10 flex items-center justify-center shadow-inner overflow-hidden">
                          <EmojiView value={p.emoji} />
                        </div>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate text-sm font-bold text-site-ink">{p.name}</span>
                          <span className="truncate text-[11px] text-site-faint">{p.description}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" disabled={p.added || saving || addingPreset !== null} className="h-8 shrink-0 text-xs" onClick={() => addPreset([p.key])}>
                        {p.added ? "Added" : addingPreset === p.key ? "Adding..." : "Add"}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Opened ticket message */}
          {configured && (
            <section className="bg-site-card border border-site-ink/10 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-site-ink/10 flex items-center gap-2 bg-site-card/20">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-site-ink">Opened Ticket Message</h3>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-xs text-site-faint">The message members see inside a new ticket. Leave a box empty to use the default. Placeholders: <code>{"{user}"}</code> <code>{"{username}"}</code> <code>{"{category}"}</code> <code>{"{server}"}</code></p>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-site-faint tracking-widest">Title</label>
                  <Input value={welcome.title} maxLength={200} onChange={(e) => setWelcome({ ...welcome, title: e.target.value })} placeholder="{category} Ticket" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-site-faint tracking-widest">Message</label>
                  <Textarea value={welcome.message} maxLength={1500} rows={5} onChange={(e) => setWelcome({ ...welcome, message: e.target.value })} placeholder={"Welcome {user}! Tell us what you need and our staff will be with you shortly."} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-site-faint tracking-widest">Large image URL (optional)</label>
                  <Input value={welcome.image_url} maxLength={400} onChange={(e) => setWelcome({ ...welcome, image_url: e.target.value })} placeholder="https://... (empty = no image)" />
                </div>
                <Button disabled={savingWelcome} className="gap-2" onClick={saveWelcome}>
                  <Save className="h-4 w-4" />
                  {savingWelcome ? "Saving..." : "Save Message"}
                </Button>
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Stats & Configuration */}
        <div className="space-y-6">
          <div className="bg-site-card border border-site-ink/10 p-6 rounded-3xl group shadow-lg">
              <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(88,101,242,0.5)]" />
              </div>
              <p className="text-sm font-medium text-site-faint">Currently Open</p>
              <h3 className="text-3xl font-black text-site-ink mt-1">{config.open_ticket_count} Tickets</h3>
          </div>

          <section className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 transition-transform">
              <Mail className="h-32 w-32 text-site-ink" />
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-site-ink">Panel Appearance</h3>
            </div>
            <div className="space-y-3 relative z-10">
               <div className="p-3 bg-site-bg/20 rounded-xl border border-site-ink/5">
                  <p className="text-[10px] uppercase font-bold text-site-faint mb-1">Title</p>
                  <p className="text-sm text-site-ink font-medium truncate">{config.embed.title || 'Support Department'}</p>
               </div>
               <div className="p-3 bg-site-bg/20 rounded-xl border border-site-ink/5">
                  <p className="text-[10px] uppercase font-bold text-site-faint mb-1">Description</p>
                  <p className="text-xs text-site-muted line-clamp-2 leading-relaxed">
                    {config.embed.description || 'Open a ticket below to talk to our staff.'}
                  </p>
               </div>
            </div>
            <Button 
              variant="secondary" 
              className="w-full mt-6 py-5 text-xs font-bold uppercase tracking-wider"
              onClick={() => setEditingEmbed({...config.embed})}
            >
              Edit Appearance
            </Button>
          </section>
        </div>
      </div>
    </>
  );
}
