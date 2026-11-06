"use client";

import React from "react";
import { TicketCenter } from "@/components/site/ticket-center";

export default function SupportTicketsPage() {
  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="font-outfit text-3xl font-bold text-site-ink">Support tickets</h1>
        <p className="mt-1 text-sm text-site-muted">Your tickets and the replies from the team. Support staff also see every ticket under All tickets.</p>
      </div>
      <TicketCenter compact />
    </div>
  );
}
