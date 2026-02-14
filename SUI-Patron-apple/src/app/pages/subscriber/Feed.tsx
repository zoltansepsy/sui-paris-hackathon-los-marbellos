import React from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Lock,
  Heart,
  MessageSquare,
  Share2,
  Play,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { Card, Button, Badge, cn } from "../../components/ui/Shared";
import { MOCK_CREATORS, MOCK_POSTS, Creator, Post } from "../../mockData";

export function SubscriberFeed() {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredCreators = MOCK_CREATORS.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-8">
      {/* Search and Discovery */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Discover Creators
          </h1>
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search creators, tags, or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCreators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      </section>

      {/* Latest Posts Feed */}
      <section className="space-y-6 pt-8 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Latest Updates</h2>
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Filter className="w-4 h-4 mr-2" /> Filter Feed
          </Button>
        </div>

        <div className="space-y-6">
          {MOCK_POSTS.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              creator={MOCK_CREATORS.find((c) => c.id === post.creatorId)!}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function CreatorCard({ creator }: { creator: Creator }) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <div className="h-32 bg-gray-200 relative">
        <img
          src={creator.coverImage}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      <div className="px-5 pt-12 pb-5 relative">
        <div className="absolute -top-10 left-5">
          <img
            src={creator.avatar}
            alt={creator.name}
            className="w-20 h-20 rounded-xl border-4 border-white shadow-sm"
          />
        </div>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{creator.name}</h3>
            <p className="text-sm text-gray-500">{creator.category}</p>
          </div>
          <Link to={`/creator/${creator.id}`}>
            <Button size="sm" variant="outline">
              View
            </Button>
          </Link>
        </div>
        <p className="mt-3 text-sm text-gray-600 line-clamp-2">{creator.bio}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {creator.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
            >
              #{tag}
            </span>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>{creator.supporterCount.toLocaleString()} supporters</span>
          <span className="text-indigo-600 font-medium">
            From ${creator.accessPassPrice}
          </span>
        </div>
      </div>
    </Card>
  );
}

function PostCard({ post, creator }: { post: Post; creator: Creator }) {
  const isLocked = post.accessLevel === "premium";

  return (
    <Card className="max-w-3xl mx-auto">
      <div className="p-4 sm:p-6">
        <div className="flex items-center mb-4">
          <img
            src={creator.avatar}
            alt=""
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <h4 className="text-sm font-bold text-gray-900">{creator.name}</h4>
            <p className="text-xs text-gray-500">
              {new Date(post.publishedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="ml-auto">
            {isLocked ? (
              <Badge variant="premium">
                <Lock className="w-3 h-3 mr-1" /> AccessPass
              </Badge>
            ) : (
              <Badge variant="success">Free</Badge>
            )}
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>

        <div className="relative rounded-lg overflow-hidden bg-gray-100 mb-4 aspect-video group">
          <img
            src={post.thumbnail}
            alt={post.title}
            className={cn(
              "w-full h-full object-cover transition-all",
              isLocked && "blur-sm opacity-80",
            )}
          />

          {isLocked && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 text-white p-6 text-center">
              <div className="bg-white/20 backdrop-blur-md p-4 rounded-full mb-3">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-bold text-lg mb-1">Supporters Only</h4>
              <p className="text-sm max-w-xs mb-4">
                Get an AccessPass to unlock this content and support{" "}
                {creator.name}.
              </p>
              <Button
                variant="primary"
                className="bg-white text-indigo-600 hover:bg-gray-100 border-none"
              >
                Get AccessPass
              </Button>
            </div>
          )}

          {!isLocked && post.type === "video" && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 cursor-pointer">
              <div className="bg-white/90 p-3 rounded-full shadow-lg">
                <Play className="w-8 h-8 text-indigo-600 ml-1" />
              </div>
            </div>
          )}
        </div>

        <p className="text-gray-700 leading-relaxed mb-4">{post.description}</p>

        <div className="flex items-center space-x-6 pt-4 border-t border-gray-100 text-gray-500">
          <button className="flex items-center space-x-2 hover:text-red-500 transition-colors">
            <Heart className="w-5 h-5" />
            <span className="text-sm font-medium">{post.likes}</span>
          </button>
          <button className="flex items-center space-x-2 hover:text-indigo-500 transition-colors">
            <MessageSquare className="w-5 h-5" />
            <span className="text-sm font-medium">{post.comments}</span>
          </button>
          <button className="flex items-center space-x-2 ml-auto hover:text-gray-900 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Card>
  );
}
