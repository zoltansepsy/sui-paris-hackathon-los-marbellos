"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export function Settings() {
  const { user, updateUser, signOut } = useAuth();
  const router = useRouter();
  const [name, setName] = useState(user?.name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuiNSModal, setShowSuiNSModal] = useState(false);
  const [suinsInput, setSuinsInput] = useState("");

  if (!user) {
    router.push("/?signin=true");
    return null;
  }

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    updateUser({ name });

    setIsSaving(false);
    toast.success("Settings saved successfully");
  };

  const handleClaimSuiNS = async () => {
    if (!suinsInput.trim()) return;

    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    updateUser({
      suinsName: `${suinsInput}@suipatron.sui`,
    });

    setIsSaving(false);
    setShowSuiNSModal(false);
    setSuinsInput("");
    toast.success("Display name set successfully!");
  };

  const handleSignOut = () => {
    signOut();
    router.push("/");
    toast.success("Signed out successfully");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <section className="py-12 px-4 border-b bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Settings</h1>
          <p className="text-lg text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>
      </section>

      <section className="py-12 px-4 flex-1">
        <div className="container mx-auto max-w-4xl space-y-6">
          {/* Profile */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your public profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>
                    {user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{user.email}</p>
                  <p className="text-sm text-muted-foreground">
                    Signed in with Google
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Display Name */}
          <Card>
            <CardHeader>
              <CardTitle>Display Name & SuiNS</CardTitle>
              <CardDescription>
                Your display name and SuiNS identity (if registered)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.suinsName ? (
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Your display name
                    </p>
                    <Badge variant="secondary" className="text-base">
                      {user.suinsName}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Set a display name for your profile
                  </p>
                  <Button onClick={() => setShowSuiNSModal(true)}>
                    Set Display Name
                  </Button>
                </div>
              )}

              {/* SuiNS Auto-Resolution Info */}
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-900 dark:text-blue-100">
                      <p className="font-semibold mb-1">SuiNS Auto-Detection ✨</p>
                      <p className="text-xs">If you own a real SuiNS name (e.g., alice.sui), it will automatically appear on your profile!</p>
                    </div>
                  </div>
                  <a
                    href="https://suins.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-700 dark:text-blue-300 hover:underline inline-flex items-center"
                  >
                    Register a SuiNS name →
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account */}
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Account Status</p>
                  <p className="text-sm text-muted-foreground">
                    {user.isCreator ? "Creator Account" : "Supporter Account"}
                  </p>
                </div>
                <Badge variant="outline">Active</Badge>
              </div>

              <Separator />

              <div>
                <Button variant="destructive" onClick={handleSignOut}>
                  Sign Out
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  You&apos;ll need to sign in again to access your account
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Display Name Modal */}
      <Dialog open={showSuiNSModal} onOpenChange={setShowSuiNSModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Your Display Name</DialogTitle>
            <DialogDescription>
              Choose a display name for your profile
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="suins">Choose your display name</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="suins"
                  value={suinsInput}
                  onChange={(e) =>
                    setSuinsInput(
                      e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""),
                    )
                  }
                  placeholder="yourname"
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  @suipatron.sui
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Note: This is a display name only, not a registered SuiNS name
              </p>
            </div>

            {/* SuiNS Info */}
            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3">
              <div className="flex items-start space-x-2">
                <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-xs text-blue-900 dark:text-blue-100">
                  <p className="font-semibold mb-1">Want a real SuiNS name?</p>
                  <p>Register at <a href="https://suins.io" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-700">suins.io</a> and it will automatically appear on your profile!</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuiNSModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleClaimSuiNS}
              disabled={!suinsInput.trim() || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting...
                </>
              ) : (
                "Set Display Name"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
