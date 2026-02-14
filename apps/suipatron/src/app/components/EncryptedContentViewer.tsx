"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Loader2 } from "lucide-react";
import { useContentDecrypt } from "../hooks/useContent";
import type { ContentType } from "../constants";

export interface EncryptedContentViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blobId: string;
  creatorProfileId: string;
  accessPassId: string;
  contentType: ContentType;
  title?: string;
  description?: string;
}

async function renderPdfFirstPage(bytes: Uint8Array): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
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
    viewport,
    canvas: canvas as unknown as HTMLCanvasElement,
  } as Parameters<typeof page.render>[0]).promise;
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(URL.createObjectURL(blob))
          : reject(new Error("Failed to create blob")),
      "image/png",
    );
  });
}

export function EncryptedContentViewer({
  open,
  onOpenChange,
  blobId,
  creatorProfileId,
  accessPassId,
  contentType,
  title,
  description,
}: EncryptedContentViewerProps) {
  const { decrypt, isPending } = useContentDecrypt();
  const [decryptedBytes, setDecryptedBytes] = useState<Uint8Array | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !blobId || !creatorProfileId || !accessPassId) {
      setDecryptedBytes(null);
      setPreviewUrl(null);
      setError(null);
      return;
    }
    let cancelled = false;
    let urlToRevoke: string | null = null;
    setError(null);
    decrypt(blobId, creatorProfileId, accessPassId)
      .then((bytes) => {
        if (cancelled) return;
        setDecryptedBytes(bytes);
        if (contentType === "image") {
          const blob = new Blob([bytes as BlobPart]);
          const url = URL.createObjectURL(blob);
          urlToRevoke = url;
          setPreviewUrl(url);
        } else if (contentType === "text") {
          setPreviewUrl(null);
        } else if (contentType === "pdf") {
          renderPdfFirstPage(bytes).then((url) => {
            if (!cancelled) {
              urlToRevoke = url;
              setPreviewUrl(url);
            }
          });
        }
      })
      .catch((e) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Decryption failed");
      });
    return () => {
      cancelled = true;
      if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);
    };
  }, [open, blobId, creatorProfileId, accessPassId, contentType, decrypt]);

  const textContent =
    decryptedBytes && contentType === "text"
      ? new TextDecoder("utf-8").decode(decryptedBytes)
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title ?? "Content"}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto min-h-0">
          {isPending && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            </div>
          )}
          {error && <p className="text-destructive py-4 text-sm">{error}</p>}
          {!isPending && !error && decryptedBytes && (
            <>
              {contentType === "image" && previewUrl && (
                <img
                  src={previewUrl}
                  alt={title ?? "Content"}
                  className="w-full h-auto max-h-[70vh] object-contain"
                />
              )}
              {contentType === "text" && textContent !== null && (
                <pre className="whitespace-pre-wrap break-words p-4 bg-muted/50 rounded-lg text-sm max-h-[70vh] overflow-auto">
                  {textContent}
                </pre>
              )}
              {contentType === "pdf" && previewUrl && (
                <img
                  src={previewUrl}
                  alt={`${title ?? "PDF"} (first page)`}
                  className="w-full h-auto max-h-[70vh] object-contain"
                />
              )}
            </>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {description}
          </p>
        )}
        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
