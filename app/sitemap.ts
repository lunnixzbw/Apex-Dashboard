import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { DOCS_URL, SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

const DOCS_PAGES = ["", "/setup", "/verification", "/commands", "/faq"];
const MAIN_PAGES: [string, MetadataRoute.Sitemap[number]["changeFrequency"], number][] = [
  ["", "weekly", 1],
  ["/features", "monthly", 0.9],
  ["/premium", "monthly", 0.9],
  ["/status", "daily", 0.4],
  ["/announcements", "weekly", 0.5],
  ["/contact", "yearly", 0.3],
  ["/terms", "yearly", 0.3],
  ["/privacy", "yearly", 0.3],
  ["/refund", "yearly", 0.3],
];

// A sitemap may only list URLs of its own host, so docs.<domain> gets its own sitemap.
export default function sitemap(): MetadataRoute.Sitemap {
  const host = (headers().get("x-forwarded-host") || headers().get("host") || "").toLowerCase();
  const now = new Date();
  const onDocsHost = host.startsWith("docs.");

  if (onDocsHost) {
    const base = DOCS_URL || `https://${host}`;
    return DOCS_PAGES.map((p) => ({ url: `${base}${p}` || base, lastModified: now, changeFrequency: "monthly" as const, priority: p === "" ? 0.8 : 0.7 }));
  }
  const main = MAIN_PAGES.map(([p, f, pr]) => ({ url: `${SITE_URL}${p}`, lastModified: now, changeFrequency: f, priority: pr }));
  if (DOCS_URL) return main;
  return [...main, ...DOCS_PAGES.map((p) => ({ url: `${SITE_URL}/docs${p}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 }))];
}
