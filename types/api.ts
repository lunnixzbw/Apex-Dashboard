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

export interface BotInfo {
  name: string;
  id: string | null;
  guilds: number;
  users: number;
  commands: number;
  latency: string;
}

export interface BotStatus {
  user: string;
  id: string | null;
  latency: number;
  guild_count: number;
  user_count: number;
  shards: number | null;
}

export interface GuildSummary {
  id: string;
  name: string;
  icon_url: string | null;
  owner_id: string;
  member_count: number;
}

export interface GuildDetails {
  id: string;
  name: string;
  icon: string | null;
  owner_id: string;
  member_count: number;
  role_count: number;
  channel_count: number;
}

export interface PrefixConfig {
  guild_id: string;
  prefix: string;
}

export interface AutomodConfig {
  guild_id: string;
  enabled: boolean;
  punishments: Record<string, string>;
  ignored_roles: string[];
  ignored_channels: string[];
  logging_channel: string | null;
}

export interface TicketCategory {
  name: string;
  emoji: string | null;
  description?: string | null;
  staff_roles: string[];
  button_style?: number;
  discord_category_id?: string | null;
  questions?: TicketQuestion[];
}

export interface TicketQuestion {
  label: string;
  placeholder?: string;
  paragraph?: boolean;
  required?: boolean;
}

export interface TicketEmbed {
  title: string | null;
  description: string | null;
  color?: number | null;
  image_url?: string | null;
  thumbnail_url?: string | null;
}

export interface TicketConfig {
  guild_id: string;
  panel_channel: string | null;
  panel_message: string | null;
  logging_channel?: string | null;
  closed_category?: string | null;
  panel_type?: string;
  default_category_id?: string | null;
  embed: TicketEmbed;
  categories: TicketCategory[];
  staff_roles: string[];
  open_ticket_count: number;
  panels?: { id: number; name: string }[];
  panel_id?: number | null;
  panel_limit?: number;
}

export interface LevelingEmbedStyle {
  color: string;
  thumbnail: boolean;
  image: string | null;
}

export interface LevelingConfig {
  guild_id: string;
  enabled: boolean;
  xp_per_message: number;
  cooldown: number;
  level_up_channel: string | null;
  level_message?: string | null;
  level_message_type?: string;
  embed_style: LevelingEmbedStyle;
}

export interface LoggingConfig {
  guild_id: string;
  log_enabled: Record<string, boolean>;
  log_channels: Record<string, string>;
  ignore_channels: string[];
  ignore_roles: string[];
  ignore_users: string[];
  auto_delete_duration: number | null;
}

// Update Request Types
export interface PrefixUpdate {
  prefix: string;
}

export interface AutomodUpdate {
  enabled?: boolean;
  punishments?: Record<string, string>;
  ignored_roles?: string[];
  ignored_channels?: string[];
  logging_channel?: string;
}

export interface LevelingUpdate {
  enabled?: boolean;
  xp_per_message?: number;
  cooldown?: number;
  level_up_channel?: string;
  embed_color?: string;
}

export interface LoggingUpdate {
  log_enabled?: Record<string, boolean>;
  log_channels?: Record<string, string>;
}

export interface LeaderboardEntry {
  user_id: string;
  name: string;
  level: number;
  xp: number;
}

export interface DiscordChannel {
  id: string;
  name: string;
  type: string;
}

export interface DiscordRole {
  id: string;
  name: string;
  color: number;
  position: number;
}

export interface TicketUpdate {
  panel_channel?: string | null;
  logging_channel?: string | null;
  closed_category?: string | null;
  panel_type?: string;
  embed_title?: string | null;
  embed_description?: string | null;
  embed_color?: number | null;
  embed_image_url?: string | null;
  embed_thumbnail_url?: string | null;
  categories?: TicketCategory[];
}

export interface WelcomeEmbedData {
  header?: string | null;
  footer?: string | null;
  message?: string | null;
  title?: string | null;
  description?: string | null;
  color?: string | null;
  footer_text?: string | null;
  footer_icon?: string | null;
  author_name?: string | null;
  author_icon?: string | null;
  thumbnail?: string | null;
  image?: string | null;
}

