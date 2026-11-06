"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { BookOpen, HelpCircle, Rocket, ShieldCheck, Terminal } from "lucide-react";
import { docsHref } from "@/lib/site";

const ITEMS = [
  { label: "Introduction", path: "", icon: BookOpen },
  { label: "Setup guide", path: "/setup", icon: Rocket },
  { label: "Verification", path: "/verification", icon: ShieldCheck },
  { label: "Commands", path: "/commands", icon: Terminal },
  { label: "FAQ", path: "/faq", icon: HelpCircle },
];

export function DocsSidebar() {
  const raw = usePathname() || "/";
  // Works whether docs are shown at zevion.bond/docs/... or at docs.zevion.bond/...
  const here = raw.replace(/^\/docs/, "").replace(/\/$/, "");
  return (
    <nav aria-label="Docs" className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
      {ITEMS.map(({ label, path, icon: Icon }) => {
        const on = here === path;
        return (
          <a key={label} href={docsHref(path)}
            className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${on ? "bg-site-ink text-site-bg" : "text-site-muted hover:bg-site-ink/10 hover:text-site-ink"}`}>
            <Icon className="h-4 w-4" /> {label}
          </a>
        );
      })}
    </nav>
  );
}
