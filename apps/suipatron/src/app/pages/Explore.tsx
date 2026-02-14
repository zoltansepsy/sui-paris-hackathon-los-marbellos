"use client";

import { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { CreatorCard } from "../components/CreatorCard";
import { mockCreators } from "../lib/mock-data";
import { Search } from "lucide-react";

export function Explore() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCreators = mockCreators.filter(
    (creator) =>
      creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.suinsName?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col min-h-screen">
      <section className="py-12 px-4 border-b bg-muted/30">
        <div className="container mx-auto space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">Explore Creators</h1>
            <p className="text-lg text-muted-foreground">
              Discover talented creators and support their work
            </p>
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
          {filteredCreators.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCreators.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 space-y-4">
              <p className="text-lg text-muted-foreground">No creators found</p>
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
