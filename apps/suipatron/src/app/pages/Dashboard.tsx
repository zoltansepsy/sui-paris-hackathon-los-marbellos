"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import { isEnokiConfigured } from "../lib/enoki-provider";
import { CreateProfileForm } from "../components/CreateProfileForm";
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
import { mockContent } from "../lib/mock-data";
import { DollarSign, Users, FileUp, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export function Dashboard() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSuiNSModal, setShowSuiNSModal] = useState(false);

  // Form states
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.creatorProfile?.bio || "");
  const tiers = user?.creatorProfile?.tiers ?? [];
  const [suinsInput, setSuinsInput] = useState("");

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
        tiers: [
          {
            name: "Supporter",
            description: "Access to all content",
            price: 5,
            tierLevel: 1,
            durationMs: null,
          },
        ],
        balance: 0,
        contentCount: 0,
        supporterCount: 0,
      },
    });
    setIsEditing(true);
    toast.success("Welcome! Set up your creator profile.");
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    updateUser({
      name,
      creatorProfile: {
        ...user.creatorProfile,
        bio,
      },
    });

    setIsSaving(false);
    setIsEditing(false);
    toast.success("Profile updated successfully");
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

  const userContent = mockContent.filter((c) => c.creatorId === user.id);

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
                <div className="text-2xl font-bold">
                  {user.creatorProfile?.balance || 0} SUI
                </div>
                {isEnokiConfigured ? (
                  <WithdrawButton
                    variant="outline"
                    size="sm"
                    className="mt-3"
                  />
                ) : (
                  <Button variant="outline" size="sm" className="mt-3" disabled>
                    Withdraw
                  </Button>
                )}
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

                {tiers.length > 0 && (
                  <div className="space-y-2">
                    <Label>Tiers</Label>
                    <div className="space-y-2">
                      {tiers.map((tier, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                        >
                          <div>
                            <p className="font-medium text-sm">{tier.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {tier.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm">
                              {tier.price} SUI
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {tier.durationMs
                                ? `${Math.round(tier.durationMs / 86400000)}d`
                                : "Permanent"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Manage tiers from your creator dashboard
                    </p>
                  </div>
                )}
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
              onClick={() => {
                toast.success("Content uploaded successfully!");
                setShowUploadModal(false);
              }}
            >
              Publish
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
