import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { DOCS_URL, SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const host = (headers().get("x-forwarded-host") || headers().get("host") || "").toLowerCase();
  if (host.startsWith("auth.")) {
    // The verification page is personal and should never show up in search.
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  const base = host.startsWith("docs.") ? DOCS_URL || `https://${host}` : SITE_URL;
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/dashboard", "/api", "/verify", "/invite"] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
