"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { CreatorCard } from "../components/CreatorCard";
import { LoadingState } from "../components/LoadingState";
import { useCreatorProfiles } from "../hooks/useCreator";
import { creatorProfileToCreator } from "../lib/adapters";
import { Search, Users, RefreshCw } from "lucide-react";

export function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    data: profiles,
    isLoading,
    refetch,
    isFetching,
  } = useCreatorProfiles();

  // Use ONLY on-chain data (no mock fallback)
  const creators = profiles ? profiles.map(creatorProfileToCreator) : [];

  const filteredCreators = creators.filter(
    (creator) =>
      creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.suinsName?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col min-h-screen">
      <section className="py-12 px-4 border-b bg-muted/30">
        <div className="container mx-auto space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <h1 className="text-3xl md:text-4xl font-bold">
                Explore Creators
              </h1>
              <p className="text-lg text-muted-foreground">
                Discover talented creators and support their work
                {creators.length > 0 && (
                  <span className="ml-2">
                    • {creators.length} creator
                    {creators.length !== 1 ? "s" : ""}
                  </span>
                )}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              />
              {isFetching ? "Refreshing..." : "Refresh"}
            </Button>
          </div>

          <div className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, bio, or SuiNS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 flex-1">
        <div className="container mx-auto">
          {isLoading ? (
            <LoadingState />
          ) : creators.length === 0 ? (
            // Empty state when no creators exist on-chain
            <div className="flex items-center justify-center min-h-[400px]">
              <Card className="max-w-md w-full">
                <CardContent className="pt-6 text-center space-y-4">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      No Creators Yet
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Be the first creator on SuiPatron! Create your profile and
                      start sharing exclusive content.
                    </p>
                  </div>
                  <Link href="/dashboard">
                    <Button>Become a Creator</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          ) : filteredCreators.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCreators.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} />
              ))}
            </div>
          ) : (
            // Search returned no results
            <div className="text-center py-12 space-y-4">
              <p className="text-lg text-muted-foreground">
                No creators found matching &quot;{searchQuery}&quot;
              </p>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear search
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
