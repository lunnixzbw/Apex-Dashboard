"use client";

import React, { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

type Mode = "system" | "light" | "dark";
const ORDER: Mode[] = ["system", "light", "dark"];
const KEY = "zv-theme";

function apply(mode: Mode) {
  const dark = mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

// Cycles Device -> Light -> Dark. "Device" (the default) follows the phone or computer setting, live.
export function ThemeToggle({ className = "", withLabel = false }: { className?: string; withLabel?: boolean }) {
  const [mode, setMode] = useState<Mode>("system");

  useEffect(() => {
    let saved: Mode = "system";
    try { const v = localStorage.getItem(KEY); if (v === "light" || v === "dark") saved = v; } catch { /* storage blocked */ }
    setMode(saved);
  }, []);

  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const on = () => apply("system");
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [mode]);

  const next = () => {
    const m = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
    setMode(m);
    try { if (m === "system") localStorage.removeItem(KEY); else localStorage.setItem(KEY, m); } catch { /* storage blocked */ }
    apply(m);
  };

  const Icon = mode === "light" ? Sun : mode === "dark" ? Moon : Monitor;
  const label = mode === "system" ? "Device theme" : mode === "light" ? "Light theme" : "Dark theme";
  return (
    <button onClick={next} title={`${label} (click to change)`} aria-label={`${label}. Click to change theme`}
      className={`inline-flex items-center justify-center gap-2 text-site-ink transition hover:bg-site-ink/10 ${className}`}>
      <Icon className="h-[18px] w-[18px]" />
      {withLabel && <span className="text-sm">{label}</span>}
    </button>
  );
}
