"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { Check, CheckCircle2, Clock, Copy, Crown, Loader2, QrCode, ShieldCheck, X } from "lucide-react";
import { NOPREFIX_BENEFITS, NOPREFIX_PLANS, PREMIUM_BENEFITS, PREMIUM_FEATURE_TITLES, PREMIUM_PLANS, formatPrice, type Plan, type Product } from "@/lib/plans";
import { BRAND } from "@/lib/site";

declare global { interface Window { Razorpay?: any } }

type Me = { noprefix?: { active: boolean; permanent?: boolean; expires_at?: string | null }; active: boolean; permanent: boolean; expires_at: string | null; guild_limit: number; activations: { guild_id: string; guild_name: string }[] };
type Guild = { id: string; name: string; icon_url: string | null };
type PayConfig = { enabled: boolean; razorpay: boolean; manual: boolean };
type ManualOrder = { order_id: string; vpa: string; amount: number; currency: string; upi_uri: string; qr: string };

async function api(path: string, init?: RequestInit) {
  const r = await fetch(path, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers || {}) }, cache: "no-store" });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.detail || `Request failed (${r.status})`);
  return d;
}

function loadRazorpay(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

const dateFmt = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export function PremiumClient() {
  const { status } = useSession();
  const signedIn = status === "authenticated";
  const [product, setProduct] = useState<Product>("premium");
  const [payCfg, setPayCfg] = useState<PayConfig | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [busyPlan, setBusyPlan] = useState<string | null>(null);
  const [busyGuild, setBusyGuild] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [pickMethodFor, setPickMethodFor] = useState<Plan | null>(null);
  const [manualPlan, setManualPlan] = useState<Plan | null>(null);
  const [manualOrder, setManualOrder] = useState<ManualOrder | null>(null);
  const [manualStatus, setManualStatus] = useState<string>("pending_payment");
  const [utr, setUtr] = useState("");
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const signing = useRef(false);
  const enabled = payCfg?.enabled ?? null;

  const refresh = useCallback(async () => {
    try {
      const [m, g] = await Promise.all([api("/api/bot/premium/me"), api("/api/bot/guilds/").catch(() => [])]);
      setMe(m);
      setGuilds(Array.isArray(g) ? g : []);
    } catch (e: any) {
      setNotice({ kind: "err", text: e.message });
    }
  }, []);

  useEffect(() => { api("/api/payments/config").then((d) => setPayCfg({ enabled: !!d.enabled, razorpay: !!d.razorpay, manual: !!d.manual })).catch(() => setPayCfg({ enabled: false, razorpay: false, manual: false })); }, []);
  useEffect(() => { if (signedIn) refresh(); }, [signedIn, refresh]);

  // Poll for staff approval/rejection while a manual-UPI order sits "submitted".
  useEffect(() => {
    if (!manualOrder || manualStatus !== "submitted") return;
    const id = setInterval(async () => {
      try {
        const s = await api(`/api/payments/manual/status/${encodeURIComponent(manualOrder.order_id)}`);
        if (s.status && s.status !== manualStatus) {
          setManualStatus(s.status);
          if (s.status === "approved") {
            setNotice({ kind: "ok", text: manualPlan?.product === "noprefix"
              ? "Your UPI payment was approved. No-Prefix is now active."
              : `Your UPI payment was approved. ${BRAND} Premium is now active. Choose a server below to use it.` });
            setManualOrder(null);
            setManualPlan(null);
            await refresh();
          } else if (s.status === "rejected") {
            setNotice({ kind: "err", text: "Your UPI payment was rejected by staff. If you believe this is a mistake, contact support with your order ID." });
          }
        }
      } catch { /* keep polling silently */ }
    }, 5000);
    return () => clearInterval(id);
  }, [manualOrder, manualStatus, manualPlan, refresh]);

  const login = () => {
    if (signing.current) return;
    signing.current = true;
    signIn("discord", { callbackUrl: "/premium" });
  };

  const buy = (plan: Plan) => {
    if (!signedIn) return login();
    if (busyPlan) return;
    const canRzp = !!payCfg?.razorpay;
    const canManual = !!payCfg?.manual;
    if (canRzp && canManual) return setPickMethodFor(plan);
    if (canManual && !canRzp) return startManual(plan);
    return buyRazorpay(plan);
  };

  const buyRazorpay = async (plan: Plan) => {
    setBusyPlan(plan.id);
    setNotice(null);
    try {
      if (!(await loadRazorpay())) throw new Error("Could not load the payment window. Check your connection and try again.");
      const o = await api("/api/payments/order", { method: "POST", body: JSON.stringify({ planId: plan.id }) });
      const rz = new window.Razorpay({
        key: o.key_id,
        order_id: o.order_id,
        amount: o.amount,
        currency: o.currency,
        name: o.name,
        description: o.description,
        prefill: { name: o.prefill_name },
        theme: { color: "#111111" },
        modal: { ondismiss: () => setBusyPlan(null) },
        handler: async (resp: any) => {
          try {
            const v = await api("/api/payments/verify", { method: "POST", body: JSON.stringify(resp) });
            setNotice({ kind: "ok", text: plan.product === "noprefix"
              ? `Payment received. No-Prefix is active${v.expires_at ? ` until ${dateFmt(v.expires_at)}` : ""}.`
              : `Payment received. ${BRAND} Premium is active until ${dateFmt(v.expires_at)}. Choose a server below to use it.` });
            await refresh();
          } catch (e: any) {
            setNotice({ kind: "err", text: `${e.message} If money was taken from your account, it will be matched automatically within a few minutes or contact support with payment ID ${resp?.razorpay_payment_id}.` });
          } finally {
            setBusyPlan(null);
          }
        },
      });
      rz.on("payment.failed", (r: any) => {
        setNotice({ kind: "err", text: r?.error?.description || "The payment failed. You have not been charged." });
        setBusyPlan(null);
      });
      rz.open();
    } catch (e: any) {
      setNotice({ kind: "err", text: e.message });
      setBusyPlan(null);
    }
  };

  const startManual = async (plan: Plan) => {
    setPickMethodFor(null);
    setBusyPlan(plan.id);
    setNotice(null);
    try {
      const o = await api("/api/payments/manual/order", { method: "POST", body: JSON.stringify({ planId: plan.id }) });
      setManualPlan(plan);
      setManualOrder(o);
      setManualStatus("pending_payment");
      setUtr("");
    } catch (e: any) {
      setNotice({ kind: "err", text: e.message });
    } finally {
      setBusyPlan(null);
    }
  };

  const submitManualUtr = async () => {
    if (!manualOrder) return;
    const clean = utr.trim();
    if (!/^\d{12}$/.test(clean)) {
      setNotice({ kind: "err", text: "Enter the 12-digit UTR / reference number from your UPI app." });
      return;
    }
    setManualSubmitting(true);
    try {
      const r = await api("/api/payments/manual/submit", { method: "POST", body: JSON.stringify({ order_id: manualOrder.order_id, utr: clean }) });
      setManualStatus(r.status === "already_submitted" ? "submitted" : r.status);
    } catch (e: any) {
      setNotice({ kind: "err", text: e.message });
    } finally {
      setManualSubmitting(false);
    }
  };

  const copyVpa = () => {
    if (!manualOrder) return;
    navigator.clipboard?.writeText(manualOrder.vpa).catch(() => {});
    setNotice({ kind: "ok", text: "UPI ID copied." });
  };

  const toggle = async (g: Guild, on: boolean) => {
    setBusyGuild(g.id);
    setNotice(null);
    try {
      await api(`/api/bot/guilds/${g.id}/premium/activate`, { method: on ? "POST" : "DELETE" });
      await refresh();
    } catch (e: any) {
      setNotice({ kind: "err", text: e.message });
    } finally {
      setBusyGuild(null);
    }
  };

  const activeIds = new Set((me?.activations || []).map((a) => a.guild_id));
  const used = me?.activations?.length || 0;
  const plans = product === "premium" ? PREMIUM_PLANS : NOPREFIX_PLANS;
  const benefits = product === "premium" ? PREMIUM_BENEFITS : NOPREFIX_BENEFITS;
  const label = product === "premium" ? "Premium" : "No-Prefix";

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24">
      {notice && (
        <div className={`mb-6 flex gap-3 rounded-xl border p-4 text-sm ${notice.kind === "ok" ? "border-site-ink/30 bg-site-ink/[0.06] text-site-ink" : "border-site-ink/20 bg-site-card text-site-body"}`}>
          {notice.kind === "ok" && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Product tabs */}
      <div className="mb-8 inline-flex rounded-xl border border-site-ink/15 p-1">
        {([["premium", "Premium"], ["noprefix", "No-Prefix"]] as [Product, string][]).map(([k, n]) => (
          <button key={k} onClick={() => setProduct(k)}
            className={`h-9 rounded-lg px-5 text-sm font-semibold transition ${product === k ? "bg-site-ink text-site-bg" : "text-site-muted hover:text-site-ink"}`}>{n}</button>
        ))}
      </div>
      <p className="mb-6 max-w-2xl text-sm text-site-muted">
        {product === "premium"
          ? "Higher limits and extra features for your servers."
          : "Use every command without typing the prefix. It belongs to your account and works in every server."}
      </p>

      {/* Plans */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {plans.map((p) => (
          <div key={p.id} className={`relative flex flex-col rounded-2xl border p-7 ${p.badge ? "border-site-ink/40 bg-site-card" : "border-site-ink/10 bg-site-card/70"}`}>
            {p.badge && <span className="absolute -top-3 left-7 rounded-full bg-site-ink px-3 py-1 text-[11px] font-semibold text-site-bg">{p.badge}</span>}
            <h3 className="font-outfit text-lg font-semibold text-site-ink">{p.name}</h3>
            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="font-outfit text-4xl font-bold text-site-ink">{formatPrice(p.amount)}</span>
              <span className="text-sm text-site-faint">one-time</span>
            </div>
            <p className="mt-1 text-xs text-site-faint">{p.lifetime ? "Pay once, keep it forever" : `${formatPrice(Math.round(p.amount / p.days))} per day, no auto-renewal`}</p>
            <ul className="mt-6 flex-1 space-y-2.5 text-sm text-site-muted">
              <li className="flex gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-site-ink" /> {p.lifetime ? `Lifetime ${label}, never expires` : `${p.days} days of ${label}`}</li>
              {product === "premium" && <li className="flex gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-site-ink" /> Use on {p.servers} server{p.servers > 1 ? "s" : ""}</li>}
              <li className="flex gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-site-ink" /> {p.lifetime ? "Replaces any time-limited plan" : "Adds to time you already have"}</li>
              {product === "noprefix" && <li className="flex gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-site-ink" /> Every command, no prefix</li>}
            </ul>
            {product === "premium" && (
              <div className="mt-5 border-t border-site-ink/10 pt-5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-site-faint">Everything included</p>
                <ul className="mt-3 space-y-2 text-sm text-site-muted">
                  {PREMIUM_FEATURE_TITLES.map((title) => (
                    <li key={title} className="flex gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-site-ink" /> {title}</li>
                  ))}
                </ul>
              </div>
            )}
            {enabled === false ? (
              <a href="/support" className="mt-7 inline-flex h-11 items-center justify-center rounded-xl bg-site-ink text-sm font-semibold text-site-bg transition hover:opacity-85">
                Get it via support
              </a>
            ) : (
              <button
                onClick={() => buy(p)}
                disabled={busyPlan !== null}
                className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-site-ink text-sm font-semibold text-site-bg transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busyPlan === p.id ? <><Loader2 className="h-4 w-4 animate-spin" /> Opening...</> : signedIn ? "Buy now" : "Login to buy"}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Payment method picker, when both Razorpay and manual UPI are available */}
      {pickMethodFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setPickMethodFor(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-site-ink/10 bg-site-bg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-outfit text-lg font-semibold text-site-ink">Pay with</h3>
              <button onClick={() => setPickMethodFor(null)} className="text-site-faint hover:text-site-ink"><X className="h-4 w-4" /></button>
            </div>
            <p className="mt-1 text-sm text-site-muted">{pickMethodFor.name} — {formatPrice(pickMethodFor.amount)}</p>
            <div className="mt-5 space-y-2.5">
              <button onClick={() => buyRazorpay(pickMethodFor)} className="flex w-full items-center justify-between rounded-xl border border-site-ink/15 p-4 text-left transition hover:bg-site-ink/5">
                <span className="text-sm font-semibold text-site-ink">Razorpay (UPI, cards, net banking)</span>
                <ShieldCheck className="h-4 w-4 text-site-faint" />
              </button>
              <button onClick={() => startManual(pickMethodFor)} className="flex w-full items-center justify-between rounded-xl border border-site-ink/15 p-4 text-left transition hover:bg-site-ink/5">
                <span className="text-sm font-semibold text-site-ink">Manual UPI (QR) — approved by staff</span>
                <QrCode className="h-4 w-4 text-site-faint" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual UPI order: show QR + VPA, collect UTR, then poll for staff approval */}
      {manualOrder && manualPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => manualStatus === "pending_payment" && setManualOrder(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-site-ink/10 bg-site-bg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-outfit text-lg font-semibold text-site-ink">Pay by UPI QR</h3>
              {manualStatus === "pending_payment" && (
                <button onClick={() => setManualOrder(null)} className="text-site-faint hover:text-site-ink"><X className="h-4 w-4" /></button>
              )}
            </div>
            <p className="mt-1 text-sm text-site-muted">{manualPlan.name} — {formatPrice(manualOrder.amount)}</p>

            {manualStatus === "pending_payment" && (
              <>
                <div className="mt-4 flex justify-center">
                  <img src={manualOrder.qr} alt="UPI QR code" className="h-56 w-56 rounded-xl border border-site-ink/10 bg-white p-2" />
                </div>
                <div className="mt-3 flex items-center justify-center gap-2 text-sm text-site-ink">
                  <span className="font-mono">{manualOrder.vpa}</span>
                  <button onClick={copyVpa} className="text-site-faint hover:text-site-ink"><Copy className="h-3.5 w-3.5" /></button>
                </div>
                <p className="mt-1 text-center text-xs text-site-faint">Order <span className="font-mono">{manualOrder.order_id}</span></p>
                <p className="mt-4 text-xs text-site-faint">Scan the QR (or pay {manualOrder.vpa} directly) for exactly {formatPrice(manualOrder.amount)}, then enter the 12-digit UTR / reference number from your UPI app below.</p>
                <input
                  value={utr}
                  onChange={(e) => setUtr(e.target.value.replace(/\D/g, "").slice(0, 12))}
                  placeholder="12-digit UTR"
                  className="mt-3 w-full rounded-xl border border-site-ink/15 bg-site-card px-3 py-2.5 text-sm text-site-ink placeholder:text-site-faint focus:outline-none focus:ring-1 focus:ring-site-ink/30"
                />
                <button
                  onClick={submitManualUtr}
                  disabled={manualSubmitting || utr.length !== 12}
                  className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-site-ink text-sm font-semibold text-site-bg transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {manualSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : "I have paid"}
                </button>
                <p className="mt-3 flex items-center gap-1.5 text-[11px] text-site-faint"><ShieldCheck className="h-3.5 w-3.5 shrink-0" /> This is not instant — staff manually verify every UTR before {manualPlan.product === "noprefix" ? "No-Prefix" : "Premium"} is granted.</p>
              </>
            )}

            {manualStatus === "submitted" && (
              <div className="mt-5 flex flex-col items-center gap-3 py-4 text-center">
                <Clock className="h-8 w-8 text-site-faint" />
                <p className="text-sm text-site-muted">Thanks! Your payment for order <span className="font-mono text-site-ink">{manualOrder.order_id}</span> is awaiting staff review. This page will update automatically once it's checked.</p>
                <button onClick={() => setManualOrder(null)} className="mt-2 text-xs text-site-faint underline underline-offset-2 hover:text-site-ink">Close (you'll still get a DM)</button>
              </div>
            )}
          </div>
        </div>
      )}

      <p className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-xs text-site-faint">
        <ShieldCheck className="h-3.5 w-3.5" /> {enabled === false ? "Online checkout is not open yet. Open a ticket in the support server to buy." : "Secure payment by Razorpay: UPI, cards, net banking and wallets. We never see your payment details."}
        <span>By buying you agree to the <Link href="/terms" className="underline underline-offset-2">Terms</Link> and <Link href="/refund" className="underline underline-offset-2">Refund Policy</Link>.</span>
      </p>

      {/* Your Premium */}
      {signedIn && me && (
        <section className="mt-16">
          <h2 className="flex items-center gap-2 font-outfit text-2xl font-bold text-site-ink"><Crown className="h-5 w-5" /> Your Premium</h2>
          <div className="mt-5 rounded-2xl border border-site-ink/10 bg-site-card/70 p-6">
            {me.active ? (
              <p className="text-sm text-site-muted">
                <b className="text-site-ink">Premium is active</b>
                {me.permanent ? " and never expires." : me.expires_at ? <> until <b className="text-site-ink">{dateFmt(me.expires_at)}</b>.</> : "."}{" "}
                You are using <b className="text-site-ink">{used} of {me.guild_limit}</b> server slot{(me.guild_limit || 1) > 1 ? "s" : ""}.
              </p>
            ) : (
              <p className="text-sm text-site-muted">You do not have Premium yet. Pick a plan above to get started.</p>
            )}

            {me.noprefix?.active && (
              <p className="mt-3 text-sm text-site-muted"><b className="text-site-ink">No-Prefix is active</b>{me.noprefix.permanent ? " and never expires." : me.noprefix.expires_at ? <> until <b className="text-site-ink">{dateFmt(me.noprefix.expires_at)}</b>.</> : "."}</p>
            )}

            {me.active && (
              <div className="mt-5 divide-y divide-site-ink/10 rounded-xl border border-site-ink/10">
                {guilds.length === 0 && <p className="p-4 text-sm text-site-faint">No servers found. Add {BRAND} to a server you manage first.</p>}
                {guilds.map((g) => {
                  const on = activeIds.has(g.id);
                  return (
                    <div key={g.id} className="flex items-center justify-between gap-3 p-3.5">
                      <div className="flex min-w-0 items-center gap-3">
                        {g.icon_url ? <img src={g.icon_url} alt="" className="h-9 w-9 rounded-lg" /> : <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-site-ink/10 text-xs font-bold text-site-ink">{g.name.slice(0, 1)}</div>}
                        <span className="truncate text-sm text-site-ink">{g.name}</span>
                      </div>
                      <button
                        onClick={() => toggle(g, !on)}
                        disabled={busyGuild !== null || (!on && used >= me.guild_limit)}
                        className={`inline-flex h-8 shrink-0 items-center rounded-lg px-3.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${on ? "border border-site-ink/25 text-site-ink hover:bg-site-ink/10" : "bg-site-ink text-site-bg hover:opacity-85"}`}
                      >
                        {busyGuild === g.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : on ? "Remove" : "Activate"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Benefits */}
      <section className="mt-16">
        <h2 className="font-outfit text-2xl font-bold text-site-ink">What you get with {label}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <div key={b.title} className="rounded-2xl border border-site-ink/10 bg-site-card/70 p-6">
              <h3 className="font-semibold text-site-ink">{b.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-site-faint">{b.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
