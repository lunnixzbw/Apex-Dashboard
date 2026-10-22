"use client";

import { Crown, Lock } from "lucide-react";

// Shown instead of a premium feature when the server has no active Apex Premium.
export function PremiumGate({ feature }: { feature: string }) {
  const url = process.env.NEXT_PUBLIC_PREMIUM_URL || "https://discord.gg/75WUGBKbd5";
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 animate-in fade-in duration-500">
      <div className="w-full max-w-md rounded-[2rem] border border-white/[0.06] bg-[#0b0b0b] p-8 text-center shadow-2xl shadow-black/60">
        <div className="relative mx-auto mb-7 h-24 w-24">
          <div className="flex h-full w-full items-center justify-center rounded-3xl border border-white/[0.06] bg-[#141414]">
            <Crown className="h-10 w-10 text-zinc-200" strokeWidth={1.5} />
          </div>
          <div className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black">
            <Lock className="h-4 w-4 text-zinc-200" />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold uppercase tracking-wide text-white">Apex Premium</h2>
        <p className="mt-4 text-base leading-relaxed text-zinc-500">
          The {feature} feature requires an active premium subscription. Upgrade your server to unlock the
          ultimate Discord experience and gain access to powerful advanced tools.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 flex h-14 w-full items-center justify-center rounded-2xl bg-white text-base font-bold text-black transition hover:bg-zinc-200"
        >
          Upgrade to Premium
        </a>
      </div>
    </div>
  );
}