export interface WelcomeConfig {
  guild_id: string;
  welcome_type?: string | null;
  welcome_message?: string | null;
  welcome_content?: string | null;
  channel_id?: string | null;
  embed_data?: WelcomeEmbedData | null;
  auto_delete_duration?: number | null;
  card_background?: string | null;
  card_backgrounds?: { id: string; label: string }[];
}

export interface WelcomeUpdate {
  welcome_content?: string | null;
  card_background?: string | null;
  welcome_type?: string | null;
  welcome_message?: string | null;
  channel_id?: string | null;
  embed_data?: WelcomeEmbedData | null;
  auto_delete_duration?: number | null;
}

export interface AntiNukeConfig {
  guild_id: string;
  status: boolean;
  whitelisted_users?: string[];
}

export interface AntiNukeUpdate {
  status?: boolean;
  add_whitelist?: string;
  remove_whitelist?: string;
}

export interface VerificationConfig {
  guild_id: string;
  verification_channel_id: string | null;
  verified_role_id: string | null;
  log_channel_id: string | null;
  verification_method: string;
  enabled: boolean;
}

export interface VerificationUpdate {
  verification_channel_id?: string | null;
  verified_role_id?: string | null;
  log_channel_id?: string | null;
  verification_method?: string | null;
  enabled?: boolean | null;
}

export interface VanityRoleSetup {
  vanity: string;
  role_id: string;
  log_channel_id: string;
}

export interface AutoRoleConfig {
  guild_id: string;
  bots: string[];
  humans: string[];
}

export interface AutoRoleUpdate {
  bots?: string[];
  humans?: string[];
}

export interface AdminNodeStatus {
  name: string;
  status: string;
  load: string;
  icon: string;
}

export interface AdminStats {
  total_users: string;
  active_servers: string;
  api_latency: string;
  db_size: string;
  nodes: AdminNodeStatus[];
}

export interface AdminConfig {
  maintenance_mode: boolean;
  global_notification: string | null;
}

export interface AdminConfigUpdate {
  maintenance_mode?: boolean;
  global_notification?: string | null;
}

// ── Premium features ──
export interface AntiBetrayConfig {
  guild_id: string;
  premium: boolean;
  enabled: boolean;
  ban_threshold: number;
  ban_window: number;
  kick_threshold: number;
  kick_window: number;
  everyone_threshold: number;
  everyone_window: number;
  log_channel: string | null;
}

export interface AIChatConfig {
  guild_id: string;
  premium: boolean;
  channels: { id: string; name: string }[];
}

export interface BotProfileConfig {
  guild_id: string;
  premium: boolean;
  avatar_url: string;
  banner_url: string | null;
  bio: string;
}

export interface HoneypotConfig {
  guild_id: string;
  configured: boolean;
  channel_id: string | null;
  channel_name: string | null;
  message: string;
  punishment: "softban" | "ban";
  log_channel: string | null;
  kicks: number;
}

export interface UpiConfig {
  guild_id: string;
  slots: { slot: number; upi_id: string; qr: string | null }[];
}

export interface AutoresponderItem {
  id: number;
  trigger: string;
  response: string;
  case_sensitive: boolean;
  enabled: boolean;
}

export interface AutoresponderList {
  guild_id: string;
  limit: number;
  items: AutoresponderItem[];
}

export interface TagSupporterConfig {
  guild_id: string;
  enabled: boolean;
  role_id: string | null;
  log_channel: string | null;
}

export interface JailRecordItem {
  id: number;
  user_id: string;
  username: string | null;
  moderator: string | null;
  reason: string | null;
  jailed_at: string;
  released_at: string | null;
  released_by: string | null;
}

export interface JailConfig {
  guild_id: string;
  role_id: string | null;
  channel_id: string | null;
  log_channel: string | null;
  ready: boolean;
  active: JailRecordItem[];
  history: JailRecordItem[];
}
