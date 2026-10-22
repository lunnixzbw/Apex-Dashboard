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

import DiscordProvider from "next-auth/providers/discord";
import { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
  // Shows the real reason for OAuthCallback errors in the Vercel function logs.
  logger: {
    error(code, metadata: any) {
      const detail = metadata?.error?.message || metadata?.message || JSON.stringify(metadata)?.slice(0, 600);
      console.error("[next-auth]", code, detail);
    },
  },
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
      // Discord now sends an `iss` parameter on the callback; the OAuth client must know the issuer or it throws
      // "issuer must be configured on the issuer".
      issuer: "https://discord.com",
      authorization: { params: { scope: "identify guilds" } },
      // Emergency switch: set NEXTAUTH_RELAX_STATE=1 on Vercel if "state mismatch" keeps happening (e.g. a proxy
      // is interfering with cookies). Slightly weaker login-CSRF protection, so leave it off if logins work.
      checks: process.env.NEXTAUTH_RELAX_STATE === "1" ? ["none"] : ["pkce", "state"],
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.user.id = token.sub;
        // @ts-ignore
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};
