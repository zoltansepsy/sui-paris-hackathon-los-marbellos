"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Shield, Zap, Globe, Users, CheckCircle2, Heart } from "lucide-react";
import toast from "react-hot-toast";

export function Landing() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, signIn } = useAuth();
  const [showSignIn, setShowSignIn] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("signin") === "true") {
      setShowSignIn(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user && showSignIn) {
      setShowSignIn(false);
      router.push("/explore");
    }
  }, [user, showSignIn, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await signIn(email);
      toast.success("Successfully signed in!");
    } catch (error) {
      toast.error("Sign in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-indigo-950/20 dark:via-background dark:to-purple-950/20" />

        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center space-x-2 bg-indigo-100 dark:bg-indigo-900/30 px-4 py-2 rounded-full">
              <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                Decentralized Creator Platform
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Support creators.
              <br />
              <span className="text-indigo-600 dark:text-indigo-400">
                Own your content forever.
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              One-time payment. Permanent access. No monthly fees. No platform
              fees. Content owned by creators, accessible to supporters forever.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="text-lg px-8"
                onClick={() => setShowSignIn(true)}
              >
                <Heart className="mr-2 h-5 w-5" />
                Sign in with Google
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8"
                onClick={() => router.push("/explore")}
              >
                Explore Creators
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Value Props */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">For Creators</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Take control of your content and keep 100% of your earnings
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-background p-8 rounded-lg space-y-4 border">
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold">Keep 100% of Earnings</h3>
              <p className="text-muted-foreground">
                No platform fees. No hidden charges. Every SUI you earn goes
                directly to you.
              </p>
            </div>

            <div className="bg-background p-8 rounded-lg space-y-4 border">
              <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold">You Own Your Content</h3>
              <p className="text-muted-foreground">
                Content can&apos;t be deplatformed. You maintain full control
                and ownership forever.
              </p>
            </div>

            <div className="bg-background p-8 rounded-lg space-y-4 border">
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Globe className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold">Human-Readable Identity</h3>
              <p className="text-muted-foreground">
                Get your unique SuiNS name like alice@suipatron.sui to build
                your brand.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supporter Value Props */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">For Supporters</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Support once, access forever
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <CheckCircle2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    One-Click Support
                  </h3>
                  <p className="text-muted-foreground">
                    Simple, secure payments with Google sign-in. No wallet setup
                    required.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Permanent Access
                  </h3>
                  <p className="text-muted-foreground">
                    Pay once, own forever. No recurring subscriptions or
                    surprise charges.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">On-Chain Proof</h3>
                  <p className="text-muted-foreground">
                    Your support is recorded permanently. Verifiable proof of
                    your contribution.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Direct to Creator
                  </h3>
                  <p className="text-muted-foreground">
                    100% of your payment goes to the creator. No platform taking
                    a cut.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 p-8 rounded-2xl">
              <div className="bg-background p-6 rounded-lg space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Support Amount
                  </span>
                  <span className="font-bold text-2xl">5 SUI</span>
                </div>
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Platform Fee</span>
                    <span className="text-green-600 font-medium">0%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Creator Receives
                    </span>
                    <span className="font-semibold">5 SUI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-indigo-600 dark:bg-indigo-900/50">
        <div className="container mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Ready to get started?
          </h2>
          <p className="text-lg text-indigo-100 max-w-2xl mx-auto">
            Join creators and supporters building a fairer content economy
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="text-lg px-8"
            onClick={() => setShowSignIn(true)}
          >
            Sign in with Google
          </Button>
        </div>
      </section>

      {/* Sign In Dialog */}
      <Dialog open={showSignIn} onOpenChange={setShowSignIn}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in to SuiPatron</DialogTitle>
            <DialogDescription>
              Use your Google account to get started. No wallet setup required.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSignIn} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in with Google"}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By signing in, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
