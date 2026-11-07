import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Zap, Plus } from "lucide-react";
import { ThemeToggle } from "@/components/site/theme-toggle";

export const metadata = { title: "Add to your server", description: "Add Zevion to your Discord server.", robots: { index: true } };
export const dynamic = "force-static";

// The bot's application ID (same as CLIENT_ID in the bot's config.js). Override with NEXT_PUBLIC_BOT_CLIENT_ID if it ever changes.
const CLIENT_ID = process.env.NEXT_PUBLIC_BOT_CLIENT_ID || "1549227379753361508";
// permissions=8 is Administrator, so every feature (antinuke, moderation, music...) works without extra setup.
const AUTH_URL =
  `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}` +
  `&permissions=8&integration_type=0&scope=bot+applications.commands`;

export default function AddPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-site-bg px-4 py-10">
      <div className="pointer-events-none absolute inset-0 opacity-[0.5]" style={{ backgroundImage: "linear-gradient(rgb(var(--site-ink) / 0.04) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--site-ink) / 0.04) 1px, transparent 1px)", backgroundSize: "44px 44px", maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)", WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)" }} />
      <div className="absolute right-4 top-4 z-10"><ThemeToggle /></div>

      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-5 inline-flex items-center gap-2 text-sm text-site-faint transition hover:text-site-ink">
          <ArrowLeft className="h-4 w-4" /> Back to Website
        </Link>

        <div className="rounded-3xl border border-site-ink/10 bg-site-card p-8 text-center shadow-2xl sm:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-site-ink/10 bg-site-bg">
            <Image src="/logo.png" alt="Zevion" width={48} height={48} priority className="site-logo" />
          </div>
          <h1 className="mt-6 font-outfit text-3xl font-bold tracking-tight text-site-ink">Add Zevion</h1>
          <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-site-muted">Protection, moderation, music and more. Add Zevion to your Discord server in a few clicks.</p>

          <a href={AUTH_URL} rel="noopener"
            className="mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#5865F2] text-base font-semibold text-white transition hover:brightness-110">
            <Plus className="h-5 w-5" /> Add to your server
          </a>

          <div className="mt-7 flex items-center justify-center gap-5 text-xs text-site-faint">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Official Link</span>
            <span className="h-1 w-1 rounded-full bg-site-faint/60" />
            <span className="inline-flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" /> Instant Setup</span>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-site-faint">You need the Manage Server permission to add a bot. Zevion asks for Administrator so anti-nuke and moderation work fully.</p>
      </div>
    </main>
  );
}
