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

"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="h-20 w-20 bg-site-ink/10 rounded-3xl flex items-center justify-center mb-6">
        <AlertTriangle className="h-10 w-10 text-site-ink" />
      </div>
      
      <h2 className="text-2xl font-black text-site-ink mb-2 tracking-tight">System Fault Detected</h2>
      <p className="text-site-muted max-w-md mb-8">
        The neural link experienced an unexpected interruption. This could be due to a connection timeout or an internal API failure.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
        <Button 
          onClick={() => reset()}
          className="flex-1 gap-2 h-12 font-bold"
        >
          <RefreshCw className="h-4 w-4" />
          Retry Connection
        </Button>
        <Link href="/dashboard" className="flex-1">
          <Button 
            variant="outline"
            className="w-full gap-2 h-12 font-bold border-site-ink/10"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Button>
        </Link>
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <pre className="mt-8 p-4 bg-site-bg/40 border border-site-ink/10 rounded-xl text-left text-xs text-site-ink overflow-auto max-w-full font-mono">
          {error.message}
        </pre>
      )}
    </div>
  );
}
