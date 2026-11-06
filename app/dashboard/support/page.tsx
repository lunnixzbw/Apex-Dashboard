"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Check, Inbox, Loader2, Mail, RotateCcw } from "lucide-react";
import { toast } from "sonner";

type Ticket = {
  code: string; user_id: string | null; name: string; email: string; category: string;
  subject: string; message: string; status: "open" | "closed"; closed_by: string | null; created_at: string;
};

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [filter, setFilter] = useState<"open" | "closed" | "all">("open");
  const [denied, setDenied] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await fetch(`/api/staff/tickets${filter === "all" ? "" : `?status=${filter}`}`, { cache: "no-store" });
    if (r.status === 403) return setDenied(true);
    const d = await r.json().catch(() => []);
    if (!r.ok) { toast.error(d.detail || "Could not load tickets"); return setTickets([]); }
    setTickets(d);
  }, [filter]);

  useEffect(() => { setTickets(null); load(); }, [load]);

  const setStatus = async (t: Ticket, status: "open" | "closed") => {
    setBusy(t.code);
    try {
      const r = await fetch(`/api/staff/tickets/${t.code}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.detail || "Failed");
      await load();
    } catch (e: any) { toast.error(e.message || "Could not update the ticket"); }
    finally { setBusy(null); }
  };

  if (denied) return <p className="py-20 text-center text-site-muted">You do not have access to support tickets.</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      <div>
        <h1 className="font-outfit text-3xl font-bold text-site-ink">Support tickets</h1>
        <p className="mt-1 text-sm text-site-muted">Tickets sent from the website contact form. Reply by email, then close the ticket.</p>
      </div>

      <div className="inline-flex rounded-xl border border-site-ink/15 p-1">
        {(["open", "closed", "all"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`h-9 rounded-lg px-5 text-sm font-semibold capitalize transition ${filter === f ? "bg-site-ink text-site-bg" : "text-site-muted hover:text-site-ink"}`}>{f}</button>
        ))}
      </div>

      {tickets === null && <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-site-faint" /></div>}
      {tickets && tickets.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-site-ink/10 py-16 text-site-faint"><Inbox className="h-8 w-8" /><p className="mt-3 text-sm">No {filter === "all" ? "" : filter} tickets.</p></div>
      )}

      <div className="space-y-3">
        {tickets?.map((t) => (
          <details key={t.code} className="group rounded-2xl border border-site-ink/10 bg-site-card/70">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 [&::-webkit-details-marker]:hidden">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-site-ink/10 px-2 py-0.5 font-mono text-xs text-site-ink">{t.code}</span>
                  <span className="text-xs text-site-faint">{t.category}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${t.status === "open" ? "bg-site-ink text-site-bg" : "border border-site-ink/20 text-site-faint"}`}>{t.status}</span>
                </div>
                <div className="mt-1.5 truncate font-semibold text-site-ink">{t.subject}</div>
                <div className="text-xs text-site-faint">{t.name} · {new Date(t.created_at).toLocaleString()}</div>
              </div>
            </summary>
            <div className="border-t border-site-ink/10 p-5">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-site-body">{t.message}</p>
              <dl className="mt-4 grid gap-1 text-xs text-site-faint sm:grid-cols-2">
                <div>Email: <a className="text-site-ink underline" href={`mailto:${t.email}`}>{t.email}</a></div>
                <div>Discord ID: {t.user_id || "not signed in"}</div>
                {t.closed_by && <div>Closed by: {t.closed_by}</div>}
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                <a href={`mailto:${t.email}?subject=${encodeURIComponent(`Re: ${t.subject} [${t.code}]`)}`} className="inline-flex h-9 items-center gap-2 rounded-lg border border-site-ink/20 px-3.5 text-sm font-medium text-site-ink hover:bg-site-ink/10"><Mail className="h-4 w-4" /> Reply</a>
                <button disabled={busy === t.code} onClick={() => setStatus(t, t.status === "open" ? "closed" : "open")}
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-site-ink px-3.5 text-sm font-semibold text-site-bg hover:opacity-85 disabled:opacity-50">
                  {busy === t.code ? <Loader2 className="h-4 w-4 animate-spin" /> : t.status === "open" ? <Check className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
                  {t.status === "open" ? "Close ticket" : "Reopen"}
                </button>
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
