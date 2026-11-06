"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { CheckCircle2, Loader2, ShieldCheck, AlertTriangle } from "lucide-react";

const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME || "Zevion";
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
const SUPPORT = process.env.NEXT_PUBLIC_SUPPORT_URL || "https://discord.gg/75WUGBKbd5";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
  }
}

type Session = {
  guild_id: string;
  guild_name: string;
  guild_icon: string | null;
  user_id: string;
  username: string;
  avatar_url: string | null;
  already_verified: boolean;
};
type Done = { status: "verified" | "already_verified"; guild_name: string; guild_icon: string | null; dm_sent: boolean };
type Problem = { message: string; code?: string };

export default function VerifyPage() {
  const [token, setToken] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [cf, setCf] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const [formError, setFormError] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);

  // 1. read the link and look up who is verifying
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("t");
    if (!t) {
      setProblem({ message: `Open this page from the Verify button in your Discord server. ${BRAND} sends you a personal link there.`, code: "INVALID" });
      setLoading(false);
      return;
    }
    setToken(t);
    (async () => {
      try {
        const r = await fetch("/api/verify/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: t }),
        });
        const d = await r.json().catch(() => ({}));
        if (!r.ok) setProblem({ message: d.detail || "This verification link is not valid.", code: d.code });
        else if (d.already_verified) setDone({ status: "already_verified", guild_name: d.guild_name, guild_icon: d.guild_icon, dm_sent: false });
        else setSession(d);
      } catch {
        setProblem({ message: "Could not reach the server. Check your connection and refresh." });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 2. Cloudflare Turnstile
  const mountWidget = useCallback(() => {
    if (!boxRef.current || !window.turnstile || widgetId.current !== undefined) return;
    widgetId.current = window.turnstile.render(boxRef.current, {
      sitekey: SITE_KEY,
      theme: "dark",
      callback: (v: string) => { setCf(v); setFormError(""); },
      "expired-callback": () => setCf(""),
      "error-callback": () => { setCf(""); setFormError("The security check could not load. Refresh the page and try again."); },
    });
  }, []);

  useEffect(() => {
    if (!session || !SITE_KEY) return;
    if (window.turnstile) { mountWidget(); return; }
    const existing = document.querySelector<HTMLScriptElement>("script[data-turnstile]");
    if (existing) { existing.addEventListener("load", mountWidget); return () => existing.removeEventListener("load", mountWidget); }
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.defer = true;
    s.dataset.turnstile = "1";
    s.onload = mountWidget;
    document.head.appendChild(s);
  }, [session, mountWidget]);

  // 3. press Verify
  const verify = async () => {
    if (!token || !cf || busy) return;
    setBusy(true);
    setFormError("");
    try {
      const r = await fetch("/api/verify/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, cf_token: cf }),
      });
      const d = await r.json().catch(() => ({}));
      if (r.ok) { setDone(d); return; }
      if (d.code === "CHALLENGE" || r.status === 429) {
        setFormError(d.detail || "Security check failed. Try again.");
        setCf("");
        if (widgetId.current !== undefined) window.turnstile?.reset(widgetId.current);
      } else {
        setProblem({ message: d.detail || "Something went wrong. Please try again.", code: d.code });
      }
    } catch {
      setFormError("Could not reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const guildName = session?.guild_name || done?.guild_name || "";
  const guildIcon = session?.guild_icon || done?.guild_icon || null;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-site-bg px-4 py-10 text-site-body">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-20%] h-[480px] w-[760px] -translate-x-1/2 rounded-full bg-site-ink/[0.06] blur-[130px]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgb(var(--site-ink))_1px,transparent_1px),linear-gradient(90deg,rgb(var(--site-ink))_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />
      </div>

      <ThemeToggle className="absolute right-4 top-4 h-9 w-9 rounded-lg border border-site-ink/15" />
      <div className="relative w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-3">
          <img src="/logo.png" alt="" className="site-logo h-10 w-10 object-contain" />
          <span className="font-outfit text-xl font-semibold tracking-tight text-site-ink">{BRAND}</span>
        </div>

        <div className="rounded-2xl border border-site-ink/10 bg-site-card/80 p-7 shadow-2xl backdrop-blur">
          {loading && (
            <div className="flex flex-col items-center gap-3 py-10 text-sm text-site-faint">
              <Loader2 className="h-6 w-6 animate-spin" /> Checking your link...
            </div>
          )}

          {!loading && done && (
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-site-ink text-site-bg"><CheckCircle2 className="h-7 w-7" /></div>
              <h1 className="mt-5 font-outfit text-2xl font-bold text-site-ink">
                {done.status === "already_verified" ? "You're already verified" : "You're verified!"}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-site-muted">
                {done.status === "already_verified"
                  ? <>You already have access to <b className="text-site-ink">{done.guild_name}</b>.</>
                  : <>You now have access to <b className="text-site-ink">{done.guild_name}</b>.{" "}
                      {done.dm_sent ? `${BRAND} sent you a DM to confirm.` : "Go back to Discord to start chatting."}</>}
              </p>
              <p className="mt-6 text-xs text-site-faint">You can close this tab now.</p>
            </div>
          )}

          {!loading && !done && problem && (
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-site-ink/15 text-site-body"><AlertTriangle className="h-6 w-6" /></div>
              <h1 className="mt-5 font-outfit text-xl font-bold text-site-ink">
                {problem.code === "EXPIRED" ? "Link expired" : problem.code === "USED" ? "Link already used" : "Can't verify"}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-site-muted">{problem.message}</p>
              <a href={SUPPORT} target="_blank" rel="noreferrer" className="mt-6 text-xs text-site-faint underline-offset-4 hover:text-site-body hover:underline">
                Need help? Join the support server
              </a>
            </div>
          )}

          {!loading && !done && !problem && session && (
            <div className="flex flex-col items-center text-center">
              {guildIcon
                ? <img src={guildIcon} alt="" className="h-16 w-16 rounded-2xl border border-site-ink/10 object-cover" />
                : <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-site-ink/10 bg-site-ink/5"><ShieldCheck className="h-7 w-7 text-site-ink" /></div>}
              <h1 className="mt-5 font-outfit text-2xl font-bold text-site-ink">Verify you&apos;re human</h1>
              <p className="mt-2 text-sm text-site-muted">
                Joining <b className="text-site-ink">{guildName}</b>
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-site-ink/10 bg-site-ink/[0.04] py-1 pl-1 pr-3 text-xs text-site-body">
                {session.avatar_url && <img src={session.avatar_url} alt="" className="h-5 w-5 rounded-full" />}
                Verifying as {session.username}
              </div>

              <div className="mt-6 flex min-h-[70px] w-full items-center justify-center">
                {SITE_KEY
                  ? <div ref={boxRef} />
                  : <p className="text-sm text-site-faint">The security check is not set up yet. Please tell a server admin.</p>}
              </div>

              {formError && <p className="mt-3 text-sm text-site-body">{formError}</p>}

              <button
                onClick={verify}
                disabled={!cf || busy || !SITE_KEY}
                className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-site-ink text-sm font-semibold text-site-bg transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</> : <><ShieldCheck className="h-4 w-4" /> Verify</>}
              </button>
              <p className="mt-4 text-xs text-site-faint">Protected by Cloudflare. We never ask for your password.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
