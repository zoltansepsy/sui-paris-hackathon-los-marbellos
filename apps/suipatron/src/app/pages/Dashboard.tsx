"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import { isEnokiConfigured } from "../lib/enoki-provider";
import { CreateProfileForm } from "../components/CreateProfileForm";
import {
  useMyCreatorProfile,
  useMyCreatorCap,
  useContentList,
} from "../hooks/useCreator";
import { useSuiPatronTransactions } from "../hooks/useTransactions";
import {
  useContentUpload,
  useContentUploadUnencrypted,
  useContentUploadBundled,
} from "../hooks/useContent";
import { onchainContentToContent } from "../lib/adapters";
import { useCurrentAccount } from "@mysten/dapp-kit";
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
import { NFTLabCard } from "../components/NFTLabCard";
import { mockContent } from "../lib/mock-data";
import {
  DollarSign,
  Users,
  FileUp,
  Loader2,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import { WALRUS_AGGREGATOR_URL_TESTNET } from "../constants";

export function Dashboard() {
  const { user, walletAddress, updateUser } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const account = useCurrentAccount();
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
  // Using BUNDLED upload for better UX (2 signatures instead of 3)
  // Bundles Walrus certify + publish_content into a single PTB
  // SEAL encryption works but creators can't decrypt their own content without AccessPass
  const { upload: uploadContent, isPending: uploadPending } =
    useContentUploadBundled();

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

  // Upload form states
  const [contentTitle, setContentTitle] = useState("");
  const [contentDescription, setContentDescription] = useState("");
  const [contentType, setContentType] = useState<"image" | "text" | "pdf">(
    "image",
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/?signin=true");
    }
  }, [user, router]);

  if (!user) return null;

  const handleBecomeCreator = async () => {
    if (!walletAddress) {
      toast.error("Please connect your wallet to become a creator");
      return;
    }

    try {
      const priceInMist = (parseFloat(price) || 5) * MIST_PER_SUI;
      await createProfile(name || user!.name, bio, priceInMist);

      // Invalidate all creator-related queries so they refetch
      queryClient.invalidateQueries({ queryKey: ["myCreatorProfile"] });
      queryClient.invalidateQueries({ queryKey: ["myCreatorCap"] });
      queryClient.invalidateQueries({ queryKey: ["creatorProfiles"] }); // ✅ Added: Updates Explore page

      toast.success("Creator profile created on-chain!");
      setIsEditing(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create profile",
      );
    }
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
    toast.success("Display name set successfully!");
  };

  const handleContentUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }
    if (!contentTitle.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!myProfile?.objectId || !myCreatorCap?.objectId) {
      toast.error("Creator profile not found");
      return;
    }
    if (!account) {
      toast.error("Wallet not connected");
      return;
    }

    try {
      const result = await uploadContent(
        {
          file: selectedFile,
          title: contentTitle,
          description: contentDescription,
          contentType,
        },
        myProfile.objectId,
        myCreatorCap.objectId,
      );

      // Log blob ID for SEAL verification
      console.log("🔒 SEAL VERIFICATION - Blob ID:", result.blobId);
      console.log(
        "🔗 Check encrypted blob at:",
        `https://aggregator.walrus-testnet.walrus.space/blobs/${result.blobId}`,
      );

      toast.success("Content uploaded to Walrus and published on-chain!");
      setShowUploadModal(false);

      // Reset form
      setContentTitle("");
      setContentDescription("");
      setContentType("image");
      setSelectedFile(null);

      // Invalidate and refetch content list for this profile
      await queryClient.invalidateQueries({
        queryKey: ["contentList", myProfile?.objectId],
      });
      await queryClient.refetchQueries({
        queryKey: ["contentList", myProfile?.objectId],
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload content",
      );
    }
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

            {isEnokiConfigured ? (
              <CreateProfileForm onSuccess={() => {}} />
            ) : (
              <Button
                onClick={handleBecomeCreator}
                size="lg"
                className="w-full"
              >
                Set Up Creator Profile
              </Button>
            )}
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
                    Set Display Name
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
                  {userContent.map((content) => {
                    const blobId = (content as any).blobId;
                    const blobUrl = blobId
                      ? `${WALRUS_AGGREGATOR_URL_TESTNET}/blobs/${blobId}`
                      : null;

                    // Debug: log to see if blobId exists
                    console.log(
                      "Dashboard Content:",
                      content.title,
                      "BlobId:",
                      blobId,
                      "Has URL:",
                      !!blobUrl,
                    );

                    return (
                      <div key={content.id} className="space-y-2">
                        <ContentCard
                          content={content}
                          isLocked={false}
                          blobId={blobId}
                        />
                        {blobUrl && (
                          <div className="flex gap-2">
                            <a
                              href={blobUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-xs"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                🔒 Encrypted
                              </Button>
                            </a>
                            <Button
                              variant="default"
                              size="sm"
                              className="flex-1 text-xs"
                              onClick={() => {
                                // The decrypted version is already shown in the ContentCard above
                                // For demo, we can indicate this or implement a full-screen view
                                alert(
                                  "The decrypted version is displayed in the card above. The encrypted blob (left button) shows garbage data from Walrus.",
                                );
                              }}
                            >
                              ✓ Decrypted
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
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

          {/* NFT Lab */}
          <NFTLabCard />
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
                <Button
                  type="button"
                  variant={contentType === "image" ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setContentType("image")}
                >
                  Image
                </Button>
                <Button
                  type="button"
                  variant={contentType === "text" ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setContentType("text")}
                >
                  Text
                </Button>
                <Button
                  type="button"
                  variant={contentType === "pdf" ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setContentType("pdf")}
                >
                  PDF
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Content title..."
                value={contentTitle}
                onChange={(e) => setContentTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Optional description..."
                rows={3}
                value={contentDescription}
                onChange={(e) => setContentDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file-upload">File</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setSelectedFile(file);
                  }}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  {selectedFile ? (
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Click to select a file
                    </p>
                  )}
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadModal(false)}>
              Cancel
            </Button>
            <Button
              disabled={uploadPending || !selectedFile || !contentTitle.trim()}
              onClick={handleContentUpload}
            >
              {uploadPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading to Walrus...
                </>
              ) : (
                "Publish"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Display Name Modal */}
      <Dialog open={showSuiNSModal} onOpenChange={setShowSuiNSModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Your Display Name</DialogTitle>
            <DialogDescription>
              Choose a display name for your creator profile
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

            {/* SuiNS Auto-Resolution Info */}
            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3">
              <div className="flex items-start space-x-2">
                <svg
                  className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="text-xs text-blue-900 dark:text-blue-100">
                  <p className="font-semibold mb-1">Have a real SuiNS name?</p>
                  <p>
                    If you own a SuiNS name (e.g., alice.sui), it will
                    automatically appear on your profile! Register at{" "}
                    <a
                      href="https://suins.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-blue-700"
                    >
                      suins.io
                    </a>
                  </p>
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
