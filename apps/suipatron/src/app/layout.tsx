import type { Metadata } from "next";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./lib/auth-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "SuiPatron",
  description: "Decentralized creator support platform on SUI",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
