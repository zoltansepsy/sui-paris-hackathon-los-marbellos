import React from "react";
import { useParams, Link } from "react-router-dom";
import { Lock, Globe, Instagram, Twitter, Share2, Check } from "lucide-react";
import { Card, Button, Badge, cn } from "../../components/ui/Shared";
import { MOCK_CREATORS, MOCK_POSTS, Creator } from "../../mockData";

export function CreatorProfile() {
  const { id } = useParams<{ id: string }>();
  // Fallback to first creator if id not found or provided
  const creator = MOCK_CREATORS.find((c) => c.id === id) || MOCK_CREATORS[0];
  const creatorPosts = MOCK_POSTS.filter((p) => p.creatorId === creator.id);

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <Card className="overflow-hidden">
        <div className="h-48 sm:h-64 w-full relative">
          <img
            src={creator.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        <div className="px-6 sm:px-10 pb-8 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-12 sm:-mt-16 mb-6">
            <img
              src={creator.avatar}
              alt={creator.name}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white shadow-md bg-white"
            />
            <div className="mt-4 sm:mt-0 sm:ml-6 flex-1 text-white sm:text-gray-900 mb-2 sm:mb-0">
              <h1 className="text-3xl font-bold shadow-black sm:shadow-none drop-shadow-md sm:drop-shadow-none">
                {creator.name}
              </h1>
              <p className="text-gray-200 sm:text-gray-500 font-medium drop-shadow-md sm:drop-shadow-none">
                {creator.category}
              </p>
            </div>
            <div className="flex space-x-3 mt-4 sm:mt-0 sm:mb-2">
              <Button
                variant="outline"
                className="bg-white/90 backdrop-blur-sm sm:bg-white"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                className="bg-white/90 backdrop-blur-sm sm:bg-gray-100"
              >
                Follow
              </Button>
              <Link to={`/payment/${creator.id}`}>
                <Button className="shadow-lg">
                  Get AccessPass ${creator.accessPassPrice}
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">About</h2>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {creator.bio}
                </p>

                <div className="flex space-x-4 mt-4">
                  {creator.links.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      className="text-gray-500 hover:text-indigo-600 transition-colors"
                    >
                      <link.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Content
                </h2>
                <div className="space-y-6">
                  {creatorPosts.map((post) => (
                    <SimplePostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="p-6 bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-indigo-900">
                    AccessPass Benefits
                  </h3>
                  <Badge variant="premium">NFT Included</Badge>
                </div>
                <div className="text-3xl font-bold text-indigo-600 mb-4">
                  ${creator.accessPassPrice}{" "}
                  <span className="text-sm font-normal text-gray-500">
                    one-time
                  </span>
                </div>
                <ul className="space-y-3 mb-6">
                  {creator.accessPassBenefits.map((benefit, i) => (
                    <li
                      key={i}
                      className="flex items-start text-sm text-gray-700"
                    >
                      <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                  <li className="flex items-start text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Official Supporter Badge (NFT)
                  </li>
                </ul>
                <Link to={`/payment/${creator.id}`}>
                  <Button className="w-full">Support & Unlock</Button>
                </Link>
                <p className="text-xs text-center text-gray-500 mt-3">
                  Secure payment • Instant access
                </p>
              </Card>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function SimplePostCard({ post }: { post: any }) {
  const isLocked = post.accessLevel === "premium";
  return (
    <Card className="flex flex-col sm:flex-row overflow-hidden group cursor-pointer hover:border-indigo-200 transition-colors">
      <div className="sm:w-48 h-48 sm:h-auto relative flex-shrink-0">
        <img
          src={post.thumbnail}
          alt=""
          className={cn(
            "w-full h-full object-cover",
            isLocked && "blur-[2px] brightness-75",
          )}
        />
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Lock className="w-8 h-8 text-white drop-shadow-lg" />
          </div>
        )}
      </div>
      <div className="p-4 sm:p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">
            {post.title}
          </h3>
          {isLocked ? (
            <Badge variant="premium">Locked</Badge>
          ) : (
            <Badge variant="success">Free</Badge>
          )}
        </div>
        <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-1">
          {post.description}
        </p>
        <div className="flex items-center text-xs text-gray-500 mt-auto">
          <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
          <span className="mx-2">•</span>
          <span className="capitalize">{post.type}</span>
        </div>
      </div>
    </Card>
  );
}
