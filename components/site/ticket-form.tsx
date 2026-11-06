"use client";

import React, { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

const CATEGORIES = ["General Support", "Bug Report", "Premium & Payments", "Feature Request", "Partnership", "Other"];
const field = "w-full rounded-xl border border-site-ink/15 bg-site-bg px-4 py-3 text-sm text-site-ink placeholder:text-site-faint focus:border-site-ink/50 focus:outline-none";

export function TicketForm() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(f.entries())),
      });
      const d = await r.json().catch(() => ({}));
      if (r.ok) setDone(true);
      else setError(d.detail || "Something went wrong. Please try again.");
    } catch {
      setError("Could not send your ticket. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-site-ink/10 bg-site-card/70 p-10 text-center">
        <CheckCircle2 className="h-10 w-10 text-site-ink" />
        <h3 className="mt-4 font-outfit text-xl font-semibold text-site-ink">Ticket sent</h3>
        <p className="mt-2 max-w-sm text-sm text-site-muted">Thanks! We will reply to the email you gave us. For faster help, join the support server.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-site-ink/10 bg-site-card/70 p-7">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-site-muted">Your name
          <input name="name" required maxLength={80} className={`${field} mt-1.5`} placeholder="Name" />
        </label>
        <label className="block text-sm text-site-muted">Email
          <input name="email" type="email" required maxLength={120} className={`${field} mt-1.5`} placeholder="you@example.com" />
        </label>
      </div>
      <label className="block text-sm text-site-muted">Category
        <select name="category" className={`${field} mt-1.5`} defaultValue={CATEGORIES[0]}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <label className="block text-sm text-site-muted">Subject
        <input name="subject" required maxLength={120} className={`${field} mt-1.5`} placeholder="What do you need help with?" />
      </label>
      <label className="block text-sm text-site-muted">Message
        <textarea name="message" required minLength={10} maxLength={1800} rows={6} className={`${field} mt-1.5 resize-y`} placeholder="Describe the problem. Include your server ID if it is about a server." />
      </label>
      {error && <p className="text-sm text-site-ink">{error}</p>}
      <button disabled={busy} className="inline-flex h-11 items-center gap-2 rounded-xl bg-site-ink px-6 text-sm font-semibold text-site-bg transition hover:opacity-85 disabled:opacity-50">
        {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</> : "Send ticket"}
      </button>
    </form>
  );
}
