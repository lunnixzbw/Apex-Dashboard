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

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-site-card group-[.toaster]:text-site-ink group-[.toaster]:border-site-ink/10 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl group-[.toaster]:p-4",
          description: "group-[.toast]:text-site-faint group-[.toast]:text-[11px] group-[.toast]:font-medium",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-site-bg",
          cancelButton: "group-[.toast]:bg-site-ink/10 group-[.toast]:text-site-muted",
          success: "group-[.toaster]:border-emerald-500/50 group-[.toaster]:bg-emerald-500/5",
          error: "group-[.toaster]:border-site-ink/50 group-[.toaster]:bg-site-ink/5",
          loading: "group-[.toaster]:border-primary/50 group-[.toaster]:bg-primary/5",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
