import { Suspense } from "react";
import { AuthCallback } from "../../pages/AuthCallback";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <AuthCallback />
    </Suspense>
  );
}
