"use client";

import React, { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";

const AUTH_ERRORS: Record<string, string> = {
  OAuthCallback: "Discord sign-in failed. If it worked before, Discord is probably rate limiting the login: wait a minute and try again. Otherwise check that the Discord redirect URL and client secret match this site.",
  OAuthSignin: "Could not start Discord sign-in. Check DISCORD_CLIENT_ID / DISCORD_CLIENT_SECRET.",
  Configuration: "The dashboard is missing a setting (NEXTAUTH_SECRET or NEXTAUTH_URL).",
  AccessDenied: "Discord denied the sign-in.",
  Callback: "Sign-in could not be completed. Try again.",
  SessionExpired: "Your session expired. Sign in again.",
};

// Shows login errors, and starts Discord login when the page is opened with ?login=1 (used by links from docs.zevion.bond).
export function AuthEffects() {
  const { status } = useSession();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const code = q.get("error");
    if (code) setError((AUTH_ERRORS[code] || "Sign-in problem.") + ` [${code}]`);
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    const q = new URLSearchParams(window.location.search);
    if (q.get("login") !== "1") return;
    window.history.replaceState(null, "", window.location.pathname);
    if (status === "authenticated") window.location.assign("/dashboard");
    else signIn("discord", { callbackUrl: "/dashboard" });
  }, [status]);

  if (!error) return null;
  return (
    <div className="fixed left-1/2 top-20 z-[70] w-[92%] max-w-xl -translate-x-1/2 rounded-xl border border-site-ink/20 bg-site-card px-5 py-4 text-sm text-site-ink shadow-2xl">
      {error}
    </div>
  );
}

type Stats = { online: boolean; servers?: number; users?: number; ping?: number };
const compact = (n?: number) => (typeof n === "number" ? new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n) : "-");

// Live numbers from the bot. Hidden completely while the bot is offline so the page never shows a scary zero.
export function LiveStats() {
  const [s, setS] = useState<Stats | null>(null);
  useEffect(() => {
    let alive = true;
    fetch("/api/status").then((r) => r.json()).then((d) => alive && setS(d)).catch(() => {});
    return () => { alive = false; };
  }, []);
  if (!s?.online) return null;
  const items = [
    ["Servers", compact(s.servers)],
    ["Members", compact(s.users)],
    ["Latency", typeof s.ping === "number" ? `${s.ping} ms` : "-"],
  ];
  return (
    <div className="mx-auto mt-12 grid max-w-xl grid-cols-3 divide-x divide-site-ink/10 rounded-2xl border border-site-ink/10 bg-site-card/60 py-4">
      {items.map(([k, v]) => (
        <div key={k} className="px-4 text-center">
          <div className="font-outfit text-2xl font-bold text-site-ink">{v}</div>
          <div className="mt-0.5 text-xs text-site-faint">{k}</div>
        </div>
      ))}
    </div>
  );
}
