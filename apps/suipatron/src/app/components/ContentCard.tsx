"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Lock,
  Image as ImageIcon,
  FileText,
  FileType,
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

async function renderPdfFirstPage(bytes: Uint8Array): Promise<string> {
  try {
    // Dynamically import PDF.js only on client side
    const pdfjsLib = await import("pdfjs-dist");

    // Configure worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

    const loadingTask = pdfjsLib.getDocument({ data: bytes });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) throw new Error("Could not get canvas context");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: context,
      viewport: viewport,
      canvas: canvas as unknown as HTMLCanvasElement,
    } as Parameters<typeof page.render>[0]).promise;

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(URL.createObjectURL(blob));
        } else {
          throw new Error("Failed to create blob from canvas");
        }
      }, "image/png");
    });
  } catch (error) {
    console.error("Failed to render PDF preview:", error);
    throw error;
  }
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

  // Fetch blob from Walrus if blobId is provided
  useEffect(() => {
    if (blobId && !isLocked) {
      setIsLoadingBlob(true);
      download(blobId)
        .then(async (bytes) => {
          // If it's a PDF, render the first page as a preview
          if (content.type === "pdf") {
            const previewUrl = await renderPdfFirstPage(bytes);
            setBlobUrl(previewUrl);
          } else {
            // For images, create blob URL directly
            const blob = new Blob([bytes as BlobPart]);
            const url = URL.createObjectURL(blob);
            setBlobUrl(url);
          }
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
          {isLoadingBlob ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
