"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Search, ChevronDown, Check, X, Trash2, Users, CheckCircle2, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const card = "rounded-2xl border border-slate-800 bg-[#141B2D]";
const sel = "w-full rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2.5 text-sm text-white outline-none";

const badge: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-400", accepted: "bg-emerald-500/15 text-emerald-400", denied: "bg-red-500/15 text-red-400",
};

export default function SubmissionsPage({ params }: { params: { guildId: string } }) {
  const gid = params.guildId;
  const [data, setData] = useState<any>({ counts: { total: 0, accepted: 0, pending: 0, denied: 0 }, items: [], total: 0 });
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState("");
  const [form, setForm] = useState("");
  const [order, setOrder] = useState("newest");
  const [status, setStatus] = useState("");
  const [limit, setLimit] = useState("20");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<number | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [denying, setDenying] = useState<number | null>(null);
  const [reason, setReason] = useState("");

  const load = useCallback(async () => {
    try {
      const qs = new URLSearchParams({ order, limit, page: String(page) });
      if (status) qs.set("status", status);
      if (form) qs.set("form", form);
      if (/^\d{15,22}$/.test(user.trim())) qs.set("user", user.trim());
      setData(await api.getSubmissions(gid, qs.toString()));
    } catch { toast.error("Failed to load submissions"); } finally { setLoading(false); }
  }, [gid, order, limit, page, status, form, user]);

  useEffect(() => { api.getApplications(gid).then((a) => setForms(a.items)).catch(() => {}); }, [gid]);
  useEffect(() => { load(); }, [load]);

  const act = async (id: number, fn: () => Promise<any>, ok: string) => {
    setBusy(id);
    try {
      const r = await fn();
      toast.success(ok);
      if (r?.warnings?.length) toast.warning(r.warnings.join("\n"));
      setDenying(null); setReason(""); await load();
    } catch (e: any) { toast.error(e?.message || "Failed"); } finally { setBusy(null); }
  };

  const c = data.counts;
  const stats = [
    { label: "Total", value: c.total, icon: Users, color: "text-slate-300" },
    { label: "Accepted", value: c.accepted, icon: CheckCircle2, color: "text-emerald-400" },
    { label: "Pending", value: c.pending, icon: Clock, color: "text-amber-400" },
    { label: "Denied", value: c.denied, icon: XCircle, color: "text-red-400" },
  ];
  const pages = Math.max(1, Math.ceil(data.total / Number(limit)));

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-extrabold text-white">Submissions</h1><p className="text-sm text-slate-400">Review applications from your members.</p></div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={card + " flex items-center justify-between p-5"}>
            <div><p className="text-xs font-bold uppercase text-slate-500">{s.label}</p><p className="mt-1 text-3xl font-extrabold text-white">{s.value}</p></div>
            <s.icon className={`h-7 w-7 ${s.color}`} />
          </div>
        ))}
      </div>

      <div className={card + " space-y-4 p-5"}>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <input value={user} onChange={(e) => { setUser(e.target.value); setPage(1); }} placeholder="Search by user ID…" className={sel + " pl-9"} />
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div><label className="mb-1 block text-xs font-bold text-slate-400">Applications</label>
            <select className={sel} value={form} onChange={(e) => { setForm(e.target.value); setPage(1); }}><option value="">All</option>{forms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</select></div>
          <div><label className="mb-1 block text-xs font-bold text-slate-400">Order by</label>
            <select className={sel} value={order} onChange={(e) => setOrder(e.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></div>
          <div><label className="mb-1 block text-xs font-bold text-slate-400">Status</label>
            <select className={sel} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option value="">All</option><option value="pending">Pending</option><option value="accepted">Accepted</option><option value="denied">Denied</option></select></div>
          <div><label className="mb-1 block text-xs font-bold text-slate-400">Limit</label>
            <select className={sel} value={limit} onChange={(e) => { setLimit(e.target.value); setPage(1); }}>{["10", "20", "50", "100"].map((n) => <option key={n}>{n}</option>)}</select></div>
        </div>
      </div>

      {loading && <p className="text-slate-400">Loading…</p>}
      {!loading && data.items.length === 0 && <div className={card + " p-8 text-center text-slate-400"}>No submissions found.</div>}

      <div className="space-y-3">
        {data.items.map((s: any) => (
          <div key={s.id} className={card}>
            <button onClick={() => setOpen(open === s.id ? null : s.id)} className="flex w-full items-center gap-3 p-4 text-left">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {s.avatar ? <img src={s.avatar} alt="" className="h-10 w-10 rounded-full" /> : <div className="h-10 w-10 rounded-full bg-slate-700" />}
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-white">{s.username}</p>
                <p className="truncate text-xs text-slate-500">{s.form_name} · {new Date(s.created_at).toLocaleString()} · {s.user_id}</p>
              </div>
              <span className={`rounded-lg px-2.5 py-1 text-xs font-bold capitalize ${badge[s.status]}`}>{s.status}</span>
              <ChevronDown className={`h-4 w-4 text-slate-500 transition ${open === s.id ? "rotate-180" : ""}`} />
            </button>
            {open === s.id && (
              <div className="space-y-4 border-t border-slate-800 p-4">
                {s.answers.map((a: any, i: number) => (
                  <div key={i}><p className="text-sm font-bold text-slate-200">{i + 1}. {a.question}</p><p className="mt-1 whitespace-pre-wrap rounded-lg bg-slate-900/50 p-3 text-sm text-slate-300">{a.answer || "—"}</p></div>
                ))}
                {s.status !== "pending" && s.reason && <p className="text-sm text-slate-400"><b>Reason:</b> {s.reason}</p>}
                {denying === s.id && (
                  <div className="space-y-2">
                    <textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (optional, sent to the applicant)" className={sel} />
                    <div className="flex gap-2">
                      <button disabled={busy === s.id} onClick={() => act(s.id, () => api.denySubmission(gid, s.id, reason), "Application denied")} className="rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white">Confirm deny</button>
                      <button onClick={() => setDenying(null)} className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-white">Cancel</button>
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {s.status === "pending" && (
                    <>
                      <button disabled={busy === s.id} onClick={() => act(s.id, () => api.acceptSubmission(gid, s.id), "Application accepted")} className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"><Check className="h-4 w-4" />Accept</button>
                      <button disabled={busy === s.id} onClick={() => setDenying(s.id)} className="flex items-center gap-1.5 rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"><X className="h-4 w-4" />Deny</button>
                    </>
                  )}
                  <button disabled={busy === s.id} onClick={() => { if (confirm("Delete this submission?")) act(s.id, () => api.deleteSubmission(gid, s.id), "Submission deleted"); }} className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-slate-300 disabled:opacity-50"><Trash2 className="h-4 w-4" />Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-white disabled:opacity-40">Prev</button>
          <span className="text-sm text-slate-400">Page {page} / {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-white disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
