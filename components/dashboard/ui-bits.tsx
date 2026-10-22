"use client";

import React from "react";

export const card = "rounded-3xl border border-slate-800 bg-[#141B2D] p-6";
export const field = "w-full rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2.5 text-sm text-white outline-none focus:border-slate-600";
export const lbl = "mb-1.5 block text-sm font-bold text-slate-200";
export const hint = "mb-2 text-[11px] italic text-slate-500";

export function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button type="button" disabled={disabled} onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-emerald-500" : "bg-slate-700"} ${disabled ? "opacity-40" : ""}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

export function ToggleRow({ title, help, checked, onChange }: { title: string; help?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
      <div><span className="text-sm font-bold text-slate-200">{title}</span>{help && <p className="text-[11px] italic text-slate-500">{help}</p>}</div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

export function PageTitle({ title, sub }: { title: string; sub: string }) {
  return (<div><h1 className="text-2xl font-extrabold text-white">{title}</h1><p className="text-sm text-slate-400">{sub}</p></div>);
}

export function ChannelSelect({ value, onChange, channels, placeholder = "Select a channel…" }: { value: string | null; onChange: (v: string) => void; channels: any[]; placeholder?: string }) {
  return (
    <select className={field} value={value || ""} onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {channels.map((c: any) => <option key={c.id} value={c.id}>#{c.name}</option>)}
    </select>
  );
}

export function RoleSelect({ value, onChange, roles, placeholder = "No role" }: { value: string | null; onChange: (v: string) => void; roles: any[]; placeholder?: string }) {
  return (
    <select className={field} value={value || ""} onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {roles.map((r: any) => <option key={r.id} value={r.id}>@{r.name}</option>)}
    </select>
  );
}

export const textChannels = (list: any[]) => list.filter((x: any) => x.type === "0" || x.type === "5");
