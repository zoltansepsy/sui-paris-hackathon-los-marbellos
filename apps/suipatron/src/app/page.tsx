import { Suspense } from "react";
import { Landing } from "./pages/Landing";

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <Landing />
    </Suspense>
  );
}
