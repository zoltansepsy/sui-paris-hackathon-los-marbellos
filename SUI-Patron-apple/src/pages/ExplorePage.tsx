import React from "react";
import { Link } from "react-router-dom";
import { Search, Users, FileText, BadgeCheck } from "lucide-react";
import { Card, Avatar, Button } from "../components/ui/Shared";
import { MOCK_CREATORS, Creator } from "../data/mockData";
import { motion } from "motion/react";

export const ExplorePage = () => {
  const [search, setSearch] = React.useState("");

  const filteredCreators = MOCK_CREATORS.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.bio.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Explore Creators
          </h1>
          <p className="mt-2 text-[var(--text-secondary)]">
            Discover and support independent creators.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-[var(--text-tertiary)]" />
          </div>
          <input
            type="text"
            placeholder="Search creators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 rounded-[var(--radius-md)] bg-[var(--bg-input)] border border-[var(--border-default)] pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
          />
        </div>
      </div>

      {/* Creator Grid */}
      {filteredCreators.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCreators.map((creator, index) => (
            <motion.div
              key={creator.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <CreatorCard creator={creator} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-24 w-24 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center mb-6">
            <Search className="h-10 w-10 text-[var(--text-tertiary)]" />
          </div>
          <h3 className="text-xl font-semibold text-[var(--text-primary)]">
            No creators found
          </h3>
          <p className="mt-2 text-[var(--text-secondary)]">
            Try a different search term or check back later.
          </p>
        </div>
      )}
    </div>
  );
};

const CreatorCard = ({ creator }: { creator: Creator }) => (
  <Link to={`/creator/${creator.id}`} className="block h-full">
    <Card className="h-full flex flex-col p-6 transition-all hover:-translate-y-1 hover:border-[var(--border-hover)] hover:shadow-[var(--shadow-md)] bg-[var(--bg-raised)]">
      <div className="flex items-start justify-between mb-4">
        <Avatar src={creator.avatar} fallback={creator.name} size="lg" />
      </div>

      <div className="mb-1">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] truncate">
          {creator.name}
        </h3>
        <p className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
          {creator.suins}
          <BadgeCheck className="h-3 w-3 text-[var(--brand-primary)]" />
        </p>
      </div>

      <p className="mt-3 text-sm text-[var(--text-secondary)] line-clamp-2 mb-6 flex-1">
        {creator.bio}
      </p>

      <div className="pt-4 border-t border-[var(--border-default)] flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" /> {creator.supporterCount}
          </span>
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3" /> {creator.postCount}
          </span>
        </div>
        <div className="text-sm font-bold text-[var(--text-primary)]">
          {creator.price} SUI
        </div>
      </div>
    </Card>
  </Link>
);
