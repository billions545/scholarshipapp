"use client";

import { useState } from "react";
import { ui } from "@/lib/ui";

export function ReferralLinkCard({ referralCode }: { referralCode: string }) {
  const [copied, setCopied] = useState(false);
  const path = `/register?ref=${referralCode}`;
  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;

  return (
    <div className={ui.card}>
      <p className="text-sm font-semibold text-slate-900">Your referral link</p>
      <p className={`${ui.muted} mt-1`}>
        Share this so students who sign up are automatically attributed to you.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <code className="flex-1 truncate rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{fullUrl}</code>
        <button
          type="button"
          className={ui.btnSecondary}
          onClick={() => {
            navigator.clipboard.writeText(fullUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
