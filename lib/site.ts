// Shared constants for the public website. Everything here can be changed with environment variables on Vercel.
export const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME || "Zevion";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://zevion.bond").replace(/\/$/, "");
// When docs live on their own domain (e.g. https://docs.zevion.bond) set NEXT_PUBLIC_DOCS_URL; otherwise docs are served at /docs.
export const DOCS_URL = (process.env.NEXT_PUBLIC_DOCS_URL || "").replace(/\/$/, "");
// The invite button always goes through /invite, which builds the Discord link from your bot client ID (see app/invite/route.ts).
export const INVITE = "/invite";
export const AUTH_URL = (process.env.NEXT_PUBLIC_AUTH_URL || "https://auth.zevion.bond").replace(/\/$/, "");
export const SUPPORT = process.env.NEXT_PUBLIC_SUPPORT_URL || "https://discord.gg/75WUGBKbd5";
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";
export const LAST_UPDATED = "5 November 2026";

export const docsHref = (path = "") => `${DOCS_URL || "/docs"}${path}`;

export type NavLink = { label: string; href: string; desktop?: boolean };
// "desktop" links also show in the top bar; every link shows in the menu drawer.
export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features", desktop: true },
  { label: "Premium", href: "/premium", desktop: true },
  { label: "Docs", href: docsHref(), desktop: true },
  { label: "FAQ", href: "/#faq", desktop: true },
  { label: "Status", href: "/status", desktop: true },
  { label: "Support", href: "/support" },
  { label: "Announcements", href: "/announcements" },
];
