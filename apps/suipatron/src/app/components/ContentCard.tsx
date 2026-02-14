"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Lock,
  Image as ImageIcon,
  FileText,
  BookOpen,
  Loader2,
} from "lucide-react";
import type { Content } from "@/shared/types/creator.types";
import { useWalrusDownload } from "../hooks/useContent";

interface ContentCardProps {
  content: Content;
  isLocked: boolean;
  onClick?: () => void;
  blobId?: string; // Walrus blob ID for fetching content
}

export function ContentCard({
  content,
  isLocked,
  onClick,
  blobId,
}: ContentCardProps) {
  const { download } = useWalrusDownload();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoadingBlob, setIsLoadingBlob] = useState(false);

  // Fetch blob from Walrus if blobId is provided (only for images)
  useEffect(() => {
    if (blobId && !isLocked && content.type === "image") {
      setIsLoadingBlob(true);
      download(blobId)
        .then((bytes) => {
          // For images, create blob URL directly
          const blob = new Blob([new Uint8Array(bytes)]);
          const url = URL.createObjectURL(blob);
          setBlobUrl(url);
        })
        .catch((error) => {
          console.error("Failed to download blob:", error);
        })
        .finally(() => {
          setIsLoadingBlob(false);
        });
    }

    // Cleanup blob URL on unmount
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobId, isLocked, download, content.type]);

  const displayUrl = blobUrl || content.thumbnail;
  const getTypeIcon = (size: "sm" | "lg" = "sm") => {
    const className = size === "sm" ? "h-3 w-3" : "h-16 w-16";
    switch (content.type) {
      case "image":
        return <ImageIcon className={className} />;
      case "text":
        return <FileText className={className} />;
      case "pdf":
        return <BookOpen className={className} />;
    }
  };

  const getTypeBadge = () => {
    switch (content.type) {
      case "image":
        return "Image";
      case "text":
        return "Text";
      case "pdf":
        return "PDF";
    }
  };

  return (
    <Card
      className={`overflow-hidden transition-all ${onClick ? "cursor-pointer hover:shadow-lg" : ""}`}
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="relative aspect-video bg-muted flex items-center justify-center">
          {isLoadingBlob ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : content.type === "pdf" ? (
            // PDFs show a book icon instead of preview
            <div className="flex flex-col items-center justify-center space-y-2">
              {isLocked ? (
                <>
                  {getTypeIcon("lg")}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <Lock className="h-12 w-12 text-muted-foreground" />
                  </div>
                </>
              ) : (
                <div className="text-muted-foreground">{getTypeIcon("lg")}</div>
              )}
            </div>
          ) : displayUrl && !isLocked ? (
            <img
              src={displayUrl}
              alt={content.title}
              className="w-full h-full object-contain"
            />
          ) : displayUrl ? (
            <>
              <img
                src={displayUrl}
                alt={content.title}
                className="w-full h-full object-contain blur-xl opacity-30"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="h-12 w-12 text-muted-foreground" />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2">
              {isLocked ? (
                <Lock className="h-12 w-12 text-muted-foreground" />
              ) : (
                getTypeIcon("lg")
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 flex flex-col items-start space-y-2">
        <div className="flex items-center justify-between w-full">
          <Badge variant="outline" className="text-xs">
            {getTypeIcon()}
            <span className="ml-1">{getTypeBadge()}</span>
          </Badge>
          {isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
        </div>

        <div className="w-full">
          <h3 className="font-semibold text-sm line-clamp-1">
            {content.title}
          </h3>
          {content.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {content.description}
            </p>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          {content.createdAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </CardFooter>
    </Card>
  );
}
