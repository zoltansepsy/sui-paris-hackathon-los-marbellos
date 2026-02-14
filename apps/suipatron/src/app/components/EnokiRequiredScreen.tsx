"use client";

import { AlertCircle } from "lucide-react";

/**
 * Shown when Enoki is not configured. No mock auth or mock support — production requires
 * NEXT_PUBLIC_ENOKI_PUBLIC_KEY and NEXT_PUBLIC_GOOGLE_CLIENT_ID (and Enoki Portal setup).
 */
export function EnokiRequiredScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-muted/30">
      <div className="max-w-md w-full rounded-lg border bg-card p-8 shadow-sm text-center space-y-4">
        <div className="flex justify-center">
          <AlertCircle className="h-12 w-12 text-amber-500" />
        </div>
        <h1 className="text-xl font-semibold">Enoki not configured</h1>
        <p className="text-sm text-muted-foreground">
          Sign-in and sponsored transactions require Enoki. Set these
          environment variables (and configure Enoki Portal):
        </p>
        <ul className="text-left text-sm font-mono bg-muted/50 rounded p-4 space-y-1">
          <li>NEXT_PUBLIC_ENOKI_PUBLIC_KEY</li>
          <li>NEXT_PUBLIC_GOOGLE_CLIENT_ID</li>
        </ul>
        <p className="text-xs text-muted-foreground">
          See <code className="bg-muted px-1 rounded">.env.example</code> and
          Enoki Portal docs.
        </p>
      </div>
    </div>
  );
}
