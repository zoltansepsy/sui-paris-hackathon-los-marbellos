"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Simulate OAuth callback processing
    const returnTo = searchParams.get("returnTo") || "/explore";

    const t = setTimeout(() => {
      router.push(returnTo);
    }, 1000);
    return () => clearTimeout(t);
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
      <p className="text-lg font-medium">Signing you in...</p>
      <p className="text-sm text-muted-foreground mt-2">Please wait a moment</p>
    </div>
  );
}
