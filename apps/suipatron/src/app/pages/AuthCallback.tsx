"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEnokiFlow } from "../lib/enoki-provider";
import { isEnokiConfigured } from "../lib/enoki-provider";
import { Loader2 } from "lucide-react";

function AuthCallbackEnoki() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const enoki = useEnokiFlow();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const returnTo =
      searchParams.get("returnTo") || searchParams.get("state") || "/explore";

    const run = async () => {
      try {
        const hash = typeof window !== "undefined" ? window.location.hash : "";
        await enoki.handleAuthCallback(hash);
        router.push(returnTo);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Sign-in failed");
        setTimeout(() => router.push("/"), 3000);
      }
    };

    void run();
  }, [router, searchParams, enoki]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <p className="text-destructive font-medium">{error}</p>
        <p className="text-sm text-muted-foreground mt-2">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
      <p className="text-lg font-medium">Signing you in...</p>
      <p className="text-sm text-muted-foreground mt-2">Please wait a moment</p>
    </div>
  );
}

function AuthCallbackFallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const returnTo = searchParams.get("returnTo") || "/explore";
    const t = setTimeout(() => router.push(returnTo), 1000);
    return () => clearTimeout(t);
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
      <p className="text-lg font-medium">Signing you in...</p>
    </div>
  );
}

export function AuthCallback() {
  return isEnokiConfigured ? <AuthCallbackEnoki /> : <AuthCallbackFallback />;
}
