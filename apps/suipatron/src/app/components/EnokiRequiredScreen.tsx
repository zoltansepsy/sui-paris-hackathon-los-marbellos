"use client";

import { AlertCircle } from "lucide-react";

/**
 * Legacy: previously shown when Enoki was not configured (blocked the app).
 * The app now uses wallet-only auth when Enoki is missing, so this screen is no longer
 * rendered. Kept for reference or optional use (e.g. banner in settings).
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
          Optional: set these for &quot;Sign in with Google&quot; (Enoki
          Portal). The app works with wallet-only when these are unset.
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
