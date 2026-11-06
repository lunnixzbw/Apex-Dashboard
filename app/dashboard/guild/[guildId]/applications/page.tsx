"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2, Save, Crown, ArrowLeft, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { MultiPick } from "@/components/dashboard/multi-pick";

const card = "rounded-3xl border border-site-ink/10 bg-site-card p-6";
const field = "w-full rounded-xl border border-site-ink/10 bg-site-card/40 px-3 py-2.5 text-sm text-site-ink outline-none focus:border-site-ink/20";
const lbl = "mb-1.5 block text-sm font-bold text-site-ink";
const hint = "mb-2 text-[11px] italic text-site-faint";

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button type="button" disabled={disabled} onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-emerald-500" : "bg-site-ink/15"} ${disabled ? "opacity-40" : ""}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-site-ink transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}
function Premium({ on }: { on: boolean }) {
  if (on) return null;
  return <span className="ml-2 inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-400"><Crown className="h-3 w-3" />Premium</span>;
}

type Q = { text: string; type: "text" | "choice"; options: string[]; multi: boolean };
const blankQ = (): Q => ({ text: "", type: "text", options: [], multi: false });
const toQ = (q: any): Q => (typeof q === "string" ? { ...blankQ(), text: q } : { ...blankQ(), ...q, options: Array.isArray(q?.options) ? q.options : [] });

const blank = () => ({
  id: 0, name: "", description: "", enabled: true, questions: [blankQ()] as any[],
  settings: {
    submission_channel: null as string | null, confirm_message: null as string | null, complete_message: null as string | null,
    restricted: { enabled: false, mode: "any", roles: [] as string[] }, required: { enabled: false, mode: "any", roles: [] as string[] },
    accept_roles: [] as string[], deny_roles: [] as string[], ping_roles: [] as string[],
    accept_remove_roles: [] as string[], deny_remove_roles: [] as string[], pending_roles: [] as string[], submit_remove_roles: [] as string[],
    manager_roles: [] as string[], staff_threads: false, cooldown_minutes: 0, leave_action: "none", time_limit_minutes: 180,
  } as any,
});

