import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { LandingPage } from "../pages/LandingPage";
import { ExplorePage } from "../pages/ExplorePage";
import { CreatorProfilePage } from "../pages/CreatorProfilePage";
import { DashboardPage } from "../pages/DashboardPage";
import { FeedPage } from "../pages/FeedPage";
import { Toaster } from "sonner";
import "../styles/theme.css";

const SettingsPage = () => (
  <div className="p-8 text-center text-[var(--text-secondary)]">
    Settings Page Placeholder
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/creator/:id" element={<CreatorProfilePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <Toaster
        theme="light"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--bg-overlay)",
            border: "1px solid var(--border-default)",
            color: "var(--text-primary)",
          },
        }}
      />
    </BrowserRouter>
  );
}
