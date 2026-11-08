import React from "react";
import { ShieldAlert } from "lucide-react";
import { api } from "@/lib/api";
import { AntiRaidForm } from "@/components/dashboard/antiraid-form";

export default async function AntiRaidPage({ params }: { params: { guildId: string } }) {
  const config = await api.getAntiRaid(params.guildId);
  if (!config) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-site-ink flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-site-ink" />
          Anti-Raid
        </h2>
        <p className="text-site-muted mt-1">Detect join raids in seconds, lock the server down and remove the raiders automatically.</p>
      </div>
      <AntiRaidForm initialConfig={config} guildId={params.guildId} />
    </div>
  );
}
