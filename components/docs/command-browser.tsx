"use client";

import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import data from "@/data/commands.json";

type Cmd = { name: string; description: string; aliases: string[]; subcommands: { name: string; description: string }[] };
type Cat = { label: string; commands: Cmd[] };
const CATS = data as Cat[];

export function CommandBrowser() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return CATS.filter((c) => cat === "All" || c.label === cat)
      .map((c) => ({
        label: c.label,
        commands: c.commands.filter((x) =>
          !needle ||
          x.name.includes(needle) ||
          x.description.toLowerCase().includes(needle) ||
          x.aliases.some((a) => a.toLowerCase().includes(needle)) ||
          x.subcommands.some((s) => s.name.toLowerCase().includes(needle) || s.description.toLowerCase().includes(needle))),
      }))
      .filter((c) => c.commands.length);
  }, [q, cat]);

  const total = rows.reduce((n, c) => n + c.commands.length, 0);

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-site-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search commands, e.g. ban, ticket, welcome"
            className="h-11 w-full rounded-xl border border-site-ink/15 bg-site-bg pl-10 pr-4 text-sm text-site-ink placeholder:text-site-faint focus:border-site-ink/50 focus:outline-none" />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)}
          className="h-11 rounded-xl border border-site-ink/15 bg-site-bg px-3 text-sm text-site-ink focus:border-site-ink/50 focus:outline-none">
          <option>All</option>
          {CATS.map((c) => <option key={c.label}>{c.label}</option>)}
        </select>
      </div>
      <p className="mt-3 text-xs text-site-faint">{total} command{total === 1 ? "" : "s"}</p>

      <div className="mt-4 space-y-8">
        {rows.map((c) => (
          <section key={c.label}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-site-faint">{c.label}</h2>
            <div className="divide-y divide-site-ink/10 rounded-2xl border border-site-ink/10 bg-site-card/60">
              {c.commands.map((x) => {
                const aliases = x.aliases.filter((a) => !a.includes(" ")).slice(0, 6);
                return (
                  <div key={x.name} className="p-4">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <code className="font-mono text-sm font-semibold text-site-ink">{x.name}</code>
                      {aliases.length > 0 && <span className="text-xs text-site-faint">aliases: {aliases.join(", ")}</span>}
                    </div>
                    <p className="mt-1 text-sm text-site-muted">{x.description}</p>
                    {x.subcommands.length > 0 && (
                      <ul className="mt-2 grid gap-x-6 gap-y-1 text-xs text-site-faint sm:grid-cols-2">
                        {x.subcommands.map((s) => (
                          <li key={s.name}><code className="font-mono text-site-body">{x.name} {s.name}</code> {s.description && `· ${s.description}`}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
        {total === 0 && <p className="py-10 text-center text-sm text-site-faint">No commands match that search.</p>}
      </div>
    </div>
  );
}
