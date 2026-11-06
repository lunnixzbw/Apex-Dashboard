"use client";

import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PickItem { id: string; name: string; color?: number }

// Chip multi-select used for roles / channels. `max` limits how many can be chosen.
export function MultiPick({
  items, value, onChange, placeholder = "Add…", prefix = "", disabled, max = 25,
}: {
  items: PickItem[]; value: string[]; onChange: (v: string[]) => void;
  placeholder?: string; prefix?: string; disabled?: boolean; max?: number;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const byId = new Map(items.map((i) => [i.id, i]));
  const left = items.filter((i) => !value.includes(i.id) && i.name.toLowerCase().includes(q.toLowerCase()));
  const hex = (c?: number) => (c ? `#${c.toString(16).padStart(6, "0")}` : "#94a3b8");
  return (
    <div className={cn("relative", disabled && "opacity-50 pointer-events-none")}>
      <div className="flex min-h-[44px] flex-wrap items-center gap-1.5 rounded-xl border border-site-ink/10 bg-site-card/40 p-1.5">
        {value.map((id) => {
          const it = byId.get(id);
          return (
            <span key={id} className="flex items-center gap-1 rounded-lg bg-site-ink/10 px-2 py-1 text-xs font-semibold text-site-ink">
              {it?.color !== undefined && <span className="h-2 w-2 rounded-full" style={{ background: hex(it.color) }} />}
              {prefix}{it?.name || id}
              <button type="button" onClick={() => onChange(value.filter((v) => v !== id))} className="text-site-muted hover:text-site-ink"><X className="h-3 w-3" /></button>
            </span>
          );
        })}
        {value.length < max && (
          <button type="button" onClick={() => setOpen((o) => !o)} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-site-muted hover:bg-site-ink/10 hover:text-site-ink">
            <Plus className="h-3 w-3" /> {placeholder}
          </button>
        )}
      </div>
      {open && (
        <div className="absolute z-40 mt-1 w-full rounded-xl border border-site-ink/15 bg-site-card p-2 shadow-2xl">
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="mb-2 w-full rounded-lg border border-site-ink/10 bg-site-card px-3 py-2 text-sm text-site-ink outline-none" />
          <div className="max-h-56 overflow-y-auto">
            {left.length === 0 && <p className="p-2 text-xs text-site-faint">Nothing to add.</p>}
            {left.map((i) => (
              <button key={i.id} type="button" onClick={() => { onChange([...value, i.id]); setQ(""); if (value.length + 1 >= max) setOpen(false); }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-site-ink hover:bg-site-ink/10">
                {i.color !== undefined && <span className="h-2.5 w-2.5 rounded-full" style={{ background: hex(i.color) }} />}
                {prefix}{i.name}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setOpen(false)} className="mt-2 w-full rounded-lg bg-site-ink/10 py-1.5 text-xs font-bold text-site-body">Done</button>
        </div>
      )}
    </div>
  );
}
