"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../lib/auth-context";
import { useCreatorProfile, useContentList } from "../hooks/useCreator";
import { useHasAccess } from "../hooks/useAccessPass";
import {
  creatorProfileToCreator,
  onchainContentToContent,
} from "../lib/adapters";
import { LoadingState } from "../components/LoadingState";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { ContentCard } from "../components/ContentCard";
import { SupportModal } from "../components/SupportModal";
import { EncryptedContentViewer } from "../components/EncryptedContentViewer";
import { mockCreators, mockContent } from "../lib/mock-data";
import {
  Users,
  Lock,
  CheckCircle2,
  Settings,
  ExternalLink,
} from "lucide-react";
import { WALRUS_AGGREGATOR_URL_TESTNET, type ContentType } from "../constants";

export function CreatorProfile() {
  const params = useParams();
  const id = params.id as string;
  const { user, walletAddress } = useAuth();
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [viewerContent, setViewerContent] = useState<{
    blobId: string;
    creatorProfileId: string;
    accessPassId: string;
    contentType: ContentType;
    title: string;
    description?: string;
  } | null>(null);

  // On-chain queries
  const { data: profile, isLoading: profileLoading } = useCreatorProfile(id);
  const { data: onchainContent } = useContentList(id);
  const { data: accessPass } = useHasAccess(walletAddress ?? undefined, id);

  // Adapt on-chain data to UI types, fall back to mock
  const mockCreator = mockCreators.find((c) => c.id === id);
  const creator = profile ? creatorProfileToCreator(profile) : mockCreator;

  if (profileLoading) {
    return <LoadingState />;
  }

  if (!creator) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">Creator not found</p>
        <Link href="/explore">
          <Button variant="outline" className="mt-4">
            Back to Explore
          </Button>
        </Link>
      </div>
    );
  }

  const userHasAccess = !!accessPass;
  const isOwnProfile = walletAddress
    ? profile?.owner === walletAddress
    : user?.id === creator.id;

  const creatorContent =
    onchainContent && onchainContent.length > 0
      ? onchainContent.map((c) =>
          onchainContentToContent(
            c,
            creator.id,
            userHasAccess || !!isOwnProfile,
          ),
        )
      : mockContent.filter((c) => c.creatorId === creator.id);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <section className="py-12 px-4 border-b bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row md:items-start gap-8">
            <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
              <AvatarImage src={creator.avatar} alt={creator.name} />
              <AvatarFallback className="text-3xl">
                {creator.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    {creator.name}
                  </h1>
                  {creator.suinsName && (
                    <Badge variant="secondary" className="text-sm">
                      {creator.suinsName}
                    </Badge>
                  )}
                </div>
                {isOwnProfile && (
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                )}
              </div>

              {creator.bio && (
                <p className="text-lg text-muted-foreground">{creator.bio}</p>
              )}

              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <span>{creator.contentCount} posts</span>
                <span className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{creator.supporterCount} supporters</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support CTA */}
      <section className="py-8 px-4 bg-background border-b">
        <div className="container mx-auto max-w-4xl">
          {isOwnProfile ? (
            <div className="flex items-center justify-between p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div>
                  <p className="font-semibold text-blue-900 dark:text-blue-100">
                    This is your creator profile
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    This is how other users see your profile
                  </p>
                </div>
              </div>
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            </div>
          ) : userHasAccess ? (
            <div className="flex items-center justify-between p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-100">
                    You have access to all content
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Thank you for supporting this creator
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
              <div className="text-center sm:text-left">
                <p className="font-semibold text-lg mb-1">
                  Support for {creator.price} SUI
                </p>
                <p className="text-sm text-muted-foreground">
                  One-time payment • Unlocks all {creator.contentCount} posts •
                  Permanent access
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => setShowSupportModal(true)}
                className="whitespace-nowrap"
              >
                {user ? "Support Creator" : "Sign in to Support"}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Content Grid */}
      <section className="py-12 px-4 flex-1">
        <div className="container mx-auto max-w-6xl space-y-6">
          <h2 className="text-2xl font-bold">Content</h2>

          {creatorContent.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {creatorContent.map((content) => {
                const blobId =
                  "blobId" in content
                    ? (content as { blobId: string }).blobId
                    : undefined;
                const blobUrl = blobId
                  ? `${WALRUS_AGGREGATOR_URL_TESTNET}/blobs/${blobId}`
                  : null;

                return (
                  <div key={content.id} className="space-y-2">
                    <ContentCard
                      content={content}
                      isLocked={!userHasAccess && !isOwnProfile}
                      blobId={
                        userHasAccess || isOwnProfile ? blobId : undefined
                      }
                      onClick={
                        !userHasAccess && !isOwnProfile
                          ? () => setShowSupportModal(true)
                          : undefined
                      }
                    />
                    {userHasAccess && accessPass && blobId && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() =>
                          setViewerContent({
                            blobId,
                            creatorProfileId: creator.id,
                            accessPassId: accessPass.objectId,
                            contentType: content.type as ContentType,
                            title: content.title,
                            description: content.description,
                          })
                        }
                      >
                        View (decrypt)
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 space-y-2">
              <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">No content yet</p>
              <p className="text-sm text-muted-foreground">
                This creator hasn&apos;t published any content
              </p>
            </div>
          )}
        </div>
      </section>

      {!isOwnProfile && (
        <SupportModal
          creator={creator}
          open={showSupportModal}
          onOpenChange={setShowSupportModal}
          onSuccess={() => {}}
        />
      )}

      {viewerContent && (
        <EncryptedContentViewer
          open={!!viewerContent}
          onOpenChange={(open) => !open && setViewerContent(null)}
          blobId={viewerContent.blobId}
          creatorProfileId={viewerContent.creatorProfileId}
          accessPassId={viewerContent.accessPassId}
          contentType={viewerContent.contentType}
          title={viewerContent.title}
          description={viewerContent.description}
        />
      )}
    </div>
  );
}
