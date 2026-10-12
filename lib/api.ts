/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║                                                                  ║
 * ║   ░█▀▀░█▀█░█▀▄░█▀▀░█░█   ░█▀▄░█▀▀░█░█░█▀▀                     ║
 * ║   ░█░░░█░█░█░█░█▀▀░▄▀▄   ░█░█░█▀▀░▀▄▀░▀▀█                     ║
 * ║   ░▀▀▀░▀▀▀░▀▀░░▀▀▀░▀░▀   ░▀▀░░▀▀▀░░▀░░▀▀▀                     ║
 * ║                                                                  ║
 * ║           © 2026 CodeX Devs — All Rights Reserved               ║
 * ║                                                                  ║
 * ║   discord  ──  https://discord.gg/codexdev                      ║
 * ║   youtube  ──  https://youtube.com/@CodeXDevs                   ║
 * ║   github   ──  https://github.com/RayExo                        ║
 * ║                                                                  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { 
  BotInfo, 
  BotStatus, 
  GuildSummary, 
  GuildDetails,
  PrefixConfig, 
  AutomodConfig, 
  TicketConfig, 
  LevelingConfig, 
  LoggingConfig,
  PrefixUpdate,
  AutomodUpdate,
  LevelingUpdate,
  LoggingUpdate,
  LeaderboardEntry,
  DiscordChannel,
  DiscordRole,
  AutoRoleConfig,
  AutoRoleUpdate,
  AdminStats,
  AdminConfig,
  AdminConfigUpdate,
  AntiBetrayConfig,
  AIChatConfig,
  BotProfileConfig,
  HoneypotConfig,
  TagSupporterConfig,
  JailConfig,
  AutoresponderList,
  AutoresponderItem,
  UpiConfig,
} from "@/types/api";

// Browser  -> same-origin proxy (app/api/bot), which adds the secret key and the signed-in user.
// Server   -> Apex API directly with the server-only key. middleware.ts has already checked that the
//             user may open the page; every write goes through the proxy, which identifies the user.
// The API key is never exposed to the browser (it is NOT a NEXT_PUBLIC_ variable).
const IS_SERVER = typeof window === "undefined";
const BASE_URL = IS_SERVER
  ? process.env.BOT_API_URL || "http://127.0.0.1:8000/api/v1"
  : "/api/bot";
const API_KEY = IS_SERVER ? process.env.DASHBOARD_API_KEY : undefined;

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit & { next?: NextFetchRequestConfig } = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = new Headers(options.headers);
  if (API_KEY) {
    headers.set("Authorization", `Bearer ${API_KEY}`);
  }
  headers.set("Content-Type", "application/json");
  try {
    const response = await fetch(url, {
      ...options,
      headers,
      // CRITICAL: Never cache mutation responses. For GETs, use revalidate: 0
      // to always fetch fresh data from the bot API. Caching was causing
      // saved data to "disappear" on reload because Next.js served stale cache.
      next: options.next || { revalidate: 0 },
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: "An unknown error occurred" };
      }
      console.error(`[API HTTP Error] Status ${response.status} for ${url}:`, errorData);
      throw new ApiError(response.status, errorData.detail || response.statusText);
    }

    return response.json();
  } catch (error) {
    console.error(`[API Network/Fetch Error] Failed to fetch ${url}:`, error);
    throw error;
  }
}

