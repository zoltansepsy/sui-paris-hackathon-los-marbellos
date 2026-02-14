import { Card, CardContent, CardFooter } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Lock, Image as ImageIcon, FileText, FileType } from "lucide-react";
import type { Content } from "@/shared/types/creator.types";

interface ContentCardProps {
  content: Content;
  isLocked: boolean;
  onClick?: () => void;
}

export function ContentCard({ content, isLocked, onClick }: ContentCardProps) {
  const getTypeIcon = () => {
    switch (content.type) {
      case "image":
        return <ImageIcon className="h-3 w-3" />;
      case "text":
        return <FileText className="h-3 w-3" />;
      case "pdf":
        return <FileType className="h-3 w-3" />;
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
          {content.thumbnail && !isLocked ? (
            <img
              src={content.thumbnail}
              alt={content.title}
              className="w-full h-full object-cover"
            />
          ) : content.thumbnail ? (
            <>
              <img
                src={content.thumbnail}
                alt={content.title}
                className="w-full h-full object-cover blur-xl opacity-30"
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
                getTypeIcon()
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
