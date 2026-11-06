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

import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "Zevion";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://zevion.bond";
const description =
  `${brandName} is a powerful Discord bot with antinuke security, moderation, music, giveaways, tickets, welcome, automod, logging and a full web dashboard. Add ${brandName} to your server.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: `${brandName} - Ultimate Discord Bot`, template: `%s | ${brandName}` },
  description,
  applicationName: brandName,
  keywords: [
    brandName, `${brandName} bot`, `${brandName} discord bot`, "discord bot", "antinuke bot",
    "moderation bot", "music bot", "giveaway bot", "ticket bot", "discord dashboard",
  ],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  icons: { icon: "/logo.png", shortcut: "/logo.png", apple: "/logo.png" },
  openGraph: {
    type: "website",
    url: SITE,
    siteName: brandName,
    title: `${brandName} - Ultimate Discord Bot`,
    description,
    images: [{ url: "/logo.png", alt: `${brandName} logo` }],
  },
  twitter: { card: "summary", title: `${brandName} - Ultimate Discord Bot`, description, images: ["/logo.png"] },
};

// Runs before the page paints so there is no light/dark flash. No saved choice = follow the device.
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('zv-theme');var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", name: brandName, alternateName: [`${brandName} Bot`, `${brandName} Discord Bot`], url: SITE },
    { "@type": "Organization", name: brandName, url: SITE, logo: `${SITE}/logo.png` },
    {
      "@type": "SoftwareApplication",
      name: brandName,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Discord",
      description,
      url: SITE,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="font-sans antialiased text-site-body">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
