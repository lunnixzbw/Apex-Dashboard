"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { ArrowLeft, Loader2, ShieldCheck, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/site/theme-toggle";

const ERRORS: Record<string, string> = {
  OAuthCallback: "Discord sign-in failed. If it worked before, Discord may be rate limiting the login: wait a minute and try again.",
  OAuthSignin: "Could not start Discord sign-in. Try again in a moment.",
  Configuration: "The dashboard is missing a setting. Tell the Zevion team.",
  AccessDenied: "Discord denied the sign-in.",
  Callback: "Sign-in could not be completed. Try again.",
  SessionExpired: "Your session expired. Sign in again.",
};

export function LoginCard({ callbackUrl, error }: { callbackUrl: string; error?: string }) {
  const [busy, setBusy] = useState(false);
  const once = useRef(false);
  const go = () => {
    if (once.current) return; // a double click would start two logins and break the OAuth state
    once.current = true;
    setBusy(true);
    signIn("discord", { callbackUrl });
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-site-bg px-4 py-10">
      <div className="pointer-events-none absolute inset-0 opacity-[0.5]" style={{ backgroundImage: "linear-gradient(rgb(var(--site-ink) / 0.04) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--site-ink) / 0.04) 1px, transparent 1px)", backgroundSize: "44px 44px", maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)", WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)" }} />
      <div className="absolute right-4 top-4 z-10"><ThemeToggle /></div>

      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-5 inline-flex items-center gap-2 text-sm text-site-faint transition hover:text-site-ink">
          <ArrowLeft className="h-4 w-4" /> Back to Website
        </Link>

        <div className="rounded-3xl border border-site-ink/10 bg-site-card p-8 text-center shadow-2xl sm:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-site-ink/10 bg-site-bg">
            <Image src="/logo.png" alt="Zevion" width={48} height={48} priority className="site-logo" />
          </div>
          <h1 className="mt-6 font-outfit text-3xl font-bold tracking-tight text-site-ink">Welcome Back</h1>
          <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-site-muted">Sign in with Discord to access the Zevion management dashboard.</p>

          {error && (
            <div className="mt-6 rounded-xl border border-site-ink/20 bg-site-ink/[0.05] p-3.5 text-left text-sm text-site-body">
              {ERRORS[error] || "Sign-in problem. Try again."}
            </div>
          )}

          <button onClick={go} disabled={busy}
            className="mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#5865F2] text-base font-semibold text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-80">
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : (
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" /></svg>
            )}
            {busy ? "Opening Discord..." : "Login with Discord"}
          </button>

          <div className="mt-7 flex items-center justify-center gap-5 text-xs text-site-faint">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Secure Auth</span>
            <span className="h-1 w-1 rounded-full bg-site-faint/60" />
            <span className="inline-flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" /> Instant Access</span>
          </div>
        </div>
      </div>
    </main>
  );
}
