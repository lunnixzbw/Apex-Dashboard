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

import React from "react";
import { Skel } from "@/components/dashboard/zv-loader";

export default function GuildLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300" role="status" aria-label="Loading">
      <div className="space-y-3">
        <Skel className="h-8 w-64" />
        <Skel className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="space-y-4 lg:col-span-3">
          {[1, 2, 3, 4].map((i) => <Skel key={i} className="h-32 w-full rounded-[32px]" />)}
        </div>
        <div className="space-y-6">
          <Skel className="h-64 w-full rounded-[32px]" />
          <Skel className="h-48 w-full rounded-[32px]" />
        </div>
      </div>
    </div>
  );
}
