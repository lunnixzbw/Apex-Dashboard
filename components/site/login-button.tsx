"use client";

import React, { useRef } from "react";
import { signIn, useSession } from "next-auth/react";

// Opens the dashboard when signed in, otherwise starts Discord login.
export function LoginButton({ className = "", children, signedInLabel = "Open Dashboard", callbackUrl = "/dashboard" }:
  { className?: string; children?: React.ReactNode; signedInLabel?: string; callbackUrl?: string }) {
  const { status } = useSession();
  const signing = useRef(false);
  const go = () => {
    if (signing.current || status === "loading") return; // a double click would start two logins and break the OAuth state
    if (status === "authenticated") { window.location.assign(callbackUrl); return; }
    signing.current = true;
    signIn("discord", { callbackUrl });
  };
  return <button onClick={go} className={className}>{status === "authenticated" ? signedInLabel : children || "Login with Discord"}</button>;
}
