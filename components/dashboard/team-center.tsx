"use client";

import React, { useEffect, useMemo, useState } from "react";
import { UsersRound, Save, RefreshCcw, Search, Crown, ShieldCheck, Code2, UserRound, Check } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type Person = { id: string; username: string; avatar_url: string | null; position: string; position_key: string; is_owner: boolean; permissions: string[] };
type Perm = { key: string; label: string; description: string };

const POS_ICON: Record<string, React.ElementType> = { owner: Crown, core: ShieldCheck, dev: Code2, none: UserRound };

export function TeamCenter() {
  const [people, setPeople] = useState<Person[]>([]);
  const [catalog, setCatalog] = useState<Perm[]>([]);
  const [selected, setSelected] = useState("");
  const [granted, setGranted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lookupId, setLookupId] = useState("");
  const [looking, setLooking] = useState(false);

  const load = async (keep?: string) => {
    try {
      const d = await api.getTeam();
      setPeople(d.members);
      setCatalog(d.catalog);
      const pick = keep && d.members.find((m: Person) => m.id === keep) ? keep : (d.members.find((m: Person) => !m.is_owner)?.id || d.members[0]?.id || "");
      choose(pick, d.members);
    } catch (e: any) {
      toast.error(e?.message || "Could not load the team.");
    } finally {
      setLoading(false);
    }
  };
  const choose = (id: string, list = people) => {
    setSelected(id);
    setGranted(new Set(list.find((p) => p.id === id)?.permissions || []));
  };
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const person = people.find((p) => p.id === selected);
  const dirty = useMemo(() => {
    const cur = new Set(person?.permissions || []);
    return cur.size !== granted.size || [...granted].some((g) => !cur.has(g));
  }, [person, granted]);

  const toggle = (key: string) => setGranted((g) => { const n = new Set(g); n.has(key) ? n.delete(key) : n.add(key); return n; });

  const save = async () => {
    if (!person) return;
    setSaving(true);
    try {
      await api.setTeamPermissions(person.id, [...granted]);
      toast.success(`Permissions saved for ${person.username}`);
      await load(person.id);
    } catch (e: any) {
      toast.error(e?.message || "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  const addById = async () => {
    const id = lookupId.trim();
    if (!/^\d{15,22}$/.test(id)) return toast.error("Paste a Discord user ID (numbers only).");
    setLooking(true);
    try {
      const u: Person = await api.lookupTeamUser(id);
      setPeople((p) => (p.some((x) => x.id === u.id) ? p : [...p, u]));
      setSelected(u.id);
      setGranted(new Set(u.permissions));
      setLookupId("");
    } catch (e: any) {
      toast.error(e?.message || "User not found.");
    } finally {
      setLooking(false);
    }
  };

  if (loading) return <div className="flex min-h-[400px] items-center justify-center"><RefreshCcw className="h-8 w-8 animate-spin text-primary" /></div>;

  const options = people.map((p) => ({ value: p.id, label: `${p.username}  •  ${p.position}` }));
  const PosIcon = POS_ICON[person?.position_key || "none"] || UserRound;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-site-ink"><UsersRound className="h-8 w-8 text-primary" /> Team Center</h1>
        <p className="mt-1 text-site-muted">Choose a person, tick what they are allowed to do, then save. They get the permissions straight away.</p>
      </div>

      <div className="space-y-5 rounded-2xl border border-site-ink/10 bg-site-card p-5 sm:p-6">
        <div className="space-y-2">
          <label className="pl-1 text-xs font-black uppercase tracking-widest text-site-faint">Person</label>
          <Select value={selected} onValueChange={(v: string) => choose(v)} options={options} placeholder="Choose a person" />
          <div className="flex gap-2 pt-1">
            <Input value={lookupId} onChange={(e) => setLookupId(e.target.value)} placeholder="Not listed? Paste a Discord user ID" onKeyDown={(e) => e.key === "Enter" && addById()} />
            <Button variant="outline" onClick={addById} disabled={looking} className="gap-2">{looking ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Find</Button>
          </div>
        </div>

        {person && (
          <div className="flex items-center gap-4 rounded-xl border border-site-ink/10 bg-site-bg p-4">
            {person.avatar_url ? <img src={person.avatar_url} alt="" className="h-14 w-14 rounded-full" /> : <div className="h-14 w-14 rounded-full bg-site-ink/10" />}
            <div className="min-w-0">
              <p className="truncate text-lg font-bold text-site-ink">{person.username}</p>
              <p className="font-mono text-xs text-site-faint">{person.id}</p>
            </div>
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-site-ink/15 px-3 py-1 text-sm font-semibold text-site-ink"><PosIcon className="h-4 w-4" />{person.position}</span>
          </div>
        )}

        {person?.is_owner ? (
          <p className="rounded-xl border border-site-ink/10 bg-site-ink/[0.04] p-4 text-sm text-site-body">Owners already have every permission, so there is nothing to change here.</p>
        ) : person && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="pl-1 text-xs font-black uppercase tracking-widest text-site-faint">Permissions ({granted.size}/{catalog.length})</label>
              <div className="flex gap-3 text-xs">
                <button className="text-site-muted underline-offset-2 hover:underline" onClick={() => setGranted(new Set(catalog.map((c) => c.key)))}>Select all</button>
                <button className="text-site-muted underline-offset-2 hover:underline" onClick={() => setGranted(new Set())}>Clear</button>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {catalog.map((c) => {
                const on = granted.has(c.key);
                return (
                  <button key={c.key} type="button" onClick={() => toggle(c.key)}
                    className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${on ? "border-site-ink/40 bg-site-ink/[0.08]" : "border-site-ink/10 hover:bg-site-ink/[0.04]"}`}>
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${on ? "border-site-ink bg-site-ink text-site-bg" : "border-site-ink/30"}`}>{on && <Check className="h-3.5 w-3.5" />}</span>
                    <span><span className="block text-sm font-semibold text-site-ink">{c.label}</span><span className="block text-xs text-site-muted">{c.description}</span></span>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={save} disabled={saving || !dirty} className="gap-2">{saving ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save permissions</Button>
            </div>
          </div>
        )}
      </div>
      <p className="text-xs text-site-faint">Eval, reboot and managing these permissions always stay owner-only.</p>
    </div>
  );
}
