"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowLeft, Check, Inbox, Loader2, LogIn, MessageSquarePlus, RotateCcw, Send } from "lucide-react";
import { toast } from "sonner";

type Row = {
  code: string; user_id: string | null; name: string; email: string; category: string; subject: string;
  message: string; status: "open" | "closed"; created_at: string; updated_at?: string; replies?: number; last_staff_reply?: boolean;
};
type Msg = { id: number; author_id: string | null; author_name: string; staff: boolean; body: string; created_at: string };
type Full = Row & { thread: Msg[]; viewer_staff: boolean };

const ago = (d: string) => new Date(d).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

// Ticket inbox used on the website (/tickets) and in the dashboard. Users see their own tickets; support staff also get "All tickets".
export function TicketCenter({ compact = false }: { compact?: boolean }) {
  const { status: auth } = useSession();
  const [staff, setStaff] = useState(false);
  const [scope, setScope] = useState<"mine" | "all">("mine");
  const [filter, setFilter] = useState<"open" | "closed" | "all">("open");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [full, setFull] = useState<Full | null>(null);
  const [loadingThread, setLoadingThread] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [busy, setBusy] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (auth !== "authenticated") return;
    fetch("/api/staff/me", { cache: "no-store" }).then((r) => r.json()).then((d) => setStaff(!!d?.support)).catch(() => {});
  }, [auth]);

  const loadList = useCallback(async () => {
    const url = scope === "all" ? `/api/staff/tickets${filter === "all" ? "" : `?status=${filter}`}` : "/api/tickets/mine";
    const r = await fetch(url, { cache: "no-store" });
    const d = await r.json().catch(() => []);
    if (!r.ok) { toast.error(d.detail || "Could not load tickets"); return setRows([]); }
    setRows(scope === "mine" && filter !== "all" ? (d as Row[]).filter((t) => t.status === filter) : d);
  }, [scope, filter]);

  useEffect(() => { if (auth === "authenticated") { setRows(null); loadList(); } }, [auth, loadList]);

  const open = useCallback(async (code: string, quiet = false) => {
    setActive(code);
    if (!quiet) { setLoadingThread(true); setFull(null); }
    const r = await fetch(`/api/tickets/${code}`, { cache: "no-store" });
    const d = await r.json().catch(() => ({}));
    if (!quiet) setLoadingThread(false);
    if (!r.ok) { toast.error(d.detail || "Could not open the ticket"); setActive(null); return; }
    setFull(d);
  }, []);

  useEffect(() => { bottom.current?.scrollIntoView({ block: "nearest" }); }, [full?.thread.length]);

  // New replies show up without a refresh.
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => { if (document.visibilityState === "visible") open(active, true); }, 15000);
    return () => clearInterval(id);
  }, [active, open]);

  const send = async () => {
    if (!active || text.trim().length < 2) return;
    setSending(true);
    try {
      const r = await fetch(`/api/tickets/${active}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body: text }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.detail || "Could not send");
      setText("");
      await open(active, true);
      loadList();
    } catch (e: any) { toast.error(e.message || "Could not send your reply"); }
    finally { setSending(false); }
  };

  const setStatus = async (status: "open" | "closed") => {
    if (!active) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/tickets/${active}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.detail || "Failed");
      await open(active, true);
      loadList();
    } catch (e: any) { toast.error(e.message || "Could not update the ticket"); }
    finally { setBusy(false); }
  };

  if (auth === "loading") return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-site-faint" /></div>;
  if (auth === "unauthenticated") {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-site-ink/10 bg-site-card/70 p-8 text-center">
        <LogIn className="mx-auto h-7 w-7 text-site-ink" />
        <h2 className="mt-4 font-outfit text-xl font-bold text-site-ink">Sign in to see your tickets</h2>
        <p className="mt-2 text-sm text-site-muted">Tickets are linked to your Discord account, so only you can read them.</p>
        <Link href="/login?callbackUrl=/tickets" className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-site-ink px-6 text-sm font-semibold text-site-bg hover:opacity-85">Login with Discord</Link>
      </div>
    );
  }

  const list = (
    <div className={`${active ? "hidden lg:block" : "block"} space-y-4`}>
      <div className="flex flex-wrap items-center gap-2">
        {staff && (
          <div className="inline-flex rounded-xl border border-site-ink/15 p-1">
            {([["mine", "My tickets"], ["all", "All tickets"]] as const).map(([k, n]) => (
              <button key={k} onClick={() => { setScope(k); setActive(null); setFull(null); }}
                className={`h-8 rounded-lg px-3.5 text-sm font-semibold transition ${scope === k ? "bg-site-ink text-site-bg" : "text-site-muted hover:text-site-ink"}`}>{n}</button>
            ))}
          </div>
        )}
        <div className="inline-flex rounded-xl border border-site-ink/15 p-1">
          {(["open", "closed", "all"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`h-8 rounded-lg px-3.5 text-sm font-semibold capitalize transition ${filter === f ? "bg-site-ink text-site-bg" : "text-site-muted hover:text-site-ink"}`}>{f}</button>
          ))}
        </div>
        <Link href="/contact" className="ml-auto inline-flex h-10 items-center gap-2 rounded-xl border border-site-ink/20 px-3.5 text-sm font-semibold text-site-ink hover:bg-site-ink/10"><MessageSquarePlus className="h-4 w-4" /> New ticket</Link>
      </div>

      {rows === null && <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-site-faint" /></div>}
      {rows && rows.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-site-ink/10 py-14 text-site-faint"><Inbox className="h-8 w-8" /><p className="mt-3 text-sm">No {filter === "all" ? "" : filter} tickets.</p></div>
      )}
      <div className="space-y-2">
        {rows?.map((t) => (
          <button key={t.code} onClick={() => open(t.code)}
            className={`w-full rounded-2xl border p-4 text-left transition ${active === t.code ? "border-site-ink bg-site-ink/[0.06]" : "border-site-ink/10 bg-site-card/70 hover:border-site-ink/30"}`}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-site-ink/10 px-2 py-0.5 font-mono text-xs text-site-ink">{t.code}</span>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${t.status === "open" ? "bg-site-ink text-site-bg" : "border border-site-ink/20 text-site-faint"}`}>{t.status}</span>
              {scope === "mine" && t.last_staff_reply && t.status === "open" && <span className="rounded-full border border-site-ink/30 px-2 py-0.5 text-[11px] font-semibold text-site-ink">Support replied</span>}
              {!!t.replies && <span className="text-xs text-site-faint">{t.replies} repl{t.replies > 1 ? "ies" : "y"}</span>}
            </div>
            <p className="mt-1.5 truncate font-semibold text-site-ink">{t.subject}</p>
            <p className="truncate text-xs text-site-faint">{scope === "all" ? `${t.name} · ` : ""}{t.category} · {ago(t.updated_at || t.created_at)}</p>
          </button>
        ))}
      </div>
    </div>
  );

  const thread = (
    <div className={`${active ? "block" : "hidden lg:block"} min-w-0`}>
      {!active && (
        <div className="flex h-full min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-site-ink/15 text-site-faint">
          <Inbox className="h-8 w-8" /><p className="mt-3 text-sm">Pick a ticket to read it.</p>
        </div>
      )}
      {active && loadingThread && <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-site-faint" /></div>}
      {active && full && (
        <div className="flex flex-col rounded-2xl border border-site-ink/10 bg-site-card/70">
          <div className="flex items-start gap-3 border-b border-site-ink/10 p-5">
            <button onClick={() => { setActive(null); setFull(null); }} className="mt-0.5 rounded-lg p-1.5 text-site-muted hover:bg-site-ink/10 lg:hidden" aria-label="Back"><ArrowLeft className="h-4 w-4" /></button>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-site-ink/10 px-2 py-0.5 font-mono text-xs text-site-ink">{full.code}</span>
                <span className="text-xs text-site-faint">{full.category}</span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${full.status === "open" ? "bg-site-ink text-site-bg" : "border border-site-ink/20 text-site-faint"}`}>{full.status}</span>
              </div>
              <h2 className="mt-1.5 font-outfit text-lg font-bold text-site-ink">{full.subject}</h2>
              {full.viewer_staff && <p className="mt-1 text-xs text-site-faint">{full.name} · {full.email} · Discord ID {full.user_id || "not signed in"}</p>}
            </div>
            <button disabled={busy} onClick={() => setStatus(full.status === "open" ? "closed" : "open")}
              className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-site-ink/20 px-3 text-sm font-medium text-site-ink hover:bg-site-ink/10 disabled:opacity-50">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : full.status === "open" ? <Check className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
              {full.status === "open" ? "Close" : "Reopen"}
            </button>
          </div>

          <div className={`space-y-3 overflow-y-auto p-5 ${compact ? "max-h-[50vh]" : "max-h-[55vh]"}`}>
            <Bubble who={full.name} when={ago(full.created_at)} body={full.message} staff={false} />
            {full.thread.map((m) => <Bubble key={m.id} who={m.author_name} when={ago(m.created_at)} body={m.body} staff={m.staff} />)}
            <div ref={bottom} />
          </div>

          <div className="border-t border-site-ink/10 p-4">
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={1800}
              placeholder={full.viewer_staff && full.user_id !== null ? "Reply to the user. They get a Discord DM." : "Write a reply..."}
              onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") send(); }}
              className="w-full resize-y rounded-xl border border-site-ink/15 bg-site-bg p-3 text-sm text-site-ink placeholder:text-site-faint focus:border-site-ink/40 focus:outline-none" />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-site-faint">{full.status === "closed" ? "Replying reopens a closed ticket." : "Ctrl+Enter to send"}</span>
              <button onClick={send} disabled={sending || text.trim().length < 2}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-site-ink px-5 text-sm font-semibold text-site-bg hover:opacity-85 disabled:opacity-40">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return <div className="grid gap-6 lg:grid-cols-[380px_1fr]">{list}{thread}</div>;
}

function Bubble({ who, when, body, staff }: { who: string; when: string; body: string; staff: boolean }) {
  return (
    <div className={`flex ${staff ? "justify-start" : "justify-end"}`}>
      <div className={`max-w-[88%] rounded-2xl border px-4 py-3 ${staff ? "border-site-ink/15 bg-site-ink/[0.06]" : "border-site-ink/10 bg-site-bg"}`}>
        <p className="text-xs text-site-faint"><b className="text-site-ink">{who}</b>{staff && " · Staff"} · {when}</p>
        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-site-body">{body}</p>
      </div>
    </div>
  );
}
