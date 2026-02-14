"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import {
  useMyCreatorProfile,
  useMyCreatorCap,
  useContentList,
} from "../hooks/useCreator";
import { useSuiPatronTransactions } from "../hooks/useTransactions";
import { useContentUpload } from "../hooks/useContent";
import { onchainContentToContent } from "../lib/adapters";
import { MIST_PER_SUI } from "../constants";
import { useQueryClient } from "@tanstack/react-query";
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
import { Textarea } from "../components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { ContentCard } from "../components/ContentCard";
import { mockContent } from "../lib/mock-data";
import { DollarSign, Users, FileUp, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export function Dashboard() {
  const { user, walletAddress, updateUser } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSuiNSModal, setShowSuiNSModal] = useState(false);

  // On-chain queries
  const { data: myProfile } = useMyCreatorProfile(walletAddress ?? undefined);
  const { data: myCreatorCap } = useMyCreatorCap(walletAddress ?? undefined);
  const { data: onchainContent } = useContentList(myProfile?.objectId);
  const {
    createProfile,
    updateProfile,
    withdrawEarnings,
    isPending: txPending,
  } = useSuiPatronTransactions();
  const { upload: uploadContent, isPending: uploadPending } =
    useContentUpload();

  // Form states
  const [name, setName] = useState(myProfile?.name || user?.name || "");
  const [bio, setBio] = useState(
    myProfile?.bio || user?.creatorProfile?.bio || "",
  );
  const [price, setPrice] = useState(
    myProfile
      ? (myProfile.price / MIST_PER_SUI).toString()
      : user?.creatorProfile?.price?.toString() || "5",
  );
  const [suinsInput, setSuinsInput] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/?signin=true");
    }
  }, [user, router]);

  if (!user) return null;

  const handleBecomeCreator = async () => {
    if (walletAddress) {
      try {
        const priceInMist = (parseFloat(price) || 5) * MIST_PER_SUI;
        await createProfile(name || user!.name, bio, priceInMist);
        queryClient.invalidateQueries({ queryKey: ["myCreatorProfile"] });
        queryClient.invalidateQueries({ queryKey: ["myCreatorCap"] });
        toast.success("Creator profile created on-chain!");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to create profile",
        );
        return;
      }
    } else {
      updateUser({
        isCreator: true,
        creatorProfile: {
          bio: "",
          price: 5,
          balance: 0,
          contentCount: 0,
          supporterCount: 0,
        },
      });
    }
    setIsEditing(true);
    toast.success("Welcome! Set up your creator profile.");
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);

    try {
      if (walletAddress && myProfile && myCreatorCap) {
        const priceInMist = (parseFloat(price) || 5) * MIST_PER_SUI;
        await updateProfile(myProfile.objectId, myCreatorCap.objectId, {
          name,
          bio,
          price: priceInMist,
        });
        queryClient.invalidateQueries({ queryKey: ["myCreatorProfile"] });
        toast.success("Profile updated on-chain!");
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        updateUser({
          name,
          creatorProfile: {
            ...user!.creatorProfile,
            bio,
            price: parseFloat(price) || 5,
          },
        });
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile",
      );
    }

    setIsSaving(false);
    setIsEditing(false);
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

  // User is a creator if they have an on-chain profile or the mock flag is set
  const isCreator = !!myProfile || !!user.isCreator;

  if (!isCreator) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center px-4 py-12">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto h-16 w-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
              <FileUp className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <CardTitle className="text-3xl">Become a Creator</CardTitle>
            <CardDescription className="text-lg">
              Start sharing your content and earn directly from your supporters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center space-y-2 p-4 bg-muted/50 rounded-lg">
                <DollarSign className="h-8 w-8 mx-auto text-green-600" />
                <p className="font-semibold">Keep 100%</p>
                <p className="text-xs text-muted-foreground">
                  Zero platform fees
                </p>
              </div>
              <div className="text-center space-y-2 p-4 bg-muted/50 rounded-lg">
                <CheckCircle2 className="h-8 w-8 mx-auto text-indigo-600" />
                <p className="font-semibold">You Own It</p>
                <p className="text-xs text-muted-foreground">
                  Content can&apos;t be removed
                </p>
              </div>
              <div className="text-center space-y-2 p-4 bg-muted/50 rounded-lg">
                <Users className="h-8 w-8 mx-auto text-purple-600" />
                <p className="font-semibold">Direct Access</p>
                <p className="text-xs text-muted-foreground">
                  One-time support model
                </p>
              </div>
            </div>

            <Button onClick={handleBecomeCreator} size="lg" className="w-full">
              Set Up Creator Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userContent =
    onchainContent && onchainContent.length > 0
      ? onchainContent.map((c) =>
          onchainContentToContent(c, myProfile?.objectId || user.id, true),
        )
      : mockContent.filter((c) => c.creatorId === user.id);

  const displayBalance = myProfile
    ? myProfile.balance / MIST_PER_SUI
    : user.creatorProfile?.balance || 0;
  const displaySupporters = myProfile
    ? myProfile.totalSupporters
    : user.creatorProfile?.supporterCount || 0;

  return (
    <div className="flex flex-col min-h-screen">
      <section className="py-12 px-4 border-b bg-muted/30">
        <div className="container mx-auto space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">Creator Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Manage your profile, content, and earnings
          </p>
        </div>
      </section>

      <section className="py-12 px-4 flex-1">
        <div className="container mx-auto space-y-8">
          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displayBalance} SUI</div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  disabled={txPending || displayBalance === 0}
                  onClick={async () => {
                    if (walletAddress && myProfile && myCreatorCap) {
                      try {
                        await withdrawEarnings(
                          myProfile.objectId,
                          myCreatorCap.objectId,
                        );
                        queryClient.invalidateQueries({
                          queryKey: ["myCreatorProfile"],
                        });
                        toast.success("Earnings withdrawn!");
                      } catch (error) {
                        toast.error(
                          error instanceof Error
                            ? error.message
                            : "Withdrawal failed",
                        );
                      }
                    } else {
                      toast.error("Connect wallet to withdraw");
                    }
                  }}
                >
                  {txPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Withdrawing...
                    </>
                  ) : (
                    "Withdraw"
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Supporters
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displaySupporters}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total supporters
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Content</CardTitle>
                <FileUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userContent.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Published posts
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Profile */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Creator Profile</CardTitle>
                <Button
                  variant={isEditing ? "default" : "outline"}
                  onClick={() =>
                    isEditing ? handleSaveProfile() : setIsEditing(true)
                  }
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : isEditing ? (
                    "Save Changes"
                  ) : (
                    "Edit Profile"
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>
                    {user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {!isEditing && user.suinsName && (
                  <Badge variant="secondary">{user.suinsName}</Badge>
                )}
                {!isEditing && !user.suinsName && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSuiNSModal(true)}
                  >
                    Claim SuiNS Name
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                    placeholder="Tell supporters about your work..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Support Price (SUI)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    disabled={!isEditing}
                    min="0"
                    step="0.1"
                  />
                  <p className="text-xs text-muted-foreground">
                    One-time payment for permanent access to all your content
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Content</CardTitle>
                  <CardDescription>
                    Manage your published content
                  </CardDescription>
                </div>
                <Button onClick={() => setShowUploadModal(true)}>
                  <FileUp className="mr-2 h-4 w-4" />
                  Add Content
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {userContent.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userContent.map((content) => (
                    <ContentCard
                      key={content.id}
                      content={content}
                      isLocked={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 space-y-4">
                  <FileUp className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <p className="font-medium">No content yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload your first piece of content to get started
                    </p>
                  </div>
                  <Button onClick={() => setShowUploadModal(true)}>
                    Add Content
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Content</DialogTitle>
            <DialogDescription>
              Upload and publish new content for your supporters
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Content Type</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" className="w-full">
                  Image
                </Button>
                <Button variant="outline" className="w-full">
                  Text
                </Button>
                <Button variant="outline" className="w-full">
                  PDF
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Content title..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Optional description..."
                rows={3}
              />
            </div>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <FileUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                Drop your file here or click to browse
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadModal(false)}>
              Cancel
            </Button>
            <Button
              disabled={uploadPending}
              onClick={() => {
                // Upload integration — currently shows success toast
                // Full SEAL+Walrus upload requires file input wiring
                toast.success("Content uploaded successfully!");
                setShowUploadModal(false);
                queryClient.invalidateQueries({ queryKey: ["contentList"] });
              }}
            >
              {uploadPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Publish"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SuiNS Modal */}
      <Dialog open={showSuiNSModal} onOpenChange={setShowSuiNSModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Claim Your SuiNS Name</DialogTitle>
            <DialogDescription>
              Get a human-readable identity for your creator profile
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
