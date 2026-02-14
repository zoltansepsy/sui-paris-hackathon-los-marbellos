import React from "react";
import { Link } from "react-router-dom";
import { MOCK_CONTENT, MOCK_CREATORS } from "../data/mockData";
import { Card, Avatar, Badge, Button } from "../components/ui/Shared";
import { Lock, Image as ImageIcon, FileText, FileType } from "lucide-react";
import { cn } from "../lib/utils";

export const FeedPage = () => {
  // Simulate unlocked content for feed
  // In a real app, this would filter by ownedPasses
  const feedContent = [MOCK_CONTENT[0], MOCK_CONTENT[1], MOCK_CONTENT[4]];

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar: Supported Creators */}
        <div className="lg:w-64 shrink-0 space-y-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Your Creators
          </h2>
          <div className="flex flex-col gap-2">
            <button className="flex items-center gap-3 p-2 rounded-md bg-[var(--brand-primary-muted)] border-l-2 border-[var(--brand-primary)] text-[var(--text-primary)]">
              <div className="h-2 w-2 rounded-full bg-[var(--brand-primary)]" />
              <span className="text-sm font-medium">All Content</span>
            </button>
            {MOCK_CREATORS.slice(0, 2).map((c) => (
              <Link
                to={`/creator/${c.id}`}
                key={c.id}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-colors"
              >
                <Avatar src={c.avatar} fallback={c.name} size="xs" />
                <span className="text-sm">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Main Feed */}
        <div className="flex-1 max-w-2xl space-y-6">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
            Your Feed
          </h1>

          {feedContent.length > 0 ? (
            feedContent.map((item) => {
              const creator = MOCK_CREATORS.find(
                (c) => c.id === item.creatorId,
              );
              if (!creator) return null;

              return <FeedCard key={item.id} item={item} creator={creator} />;
            })
          ) : (
            <div className="text-center py-20 bg-[var(--bg-raised)] rounded-lg border border-[var(--border-default)]">
              <p className="text-[var(--text-secondary)]">
                You haven't supported any creators yet.
              </p>
              <Link to="/explore">
                <Button className="mt-4">Explore Creators</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FeedCard = ({ item, creator }: { item: any; creator: any }) => {
  return (
    <Card className="overflow-hidden hover:border-[var(--border-hover)] transition-colors">
      <div className="p-4 flex items-center gap-3 border-b border-[var(--border-default)] bg-[var(--bg-elevated)]/30">
        <Avatar src={creator.avatar} fallback={creator.name} size="sm" />
        <div>
          <Link
            to={`/creator/${creator.id}`}
            className="text-sm font-semibold text-[var(--text-primary)] hover:underline"
          >
            {creator.name}
          </Link>
          <p className="text-xs text-[var(--text-tertiary)]">
            {item.createdAt}
          </p>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
          {item.title}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4">
          {item.description}
        </p>

        <div className="relative aspect-video bg-[var(--bg-base)] rounded-md overflow-hidden border border-[var(--border-default)]">
          {item.thumbnail ? (
            <img src={item.thumbnail} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {item.type === "PDF" ? (
                <FileType className="h-12 w-12 text-[var(--text-tertiary)]" />
              ) : (
                <FileText className="h-12 w-12 text-[var(--text-tertiary)]" />
              )}
            </div>
          )}
          <div className="absolute top-3 right-3">
            <Badge
              variant={
                item.type === "IMG"
                  ? "image"
                  : item.type === "PDF"
                    ? "pdf"
                    : "text"
              }
            >
              {item.type}
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-4 pt-0">
        <Button variant="secondary" size="sm" className="w-full">
          View Content
        </Button>
      </div>
    </Card>
  );
};
