"use client";

import React, { useState } from "react";
import { Plus, Trash2, Save, RefreshCcw, Settings } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CustomRolesFormProps {
  initialConfig: any;
  roles: any[];
  guildId: string;
}

type Row = { word: string; role_id: string };

export function CustomRolesForm({ initialConfig, roles, guildId }: CustomRolesFormProps) {
  const [reqrole, setReqrole] = useState<string | null>(initialConfig?.reqrole ? String(initialConfig.reqrole) : null);
  const [rows, setRows] = useState<Row[]>(
    (initialConfig?.commands || []).map((c: any) => ({ word: String(c.word), role_id: String(c.role_id) }))
  );
  const [saving, setSaving] = useState(false);
  const roleList = roles.filter((r) => r.name !== "@everyone");

  const update = (i: number, patch: Partial<Row>) => setRows(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const save = async () => {
    setSaving(true);
    try {
      await api.updateCustomRoles(guildId, {
        reqrole,
        commands: rows.map((r) => ({ word: r.word.trim().toLowerCase(), role_id: r.role_id })),
      });
      toast.success("Custom roles saved");
    } catch (e: any) {
      toast.error(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-950/40 p-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-primary/20 p-3 text-primary"><Settings className="h-5 w-5" /></div>
            <div>
              <h3 className="text-lg font-black text-white">Who can use these commands</h3>
              <p className="mt-1 text-sm text-slate-400">People with this role can hand out the roles below. If none is set, they need Manage Roles.</p>
            </div>
          </div>
          <div className="w-full md:w-64">
            <Select value={reqrole || "none"} onValueChange={(v) => setReqrole(v === "none" ? null : v)}>
              <SelectTrigger className="h-12 w-full border-slate-800 bg-slate-900 font-medium"><SelectValue placeholder="Select required role..." /></SelectTrigger>
              <SelectContent className="max-h-[300px] border-slate-800 bg-slate-900">
                <SelectItem value="none">None (needs Manage Roles)</SelectItem>
                {roleList.map((r) => <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-black text-white">Role commands</h3>
          {rows.length === 0 && <p className="text-sm text-slate-500">No words yet. Add one below, for example &quot;dev&quot; giving your Dev role.</p>}
          {rows.map((r, i) => (
            <div key={i} className="grid items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 md:grid-cols-[180px_1fr_auto]">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">prefix +</span>
                <Input value={r.word} maxLength={20} placeholder="dev" onChange={(e) => update(i, { word: e.target.value.replace(/[^a-zA-Z0-9_-]/g, "") })} />
              </div>
              <Select value={r.role_id || ""} onValueChange={(v) => update(i, { role_id: v })}>
                <SelectTrigger className="h-11 border-slate-800 bg-slate-900"><SelectValue placeholder="Choose the role it gives" /></SelectTrigger>
                <SelectContent className="max-h-[300px] border-slate-800 bg-slate-900">
                  {roleList.map((role) => <SelectItem key={role.id} value={String(role.id)}>{role.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" onClick={() => setRows(rows.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-300">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" disabled={rows.length >= 25} onClick={() => setRows([...rows, { word: "", role_id: "" }])} className="gap-2">
            <Plus className="h-4 w-4" /> Add a word
          </Button>
        </div>

        <Button onClick={save} disabled={saving} className="h-14 w-full gap-2 text-base font-bold">
          {saving ? <RefreshCcw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          Save Configuration
        </Button>
      </div>

      <div className="space-y-3 rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-transparent p-6 text-sm text-slate-300">
        <h4 className="text-base font-black text-white">How it works</h4>
        <p>Type your prefix, the word, then mention someone. Example: <b>,dev @user</b> gives them the Dev role. Using it again removes the role.</p>
        <ul className="space-y-2 text-slate-400">
          <li>• You can only hand out roles that are <b>below your own highest role</b>. Staff can&apos;t give an Exe role, for example.</li>
          <li>• Apex must be placed <b>above</b> these roles in your server settings.</li>
          <li>• A word can&apos;t be the same as an existing bot command.</li>
        </ul>
      </div>
    </div>
  );
}
