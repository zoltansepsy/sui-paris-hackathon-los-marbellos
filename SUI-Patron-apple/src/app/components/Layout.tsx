import React from "react";
import { Navigation } from "./Navigation";

interface LayoutProps {
  children: React.ReactNode;
  role: "creator" | "subscriber";
  setRole: (role: "creator" | "subscriber") => void;
}

export function Layout({ children, role, setRole }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
      <Navigation role={role} onRoleChange={setRole} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