export default function ApplicationsPage({ params }: { params: { guildId: string } }) {
  const gid = params.guildId;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [premium, setPremium] = useState(false);
  const [limits, setLimits] = useState({ forms: 3, panels: 3, questions: 10 });
  const [meta, setMeta] = useState<any>({});
  const [forms, setForms] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [edit, setEdit] = useState<any | null>(null);

  const load = async () => {
    try {
      const [a, m, r, c] = await Promise.all([api.getApplications(gid), api.getAppMeta(gid), api.getRoles(gid), api.getChannels(gid)]);
      setForms(a.items); setPremium(a.premium); setLimits(a.limits); setMeta(m); setRoles(r);
      setChannels(c.filter((x: any) => x.type === "0" || x.type === "5"));
    } catch { toast.error("Failed to load applications"); } finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [gid]);

  const set = (patch: any) => setEdit((e: any) => ({ ...e, ...patch }));
  const setS = (patch: any) => setEdit((e: any) => ({ ...e, settings: { ...e.settings, ...patch } }));
  const setGroup = (k: "restricted" | "required", patch: any) => setEdit((e: any) => ({ ...e, settings: { ...e.settings, [k]: { ...e.settings[k], ...patch } } }));

  const save = async () => {
    if (!edit.name.trim()) return toast.error("Give the application a name.");
    setSaving(true);
    try {
      const body = { name: edit.name, description: edit.description, enabled: edit.enabled, questions: edit.questions.filter((q: Q) => q.text.trim()).map((q: Q) => q.type === "choice" ? { text: q.text.trim(), type: "choice", options: q.options.map((o) => o.trim()).filter(Boolean), multi: q.multi } : q.text.trim()), settings: edit.settings };
      if (edit.id) await api.updateApplication(gid, edit.id, body); else await api.createApplication(gid, body);
      toast.success("Application saved");
      setEdit(null); await load();
    } catch (e: any) { toast.error(e?.message || "Failed to save"); } finally { setSaving(false); }
  };
  const del = async (f: any) => {
    if (!confirm(`Delete "${f.name}" and all of its submissions?`)) return;
    try { await api.deleteApplication(gid, f.id); toast.success("Deleted"); load(); } catch (e: any) { toast.error(e?.message || "Failed"); }
  };

  if (loading) return <div className="p-10 text-site-muted">Loading…</div>;

  // ───────── list ─────────
  if (!edit) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-site-ink">Applications</h1>
            <p className="text-sm text-site-muted">{forms.length}/{limits.forms} applications · up to {limits.questions} questions each{!premium && " (Premium: 10 applications, 100 questions)"}</p>
          </div>
          <button onClick={() => setEdit(blank())} disabled={forms.length >= limits.forms}
            className="flex items-center gap-2 rounded-xl bg-site-ink px-4 py-2.5 text-sm font-bold text-site-bg disabled:opacity-40"><Plus className="h-4 w-4" />Create application</button>
        </div>
        {forms.length === 0 && <div className={card + " text-center text-site-muted"}>No applications yet. Create one, then link it to a panel in <b>App Panels</b>.</div>}
        <div className="grid gap-4 md:grid-cols-2">
          {forms.map((f) => (
            <div key={f.id} className={card}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-site-ink">{f.name}</h3>
                  <p className="text-xs text-site-faint">{f.questions.length} questions · {f.enabled ? "Open" : "Closed"}</p>
                </div>
              </div>
              {f.description && <p className="mt-2 text-sm text-site-muted">{f.description}</p>}
              <div className="mt-4 flex gap-2">
                <button onClick={() => setEdit(JSON.parse(JSON.stringify({ ...f, questions: f.questions.length ? f.questions.map(toQ) : [blankQ()] })))} className="rounded-xl bg-site-ink/10 px-4 py-2 text-sm font-bold text-site-ink hover:bg-site-ink/15">Edit</button>
                <button onClick={() => del(f)} className="rounded-xl bg-site-ink/10 px-3 py-2 text-site-ink hover:bg-site-ink/20"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ───────── editor ─────────
  const s = edit.settings;
  const roleItems = roles.map((r: any) => ({ id: r.id, name: r.name, color: r.color }));
  const chItems = channels.map((c: any) => ({ id: c.id, name: c.name }));
  const roleField = (key: string, label: string, help: string, prem = false) => (
    <div>
      <label className={lbl}>{label}<Premium on={!prem || premium} /></label>
      <p className={hint}>{help}</p>
      <MultiPick items={roleItems} value={s[key]} onChange={(v) => setS({ [key]: v })} placeholder="Add role" prefix="@" disabled={prem && !premium} />
    </div>
  );
  const group = (k: "restricted" | "required", title: string, help: string) => (
    <div className="rounded-2xl border border-site-ink/10 bg-site-card/30 p-4">
      <div className="flex items-center justify-between"><div><span className="text-sm font-bold text-site-ink">{title}</span><p className="text-[11px] italic text-site-faint">{help}</p></div>
        <Toggle checked={s[k].enabled} onChange={(v) => setGroup(k, { enabled: v })} /></div>
      {s[k].enabled && (
        <div className="mt-3 space-y-3">
          <select className={field} value={s[k].mode} onChange={(e) => setGroup(k, { mode: e.target.value })}>
            <option value="any">Member needs ANY one of these roles</option>
            <option value="all">Member needs ALL of these roles</option>
          </select>
          <MultiPick items={roleItems} value={s[k].roles} onChange={(v) => setGroup(k, { roles: v })} placeholder="Add role" prefix="@" />
        </div>
      )}
    </div>
  );
  const qMax = limits.questions;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => setEdit(null)} className="flex items-center gap-2 text-sm font-bold text-site-muted hover:text-site-ink"><ArrowLeft className="h-4 w-4" />Back</button>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-xl bg-site-ink px-5 py-2.5 text-sm font-bold text-site-bg disabled:opacity-50"><Save className="h-4 w-4" />{saving ? "Saving…" : "Save"}</button>
      </div>

      <div className={card + " space-y-4"}>
        <h2 className="text-lg font-bold text-site-ink">General</h2>
        <div><label className={lbl}>Name</label><input className={field} maxLength={60} value={edit.name} onChange={(e) => set({ name: e.target.value })} placeholder="Staff Application" /></div>
        <div><label className={lbl}>Description</label><input className={field} maxLength={300} value={edit.description} onChange={(e) => set({ description: e.target.value })} placeholder="Shown on the panel" /></div>
        <div className="flex items-center justify-between rounded-2xl border border-site-ink/10 bg-site-card/30 p-4"><div><span className="text-sm font-bold text-site-ink">Accepting applications</span><p className="text-[11px] italic text-site-faint">Turn off to close this application.</p></div><Toggle checked={edit.enabled} onChange={(v) => set({ enabled: v })} /></div>
        <div>
          <label className={lbl}>Submissions channel</label>
          <p className={hint}>Finished applications are posted here. Anyone who can see this channel can accept or deny (unless manager roles are set).</p>
          <select className={field} value={s.submission_channel || ""} onChange={(e) => setS({ submission_channel: e.target.value || null })}>
            <option value="">Select a channel…</option>
            {channels.map((c: any) => <option key={c.id} value={c.id}>#{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className={card + " space-y-3"}>
        <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-site-ink">Questions</h2><span className="text-xs text-site-faint">{edit.questions.filter((q: Q) => q.text.trim()).length}/{qMax}{!premium && " · Premium allows 100"}</span></div>
        {edit.questions.map((q: Q, i: number) => {
          const patch = (p: Partial<Q>) => set({ questions: edit.questions.map((x: Q, j: number) => (j === i ? { ...x, ...p } : x)) });
          return (
            <div key={i} className="space-y-2 rounded-2xl border border-site-ink/10 p-3">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 shrink-0 text-site-faint" />
                <span className="w-6 shrink-0 text-xs font-bold text-site-faint">{i + 1}.</span>
                <input className={field} maxLength={300} value={q.text} placeholder="Type a question…" onChange={(e) => patch({ text: e.target.value })} />
                <select className={field + " !w-auto shrink-0"} value={q.type} onChange={(e) => patch({ type: e.target.value as Q["type"], options: e.target.value === "choice" && q.options.length < 2 ? ["", ""] : q.options })}>
                  <option value="text">Written answer</option>
                  <option value="choice">Multiple choice</option>
                </select>
                <button onClick={() => set({ questions: edit.questions.filter((_: any, j: number) => j !== i) })} className="rounded-lg p-2 text-site-faint hover:text-site-ink" aria-label="Remove question"><Trash2 className="h-4 w-4" /></button>
              </div>
              {q.type === "choice" && (
                <div className="space-y-2 pl-10">
                  {q.options.map((o: string, k: number) => (
                    <div key={k} className="flex items-center gap-2">
                      <span className="w-5 shrink-0 text-xs text-site-faint">{String.fromCharCode(65 + (k % 26))}</span>
                      <input className={field} maxLength={100} value={o} placeholder={`Option ${k + 1}`} onChange={(e) => patch({ options: q.options.map((x, m) => (m === k ? e.target.value : x)) })} />
                      <button onClick={() => patch({ options: q.options.filter((_, m) => m !== k) })} disabled={q.options.length <= 2} className="rounded-lg p-2 text-site-faint hover:text-site-ink disabled:opacity-30" aria-label="Remove option"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                  <div className="flex flex-wrap items-center gap-4">
                    <button onClick={() => patch({ options: [...q.options, ""] })} disabled={q.options.length >= 25} className="flex items-center gap-1.5 rounded-lg bg-site-ink/10 px-3 py-1.5 text-xs font-bold text-site-ink disabled:opacity-40"><Plus className="h-3.5 w-3.5" />Add option</button>
                    <label className="flex items-center gap-2 text-xs text-site-muted"><input type="checkbox" checked={q.multi} onChange={(e) => patch({ multi: e.target.checked })} /> Allow picking more than one</label>
                    <span className="text-xs text-site-faint">{q.options.length}/25 options</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <button onClick={() => set({ questions: [...edit.questions, blankQ()] })} disabled={edit.questions.length >= qMax} className="flex items-center gap-2 rounded-xl bg-site-ink/10 px-4 py-2 text-sm font-bold text-site-ink disabled:opacity-40"><Plus className="h-4 w-4" />Add question</button>
      </div>

      <div className={card + " space-y-5"}>
        <h2 className="text-lg font-bold text-site-ink">Who can apply</h2>
        {group("restricted", "Restricted roles", "Members with these roles can NOT apply. Disabled by default.")}
        {group("required", "Required roles", "Members must have these roles to apply. Disabled by default.")}
        <div>
          <label className={lbl}>Application cooldown (minutes)<Premium on={premium} /></label>
          <p className={hint}>How long a member must wait before applying again. 0 = no cooldown.</p>
          <input type="number" min={0} disabled={!premium} className={field + (premium ? "" : " opacity-50")} value={s.cooldown_minutes} onChange={(e) => setS({ cooldown_minutes: Math.max(0, Number(e.target.value) || 0) })} />
        </div>
        <div>
          <label className={lbl}>Time limit (minutes)<Premium on={premium} /></label>
          <p className={hint}>How long the applicant has to finish. Default 180 (3 hours).</p>
          <input type="number" min={5} disabled={!premium} className={field + (premium ? "" : " opacity-50")} value={s.time_limit_minutes} onChange={(e) => setS({ time_limit_minutes: Number(e.target.value) || 180 })} />
        </div>
      </div>

      <div className={card + " space-y-5"}>
        <h2 className="text-lg font-bold text-site-ink">Roles</h2>
        {roleField("pending_roles", "Pending roles", "Given while the application is waiting for review.")}
        {roleField("submit_remove_roles", "Remove roles on submit", "Taken away as soon as the application is submitted.")}
        {roleField("accept_roles", "Accepted roles", "Given when accepted.")}
        {roleField("accept_remove_roles", "Accepted removal roles", "Removed when accepted.")}
        {roleField("deny_roles", "Denied roles", "Given when denied.")}
        {roleField("deny_remove_roles", "Denied removal roles", "Removed when denied.")}
      </div>

      <div className={card + " space-y-5"}>
        <h2 className="text-lg font-bold text-site-ink">Staff</h2>
        {roleField("ping_roles", "Ping roles", "Pinged in the submissions channel when someone submits.")}
        {roleField("manager_roles", "Application managers", "Only these roles can accept/deny. Empty = anyone who can see the submissions channel.", true)}
        <div className="flex items-center justify-between rounded-2xl border border-site-ink/10 bg-site-card/30 p-4"><div><span className="text-sm font-bold text-site-ink">Staff threads</span><p className="text-[11px] italic text-site-faint">Create a thread under every submission for staff discussion. Disabled by default.</p></div><Toggle checked={s.staff_threads} onChange={(v) => setS({ staff_threads: v })} /></div>
        <div>
          <label className={lbl}>When the applicant leaves the server<Premium on={premium} /></label>
          <select disabled={!premium} className={field + (premium ? "" : " opacity-50")} value={s.leave_action} onChange={(e) => setS({ leave_action: e.target.value })}>
            <option value="none">Do nothing</option><option value="deny">Auto-deny pending application</option><option value="delete">Delete pending application</option>
          </select>
        </div>
      </div>

      <div className={card + " space-y-5"}>
        <h2 className="text-lg font-bold text-site-ink">Messages<Premium on={premium} /></h2>
        <div>
          <label className={lbl}>Confirmation message</label>
          <p className={hint}>Variables: {"{applicationName}"} {"{applicantUserId}"} {"{applicant}"}. Leave empty for the default.</p>
          <textarea disabled={!premium} rows={5} className={field + (premium ? "" : " opacity-50")} value={s.confirm_message ?? ""} placeholder={meta.default_confirm} onChange={(e) => setS({ confirm_message: e.target.value || null })} />
        </div>
        <div>
          <label className={lbl}>Completion message</label>
          <textarea disabled={!premium} rows={2} className={field + (premium ? "" : " opacity-50")} value={s.complete_message ?? ""} placeholder={meta.default_complete} onChange={(e) => setS({ complete_message: e.target.value || null })} />
        </div>
      </div>
    </div>
  );
}
