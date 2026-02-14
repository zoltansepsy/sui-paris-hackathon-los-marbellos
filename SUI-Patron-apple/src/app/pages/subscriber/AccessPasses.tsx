import React from "react";
import { Link } from "react-router-dom";
import { Clock, ExternalLink, Star } from "lucide-react";
import { Card, Button, Badge } from "../../components/ui/Shared";
import { MOCK_PASSES, MOCK_CREATORS } from "../../mockData";

export function AccessPasses() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My AccessPasses</h1>
        <p className="text-gray-500">
          Manage your subscriptions and unlocked content.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_PASSES.map((pass) => {
          const creator = MOCK_CREATORS.find((c) => c.id === pass.creatorId);
          if (!creator) return null;

          return (
            <Card
              key={pass.id}
              className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow"
            >
              <div className="h-40 bg-gray-900 relative">
                <img
                  src={pass.nftImageUrl}
                  alt=""
                  className="w-full h-full object-cover opacity-80 mix-blend-overlay"
                />
                <div className="absolute top-4 right-4">
                  <Badge
                    variant={pass.status === "active" ? "success" : "neutral"}
                  >
                    {pass.status === "active" ? "Active" : "Expired"}
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4 flex items-center">
                  <img
                    src={creator.avatar}
                    className="w-10 h-10 rounded-full border-2 border-white mr-3"
                  />
                  <div className="text-white">
                    <p className="font-bold text-sm leading-none">
                      {creator.name}
                    </p>
                    <p className="text-xs text-gray-300 mt-1">
                      AccessPass Holder
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center text-xs text-gray-500 mb-4 space-x-4">
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" /> Expires:{" "}
                    {pass.expiryDate}
                  </span>
                  <span className="flex items-center text-amber-600">
                    <Star className="w-3 h-3 mr-1" /> Premium
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 mb-2">
                  Unlocked Benefits
                </h3>
                <ul className="text-sm text-gray-600 space-y-2 mb-6 flex-1">
                  {pass.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start">
                      <span className="mr-2">•</span> {benefit}
                    </li>
                  ))}
                </ul>

                <div className="flex space-x-3 mt-auto pt-4 border-t border-gray-100">
                  <Link to={`/creator/${creator.id}`} className="flex-1">
                    <Button variant="primary" className="w-full">
                      View Content
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="px-3"
                    title="View NFT on Explorer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}

        {/* Empty State / Add New Placeholder */}
        <Link to="/" className="block h-full min-h-[300px]">
          <div className="border-2 border-dashed border-gray-300 rounded-xl h-full flex flex-col items-center justify-center text-gray-400 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-pointer">
            <div className="p-4 bg-gray-100 rounded-full mb-4 group-hover:bg-white">
              <Star className="w-8 h-8" />
            </div>
            <p className="font-medium">Discover More Creators</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