export const api = {
  // Bot 
  getBotStatus: () => request<BotStatus>("/bot/status"),
  getBotInfo: () => request<BotInfo>("/bot/info"),

  // Guilds
  listGuilds: () => request<GuildSummary[]>("/guilds/"),
  getGuildDetails: (guildId: string) => request<any>(`/guilds/${guildId}`),
  getChannels: (guildId: string) => request<DiscordChannel[]>(`/guilds/${guildId}/channels`),
  getRoles: (guildId: string) => request<DiscordRole[]>(`/guilds/${guildId}/roles`),
  
  // Module Configs
  getPrefix: (guildId: string) => request<PrefixConfig>(`/guilds/${guildId}/prefix`),
  updatePrefix: (guildId: string, prefix: string) => 
    request<{ status: string; new_prefix: string }>(`/guilds/${guildId}/prefix`, {
      method: "POST",
      body: JSON.stringify({ prefix }),
    }),

  getAutomod: (guildId: string) => request<AutomodConfig>(`/guilds/${guildId}/automod`),
  updateAutomod: (guildId: string, data: Partial<AutomodConfig>) => 
    request<{ status: string }>(`/guilds/${guildId}/automod`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  getTickets: (guildId: string) => request<TicketConfig>(`/guilds/${guildId}/tickets`),
  updateTickets: (guildId: string, data: any) => 
    request<{ status: string }>(`/guilds/${guildId}/tickets`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  
  getLeveling: (guildId: string) => request<LevelingConfig>(`/guilds/${guildId}/leveling`),
  updateLeveling: (guildId: string, data: any) => 
    request<{ status: string }>(`/guilds/${guildId}/leveling`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  getLogging: (guildId: string) => request<LoggingConfig>(`/guilds/${guildId}/logging`),
  updateLogging: (guildId: string, data: any) => 
    request<{ status: string }>(`/guilds/${guildId}/logging`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  getLeaderboard: (guildId: string) => request<LeaderboardEntry[]>(`/guilds/${guildId}/leveling/leaderboard`),

  getWelcome: (guildId: string) => request<any>(`/guilds/${guildId}/welcome`),
  updateWelcome: (guildId: string, data: any) => 
    request<{ status: string }>(`/guilds/${guildId}/welcome`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  getAntiNuke: (guildId: string) => request<any>(`/guilds/${guildId}/antinuke`),
  updateAntiNuke: (guildId: string, data: any) => 
    request<{ status: string }>(`/guilds/${guildId}/antinuke`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  getVerification: (guildId: string) => request<any>(`/guilds/${guildId}/verification`),
  updateVerification: (guildId: string, data: any) => 
    request<{ status: string }>(`/guilds/${guildId}/verification`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  getVanityRoles: (guildId: string) => request<any[]>(`/guilds/${guildId}/vanityroles`),
  addVanityRole: (guildId: string, data: any) =>
    request<{ status: string }>(`/guilds/${guildId}/vanityroles`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteVanityRole: (guildId: string, vanity: string) =>
    request<{ status: string }>(`/guilds/${guildId}/vanityroles/${vanity}`, {
      method: "DELETE",
    }),

  getAutoRole: (guildId: string) => request<AutoRoleConfig>(`/guilds/${guildId}/autorole`),
  updateAutoRole: (guildId: string, data: AutoRoleUpdate) =>
    request<{ status: string }>(`/guilds/${guildId}/autorole`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  getTracking: (guildId: string) => request<any>(`/guilds/${guildId}/tracking`),
  updateTracking: (guildId: string, data: any) =>
    request<{ status: string }>(`/guilds/${guildId}/tracking`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  getJ2C: (guildId: string) => request<any>(`/guilds/${guildId}/j2c`),
  updateJ2C: (guildId: string, data: any) =>
    request<{ status: string }>(`/guilds/${guildId}/j2c`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  getJoinDM: (guildId: string) => request<any>(`/guilds/${guildId}/joindm`),
  updateJoinDM: (guildId: string, data: any) =>
    request<{ status: string }>(`/guilds/${guildId}/joindm`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  getCustomRoles: (guildId: string) => request<any>(`/guilds/${guildId}/customroles`),
  updateCustomRoles: (guildId: string, data: any) =>
    request<{ status: string }>(`/guilds/${guildId}/customroles`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  getAutoReact: (guildId: string) => request<any>(`/guilds/${guildId}/autoreact`),
  updateAutoReact: (guildId: string, data: any) =>
    request<{ status: string }>(`/guilds/${guildId}/autoreact`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  getInvcRole: (guildId: string) => request<any>(`/guilds/${guildId}/invcrole`),
  updateInvcRole: (guildId: string, data: any) =>
    request<{ status: string }>(`/guilds/${guildId}/invcrole`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  getRR: (guildId: string) => request<any>(`/guilds/${guildId}/reactionroles`),
  updateRR: (guildId: string, data: any) =>
    request<{ status: string }>(`/guilds/${guildId}/reactionroles`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  getInvites: (guildId: string) => request<any>(`/guilds/${guildId}/invites`),
  updateInvites: (guildId: string, data: any) =>
    request<{ status: string }>(`/guilds/${guildId}/invites`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // Premium features
  getAntiBetray: (guildId: string) => request<AntiBetrayConfig>(`/guilds/${guildId}/antibetray`),
  updateAntiBetray: (guildId: string, data: Partial<AntiBetrayConfig>) =>
    request<{ status: string }>(`/guilds/${guildId}/antibetray`, { method: "PATCH", body: JSON.stringify(data) }),
  getAIChat: (guildId: string) => request<AIChatConfig>(`/guilds/${guildId}/aichat`),
  updateAIChat: (guildId: string, data: { enable_channel?: string; disable_channel?: string }) =>
    request<{ status: string }>(`/guilds/${guildId}/aichat`, { method: "PATCH", body: JSON.stringify(data) }),
  getBotProfile: (guildId: string) => request<BotProfileConfig>(`/guilds/${guildId}/botprofile`),
  updateBotProfile: (guildId: string, data: { avatar?: string; banner?: string; bio?: string; reset?: boolean }) =>
    request<{ status: string }>(`/guilds/${guildId}/botprofile`, { method: "PATCH", body: JSON.stringify(data) }),

  // Honeypot + UPI
  getHoneypot: (guildId: string) => request<HoneypotConfig>(`/guilds/${guildId}/honeypot`),
  createHoneypot: (guildId: string) => request<{ status: string }>(`/guilds/${guildId}/honeypot`, { method: "POST", body: JSON.stringify({}) }),
  updateHoneypot: (guildId: string, data: { message?: string; punishment?: string; log_channel?: string | null }) =>
    request<{ status: string }>(`/guilds/${guildId}/honeypot`, { method: "PATCH", body: JSON.stringify(data) }),
  removeHoneypot: (guildId: string) => request<{ status: string }>(`/guilds/${guildId}/honeypot`, { method: "DELETE" }),
  getUpi: (guildId: string) => request<UpiConfig>(`/guilds/${guildId}/upi`),
  updateUpi: (guildId: string, data: { slot?: number; upi_id?: string; qr?: string | null; remove_slot?: number }) =>
    request<{ status: string }>(`/guilds/${guildId}/upi`, { method: "PATCH", body: JSON.stringify(data) }),

  // Tag supporter + Jail
  getTagSupporter: (guildId: string) => request<TagSupporterConfig>(`/guilds/${guildId}/tagsupporter`),
  updateTagSupporter: (guildId: string, data: { enabled?: boolean; role_id?: string | null; log_channel?: string | null }) =>
    request<{ status: string }>(`/guilds/${guildId}/tagsupporter`, { method: "PATCH", body: JSON.stringify(data) }),
  syncTagSupporter: (guildId: string) => request<{ status: string; checked: number }>(`/guilds/${guildId}/tagsupporter/sync`, { method: "POST", body: JSON.stringify({}) }),
  getJail: (guildId: string) => request<JailConfig>(`/guilds/${guildId}/jail`),
  updateJail: (guildId: string, data: { role_id?: string | null; channel_id?: string | null; log_channel?: string | null }) =>
    request<{ status: string }>(`/guilds/${guildId}/jail`, { method: "PATCH", body: JSON.stringify(data) }),
  setupJail: (guildId: string) => request<{ status: string; locked: number; failed: number }>(`/guilds/${guildId}/jail/setup`, { method: "POST", body: JSON.stringify({}) }),
  syncJail: (guildId: string) => request<{ status: string; locked: number; failed: number }>(`/guilds/${guildId}/jail/sync`, { method: "POST", body: JSON.stringify({}) }),
  jailUser: (guildId: string, data: { user_id: string; reason?: string }) =>
    request<{ status: string }>(`/guilds/${guildId}/jail/jail`, { method: "POST", body: JSON.stringify(data) }),
  releaseJail: (guildId: string, user_id: string) =>
    request<{ status: string }>(`/guilds/${guildId}/jail/release`, { method: "POST", body: JSON.stringify({ user_id }) }),

  // Autoresponders
  getAutoresponders: (guildId: string) => request<AutoresponderList>(`/guilds/${guildId}/autoresponders`),
  createAutoresponder: (guildId: string, data: { trigger: string; response: string; case_sensitive?: boolean }) =>
    request<{ status: string; item: AutoresponderItem }>(`/guilds/${guildId}/autoresponders`, { method: "POST", body: JSON.stringify(data) }),
  updateAutoresponder: (guildId: string, id: number, data: Partial<{ trigger: string; response: string; case_sensitive: boolean; enabled: boolean }>) =>
    request<{ status: string; item: AutoresponderItem }>(`/guilds/${guildId}/autoresponders/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteAutoresponder: (guildId: string, id: number) =>
    request<{ status: string }>(`/guilds/${guildId}/autoresponders/${id}`, { method: "DELETE" }),

  // Admin
  getAdminStats: () => request<AdminStats>("/admin/stats"),
  getAdminConfig: () => request<AdminConfig>("/admin/config"),
  updateAdminConfig: (data: AdminConfigUpdate) => 
    request<{ status: string }>("/admin/config", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};
