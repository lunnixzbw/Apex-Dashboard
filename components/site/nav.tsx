"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import {
  Activity, BookOpen, Crown, HelpCircle, Home, LayoutDashboard, LifeBuoy, LogIn, Megaphone, Menu, Plus, Sparkles, X,
} from "lucide-react";
import { BRAND, INVITE, NAV_LINKS } from "@/lib/site";
import { ThemeToggle } from "./theme-toggle";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Home, Features: Sparkles, Premium: Crown, Docs: BookOpen, FAQ: HelpCircle, Status: Activity, Support: LifeBuoy, Announcements: Megaphone,
};

// `base` is the full site address ("https://zevion.bond"). Pages served on another host (docs, auth) pass it so links come back to the main site.
export function SiteNav({ base = "" }: { base?: string }) {
  const pathname = usePathname();
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const signing = useRef(false);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open]);

  const href = (h: string) => (h.startsWith("/") ? `${base}${h}` : h);
  const signedIn = status === "authenticated";

  const login = () => {
    if (base) { window.location.assign(`${base}/${signedIn ? "dashboard" : "?login=1"}`); return; }
    if (signing.current || status === "loading") return; // a double click would start two logins and break the OAuth state
    if (signedIn) { window.location.assign("/dashboard"); return; }
    signing.current = true;
    signIn("discord", { callbackUrl: "/dashboard" });
  };

  const active = (h: string) => !base && (h === "/" ? pathname === "/" : !h.includes("#") && h.startsWith("/") && pathname.startsWith(h));
  const loginLabel = signedIn ? "Dashboard" : "Login";
  const LoginIcon = signedIn ? LayoutDashboard : LogIn;

  const linkCls = (on: boolean) =>
    `rounded-lg px-3 py-2 text-sm transition-colors ${on ? "text-site-ink" : "text-site-muted hover:text-site-ink"}`;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-site-ink/[0.07] bg-site-bg/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <Link href={href("/")} className="flex items-center gap-2.5">
            <img src="/logo.png" alt="" className="site-logo h-9 w-9 object-contain" />
            <span className="font-outfit text-lg font-semibold tracking-tight text-site-ink">{BRAND}</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {NAV_LINKS.filter((l) => l.desktop).map((l) => (
              <a key={l.label} href={href(l.href)} className={linkCls(active(l.href))}>{l.label}</a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a href={href(INVITE)} className="hidden h-9 items-center gap-1.5 rounded-lg border border-site-ink/15 px-3.5 text-sm font-medium text-site-ink transition hover:bg-site-ink/10 sm:inline-flex">
              <Plus className="h-4 w-4" /> Add to Discord
            </a>
            <button onClick={login} className="hidden h-9 items-center gap-1.5 rounded-lg bg-site-ink px-3.5 text-sm font-semibold text-site-bg transition hover:opacity-85 sm:inline-flex">
              <LoginIcon className="h-4 w-4" /> {loginLabel}
            </button>
            <ThemeToggle className="h-9 w-9 rounded-lg border border-site-ink/15" />
            <button onClick={() => setOpen(true)} aria-label="Open menu" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-site-ink/15 text-site-ink transition hover:bg-site-ink/10">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Menu drawer */}
      <div className={`fixed inset-0 z-[60] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
        <div onClick={() => setOpen(false)} className={`absolute inset-0 bg-site-bg/70 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} />
        <aside className={`absolute right-0 top-0 flex h-full w-[min(86vw,340px)] flex-col border-l border-site-ink/10 bg-site-bg shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex h-16 items-center justify-between border-b border-site-ink/[0.07] px-5">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="" className="site-logo h-8 w-8 object-contain" />
              <span className="font-outfit text-base font-semibold text-site-ink">{BRAND}</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-site-muted transition hover:bg-site-ink/10 hover:text-site-ink">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Menu">
            {NAV_LINKS.map((l) => {
              const Icon = ICONS[l.label] || Sparkles;
              const on = active(l.href);
              return (
                <a key={l.label} href={href(l.href)} onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] transition-colors ${on ? "bg-site-ink/10 text-site-ink" : "text-site-muted hover:bg-site-ink/[0.06] hover:text-site-ink"}`}>
                  <Icon className="h-[18px] w-[18px]" /> {l.label}
                </a>
              );
            })}
          </nav>

          <div className="space-y-2 border-t border-site-ink/[0.07] p-4">
            <ThemeToggle withLabel className="h-11 w-full rounded-xl border border-site-ink/15" />
            <a href={href(INVITE)} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-site-ink/15 text-sm font-medium text-site-ink transition hover:bg-site-ink/10">
              <Plus className="h-4 w-4" /> Add to Discord
            </a>
            <button onClick={login} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-site-ink text-sm font-semibold text-site-bg transition hover:opacity-85">
              <LoginIcon className="h-4 w-4" /> {signedIn ? "Open Dashboard" : "Login with Discord"}
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}
