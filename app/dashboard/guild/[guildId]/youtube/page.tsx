import React from "react";
import { Youtube } from "lucide-react";
import { api } from "@/lib/api";
import { YoutubeForm } from "@/components/dashboard/youtube-form";

export default async function YoutubePage({ params }: { params: { guildId: string } }) {
  const [data, roles, channels] = await Promise.all([
    api.getYoutube(params.guildId),
    api.getRoles(params.guildId).catch(() => []),
    api.getChannels(params.guildId).catch(() => []),
  ]);
  if (!data) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-site-ink flex items-center gap-2">
          <Youtube className="h-6 w-6 text-site-ink" />
          YouTube Notifications
        </h2>
        <p className="text-site-muted mt-1">Post in a channel when a YouTube channel uploads a video, a short or goes live.</p>
      </div>
      <YoutubeForm initial={data} guildId={params.guildId} roles={roles} channels={channels} />
    </div>
  );
}
