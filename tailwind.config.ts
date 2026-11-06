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

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "rgb(var(--site-ink) / <alpha-value>)", // black on light, white on dark
          hover: "rgb(var(--site-ink) / 0.85)",
          glow: "rgb(var(--site-ink) / 0.5)",
        },
        secondary: {
          DEFAULT: "rgb(var(--site-bg) / <alpha-value>)",
          light: "rgb(var(--site-card) / <alpha-value>)",
        },
        // Public website palette: black and white, switches with the theme (see app/globals.css).
        site: {
          bg: "rgb(var(--site-bg) / <alpha-value>)",
          card: "rgb(var(--site-card) / <alpha-value>)",
          ink: "rgb(var(--site-ink) / <alpha-value>)",
          body: "rgb(var(--site-body) / <alpha-value>)",
          muted: "rgb(var(--site-muted) / <alpha-value>)",
          faint: "rgb(var(--site-faint) / <alpha-value>)",
        },
        accent: {
          red: "rgb(var(--site-ink) / 0.1)",
          glass: "rgb(var(--site-ink) / 0.03)",
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
