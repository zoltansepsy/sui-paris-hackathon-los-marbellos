"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../lib/auth-context";
import { useAccessPasses } from "../lib/access-pass";
import { getSubscriptionStatus } from "../lib/subscription-utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { ContentCard } from "../components/ContentCard";
import { mockCreators, mockContent } from "../lib/mock-data";
import { Heart, Clock } from "lucide-react";

export function Feed() {
  const { user } = useAuth();
  const { entries, getEntry } = useAccessPasses(user?.id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center px-4 py-12">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <Heart className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <CardTitle>Sign in to view your feed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Your feed shows content from creators you support
            </p>
            <Link href="/?signin=true">
              <Button className="w-full">Sign in with Google</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Include all creators with an access pass entry (even expired — they show with badges)
  const supportedCreatorIds = entries.map((e) => e.creatorId);
  const supportedCreators = mockCreators.filter((c) =>
    supportedCreatorIds.includes(c.id),
  );

  const feedContent = supportedCreators
    .flatMap((creator) => {
      const creatorContent = mockContent.filter(
        (c) => c.creatorId === creator.id,
      );
      return creatorContent.map((content) => ({
        ...content,
        creator,
      }));
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  if (supportedCreators.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <section className="py-12 px-4 border-b bg-muted/30">
          <div className="container mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">My Feed</h1>
            <p className="text-lg text-muted-foreground">
              Content from creators you support
            </p>
          </div>
        </section>

        <section className="flex-1 flex items-center justify-center px-4 py-12">
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-6 space-y-4">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto" />
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  No supported creators yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  Support a creator to see their content in your feed
                </p>
              </div>
              <Link href="/explore">
                <Button>Explore Creators</Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <section className="py-12 px-4 border-b bg-muted/30">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">My Feed</h1>
          <p className="text-lg text-muted-foreground">
            Content from {supportedCreators.length} creator
            {supportedCreators.length !== 1 ? "s" : ""} you support
          </p>
        </div>
      </section>

      <section className="py-12 px-4 flex-1">
        <div className="container mx-auto max-w-6xl space-y-8">
          {/* Supported Creators */}
          <Card>
            <CardHeader>
              <CardTitle>Creators You Support</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {supportedCreators.map((creator) => {
                  const entry = getEntry(creator.id);
                  const status = entry
                    ? getSubscriptionStatus(entry.expiresAt)
                    : null;
                  return (
                    <Link key={creator.id} href={`/creator/${creator.id}`}>
                      <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={creator.avatar}
                            alt={creator.name}
                          />
                          <AvatarFallback>
                            {creator.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{creator.name}</p>
                          {creator.suinsName && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {creator.suinsName}
                            </Badge>
                          )}
                        </div>
                        {status === "expiring" && (
                          <Badge
                            variant="outline"
                            className="text-xs text-amber-600 border-amber-300"
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            Expiring
                          </Badge>
                        )}
                        {status === "expired" && (
                          <Badge
                            variant="outline"
                            className="text-xs text-red-600 border-red-300"
                          >
                            Expired
                          </Badge>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Content Feed */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Latest Content</h2>

            {feedContent.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {feedContent.map((item) => {
                  const entry = getEntry(item.creator.id);
                  const expiryStatus = entry
                    ? getSubscriptionStatus(entry.expiresAt)
                    : null;
                  return (
                    <div key={item.id} className="space-y-3">
                      <Link href={`/creator/${item.creator.id}`}>
                        <div className="flex items-center space-x-2 mb-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={item.creator.avatar}
                              alt={item.creator.name}
                            />
                            <AvatarFallback className="text-xs">
                              {item.creator.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium hover:underline">
                            {item.creator.name}
                          </span>
                        </div>
                      </Link>
                      <ContentCard
                        content={item}
                        isLocked={false}
                        expiryStatus={expiryStatus}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No content available yet
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
