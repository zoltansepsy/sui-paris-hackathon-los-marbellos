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
    toast.success("SuiNS name claimed successfully!");
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

          {/* SuiNS */}
          <Card>
            <CardHeader>
              <CardTitle>SuiNS Identity</CardTitle>
              <CardDescription>
                Your human-readable blockchain identity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.suinsName ? (
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Your SuiNS name
                    </p>
                    <Badge variant="secondary" className="text-base">
                      {user.suinsName}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    You haven&apos;t claimed your SuiNS name yet. Get a
                    human-readable identity like{" "}
                    <span className="font-mono">yourname@suipatron.sui</span>
                  </p>
                  <Button onClick={() => setShowSuiNSModal(true)}>
                    Claim SuiNS Name
                  </Button>
                </div>
              )}
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

      {/* SuiNS Modal */}
      <Dialog open={showSuiNSModal} onOpenChange={setShowSuiNSModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Claim Your SuiNS Name</DialogTitle>
            <DialogDescription>
              Get a human-readable identity for your profile
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="suins">Choose your name</Label>
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
                This will be your unique identity on SuiPatron
              </p>
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
                  Claiming...
                </>
              ) : (
                "Claim Name"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
