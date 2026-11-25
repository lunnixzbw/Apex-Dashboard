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

import React, { useState } from "react";
import {
  ShieldAlert,
  Server,
  User,
  Settings,
  RefreshCcw,
  Save,
  MessageSquare,
  Plus,
  Trash2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AntiNukeConfig, AntiNukeWhitelistEntry } from "@/types/api";

const FEATURES = [
  { id: 'anti_ban_kick', name: 'Anti Ban & Kick', desc: 'Auto bans rogue admins', icon: User },
  { id: 'anti_server_edit', name: 'Anti Server Edit', desc: 'Secures icon, name & regions', icon: Server },
  { id: 'anti_role_modifier', name: 'Anti Role Modifier', desc: 'Protects all roles & perms', icon: Settings },
  { id: 'anti_channel_nukes', name: 'Anti Channel Nukes', desc: 'Prevents channel wipes', icon: MessageSquare },
];

interface AntiNukeFormProps {
  initialConfig: AntiNukeConfig;
  guildId: string;
}

export function AntiNukeForm({ initialConfig, guildId }: AntiNukeFormProps) {
  const [config, setConfig] = useState<AntiNukeConfig>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [wlInput, setWlInput] = useState("");
  const categories = config.whitelist_categories || {};
  const categoryKeys = Object.keys(categories);
  const [whitelist, setWhitelist] = useState<AntiNukeWhitelistEntry[]>(
    initialConfig.whitelist || (initialConfig.whitelisted_users || []).map((user_id) => ({ user_id, events: null }))
  );
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [savingEvents, setSavingEvents] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    const promise = api.updateAntiNuke(guildId, config);

    toast.promise(promise, {
      loading: 'Saving Anti-Nuke configuration...',
      success: 'Anti-Nuke settings saved successfully!',
      error: (e: any) => (e?.message && e.message !== 'An unknown error occurred' ? e.message : 'Failed to update Anti-Nuke settings'),
    });

    try {
      await promise;
    } catch (err: any) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddWhitelist = async () => {
    if (!wlInput.trim() || !/^\d{15,22}$/.test(wlInput.trim())) {
      toast.error('Please enter a valid User ID');
      return;
    }
    if (whitelist.some((w) => w.user_id === wlInput.trim())) {
      toast.error('User is already whitelisted');
      return;
    }

    setSaving(true);
    try {
      await api.updateAntiNuke(guildId, { status: config.status, add_whitelist: wlInput.trim() });
      // New entries default to every category, same as before — narrow them per-category below.
      setWhitelist([...whitelist, { user_id: wlInput.trim(), events: null }]);
      setWlInput('');
      toast.success('User whitelisted successfully');
    } catch (err: any) {
      toast.error('Failed to whitelist user');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveWhitelist = async (userId: string) => {
    setSaving(true);
    try {
      await api.updateAntiNuke(guildId, { status: config.status, remove_whitelist: userId });
      setWhitelist(whitelist.filter(w => w.user_id !== userId));
      if (expandedUser === userId) setExpandedUser(null);
      toast.success('User removed from whitelist');
    } catch (err: any) {
      toast.error('Failed to remove user from whitelist');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCategory = async (userId: string, key: string) => {
    const entry = whitelist.find((w) => w.user_id === userId);
    if (!entry) return;
    // null means "every category" — expand it so a single uncheck can take effect.
    const current = entry.events === null ? categoryKeys : entry.events;
    const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
    // Fully re-checked = back to "every category" (store as null, matching the backend's convention).
    const nextEvents = next.length === categoryKeys.length ? null : next;

    setSavingEvents(userId);
    try {
      await api.updateAntiNuke(guildId, { status: config.status, whitelist_events: { user_id: userId, events: nextEvents } });
      setWhitelist(whitelist.map((w) => (w.user_id === userId ? { ...w, events: nextEvents } : w)));
    } catch (err: any) {
      toast.error('Failed to update whitelist permissions');
      console.error(err);
    } finally {
      setSavingEvents(null);
    }
  };

  const handleSelectAllCategories = async (userId: string, selectAll: boolean) => {
    setSavingEvents(userId);
    const nextEvents = selectAll ? null : [];
    try {
      await api.updateAntiNuke(guildId, { status: config.status, whitelist_events: { user_id: userId, events: nextEvents } });
      setWhitelist(whitelist.map((w) => (w.user_id === userId ? { ...w, events: nextEvents } : w)));
    } catch (err: any) {
      toast.error('Failed to update whitelist permissions');
      console.error(err);
    } finally {
      setSavingEvents(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-site-card border border-site-ink/10 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black uppercase text-site-faint tracking-widest">Master Control</h3>
              <Switch 
                checked={config.status} 
                onCheckedChange={(val) => setConfig({ ...config, status: val })}
              />
            </div>

            <div className="space-y-4">
              {FEATURES.map((feature) => (
                <div 
                  key={feature.id}
                  className={cn(
                    "p-6 rounded-2xl border transition-all duration-300",
                    config.status ? "bg-site-card/40 border-site-ink/10" : "bg-site-card/10 border-site-ink/5 opacity-40 grayscale"
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center transition-colors",
                        config.status ? "bg-primary/20 text-primary" : "bg-site-ink/10 text-site-faint"
                      )}>
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-site-ink">{feature.name}</h3>
                        <p className="text-xs text-site-faint max-w-xs">{feature.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                       {config.status && (
                         <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                           <ShieldAlert className="h-4 w-4 text-emerald-500" />
                           <span className="text-xs font-bold text-emerald-500 uppercase">Protected</span>
                         </div>
                       )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-site-ink/10">
              <h4 className="text-sm font-bold text-site-ink mb-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                Whitelisted Users
              </h4>
              
              <div className="flex gap-2 mb-4">
                <Input 
                  placeholder="User ID..." 
                  value={wlInput}
                  onChange={(e) => setWlInput(e.target.value)}
                  className="bg-site-card/50"
                />
                <Button onClick={handleAddWhitelist} disabled={saving} variant="secondary">
                  <Plus className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-2 max-h-[32rem] overflow-y-auto pr-2 custom-scrollbar">
                {whitelist.length === 0 ? (
                  <p className="text-xs text-site-faint italic text-center py-4">No users whitelisted.</p>
                ) : (
                  whitelist.map(({ user_id: userId, events }) => {
                    const isExpanded = expandedUser === userId;
                    const isAll = events === null;
                    const selected = isAll ? categoryKeys : events;
                    return (
                      <div key={userId} className="rounded-xl bg-site-card/30 border border-site-ink/[0.05] overflow-hidden">
                        <div className="flex items-center justify-between p-3">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-site-ink/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-site-muted" />
                            </div>
                            <div>
                              <span className="text-sm font-mono text-site-body block">{userId}</span>
                              <span className="text-[10px] uppercase tracking-wide text-site-faint">
                                {isAll ? 'Exempt from all categories' : `Exempt from ${selected.length}/${categoryKeys.length} categories`}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {categoryKeys.length > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpandedUser(isExpanded ? null : userId)}
                                className="text-site-faint hover:text-site-ink hover:bg-site-ink/10 h-8 w-8 p-0"
                              >
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveWhitelist(userId)}
                              disabled={saving}
                              className="text-site-ink hover:text-site-ink hover:bg-site-ink/10 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {isExpanded && categoryKeys.length > 0 && (
                          <div className="px-3 pb-3 pt-1 border-t border-site-ink/[0.05] space-y-2">
                            <div className="flex items-center justify-between pt-2">
                              <span className="text-[11px] font-bold uppercase text-site-faint tracking-wide">Whitelisted categories</span>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSelectAllCategories(userId, true)}
                                  disabled={savingEvents === userId}
                                  className="text-[11px] font-semibold text-primary hover:underline disabled:opacity-50"
                                >
                                  Select all
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSelectAllCategories(userId, false)}
                                  disabled={savingEvents === userId}
                                  className="text-[11px] font-semibold text-site-faint hover:underline disabled:opacity-50"
                                >
                                  Clear
                                </button>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {categoryKeys.map((key) => {
                                const checked = selected.includes(key);
                                return (
                                  <button
                                    key={key}
                                    type="button"
                                    onClick={() => handleToggleCategory(userId, key)}
                                    disabled={savingEvents === userId}
                                    className={cn(
                                      "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors disabled:opacity-50",
                                      checked
                                        ? "bg-primary/15 border-primary/40 text-primary"
                                        : "bg-site-card/40 border-site-ink/10 text-site-faint hover:border-site-ink/20"
                                    )}
                                  >
                                    <span className={cn(
                                      "h-4 w-4 rounded border flex items-center justify-center shrink-0",
                                      checked ? "bg-primary border-primary" : "border-site-ink/20"
                                    )}>
                                      {checked && <Check className="h-3 w-3 text-white" />}
                                    </span>
                                    {categories[key]}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <Button 
              onClick={handleSave}
              disabled={saving}
              className="w-full h-14 text-base font-bold gap-2"
            >
              {saving ? <RefreshCcw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              Save Configuration
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
         <div className="bg-gradient-to-br from-site-ink/10 to-transparent border border-site-ink/20 rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 transition-transform">
              <ShieldAlert className="h-32 w-32 text-site-ink" />
            </div>
            <h3 className="text-sm font-bold text-site-ink mb-2">Maximum Protection</h3>
            <p className="text-xs text-site-muted leading-relaxed mb-4">Anti-Nuke is fixed to instantly Ban malicious actors. Ensure that Zevion&apos;s role is at the TOP of the role hierarchy for it to be able to ban admins.</p>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-site-ink animate-pulse" />
              <span className="text-[10px] font-black uppercase text-site-ink">Fixed Punishments</span>
            </div>
         </div>
      </div>
    </div>
  );
}
