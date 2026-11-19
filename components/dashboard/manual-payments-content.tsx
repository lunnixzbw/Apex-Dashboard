"use client";

import React, { useCallback, useEffect, useState } from "react";
import { QrCode, RefreshCw, CheckCircle2, XCircle, Clock, Copy } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ManualPaymentEntry, ManualPaymentList } from "@/types/api";
import { formatPrice } from "@/lib/plans";

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

const STATUS_STYLE: Record<string, string> = {
  pending_payment: "border-site-ink/10 bg-site-ink/5 text-site-muted",
  submitted: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  approved: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  rejected: "border-red-500/20 bg-red-500/10 text-red-400",
};

const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Awaiting payment",
  submitted: "UTR submitted — needs review",
  approved: "Approved",
  rejected: "Rejected",
};

function OrderRow({ row, onChanged }: { row: ManualPaymentEntry; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);

  const approve = async () => {
    setBusy(true);
    try {
      await api.approveManualPayment(row.id);
      toast.success(`Approved ${row.orderId}`);
      onChanged();
    } catch (err) {
      toast.error((err as any)?.message || "Could not approve");
    } finally {
      setBusy(false);
    }
  };

  const reject = async () => {
    const reason = window.prompt("Reason for rejecting (optional, shown to the user):", "") || undefined;
    setBusy(true);
    try {
      await api.rejectManualPayment(row.id, reason);
      toast.success(`Rejected ${row.orderId}`);
      onChanged();
    } catch (err) {
      toast.error((err as any)?.message || "Could not reject");
    } finally {
      setBusy(false);
    }
  };

  const copyUtr = () => {
    if (!row.utr) return;
    navigator.clipboard?.writeText(row.utr).catch(() => {});
    toast.success("UTR copied");
  };

  const canReview = row.status === "submitted";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-2xl bg-site-ink/[0.02] border border-site-ink/5">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-mono font-bold text-site-ink text-sm truncate">{row.orderId}</p>
          <span className={cn("text-[10px] font-black uppercase tracking-wider rounded-md px-1.5 py-0.5 border", STATUS_STYLE[row.status])}>
            {STATUS_LABEL[row.status] || row.status}
          </span>
        </div>
        <p className="text-[11px] text-site-muted font-medium">
          {row.username || row.userId} · {row.product === "noprefix" ? "No-Prefix" : "Premium"} ({row.planId}) ·{" "}
          {formatPrice(row.amount)} · {row.lifetime ? "Lifetime" : `${row.days}d`} · VPA {row.vpa}
        </p>
        {row.utr && (
          <button onClick={copyUtr} className="inline-flex items-center gap-1 text-[11px] text-site-faint hover:text-site-ink transition-colors mt-0.5">
            UTR: <span className="font-mono">{row.utr}</span> <Copy className="h-3 w-3" />
          </button>
        )}
        <p className="text-[10px] text-site-faint mt-0.5">
          Submitted {formatDate(row.submittedAt)} {row.reviewedAt && `· Reviewed ${formatDate(row.reviewedAt)} by ${row.reviewedBy || "?"}`}
          {row.rejectReason && ` · Reason: ${row.rejectReason}`}
        </p>
      </div>
      {canReview && (
        <div className="flex items-center gap-2 shrink-0">
          <button disabled={busy} onClick={approve} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[11px] font-black uppercase tracking-wider hover:bg-emerald-500/20 transition-colors disabled:opacity-50">
            <CheckCircle2 className="h-3.5 w-3.5" /> Approve
          </button>
          <button disabled={busy} onClick={reject} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-[11px] font-black uppercase tracking-wider hover:bg-red-500/20 transition-colors disabled:opacity-50">
            <XCircle className="h-3.5 w-3.5" /> Reject
          </button>
        </div>
      )}
    </div>
  );
}

export function ManualPaymentsContent() {
  const [data, setData] = useState<ManualPaymentList | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"needs_review" | "all">("needs_review");

  const load = useCallback(async () => {
    try {
      setData(await api.getManualPayments());
    } catch {
      toast.error("Could not load manual payments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const orders = (data?.orders || []).filter((o) => (filter === "all" ? true : o.status === "submitted"));

  return (
    <div className="bg-site-card border border-site-ink/10 rounded-3xl p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <QrCode className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-site-ink tracking-tight">Manual UPI Payments</h2>
            <p className="text-site-muted text-sm font-medium">Review UTRs submitted for personal-UPI (QR) orders and approve or reject them.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="bg-site-ink/[0.03] border border-site-ink/10 rounded-xl px-3 py-2.5 text-xs text-site-ink focus:outline-none focus:ring-1 focus:ring-indigo-500/40">
            <option value="needs_review">Needs review</option>
            <option value="all">All orders</option>
          </select>
          <button onClick={load} className="p-2.5 rounded-xl border border-site-ink/10 hover:bg-site-ink/5 transition-colors" aria-label="Refresh">
            <RefreshCw className={cn("h-4 w-4 text-site-body", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      <p className="flex items-center gap-2 text-[11px] text-site-faint">
        <Clock className="h-3.5 w-3.5" /> This isn&apos;t automatic — payments land on a personal UPI ID, so every order needs a human check here or via the Discord staff notification before it&apos;s granted.
      </p>

      <div className="grid gap-2">
        {orders.map((row) => <OrderRow key={row.id} row={row} onChanged={load} />)}
        {data && orders.length === 0 && <p className="text-center text-site-faint text-sm py-8">Nothing to review.</p>}
      </div>
    </div>
  );
}
