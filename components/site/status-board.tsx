"use client";

import React, { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

type Stats = { online: boolean; servers?: number; users?: number; ping?: number; uptime_seconds?: number; checked_at?: number };

const num = (n?: number) => (typeof n === "number" ? n.toLocaleString("en-US") : "-");
function uptime(sec?: number) {
  if (typeof sec !== "number") return "-";
  const d = Math.floor(sec / 86400), h = Math.floor((sec % 86400) / 3600), m = Math.floor((sec % 3600) / 60);
  return d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : `${m}m`;
}

export function StatusBoard() {
  const [s, setS] = useState<Stats | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const r = await fetch("/api/status", { cache: "no-store" });
      setS(await r.json());
    } catch {
      setS({ online: false, checked_at: Date.now() });
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [load]);

  const online = !!s?.online;
  const rows: [string, string][] = [
    ["Servers", num(s?.servers)],
    ["Members reached", num(s?.users)],
    ["Latency", typeof s?.ping === "number" ? `${s.ping} ms` : "-"],
    ["Uptime", uptime(s?.uptime_seconds)],
  ];

  return (
    <div className="rounded-2xl border border-site-ink/10 bg-site-card/70">
      <div className="flex items-center justify-between gap-4 border-b border-site-ink/10 p-6">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            {online && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-site-ink opacity-40" />}
            <span className={`relative inline-flex h-3 w-3 rounded-full ${s === null ? "bg-site-faint" : online ? "bg-site-ink" : "border-2 border-site-faint"}`} />
          </span>
          <div>
            <div className="font-outfit text-lg font-semibold text-site-ink">{s === null ? "Checking..." : online ? "All systems operational" : "Bot is offline"}</div>
            <div className="text-xs text-site-faint">{s?.checked_at ? `Checked ${new Date(s.checked_at).toLocaleTimeString()}` : " "}</div>
          </div>
        </div>
        <button onClick={load} disabled={busy} aria-label="Refresh" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-site-ink/15 text-site-ink transition hover:bg-site-ink/10 disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} />
        </button>
      </div>
      <dl className="grid grid-cols-2 gap-px bg-site-ink/10 sm:grid-cols-4">
        {rows.map(([k, v]) => (
          <div key={k} className="bg-site-bg p-5">
            <dt className="text-xs text-site-faint">{k}</dt>
            <dd className="mt-1 font-outfit text-xl font-bold text-site-ink">{online ? v : "-"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
