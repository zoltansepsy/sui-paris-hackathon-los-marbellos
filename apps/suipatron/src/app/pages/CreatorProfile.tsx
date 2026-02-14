"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../lib/auth-context";
import { useAccessPasses } from "../lib/access-pass";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { ContentCard } from "../components/ContentCard";
import { SupportModal } from "../components/SupportModal";
import { mockCreators, mockContent } from "../lib/mock-data";
import { Users, Lock, CheckCircle2, Settings } from "lucide-react";

export function CreatorProfile() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user } = useAuth();
  const { hasAccessPass, refresh } = useAccessPasses(user?.id);
  const [showSupportModal, setShowSupportModal] = useState(false);

  const creator = mockCreators.find((c) => c.id === id);

  useEffect(() => {
    if (id && !creator) {
      router.replace("/explore");
    }
  }, [id, creator, router]);

  if (!creator) {
    return null;
  }

  const creatorContent = mockContent.filter((c) => c.creatorId === creator.id);
  const userHasAccess = user ? hasAccessPass(creator.id) : false;
  const isOwnProfile =
    user?.id === creator.id ||
    (user?.isCreator && user?.email === creator.email);

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
                  {creator.tiers.length > 0
                    ? `Support from ${Math.min(...creator.tiers.map((t) => t.price))} SUI`
                    : "Support this creator"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {creator.tiers.length > 1
                    ? `${creator.tiers.length} tiers available`
                    : "One-time payment"}{" "}
                  • Unlocks {creator.contentCount} posts
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
              {creatorContent.map((content) => (
                <ContentCard
                  key={content.id}
                  content={content}
                  isLocked={!userHasAccess && !isOwnProfile}
                  onClick={
                    !userHasAccess && !isOwnProfile
                      ? () => setShowSupportModal(true)
                      : undefined
                  }
                />
              ))}
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
          onSuccess={() => refresh()}
        />
      )}
    </div>
  );
}
