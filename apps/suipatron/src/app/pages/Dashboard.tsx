"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useAuth } from "../lib/auth-context";
import { isEnokiConfigured } from "../lib/enoki-provider";
import { useSuiPatronTransactions } from "../hooks/useTransactions";
import { CreateProfileForm } from "../components/CreateProfileForm";
import { ConnectButton } from "@mysten/dapp-kit";
import { WithdrawButton } from "../components/WithdrawButton";
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
import { useContentList } from "../hooks/useCreator";
import { useContentUploadUnencrypted } from "../hooks/useContent";
import { onchainContentToContent } from "../lib/adapters";
import type { ContentType } from "../constants";
import { DollarSign, Users, FileUp, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

function contentTypeFromFile(file: File): ContentType {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext ?? "")) return "image";
  if (ext === "pdf") return "pdf";
  return "text";
}

export function Dashboard() {
  const account = useCurrentAccount();
  const { user, walletAddress, updateUser } = useAuth();
  const sender = account?.address ?? walletAddress ?? null;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSuiNSModal, setShowSuiNSModal] = useState(false);

  // Upload modal state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadContentType, setUploadContentType] =
    useState<ContentType>("image");

  // Form states
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.creatorProfile?.bio || "");
  const [price, setPrice] = useState(
    user?.creatorProfile?.price?.toString() || "5",
  );
  const [suinsInput, setSuinsInput] = useState("");

  const profileId = user?.creatorProfile?.profileId;
  const creatorCapId = user?.creatorProfile?.creatorCapId;
  const { updateProfile, isPending: isProfileTxPending } =
    useSuiPatronTransactions();
  const { data: onchainContentList } = useContentList(profileId);
  const { upload: uploadContent, isPending: isUploading } =
    useContentUploadUnencrypted();

  const userContent =
    profileId && onchainContentList
      ? onchainContentList.map((c) =>
          onchainContentToContent(c, profileId, true),
        )
      : [];

  const resetUploadForm = useCallback(() => {
    setUploadFile(null);
    setUploadTitle("");
    setUploadDescription("");
    setUploadContentType("image");
  }, []);

  const handleUploadModalOpenChange = useCallback(
    (open: boolean) => {
      setShowUploadModal(open);
      if (!open) resetUploadForm();
    },
    [resetUploadForm],
  );

  const handlePublishContent = useCallback(async () => {
    if (!uploadFile || !uploadTitle.trim()) {
      toast.error("Please add a title and select a file");
      return;
    }
    if (!profileId || !creatorCapId) {
      toast.error(
        "Creator profile not found. Try refreshing after creating your profile.",
      );
      return;
    }
    try {
      await uploadContent(
        {
          file: uploadFile,
          title: uploadTitle.trim(),
          description: uploadDescription.trim(),
          contentType: uploadContentType,
        },
        profileId,
        creatorCapId,
      );
      toast.success("Content published successfully!");
      handleUploadModalOpenChange(false);
      await queryClient.invalidateQueries({
        queryKey: ["contentList", profileId],
      });
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Upload failed. Please try again.",
      );
    }
  }, [
    uploadFile,
    uploadTitle,
    uploadDescription,
    uploadContentType,
    profileId,
    creatorCapId,
    uploadContent,
    handleUploadModalOpenChange,
    queryClient,
  ]);

  useEffect(() => {
    if (!user) {
      router.push("/?signin=true");
    }
  }, [user, router]);

  if (!user) return null;

  const handleBecomeCreator = () => {
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
    setIsEditing(true);
    toast.success("Welcome! Set up your creator profile.");
  };

  const handleSaveProfile = async () => {
    if (!profileId || !creatorCapId || !user?.id) {
      toast.error("Missing profile or sign-in");
      return;
    }
    setIsSaving(true);
    try {
      const priceNum = parseFloat(price) || 5;
      const priceMist = Math.round(priceNum * 1e9);
      await updateProfile(profileId, creatorCapId, {
        name: name || undefined,
        bio: bio || undefined,
        price: priceMist,
      });
      updateUser({
        name,
        creatorProfile: {
          ...user.creatorProfile,
          bio,
          price: priceNum,
        },
      });
      setIsEditing(false);
      toast.success("Profile updated on-chain");
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Failed to update profile. Try again.",
      );
    } finally {
      setIsSaving(false);
    }
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

  if (!user.isCreator) {
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

            <CreateProfileForm onSuccess={() => {}} />
          </CardContent>
        </Card>
      </div>
    );
  }

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
          {!sender && (
            <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Sign in or connect your wallet to save profile changes, upload
                content, or withdraw earnings.
              </p>
              <ConnectButton connectText="Connect Wallet" />
            </div>
          )}
          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {user.creatorProfile?.balance || 0} SUI
                </div>
                <WithdrawButton variant="outline" size="sm" className="mt-3" />
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
                <div className="text-2xl font-bold">
                  {user.creatorProfile?.supporterCount || 0}
                </div>
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
                  disabled={!sender || isSaving}
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
                <Button
                  onClick={() => setShowUploadModal(true)}
                  disabled={!sender}
                >
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
                      blobId={"blobId" in content ? content.blobId : undefined}
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
                  <Button
                    onClick={() => setShowUploadModal(true)}
                    disabled={!sender}
                  >
                    Add Content
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={handleUploadModalOpenChange}>
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
                  variant={
                    uploadContentType === "image" ? "default" : "outline"
                  }
                  className="w-full"
                  onClick={() => setUploadContentType("image")}
                >
                  Image
                </Button>
                <Button
                  type="button"
                  variant={uploadContentType === "text" ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setUploadContentType("text")}
                >
                  Text
                </Button>
                <Button
                  type="button"
                  variant={uploadContentType === "pdf" ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setUploadContentType("pdf")}
                >
                  PDF
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="upload-title">Title</Label>
              <Input
                id="upload-title"
                placeholder="Content title..."
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="upload-description">Description</Label>
              <Textarea
                id="upload-description"
                placeholder="Optional description..."
                rows={3}
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>File</Label>
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() =>
                  document.getElementById("upload-file-input")?.click()
                }
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files[0];
                  if (file) {
                    setUploadFile(file);
                    setUploadContentType(contentTypeFromFile(file));
                  }
                }}
              >
                <input
                  id="upload-file-input"
                  type="file"
                  className="hidden"
                  accept=".png,.jpg,.jpeg,.gif,.webp,.pdf,.txt,.md"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadFile(file);
                      setUploadContentType(contentTypeFromFile(file));
                    }
                  }}
                />
                <FileUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  {uploadFile
                    ? uploadFile.name
                    : "Drop your file here or click to browse"}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleUploadModalOpenChange(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePublishContent}
              disabled={
                isUploading ||
                !uploadFile ||
                !uploadTitle.trim() ||
                !profileId ||
                !creatorCapId
              }
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
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
